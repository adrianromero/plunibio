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
    verifyOnly: boolean;
};

type FlowPreferences = NonNullable<AutomationFlow["app"]["preferences"]>;

const execFileAsync = promisify(execFile);

async function applyPreferences(preferences: FlowPreferences | undefined): Promise<void> {
    if (!preferences) return;
    await browser.execute((values: FlowPreferences) => {
        const keys: Record<keyof FlowPreferences, string> = {
            locale: "plunibio.locale",
            theme: "plunibio.theme",
            typography: "plunibio.typography",
            sidebarVisible: "plunibio.sidebarVisible",
            showHiddenFiles: "plunibio.showHiddenFiles",
        };
        for (const [name, value] of Object.entries(values) as [
            keyof FlowPreferences,
            FlowPreferences[keyof FlowPreferences],
        ][]) {
            window.localStorage.setItem(keys[name], String(value));
        }
    }, preferences);
    await browser.refresh();
}

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
        case "domClick":
        case "doubleClick":
        case "contextClick": {
            const element = await findTarget(step.target);
            if (step.action === "domClick") {
                await element.waitForExist({ timeout: context.timeoutMs });
                await browser.execute((node: HTMLElement) => node.click(), element);
                break;
            }
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
        case "pointerOver": {
            const element = await findTarget(step.target);
            await element.waitForDisplayed({ timeout: context.timeoutMs });
            await browser.execute((node: Element) => {
                node.dispatchEvent(
                    new PointerEvent("pointerover", {
                        bubbles: true,
                        cancelable: true,
                        composed: true,
                        pointerType: "mouse",
                    })
                );
            }, element);
            break;
        }
        case "pointerMove": {
            const element = await findTarget(step.target);
            await element.waitForDisplayed({ timeout: context.timeoutMs });
            await browser.execute(
                (node: Element, xRatio: number, yRatio: number) => {
                    const rect = node.getBoundingClientRect();
                    node.dispatchEvent(
                        new PointerEvent("pointermove", {
                            bubbles: true,
                            cancelable: true,
                            composed: true,
                            pointerType: "mouse",
                            clientX: rect.left + rect.width * xRatio,
                            clientY: rect.top + rect.height * yRatio,
                        })
                    );
                },
                element,
                step.xRatio ?? 0.5,
                step.yRatio ?? 0.5
            );
            break;
        }
        case "pointerDrag": {
            const element = await findTarget(step.target);
            await element.waitForDisplayed({ timeout: context.timeoutMs });
            await browser
                .action("pointer", { parameters: { pointerType: "mouse" } })
                .move({ duration: 0, origin: element, x: 0, y: 0 })
                .down({ button: 0 })
                .pause(50)
                .move({
                    duration: step.durationMs ?? 400,
                    origin: "pointer",
                    x: step.x,
                    y: step.y,
                })
                .up({ button: 0 })
                .perform();
            break;
        }
        case "setRange": {
            const element = await findTarget(step.target);
            await element.waitForExist({ timeout: context.timeoutMs });
            await browser.execute(
                (input: HTMLInputElement, value: number) => {
                    input.value = String(value);
                    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
                },
                element,
                step.value
            );
            break;
        }
        case "clear": {
            await (await findTarget(step.target)).clearValue();
            break;
        }
        case "caret": {
            const element = await findTarget(step.target);
            await element.waitForDisplayed({ timeout: context.timeoutMs });
            await browser.execute(
                (node: Element, position: "start" | "end") => {
                    const editable = node.closest<HTMLElement>("[contenteditable='true']");
                    editable?.focus();
                    const range = document.createRange();
                    range.selectNodeContents(node);
                    range.collapse(position === "start");
                    const selection = window.getSelection();
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                },
                element,
                step.position
            );
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
        case "waitSelection": {
            const element = await findTarget(step.target);
            const timeout = step.timeoutMs ?? context.timeoutMs;
            await element.waitForExist({ timeout });
            await browser.waitUntil(
                async () =>
                    await browser.execute((node: Element) => {
                        const selection = window.getSelection();
                        return Boolean(selection?.anchorNode && node.contains(selection.anchorNode));
                    }, element),
                {
                    timeout,
                    timeoutMsg: "Selection did not move inside the requested target",
                }
            );
            break;
        }
        case "waitClipboard": {
            const timeout = step.timeoutMs ?? context.timeoutMs;
            await browser.waitUntil(
                async () =>
                    await browser.execute(async (expected: string) => {
                        try {
                            const internals = (
                                window as Window & {
                                    __TAURI_INTERNALS__?: {
                                        invoke<T>(command: string): Promise<T>;
                                    };
                                }
                            ).__TAURI_INTERNALS__;
                            const actual = internals
                                ? await internals.invoke<string>(
                                      "plugin:clipboard-manager|read_text"
                                  )
                                : await navigator.clipboard.readText();
                            return actual === expected;
                        } catch {
                            return false;
                        }
                    }, step.text),
                {
                    timeout,
                    timeoutMsg: "Clipboard text did not match the requested value",
                }
            );
            break;
        }
        case "refresh": {
            await browser.refresh();
            break;
        }
        case "capture": {
            await browser.pause(step.settleMs ?? context.settleMs);
            const scope = step.scope ?? "viewport";
            if (context.verifyOnly) {
                if (scope === "element") {
                    if (!step.target) {
                        throw new Error("An element capture requires target");
                    }
                    const element = await findTarget(step.target);
                    await element.waitForDisplayed({ timeout: context.timeoutMs });
                    const bounds = await browser.execute((node: Element) => {
                        const rect = node.getBoundingClientRect();
                        return { width: rect.width, height: rect.height };
                    }, element);
                    if (bounds.width <= 0 || bounds.height <= 0) {
                        throw new Error(`Capture target '${step.name}' has no visible area`);
                    }
                } else {
                    const viewport = await browser.execute(() => ({
                        width: window.innerWidth,
                        height: window.innerHeight,
                    }));
                    if (viewport.width <= 0 || viewport.height <= 0) {
                        throw new Error(`Capture viewport '${step.name}' has no visible area`);
                    }
                }
                break;
            }

            const filename = captureFilename(context, step.name);
            await mkdir(dirname(filename), { recursive: true });
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
        verifyOnly: process.env.PLUNIBIO_AUTOMATION_VERIFY_ONLY === "1",
    };
    if (!context.verifyOnly) await mkdir(outputDir, { recursive: true });
    await applyPreferences(flow.app.preferences);

    for (const [index, step] of flow.steps.entries()) {
        console.log(`[${index + 1}/${flow.steps.length}] ${step.action}`);
        await executeStep(step, context);
    }
}
