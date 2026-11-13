/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { mermaidThemeConfig } from "./MermaidTheme";

export type MermaidApi = typeof import("mermaid")["default"];
export type MermaidLoader = () => Promise<MermaidApi>;

let mermaidInstance: Promise<MermaidApi> | null = null;
let renderQueue: Promise<void> = Promise.resolve();

async function loadMermaid(): Promise<MermaidApi> {
    if (!mermaidInstance) {
        mermaidInstance = import("mermaid").then(({ default: mermaid }) => mermaid);
    }

    return mermaidInstance;
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
    const details = error instanceof Error ? error.message.split("\n", 1)[0]?.trim() : "";
    return details ? `${errorText}: ${details}` : errorText;
}
