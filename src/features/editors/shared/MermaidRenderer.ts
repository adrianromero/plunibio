/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { frontendLog } from "@/shared/logging/frontendLog";
import { mermaidThemeConfig } from "./MermaidTheme";

export type MermaidApi = typeof import("mermaid")["default"];
export type MermaidLoader = () => Promise<MermaidApi>;

let library: Promise<MermaidApi> | null = null;
let renderQueue: Promise<void> = Promise.resolve();

function loadMermaid(): Promise<MermaidApi> {
    library ??= import("mermaid").then(({ default: mermaid }) => mermaid).catch((error: unknown) => {
        library = null;
        throw error;
    });
    return library;
}

function enqueueRender<T>(render: () => Promise<T>): Promise<T> {
    const result = renderQueue.then(render, render);
    renderQueue = result.then(
        () => undefined,
        () => undefined
    );
    return result;
}

export function renderMermaid(
    id: string,
    content: string,
    load: MermaidLoader = loadMermaid
): Promise<string> {
    return enqueueRender(async () => {
        const mermaid = await load();
        // initialize changes Mermaid's global configuration. Keep it in the same
        // queue as render so simultaneous previews cannot use each other's theme.
        mermaid.initialize(mermaidThemeConfig());
        const { svg } = await mermaid.render(id, content);
        return svg;
    });
}

export function mermaidErrorMessage(errorText: string, error: unknown): string {
    frontendLog("error", "mermaid.render.failed", {
        error: error instanceof Error ? error.stack ?? error.message : String(error),
    });
    return errorText;
}
