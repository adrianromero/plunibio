/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */

import type { CodeBlockConfig } from "@milkdown/kit/component/code-block";
import { echartsErrorMessage, mountECharts, type EChartsLoader } from "../shared/EChartsRenderer";
import "../shared/EChartsPreview.css";

type PreviewRenderer = CodeBlockConfig["renderPreview"];
type PreviewOptions = { loading: string | HTMLElement; errorText: string; objectError: string; label: string };
type Subscription = { update: () => void; stop: () => void };
const subscriptions = new Set<Subscription>();
let observer: MutationObserver | null = null;
let nextId = 0;

function watch(subscription: Subscription): void {
    subscriptions.add(subscription);
    observer ??= new MutationObserver(() => {
        for (const entry of subscriptions) entry.update();
        if (!subscriptions.size) { observer?.disconnect(); observer = null; }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    // Milkdown mounts a sanitized clone later; no ECharts instance is attached
    // to the detached placeholder passed through renderPreview.
    subscription.update();
}

export function createEChartsPreviewRenderer(
    fallback: PreviewRenderer,
    options: PreviewOptions,
    load?: EChartsLoader
): PreviewRenderer {
    return (language, content, applyPreview) => {
        if (language.trim().toLowerCase() !== "echarts") return fallback(language, content, applyPreview);
        if (!content.trim()) return null;
        const id = `plunibio-echarts-preview-${++nextId}`;
        const placeholder = document.createElement("div");
        placeholder.id = id;
        placeholder.className = "echarts-preview";
        placeholder.setAttribute("role", "region");
        placeholder.setAttribute("aria-label", options.label);
        const loading = document.createElement("div");
        loading.className = "echarts-preview-loading";
        loading.setAttribute("role", "status");
        if (typeof options.loading === "string") loading.textContent = options.loading;
        else loading.append(options.loading.cloneNode(true));
        placeholder.append(loading);
        let live: HTMLElement | null = null;
        let cleanup: (() => void) | undefined;
        const subscription: Subscription = {
            stop: () => { cleanup?.(); subscriptions.delete(subscription); },
            update: () => {
                const current = document.getElementById(id);
                if (current === live) return;
                cleanup?.();
                if (!current) { subscription.stop(); return; }
                live = current;
                const status = loading.cloneNode(true) as HTMLElement;
                const chart = document.createElement("div");
                current.replaceChildren(status, chart);
                cleanup = mountECharts(chart, content, {
                    objectError: options.objectError,
                    loading: (busy) => { current.setAttribute("aria-busy", String(busy)); status.hidden = !busy; },
                    error: (reason) => {
                        const error = document.createElement("div");
                        error.className = "echarts-preview-error";
                        error.setAttribute("role", "alert");
                        error.textContent = echartsErrorMessage(options.errorText, reason);
                        chart.replaceChildren(error);
                    },
                }, load);
            },
        };
        watch(subscription);
        // Keep the same live DOM tree while ECharts updates it; applyPreview
        // would sanitize/clone it again and discard its event handlers.
        void applyPreview;
        return placeholder;
    };
}
