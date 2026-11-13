/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

export type MermaidApi = typeof import("mermaid")["default"];
export type MermaidLoader = () => Promise<MermaidApi>;

let mermaidInstance: Promise<MermaidApi> | null = null;
let renderQueue: Promise<void> = Promise.resolve();

async function loadMermaid(): Promise<MermaidApi> {
    if (!mermaidInstance) {
        mermaidInstance = import("mermaid").then(({ default: mermaid }) => {
            mermaid.initialize({
                startOnLoad: false,
                securityLevel: "strict",
                suppressErrorRendering: true,
                theme: "neutral",
            });
            return mermaid;
        });
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
        const { svg } = await mermaid.render(id, content);
        return svg;
    });
}

export function mermaidErrorMessage(errorText: string, error: unknown): string {
    const details = error instanceof Error ? error.message.split("\n", 1)[0]?.trim() : "";
    return details ? `${errorText}: ${details}` : errorText;
}
