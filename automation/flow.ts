import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import type { AutomationFlow, FlowStep, Target } from "./types";

type FlowPreferences = NonNullable<AutomationFlow["app"]["preferences"]>;

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
        "domClick",
        "doubleClick",
        "contextClick",
        "type",
        "focus",
        "hover",
        "pointerOver",
        "pointerMove",
        "pointerDrag",
        "setRange",
        "clear",
        "caret",
        "scrollIntoView",
        "select",
        "wait",
        "waitSelection",
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
        "domClick",
        "doubleClick",
        "contextClick",
        "type",
        "keys",
        "focus",
        "hover",
        "pointerOver",
        "pointerMove",
        "pointerDrag",
        "setRange",
        "clear",
        "caret",
        "scroll",
        "scrollIntoView",
        "select",
        "drag",
        "pause",
        "wait",
        "waitSelection",
        "waitClipboard",
        "refresh",
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
        if (
            action === "caret" &&
            step.position !== "start" &&
            step.position !== "end"
        ) {
            throw new Error(`steps[${index}].position must be either 'start' or 'end'`);
        }
        if (action === "pointerMove") {
            for (const key of ["xRatio", "yRatio"] as const) {
                const ratio = step[key];
                if (
                    ratio !== undefined &&
                    (typeof ratio !== "number" || ratio < 0 || ratio > 1)
                ) {
                    throw new Error(`steps[${index}].${key} must be between 0 and 1`);
                }
            }
        }
        if (action === "pointerDrag") {
            for (const key of ["x", "y"] as const) {
                if (typeof step[key] !== "number" || !Number.isFinite(step[key])) {
                    throw new Error(`steps[${index}].${key} must be a number`);
                }
            }
            if (
                step.durationMs !== undefined &&
                (typeof step.durationMs !== "number" ||
                    !Number.isFinite(step.durationMs) ||
                    step.durationMs < 0)
            ) {
                throw new Error(`steps[${index}].durationMs must be a non-negative number`);
            }
        }
        if (
            action === "setRange" &&
            (typeof step.value !== "number" || !Number.isFinite(step.value))
        ) {
            throw new Error(`steps[${index}].value must be a number`);
        }
        if (action === "waitClipboard") {
            requireString(step, "text", `steps[${index}]`);
        }
        return step as FlowStep;
    });
}

function parsePreferences(value: unknown): FlowPreferences | undefined {
    if (value === undefined) return undefined;
    if (!isRecord(value)) {
        throw new Error("app.preferences must be an object");
    }
    const preferences: FlowPreferences = {};
    if (value.locale !== undefined) {
        if (typeof value.locale !== "string" || !["en", "es", "ca", "gl", "eu"].includes(value.locale)) {
            throw new Error("app.preferences.locale has an unsupported value");
        }
        preferences.locale = value.locale as FlowPreferences["locale"];
    }
    if (value.theme !== undefined) {
        if (value.theme !== "light" && value.theme !== "dark") {
            throw new Error("app.preferences.theme has an unsupported value");
        }
        preferences.theme = value.theme;
    }
    if (value.typography !== undefined) {
        if (
            typeof value.typography !== "string" ||
            !["sans-serif", "serif", "modern", "reading"].includes(value.typography)
        ) {
            throw new Error("app.preferences.typography has an unsupported value");
        }
        preferences.typography = value.typography as FlowPreferences["typography"];
    }
    for (const key of ["sidebarVisible", "showHiddenFiles"] as const) {
        if (value[key] !== undefined) {
            if (typeof value[key] !== "boolean") {
                throw new Error(`app.preferences.${key} must be a boolean`);
            }
            preferences[key] = value[key];
        }
    }
    return preferences;
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
    const workspaceMode = requireString(parsed.app, "workspaceMode", "app");
    if (!["read-only", "temporary-copy"].includes(workspaceMode)) {
        throw new Error(
            "app.workspaceMode must be either 'read-only' or 'temporary-copy'"
        );
    }
    return {
        ...(parsed as Omit<AutomationFlow, "name" | "app" | "steps">),
        name: requireString(parsed, "name", "flow"),
        app: {
            ...(parsed.app as AutomationFlow["app"]),
            basePath: requireString(parsed.app, "basePath", "app"),
            workspaceMode: workspaceMode as AutomationFlow["app"]["workspaceMode"],
            ...(parsed.app.preferences === undefined
                ? {}
                : { preferences: parsePreferences(parsed.app.preferences) }),
        },
        steps: parseSteps(parsed.steps),
    };
}

export function resolveFlowPath(path: string, projectRoot: string): string {
    return isAbsolute(path) ? path : resolve(projectRoot, path);
}
