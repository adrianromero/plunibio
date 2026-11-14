/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { EChartsOption, EChartsType } from "echarts";

export type EChartsApi = Pick<typeof import("echarts"), "init">;
export type EChartsLoader = () => Promise<EChartsApi>;
let library: Promise<EChartsApi> | null = null;

function loadECharts(): Promise<EChartsApi> {
    library ??= import("echarts").catch((error: unknown) => {
        library = null;
        throw error;
    });
    return library;
}

export function echartsErrorMessage(label: string, error: unknown): string {
    const details = error instanceof Error ? error.message.split("\n", 1)[0]?.trim() : "";
    return details ? `${label}: ${details}` : label;
}

export function parseEChartsOption(source: string, objectError: string): EChartsOption {
    // Tooltips stay inside SVG, including string formatters supplied by a document.
    // No document-supplied HTML is inserted into the surrounding editor DOM.
    const value: unknown = JSON.parse(source, (key: string, item: unknown): unknown => {
        if (key !== "tooltip") return item;
        const tooltip = (entry: unknown): unknown => entry && typeof entry === "object" && !Array.isArray(entry)
            ? { ...entry, renderMode: "richText", confine: true } : entry;
        return Array.isArray(item) ? item.map(tooltip) : tooltip(item);
    });
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(objectError);
    return value as EChartsOption;
}

type MountOptions = {
    objectError: string;
    loading: (loading: boolean) => void;
    error: (error: unknown) => void;
};

// Owns a single live SVG chart. Markdown calls this on Milkdown's mounted,
// sanitized copy, since instances cannot survive cloning of their container.
export function mountECharts(
    target: HTMLElement,
    source: string,
    options: MountOptions,
    load: EChartsLoader = loadECharts
): () => void {
    let disposed = false;
    let failed = false;
    let chart: EChartsType | null = null;
    let api: EChartsApi | null = null;
    let resizeObserver: ResizeObserver | undefined;
    let themeObserver: MutationObserver | undefined;
    let width = 0;
    let height = 0;
    const theme = (): string => document.documentElement.dataset.theme === "dark" ? "dark" : "default";
    const release = (): void => {
        resizeObserver?.disconnect();
        themeObserver?.disconnect();
        chart?.dispose();
        chart = null;
    };
    const stop = (): void => {
        disposed = true;
        release();
    };
    const fail = (error: unknown): void => {
        if (disposed || failed) return;
        failed = true;
        release();
        target.replaceChildren();
        options.loading(false);
        options.error(error);
    };
    target.replaceChildren();
    if (!source.trim()) {
        options.loading(false);
        return stop;
    }
    options.loading(true);
    let option: EChartsOption;
    try {
        option = parseEChartsOption(source, options.objectError);
    } catch (error: unknown) {
        fail(error);
        return stop;
    }
    const container = document.createElement("div");
    container.className = "echarts-chart";
    target.append(container);
    const render = (): void => {
        if (disposed || failed || !api || !target.isConnected) return;
        const nextWidth = container.clientWidth;
        const nextHeight = container.clientHeight;
        // Source/view switching temporarily hides the destination. Wait for
        // ResizeObserver instead of initializing ECharts at zero dimensions.
        if (nextWidth <= 0 || nextHeight <= 0) return;
        try {
            if (!chart) {
                chart = api.init(container, theme(), { renderer: "svg", width: nextWidth, height: nextHeight });
                chart.setOption(option, { notMerge: true });
            } else if (width !== nextWidth || height !== nextHeight) {
                chart.resize({ width: nextWidth, height: nextHeight });
            }
            // Flush inside this error boundary, including failures deferred by ZRender.
            chart.getZr().flush();
            width = nextWidth;
            height = nextHeight;
            options.loading(false);
        } catch (error: unknown) { fail(error); }
    };
    resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(container);
    themeObserver = new MutationObserver(() => {
        if (disposed || failed || !chart) return;
        try {
            chart.setTheme(theme());
            chart.getZr().flush();
        } catch (error: unknown) { fail(error); }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    void load().then((loaded) => {
        if (disposed || failed) return;
        api = loaded;
        render();
    }, fail);
    return stop;
}
