/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */
import { afterEach, expect, it, vi } from "vitest";
import { renderPrintPreviews } from "../PrintPreviews";
import { renderMermaid } from "@/features/editors/shared/MermaidRenderer";
import { init } from "echarts";

const chart = vi.hoisted(() => ({
    setOption: vi.fn(), dispose: vi.fn(), isDisposed: vi.fn(() => false), getZr: () => ({ flush: vi.fn() }),
}));
vi.mock("echarts", () => ({ init: vi.fn((target: HTMLElement) => {
    target.innerHTML = '<svg width="680" height="400" style="position:absolute;left:0;top:0"></svg>';
    return chart;
}) }));
vi.mock("@/features/editors/shared/MermaidRenderer", () => ({
    renderMermaid: vi.fn(async () => '<svg viewBox="0 0 100 50"><text>Light diagram</text></svg>'),
}));

afterEach(() => { document.body.replaceChildren(); vi.clearAllMocks(); delete document.documentElement.dataset.theme; });

it("rerenders Mermaid in a light staging root and leaves the dark editor unchanged", async () => {
    document.documentElement.dataset.theme = "dark";
    const root = document.createElement("article");
    root.dataset.theme = "light";
    root.innerHTML = '<div data-print-language="mermaid" data-print-source="flowchart LR; A --> B"><svg data-old-dark-svg></svg></div>';
    document.body.append(root);
    await renderPrintPreviews(root);
    expect(renderMermaid).toHaveBeenCalledWith(expect.any(String), "flowchart LR; A --> B", undefined, root);
    expect(root.querySelector("[data-old-dark-svg]")).toBeNull();
    expect(root.querySelector("text")?.textContent).toBe("Light diagram");
    expect(document.documentElement.dataset.theme).toBe("dark");
});

it("renders ECharts with the light theme, a transparent background and animation disabled", async () => {
    document.documentElement.dataset.theme = "dark";
    const root = document.createElement("article");
    root.innerHTML = '<div data-print-language="echarts"></div>';
    const target = root.firstElementChild as HTMLElement;
    target.dataset.printSource = JSON.stringify({ title: { text: "Sales" }, backgroundColor: "black", animation: true });
    document.body.append(root);
    await renderPrintPreviews(root);
    expect(init).toHaveBeenCalledWith(expect.any(HTMLElement), "default", { renderer: "svg", width: 680, height: 400 });
    expect(chart.setOption).toHaveBeenCalledWith(expect.objectContaining({ backgroundColor: "transparent", animation: false }), { notMerge: true });
    expect(root.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 680 400");
    expect(root.querySelector("svg")?.style.position).toBe("");
    expect(root.querySelector("svg")?.style.display).toBe("block");
    expect(chart.dispose).toHaveBeenCalled();
    expect(document.documentElement.dataset.theme).toBe("dark");
});
