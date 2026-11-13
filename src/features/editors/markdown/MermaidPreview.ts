/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import "../shared/MermaidPreview.css";
import { renderMermaid, mermaidErrorMessage, type MermaidLoader } from "../shared/MermaidRenderer";
import { observeMermaidTheme } from "../shared/MermaidTheme";
import type { CodeBlockConfig } from "@milkdown/kit/component/code-block";

type PreviewRenderer = CodeBlockConfig["renderPreview"];
type PreviewContent = string | HTMLElement;
type MermaidPreviewOptions = {
    loading: PreviewContent;
    errorText: string;
};

let previewId = 0;

function createPlaceholder(id: string, loading: PreviewContent): HTMLDivElement {
    const placeholder = document.createElement("div");
    placeholder.id = id;
    placeholder.className = "mermaid-preview";
    const message = document.createElement("div");
    message.className = "mermaid-preview-loading";
    message.setAttribute("role", "status");

    if (typeof loading === "string") {
        message.textContent = loading;
    } else {
        message.append(loading.cloneNode(true));
    }

    placeholder.append(message);
    return placeholder;
}

function createError(errorText: string, error: unknown): HTMLDivElement {
    const element = document.createElement("div");
    element.className = "mermaid-preview-error";
    element.setAttribute("role", "alert");

    element.textContent = mermaidErrorMessage(errorText, error);
    return element;
}

export function createMermaidPreviewRenderer(
    fallback: PreviewRenderer,
    options: MermaidPreviewOptions,
    load?: MermaidLoader
): PreviewRenderer {
    return (language, content, applyPreview) => {
        if (language.trim().toLowerCase() !== "mermaid") {
            return fallback(language, content, applyPreview);
        }

        if (content.trim().length === 0) {
            return null;
        }

        const id = ++previewId;
        const placeholderId = `plunibio-mermaid-preview-${id}`;
        const placeholder = createPlaceholder(placeholderId, options.loading);
        let generation = 0;
        const current = (): HTMLElement | null => document.getElementById(placeholderId);
        const refresh = (): void => {
            const version = ++generation;
            const theme = document.documentElement.dataset.theme;
            void (async () => {
                try {
                    const svg = await renderMermaid(`plunibio-mermaid-diagram-${id}-${version}`, content, load);
                    if (!current()) { stopObserving(); return; }
                    if (version !== generation || theme !== document.documentElement.dataset.theme) return;
                    const result = document.createElement("div");
                    result.id = placeholderId;
                    result.className = "mermaid-preview";
                    result.innerHTML = svg;
                    applyPreview(result);
                } catch (error: unknown) {
                    if (!current()) { stopObserving(); return; }
                    if (version !== generation || theme !== document.documentElement.dataset.theme) return;
                    const result = document.createElement("div");
                    result.id = placeholderId;
                    result.className = "mermaid-preview";
                    result.append(createError(options.errorText, error));
                    applyPreview(result);
                }
            })();
        };
        const stopObserving = observeMermaidTheme(current, refresh);
        refresh();

        return placeholder;
    };
}

