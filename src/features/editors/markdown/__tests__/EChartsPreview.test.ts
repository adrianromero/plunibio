/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */

import type { EChartsType } from "echarts";
import type { EChartsApi } from "../../shared/EChartsRenderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CodeBlockConfig } from "@milkdown/kit/component/code-block";
import { createEChartsPreviewRenderer } from "../EChartsPreview";
import { observeCodeBlockLayout } from "../MarkdownCodeBlockLayout";

describe("EChartsPreview", () => {
    const chart = { setOption: vi.fn(), dispose: vi.fn(), resize: vi.fn(), setTheme: vi.fn(), getZr: () => ({ flush: vi.fn() }) };
    const init = vi.fn<EChartsApi["init"]>(() => chart as unknown as EChartsType);
    const fallback: CodeBlockConfig["renderPreview"] = vi.fn(() => "fallback");
    const renderer = () => createEChartsPreviewRenderer(fallback, {
        loading: "Loading", errorText: "Chart error", objectError: "Expected JSON object", label: "ECharts chart",
    }, async () => ({ init }));

    beforeEach(() => {
        vi.clearAllMocks();
        chart.setOption.mockReset();
        vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(600);
        vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(400);
    });
    afterEach(async () => {
        document.body.replaceChildren();
        await Promise.resolve();
        delete document.documentElement.dataset.theme;
        vi.restoreAllMocks();
    });

    it("delegates other languages and leaves empty blocks blank", () => {
        expect(renderer()("json", "{}", vi.fn())).toBe("fallback");
        expect(fallback).toHaveBeenCalledWith("json", "{}", expect.any(Function));
        expect(renderer()("echarts", "  ", vi.fn())).toBeNull();
        expect(init).not.toHaveBeenCalled();
    });

    it("mounts on Milkdown's sanitized clone, follows theme and disposes when removed", async () => {
        const placeholder = renderer()("ECharts", "{}", vi.fn()) as HTMLElement;
        expect(init).not.toHaveBeenCalled();
        const clone = placeholder.cloneNode(true) as HTMLElement;
        document.body.append(clone);
        await vi.waitFor(() => expect(init).toHaveBeenCalledOnce());
        expect(clone.contains(init.mock.calls[0]?.[0] ?? null)).toBe(true);
        document.documentElement.dataset.theme = "dark";
        await vi.waitFor(() => expect(chart.setTheme).toHaveBeenCalledWith("dark"));
        clone.remove();
        await vi.waitFor(() => expect(chart.dispose).toHaveBeenCalledOnce());
        document.documentElement.dataset.theme = "light";
        await Promise.resolve();
        expect(chart.setTheme).toHaveBeenCalledOnce();
    });

    it.each(['{"bad":', "[]"])("shows a parse error for %s without losing the code block", async source => {
        const placeholder = renderer()("echarts", source, vi.fn()) as HTMLElement;
        document.body.append(placeholder.cloneNode(true));
        await vi.waitFor(() => expect(document.querySelector('[role="alert"]')?.textContent).toContain("Chart error"));
        expect(init).not.toHaveBeenCalled();
        expect(document.querySelector(".echarts-preview")).not.toBeNull();
    });

    it("shows render failures as text and cleans up the broken chart", async () => {
        chart.setOption.mockImplementationOnce(() => { throw new Error("bad <script>alert(1)</script>"); });
        document.body.append(renderer()("echarts", "{}", vi.fn()) as HTMLElement);
        await vi.waitFor(() => expect(document.querySelector('[role="alert"]')?.textContent).toContain("Chart error"));
        expect(document.querySelector('[role="alert"]')?.textContent).not.toContain("bad <script>");
        expect(document.querySelector("script")).toBeNull();
        expect(chart.dispose).toHaveBeenCalledOnce();
    });

    it("releases a failed preview's reservation without affecting the preceding valid chart", async () => {
        const root = document.createElement("div");
        const valid = document.createElement("div");
        const invalid = document.createElement("div");
        valid.className = invalid.className = "milkdown-code-block";
        root.append(valid, invalid);
        document.body.append(root);
        valid.append(renderer()("echarts", "{}", vi.fn()) as HTMLElement);
        invalid.append(renderer()("echarts", "{}", vi.fn()) as HTMLElement);
        await vi.waitFor(() => expect(init).toHaveBeenCalledTimes(2));
        vi.spyOn(valid, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 600, 440));
        vi.spyOn(invalid, "getBoundingClientRect").mockImplementation(() =>
            new DOMRect(0, 0, 600, invalid.querySelector('[role="alert"]') ? 60 : 440));
        const stop = observeCodeBlockLayout(root);
        try {
            invalid.replaceChildren(renderer()("echarts", '{"bad":', vi.fn()) as HTMLElement);
            await vi.waitFor(() => {
                expect(invalid.querySelector('[role="alert"]')).not.toBeNull();
                expect(invalid.querySelector(".echarts-preview")?.getAttribute("aria-busy")).toBe("false");
                expect(invalid.style.getPropertyValue("--code-block-reserved-height")).toBe("");
            });
            expect(invalid.querySelector(".echarts-chart")).toBeNull();
            expect(valid.querySelector(".echarts-chart")).not.toBeNull();
            expect(valid.style.getPropertyValue("--code-block-reserved-height")).toBe("");
            invalid.innerHTML = '<pre class="milkdown-code-block-placeholder">invalid</pre>';
            await vi.waitFor(() => expect(invalid.style.getPropertyValue("--code-block-reserved-height")).toBe("60px"));
        } finally { stop(); }
    });
});
