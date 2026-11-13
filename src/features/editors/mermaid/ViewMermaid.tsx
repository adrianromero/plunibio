/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createSignal, onCleanup, onMount, Show, type JSX } from "solid-js";
import { useI18N } from "@/i18n/Localization";
import MessageView from "@/shared/errors/MessageView";
import { renderMermaid, mermaidErrorMessage } from "../shared/MermaidRenderer";
import "../shared/MermaidPreview.css";
import { observeMermaidTheme } from "../shared/MermaidTheme";
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
    let stopObserving: (() => void) | undefined;
    const refresh = (): void => {
        const version = ++generation;
        const source = content;
        const theme = document.documentElement.dataset.theme;
        setError(null);
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
                setError(mermaidErrorMessage(t("markdownToolbar.codePreviewMermaidError"), reason));
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
