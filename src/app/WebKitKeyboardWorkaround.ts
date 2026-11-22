/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

function normalizeBackwardTab(event: KeyboardEvent): void {
    if (event.key !== "Unidentified" || event.code !== "Tab" || !event.shiftKey
        || event.ctrlKey || event.altKey || event.metaKey || event.isComposing) return;

    // WebKitGTK reports ISO_Left_Tab as Unidentified. Keep the original event
    // so components can still cancel the browser's default focus movement.
    Object.defineProperty(event, "key", { configurable: true, value: "Tab" });
}

export function installWebKitKeyboardWorkaround(): () => void {
    window.addEventListener("keydown", normalizeBackwardTab, true);
    return () => window.removeEventListener("keydown", normalizeBackwardTab, true);
}
