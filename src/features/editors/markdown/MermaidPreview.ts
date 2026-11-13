/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import "../shared/MermaidPreview.css";
import { renderMermaid, mermaidErrorMessage, type MermaidLoader } from "../shared/MermaidRenderer";
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
    placeholder.className = "mermaid-preview-loading";

    if (typeof loading === "string") {
        placeholder.textContent = loading;
    } else {
        placeholder.append(loading.cloneNode(true));
    }

    return placeholder;
}

function createError(errorText: string, error: unknown): HTMLDivElement {
    const element = document.createElement("div");
    element.className = "mermaid-preview-error";
    element.setAttribute("role", "alert");

    element.textContent = mermaidErrorMessage(errorText, error);
    return element;
}

function isCurrentPreview(id: string): boolean {
    return document.getElementById(id)?.classList.contains("mermaid-preview-loading") ?? false;
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
        const diagramId = `plunibio-mermaid-diagram-${id}`;
        const placeholder = createPlaceholder(placeholderId, options.loading);

        void (async () => {
            try {
                const svg = await renderMermaid(diagramId, content, load);
                if (isCurrentPreview(placeholderId)) {
                    applyPreview(svg);
                }
            } catch (error: unknown) {
                if (isCurrentPreview(placeholderId)) {
                    applyPreview(createError(options.errorText, error));
                }
            }
        })();

        return placeholder;
    };
}

