/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */

import { createSignal, onCleanup, onMount, Show, type JSX } from "solid-js";
import { useI18N } from "@/i18n/Localization";
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
    const refresh = (): void => {
        if (previewRef) {
            previewRef.dataset.printLanguage = "echarts";
            previewRef.dataset.printSource = content ?? "";
        }
        stop?.();
        host.reportError(null);
        host.reportEmpty(content !== null && !content.trim() ? t("editor.emptyECharts") : null);
        if (!mounted) return;
        stop = mountECharts(previewRef, content ?? "", {
            objectError: t("markdownToolbar.codePreviewEChartsObjectError"),
            loading: setLoading,
            error: (reason) => host.reportError(echartsErrorMessage(t("markdownToolbar.codePreviewEChartsError"), reason)),
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
            host.reportError(null);
            host.reportEmpty(null);
            previewRef?.replaceChildren();
        },
    });

    return (
        <section class={styles.studio} data-testid="echarts-view"
            style={{ display: host.active() ? undefined : "none" }}
            inert={!host.active() || !host.ready()}>
            <div class="scrollingView" tabIndex={-1}>
                <div class="contentView">
                    <Show when={loading()}>
                        <div class="echarts-preview-loading" role="status">{t("markdownToolbar.codePreviewLoading")}</div>
                    </Show>
                    <div ref={previewRef} data-print-content class={`echarts-preview ${styles.preview}`}
                        data-testid="echarts-preview" role="region"
                        aria-label={t("markdownToolbar.echartsBlock")} aria-busy={loading()} />
                </div>
            </div>
        </section>
    );
}

export default ViewECharts;
