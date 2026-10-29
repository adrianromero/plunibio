import type { ChainablePromiseElement } from "webdriverio";
import type { Target } from "./types";

function escapeXPathText(value: string): string {
    if (!value.includes("'")) {
        return `'${value}'`;
    }
    if (!value.includes('"')) {
        return `"${value}"`;
    }
    return `concat('${value.replaceAll("'", "', \"'\", '")}')`;
}

function selectorFor(target: Target): string {
    switch (target.using) {
        case "css":
            return target.value;
        case "aria":
            return `aria/${target.value}`;
        case "text":
            return `//*[normalize-space(.)=${escapeXPathText(target.value)}]`;
        case "xpath":
            return target.value;
        case "testId":
            return `[data-testid="${target.value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"]`;
    }
}

export async function findTarget(
    target: Target
): Promise<ChainablePromiseElement> {
    const selector = selectorFor(target);
    if (target.index === undefined) {
        return browser.$(selector);
    }
    const matches = await browser.$$(selector);
    const match = matches[target.index];
    if (!match) {
        throw new Error(`Target ${selector} has no element at index ${target.index}`);
    }
    return match;
}
