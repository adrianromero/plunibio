/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createSignal, onCleanup, onMount, Show, type JSX } from "solid-js";
import { useI18N } from "@/i18n/Localization";
import { renderMermaid, mermaidErrorMessage } from "../shared/MermaidRenderer";
import "../shared/MermaidPreview.css";
import { observeMermaidTheme } from "../shared/MermaidTheme";
import { useEditorTextView } from "../text/EditorTextViewContext";
import styles from "./ViewMermaid.module.css";

let diagramId = 0;

export function ViewMermaid(): JSX.Element {
    const host = useEditorTextView();
    const { t } = useI18N();
    let previewRef!: HTMLDivElement;
    let content: string | null = null;
    let generation = 0;
    const [loading, setLoading] = createSignal(false);
    let stopObserving: (() => void) | undefined;
    const refresh = (): void => {
        const version = ++generation;
        const source = content;
        const theme = document.documentElement.dataset.theme;
        host.reportError(null);
        host.reportEmpty(source !== null && !source.trim() ? t("editor.emptyMermaid") : null);
        setLoading(Boolean(source?.trim()));
        if (!source?.trim()) {
            previewRef.replaceChildren();
            return;
        }
        void renderMermaid(`plunibio-mermaid-view-${++diagramId}`, source).then(
            (svg) => {
                if (version !== generation || theme !== document.documentElement.dataset.theme) return;
                previewRef.innerHTML = svg;
                setLoading(false);
            },
            (reason: unknown) => {
                if (version !== generation || theme !== document.documentElement.dataset.theme) return;
                host.reportError(mermaidErrorMessage(t("markdownToolbar.codePreviewMermaidError"), reason));
                setLoading(false);
            }
        );
    };
    onMount(() => { stopObserving = observeMermaidTheme(() => previewRef, refresh); });
    onCleanup(() => {
        generation += 1;
        stopObserving?.();
    });

    host.register({
        getContent: () => Promise.resolve(content),
        replaceContent: async (source) => {
            content = source;
            previewRef.replaceChildren();
            refresh();
        },
        destroy: async () => {
            generation += 1;
            content = null;
            setLoading(false);
            host.reportError(null);
            host.reportEmpty(null);
            previewRef.replaceChildren();
        },
    });

    return (
        <section
            class={styles.studio}
            data-testid="mermaid-view"
            style={{ display: host.active() ? undefined : "none" }}
            inert={!host.active() || !host.ready()}
        >
            <div class="scrollingView" tabIndex={-1}>
                <div class="contentView">
                    <Show when={loading()}>
                        <div class="mermaid-preview">
                            <div class="mermaid-preview-loading" role="status">
                                {t("markdownToolbar.codePreviewLoading")}
                            </div>
                        </div>
                    </Show>
                    <div
                        ref={previewRef}
                        class={`mermaid-preview ${styles.preview}`}
                        data-testid="mermaid-preview"
                        role="region"
                        aria-label={t("markdownToolbar.mermaidBlock")}
                        aria-busy={loading()}
                    />
                </div>
            </div>
        </section>
    );
}

export default ViewMermaid;
