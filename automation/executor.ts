import { execFile } from "node:child_process";
import { mkdir, unlink } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { promisify } from "node:util";
import { captureGnomeWindow } from "./native-capture";
import { findTarget } from "./targets";
import type { AutomationFlow, FlowStep, Target } from "./types";

type ExecutionContext = {
    projectRoot: string;
    outputDir: string;
    timeoutMs: number;
    settleMs: number;
};

const execFileAsync = promisify(execFile);

function captureFilename(context: ExecutionContext, name: string): string {
    const normalized = name.endsWith(".png") ? name : `${name}.png`;
    return isAbsolute(normalized) ? normalized : resolve(context.outputDir, normalized);
}

async function captureElement(filename: string, target: Target): Promise<void> {
    const element = await findTarget(target);
    await element.waitForDisplayed();
    const rect = await browser.execute((node: Element) => {
        const bounds = node.getBoundingClientRect();
        return {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            scale: window.devicePixelRatio,
        };
    }, element);
    const temporary = `${filename}.viewport-${process.pid}-${Date.now()}.png`;
    try {
        await browser.saveScreenshot(temporary);
        const x = Math.max(0, Math.round(rect.x * rect.scale));
        const y = Math.max(0, Math.round(rect.y * rect.scale));
        const width = Math.max(1, Math.round(rect.width * rect.scale));
        const height = Math.max(1, Math.round(rect.height * rect.scale));
        await execFileAsync("convert", [
            temporary,
            "-crop",
            `${width}x${height}+${x}+${y}`,
            "+repage",
            filename,
        ]);
    } finally {
        await unlink(temporary).catch(() => undefined);
    }
}

async function executeStep(step: FlowStep, context: ExecutionContext): Promise<void> {
    switch (step.action) {
        case "click":
        case "doubleClick":
        case "contextClick": {
            const element = await findTarget(step.target);
            await element.waitForDisplayed({ timeout: context.timeoutMs });
            if (step.action === "doubleClick") {
                await element.doubleClick();
            } else {
                await element.click({
                    ...(step.x === undefined ? {} : { x: step.x }),
                    ...(step.y === undefined ? {} : { y: step.y }),
                    ...(step.action === "contextClick" ? { button: "right" } : {}),
                });
            }
            break;
        }
        case "type": {
            const element = await findTarget(step.target);
            await element.waitForDisplayed({ timeout: context.timeoutMs });
            await element.click();
            if (step.replace) {
                await browser.keys(["Control", "a"]);
            }
            await browser.keys(step.text);
            break;
        }
        case "keys": {
            if (step.target) {
                const element = await findTarget(step.target);
                await element.waitForDisplayed({ timeout: context.timeoutMs });
                await element.click();
            }
            await browser.keys(step.keys);
            break;
        }
        case "focus": {
            await (await findTarget(step.target)).click();
            break;
        }
        case "hover": {
            await (await findTarget(step.target)).moveTo();
            break;
        }
        case "clear": {
            await (await findTarget(step.target)).clearValue();
            break;
        }
        case "scroll": {
            const element = step.target ? await findTarget(step.target) : undefined;
            await browser.execute(
                (target: Element | undefined, x: number, y: number) => {
                    const scrollingTarget = target ?? document.scrollingElement ?? document.documentElement;
                    scrollingTarget.scrollBy({ left: x, top: y, behavior: "instant" });
                },
                element,
                step.x ?? 0,
                step.y
            );
            break;
        }
        case "scrollIntoView": {
            const element = await findTarget(step.target);
            await browser.execute(
                (target: Element, block: ScrollLogicalPosition) => {
                    target.scrollIntoView({ block, inline: "nearest", behavior: "instant" });
                },
                element,
                step.block ?? "center"
            );
            break;
        }
        case "select": {
            const element = await findTarget(step.target);
            if (step.by === "text") {
                await element.selectByVisibleText(String(step.value));
            } else if (step.by === "value") {
                await element.selectByAttribute("value", String(step.value));
            } else {
                await element.selectByIndex(Number(step.value));
            }
            break;
        }
        case "drag": {
            await (await findTarget(step.from)).dragAndDrop(await findTarget(step.to));
            break;
        }
        case "pause": {
            await browser.pause(step.milliseconds);
            break;
        }
        case "wait": {
            const element = await findTarget(step.target);
            const timeout = step.timeoutMs ?? context.timeoutMs;
            const state = step.state ?? "visible";
            if (state === "visible" || state === "hidden") {
                await element.waitForDisplayed({ timeout, reverse: state === "hidden" });
            } else if (state === "existing" || state === "missing") {
                await element.waitForExist({ timeout, reverse: state === "missing" });
            } else {
                await element.waitForEnabled({ timeout });
            }
            if (step.text !== undefined) {
                await browser.waitUntil(async () => (await element.getText()).includes(step.text!), {
                    timeout,
                    timeoutMsg: `Target did not contain text '${step.text}'`,
                });
            }
            break;
        }
        case "capture": {
            const filename = captureFilename(context, step.name);
            await mkdir(dirname(filename), { recursive: true });
            await browser.pause(step.settleMs ?? context.settleMs);
            const scope = step.scope ?? "viewport";
            if (scope === "element") {
                if (!step.target) {
                    throw new Error("An element capture requires target");
                }
                await captureElement(filename, step.target);
            } else if (scope === "native-window") {
                await captureGnomeWindow(filename, step.includeCursor ?? false);
            } else {
                await browser.saveScreenshot(filename);
            }
            break;
        }
    }
}

export async function executeFlow(flow: AutomationFlow, projectRoot: string): Promise<void> {
    const outputDir = resolve(projectRoot, flow.outputDir ?? "automation/output");
    const context: ExecutionContext = {
        projectRoot,
        outputDir,
        timeoutMs: flow.timeoutMs ?? 10_000,
        settleMs: flow.settleMs ?? 300,
    };
    await mkdir(outputDir, { recursive: true });

    for (const [index, step] of flow.steps.entries()) {
        console.log(`[${index + 1}/${flow.steps.length}] ${step.action}`);
        await executeStep(step, context);
    }
}
