/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */

import { renderMermaid } from "@/features/editors/shared/MermaidRenderer";
import { parseEChartsOption } from "@/features/editors/shared/EChartsRenderer";

let previewId = 0;

/** Render from source in a light, measured staging area; the live editor keeps
 * its theme. SVG colours are baked in and cannot be fixed with print CSS alone. */
export async function renderPrintPreviews(root: HTMLElement): Promise<void> {
    for (const target of root.querySelectorAll<HTMLElement>("[data-print-language]")) {
        const language = target.dataset.printLanguage;
        const source = target.dataset.printSource ?? "";
        if (!source.trim() || (language !== "mermaid" && language !== "echarts")) continue;
        const preview = document.createElement("div");
        preview.className = `${language}-preview`;
        preview.dataset.theme = "light";
        target.replaceChildren(preview);
        if (language === "mermaid") {
            preview.innerHTML = await renderMermaid(`plunibio-print-diagram-${++previewId}`, source, undefined, root);
        } else {
            const { init } = await import("echarts");
            const chart = init(preview, "default", { renderer: "svg", width: 680, height: 400 });
            try {
                const option = parseEChartsOption(source, "Expected an ECharts option object");
                chart.setOption({ ...option, backgroundColor: "transparent", animation: false }, { notMerge: true });
                chart.getZr().flush();
                const svg = preview.querySelector("svg")?.cloneNode(true);
                if (!(svg instanceof SVGElement)) throw new Error("ECharts did not produce a printable SVG");
                svg.setAttribute("viewBox", "0 0 680 400");
                svg.removeAttribute("style");
                svg.style.display = "block";
                svg.style.width = "100%";
                svg.style.height = "auto";
                chart.dispose();
                preview.replaceChildren(svg);
            } finally {
                if (!chart.isDisposed()) chart.dispose();
            }
        }
        // No fixed editor heights, hidden source panes or active preview IDs.
        preview.querySelectorAll<SVGSVGElement>("svg").forEach(svg => {
            svg.style.maxWidth = "100%";
            svg.style.height = "auto";
        });
        target.removeAttribute("data-print-source");
    }
}
