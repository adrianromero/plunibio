/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createSignal, onCleanup, Show, type JSX } from "solid-js";
import { useI18N } from "@/i18n/Localization";
import MessageView from "@/shared/errors/MessageView";
import { renderMermaid, mermaidErrorMessage } from "../shared/MermaidRenderer";
import "../shared/MermaidPreview.css";
import { useEditorTextView } from "../text/EditorTextViewContext";
import styles from "./ViewMermaid.module.css";

let diagramId = 0;

export function ViewMermaid(): JSX.Element {
    const host = useEditorTextView();
    const { t } = useI18N();
    let viewRef!: HTMLElement;
    let previewRef!: HTMLDivElement;
    let content: string | null = null;
    let generation = 0;
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    onCleanup(() => { generation += 1; });

    host.register({
        getContent: () => Promise.resolve(content),
        replaceContent: async (source) => {
            const version = ++generation;
            content = source;
            setError(null);
            setLoading(Boolean(source.trim()));
            previewRef.replaceChildren();
            if (!source.trim()) return;
            void renderMermaid(`plunibio-mermaid-view-${++diagramId}`, source).then(
                (svg) => {
                    if (version !== generation) return;
                    previewRef.innerHTML = svg;
                    setLoading(false);
                },
                (reason: unknown) => {
                    if (version !== generation) return;
                    setError(mermaidErrorMessage(t("markdownToolbar.codePreviewMermaidError"), reason));
                    setLoading(false);
                }
            );
        },
        focus: () => (error() ? viewRef : previewRef).focus(),
        destroy: async () => {
            generation += 1;
            content = null;
            setLoading(false);
            setError(null);
            previewRef.replaceChildren();
        },
    });

    return (
        <section
            ref={viewRef}
            tabIndex={-1}
            class={styles.studio}
            data-testid="mermaid-view"
            style={{ display: host.active() ? undefined : "none" }}
            inert={!host.active() || !host.ready()}
        >
            <Show when={error()}>
                <MessageView>{error()}</MessageView>
            </Show>
            <div class="scrollingView" style={{ display: error() ? "none" : undefined }}>
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
                        tabIndex={0}
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
