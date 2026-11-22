/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { expect, it, vi } from "vitest";
import { installWebKitKeyboardWorkaround } from "../WebKitKeyboardWorkaround";

const unidentifiedBackwardTab: KeyboardEventInit = {
    key: "Unidentified",
    code: "Tab",
    shiftKey: true,
    bubbles: true,
    cancelable: true,
};

it("normalizes the original event before document and component listeners", () => {
    const input = document.createElement("input");
    const onDocumentKey = vi.fn((event: KeyboardEvent) => event.key);
    const onInputKey = vi.fn((event: KeyboardEvent) => event.key);
    const cleanup = installWebKitKeyboardWorkaround();
    document.addEventListener("keydown", onDocumentKey, true);
    input.addEventListener("keydown", onInputKey);
    document.body.append(input);

    try {
        const event = new KeyboardEvent("keydown", unidentifiedBackwardTab);
        expect(input.dispatchEvent(event)).toBe(true);
        expect(onDocumentKey).toHaveBeenCalledWith(event);
        expect(onDocumentKey).toHaveReturnedWith("Tab");
        expect(onInputKey).toHaveBeenCalledWith(event);
        expect(onInputKey).toHaveReturnedWith("Tab");

        cleanup();
        const afterCleanup = new KeyboardEvent("keydown", unidentifiedBackwardTab);
        input.dispatchEvent(afterCleanup);
        expect(afterCleanup.key).toBe("Unidentified");
    } finally {
        cleanup();
        document.removeEventListener("keydown", onDocumentKey, true);
        input.remove();
    }
});

it.each<KeyboardEventInit>([
    { key: "Tab" },
    { code: "Enter" },
    { shiftKey: false },
    { ctrlKey: true },
    { altKey: true },
    { metaKey: true },
    { isComposing: true },
])("keeps an event unchanged when %o", (overrides) => {
    const cleanup = installWebKitKeyboardWorkaround();
    try {
        const event = new KeyboardEvent("keydown", { ...unidentifiedBackwardTab, ...overrides });
        document.body.dispatchEvent(event);
        expect(Object.getOwnPropertyDescriptor(event, "key")).toBeUndefined();
    } finally {
        cleanup();
    }
});
