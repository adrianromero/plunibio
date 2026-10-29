import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import type { AutomationFlow, FlowStep, Target } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(record: Record<string, unknown>, key: string, context: string): string {
    const value = record[key];
    if (typeof value !== "string" || value.length === 0) {
        throw new Error(`${context}.${key} must be a non-empty string`);
    }
    return value;
}

function parseTarget(value: unknown, context: string): Target {
    if (!isRecord(value)) {
        throw new Error(`${context} must be an object`);
    }
    const using = requireString(value, "using", context);
    if (!["css", "aria", "text", "xpath", "testId"].includes(using)) {
        throw new Error(`${context}.using has unsupported strategy '${using}'`);
    }
    const index = value.index;
    if (index !== undefined && (!Number.isInteger(index) || Number(index) < 0)) {
        throw new Error(`${context}.index must be a non-negative integer`);
    }
    return {
        using: using as Target["using"],
        value: requireString(value, "value", context),
        ...(index === undefined ? {} : { index: Number(index) }),
    };
}

function validateTargetFields(step: Record<string, unknown>, index: number): void {
    const action = requireString(step, "action", `steps[${index}]`);
    const needsTarget = [
        "click",
        "doubleClick",
        "contextClick",
        "type",
        "focus",
        "hover",
        "clear",
        "scrollIntoView",
        "select",
        "wait",
    ].includes(action);
    if (needsTarget) {
        parseTarget(step.target, `steps[${index}].target`);
    }
    if (action === "drag") {
        parseTarget(step.from, `steps[${index}].from`);
        parseTarget(step.to, `steps[${index}].to`);
    }
    if (action === "capture" && step.target !== undefined) {
        parseTarget(step.target, `steps[${index}].target`);
    }
}

function parseSteps(value: unknown): FlowStep[] {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error("steps must be a non-empty array");
    }
    const supported = new Set([
        "click",
        "doubleClick",
        "contextClick",
        "type",
        "keys",
        "focus",
        "hover",
        "clear",
        "scroll",
        "scrollIntoView",
        "select",
        "drag",
        "pause",
        "wait",
        "capture",
    ]);
    return value.map((step, index) => {
        if (!isRecord(step)) {
            throw new Error(`steps[${index}] must be an object`);
        }
        const action = requireString(step, "action", `steps[${index}]`);
        if (!supported.has(action)) {
            throw new Error(`steps[${index}].action '${action}' is not supported`);
        }
        validateTargetFields(step, index);
        return step as FlowStep;
    });
}

export async function loadFlow(filename: string): Promise<AutomationFlow> {
    const absoluteFilename = isAbsolute(filename) ? filename : resolve(filename);
    const parsed: unknown = JSON.parse(await readFile(absoluteFilename, "utf8"));
    if (!isRecord(parsed)) {
        throw new Error("The flow root must be an object");
    }
    if (!isRecord(parsed.app)) {
        throw new Error("app must be an object");
    }
    return {
        ...(parsed as Omit<AutomationFlow, "name" | "app" | "steps">),
        name: requireString(parsed, "name", "flow"),
        app: {
            ...(parsed.app as AutomationFlow["app"]),
            basePath: requireString(parsed.app, "basePath", "app"),
        },
        steps: parseSteps(parsed.steps),
    };
}

export function resolveFlowPath(path: string, projectRoot: string): string {
    return isAbsolute(path) ? path : resolve(projectRoot, path);
}
