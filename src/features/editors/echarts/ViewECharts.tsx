/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */

import { createSignal, onCleanup, onMount, Show, type JSX } from "solid-js";
import { useI18N } from "@/i18n/Localization";
import MessageView from "@/shared/errors/MessageView";
import { echartsErrorMessage, mountECharts } from "../shared/EChartsRenderer";
import "../shared/EChartsPreview.css";
import { useEditorTextView } from "../text/EditorTextViewContext";
import styles from "./ViewECharts.module.css";

export function ViewECharts(): JSX.Element {
    const host = useEditorTextView();
    const { t } = useI18N();
    let previewRef!: HTMLDivElement;
    let content: string | null = null;
    let mounted = false;
    let stop: (() => void) | undefined;
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const refresh = (): void => {
        stop?.();
        setError(null);
        if (!mounted) return;
        stop = mountECharts(previewRef, content ?? "", {
            objectError: t("markdownToolbar.codePreviewEChartsObjectError"),
            loading: setLoading,
            error: (reason) => setError(echartsErrorMessage(t("markdownToolbar.codePreviewEChartsError"), reason)),
        });
    };
    onMount(() => { mounted = true; refresh(); });
    onCleanup(() => { mounted = false; stop?.(); });
    host.register({
        getContent: () => Promise.resolve(content),
        replaceContent: async (source) => { content = source; refresh(); },
        destroy: async () => {
            stop?.();
            content = null;
            setLoading(false);
            setError(null);
            previewRef?.replaceChildren();
        },
    });

    return (
        <section class={styles.studio} data-testid="echarts-view"
            style={{ display: host.active() ? undefined : "none" }}
            inert={!host.active() || !host.ready()}>
            <Show when={error()}><MessageView>{error()}</MessageView></Show>
            <div class="scrollingView" tabIndex={-1} style={{ display: error() ? "none" : undefined }}>
                <div class="contentView">
                    <Show when={loading()}>
                        <div class="echarts-preview-loading" role="status">{t("markdownToolbar.codePreviewLoading")}</div>
                    </Show>
                    <div ref={previewRef} class={`echarts-preview ${styles.preview}`}
                        data-testid="echarts-preview" role="region"
                        aria-label={t("markdownToolbar.echartsBlock")} aria-busy={loading()} />
                </div>
            </div>
        </section>
    );
}

export default ViewECharts;
