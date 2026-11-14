/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */

import type { EChartsType } from "echarts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountECharts, parseEChartsOption, type EChartsApi } from "../EChartsRenderer";

describe("EChartsRenderer lifecycle", () => {
    let target: HTMLDivElement;
    let stop: (() => void) | undefined;
    let resize: ResizeObserverCallback;
    const chart = {
        setOption: vi.fn(), setTheme: vi.fn(), resize: vi.fn(), dispose: vi.fn(),
        getZr: () => ({ flush: vi.fn() }),
    };
    const init = vi.fn(() => chart as unknown as EChartsType);
    const loading = vi.fn();
    const error = vi.fn();
    const options = { objectError: "Expected a JSON object", loading, error };

    beforeEach(() => {
        vi.clearAllMocks();
        init.mockImplementation(() => chart as unknown as EChartsType);
        chart.setOption.mockReset();
        target = document.createElement("div");
        document.body.append(target);
        vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(600);
        vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(400);
        vi.stubGlobal("ResizeObserver", class {
            constructor(callback: ResizeObserverCallback) { resize = callback; }
            observe = vi.fn();
            disconnect = vi.fn();
        });
    });
    afterEach(() => {
        stop?.();
        target.remove();
        delete document.documentElement.dataset.theme;
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });
    const mount = (content = '{"series":[{"type":"pie","data":[1,2]}]}') => {
        stop = mountECharts(target, content, options, async () => ({ init }));
    };

    it.each(["null", "[]", "42", '"text"', "true"])("rejects a non-object root: %s", source => {
        expect(() => parseEChartsOption(source, options.objectError)).toThrow(options.objectError);
    });

    it("keeps string formatters inside SVG rather than rendering document HTML", () => {
        const result = parseEChartsOption('{"tooltip":{"renderMode":"html","formatter":"<img src=x onerror=alert(1)>"}}', "object");
        expect(result.tooltip).toMatchObject({ renderMode: "richText", confine: true });
    });

    it("reports malformed JSON without loading the library", () => {
        mount('{"series":');
        expect(error).toHaveBeenCalledWith(expect.any(SyntaxError));
        expect(init).not.toHaveBeenCalled();
        expect(loading).toHaveBeenLastCalledWith(false);
    });

    it("uses SVG, replaces options and follows native theme without reparsing source", async () => {
        mount();
        await vi.waitFor(() => expect(init).toHaveBeenCalledOnce());
        expect(init).toHaveBeenCalledWith(expect.any(HTMLElement), "default", { renderer: "svg", width: 600, height: 400 });
        expect(chart.setOption).toHaveBeenCalledWith(expect.objectContaining({ series: [{ type: "pie", data: [1, 2] }] }), { notMerge: true });
        document.documentElement.dataset.theme = "dark";
        await vi.waitFor(() => expect(chart.setTheme).toHaveBeenCalledWith("dark"));
        document.documentElement.dataset.theme = "light";
        await vi.waitFor(() => expect(chart.setTheme).toHaveBeenLastCalledWith("default"));
        expect(chart.setOption).toHaveBeenCalledOnce();
        expect(error).not.toHaveBeenCalled();
    });

    it("waits for a visible size, then resizes on layout changes", async () => {
        const width = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(0);
        mount();
        await Promise.resolve();
        expect(init).not.toHaveBeenCalled();
        width.mockReturnValue(600);
        resize([], {} as ResizeObserver);
        expect(init).toHaveBeenCalledOnce();
        width.mockReturnValue(300);
        resize([], {} as ResizeObserver);
        expect(chart.resize).toHaveBeenCalledWith({ width: 300, height: 400 });
    });

    it.each(["init", "setOption", "flush", "theme", "resize"])("reports %s failures and disposes partial instances", async stage => {
        const failure = new Error("ECharts failure");
        if (stage === "init") init.mockImplementationOnce(() => { throw failure; });
        if (stage === "setOption") chart.setOption.mockImplementationOnce(() => { throw failure; });
        if (stage === "flush") vi.spyOn(chart, "getZr").mockReturnValueOnce({ flush: vi.fn(() => { throw failure; }) });
        mount();
        await vi.waitFor(() => expect(init).toHaveBeenCalledOnce());
        if (stage === "theme") {
            chart.setTheme.mockImplementationOnce(() => { throw failure; });
            document.documentElement.dataset.theme = "dark";
        }
        if (stage === "resize") {
            vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(300);
            chart.resize.mockImplementationOnce(() => { throw failure; });
            resize([], {} as ResizeObserver);
        }
        await vi.waitFor(() => expect(error).toHaveBeenCalledWith(failure));
        if (stage !== "init") expect(chart.dispose).toHaveBeenCalledOnce();
        expect(target.children).toHaveLength(0);
    });

    it("reports a failed dynamic import", async () => {
        stop = mountECharts(target, "{}", options, async () => { throw new Error("load failed"); });
        await vi.waitFor(() => expect(error).toHaveBeenCalledWith(expect.objectContaining({ message: "load failed" })));
    });

    it("does not initialize a chart if removed during loading", async () => {
        let finish!: (api: EChartsApi) => void;
        stop = mountECharts(target, "{}", options, () => new Promise(resolve => { finish = resolve; }));
        stop();
        finish({ init });
        await Promise.resolve();
        expect(init).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
    });
});
