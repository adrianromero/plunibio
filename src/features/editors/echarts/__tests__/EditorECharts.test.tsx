/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */

import { render } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditorView } from "@codemirror/view";
import { invoke } from "@tauri-apps/api/core";
import { useAppContext, type AppContextValues } from "@/app/AppContext";
import { StoryAppProvider } from "@/app/__stories__/support/StoryAppProvider";
import I18NProvider from "@/i18n/Localization";
import { frontendLog } from "@/shared/logging/frontendLog";
import EditorECharts from "../EditorECharts";

const chart = vi.hoisted(() => ({ setOption: vi.fn(), setTheme: vi.fn(), dispose: vi.fn(), resize: vi.fn(), flush: vi.fn() }));
vi.mock("@/shared/logging/frontendLog", () => ({ frontendLog: vi.fn() }));
vi.mock("echarts", () => ({ init: vi.fn((target: HTMLElement) => {
    target.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="680" height="400"></svg>';
    return { ...chart, isDisposed: () => false, getZr: () => ({ flush: chart.flush }) };
}) }));
vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));

describe("EditorECharts", () => {
    let root: HTMLDivElement;
    let dispose: (() => void) | undefined;
    let context: AppContextValues;
    let diskContent: string;
    function Probe() { context = useAppContext(); return null; }
    const mount = async (): Promise<void> => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => (
            <I18NProvider><StoryAppProvider filename="chart.echarts.json">
                <Probe /><EditorECharts />
            </StoryAppProvider></I18NProvider>
        ), root);
        await vi.waitFor(() => expect(context.editor.toggleSourceMode()).not.toBeNull());
    };
    const toggle = async (): Promise<void> => { await context.editor.toggleSourceMode()?.(); };
    const source = (): EditorView => {
        const dom = root.querySelector<HTMLElement>('[data-testid="text-editor"] .cm-editor');
        const editor = dom && EditorView.findFromDOM(dom);
        if (!editor) throw new Error("Missing source editor");
        return editor;
    };
    const writes = () => vi.mocked(invoke).mock.calls.filter(([command]) => command === "write_file");

    beforeEach(() => {
        vi.clearAllMocks();
        chart.setOption.mockReset();
        document.documentElement.dataset.theme = "light";
        diskContent = '{\n  "series": [{"type": "pie", "data": [1, 2]}]\n}\n';
        vi.mocked(invoke).mockImplementation(async command => command === "read_file" ? { content: diskContent, isNew: false } : undefined);
        vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(600);
        vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(400);
    });
    afterEach(async () => {
        dispose?.();
        root?.remove();
        vi.restoreAllMocks();
        await new Promise(resolve => setTimeout(resolve, 0));
    });

    it("prints the chart only after rendering finishes", async () => {
        const print = vi.spyOn(window, "print").mockImplementation(() => {
            expect(chart.flush).toHaveBeenCalled();
            expect(document.querySelector('.print-document .echarts-preview svg')).not.toBeNull();
        });
        try {
            await mount();
            await context.editor.printFile()?.();
            expect(print).toHaveBeenCalledOnce();
            window.dispatchEvent(new Event("afterprint"));
        } finally { print.mockRestore(); }
    });

    it("starts read-only and saves the exact JSON source including whitespace", async () => {
        await mount();
        await vi.waitFor(() => expect(chart.setOption).toHaveBeenCalled());
        expect(context.editor.sourceMode()).toBe(false);
        expect(context.editor.fileModified()).toBe(false);
        expect(root.querySelector('[contenteditable="true"]')).toBeNull();
        expect(root.querySelector('[data-testid="echarts-preview"]')?.hasAttribute("tabindex")).toBe(false);
        await context.editor.saveFile()?.();
        expect(writes()[writes().length - 1]?.[1]).toMatchObject({ content: diskContent });
    });

    it("highlights JSON, focuses the source, searches, renders edits and reloads", async () => {
        await mount();
        await toggle();
        expect(source().state.doc.toString()).toBe(diskContent);
        expect(root.querySelector('[data-testid="text-editor"] .tok-string')?.textContent).toBe('"pie"');
        expect(context.editor.searchFile()).not.toBeNull();
        await vi.waitFor(() => expect(document.activeElement).toBe(root.querySelector(".cm-content")));
        const updated = '{"title":{"text":"Updated"}}';
        source().dispatch({ changes: { from: 0, to: source().state.doc.length, insert: updated } });
        expect(context.editor.fileModified()).toBe(true);
        await toggle();
        await vi.waitFor(() => expect(chart.setOption).toHaveBeenLastCalledWith(expect.objectContaining(JSON.parse(updated)), { notMerge: true }));
        expect(context.editor.searchFile()).toBeNull();
        expect(root.querySelector<HTMLElement>('[data-testid="text-editor"]')?.parentElement?.parentElement?.style.display).toBe("none");
        await context.editor.saveFile()?.();
        expect(writes()[writes().length - 1]?.[1]).toMatchObject({ content: updated });
        diskContent = '{"title":{"text":"Reloaded"}}';
        await context.editor.reloadFile()?.();
        await vi.waitFor(() => expect(chart.setOption).toHaveBeenLastCalledWith(expect.objectContaining(JSON.parse(diskContent)), { notMerge: true }));
    });

    it.each(['{"series":', "[]", "null"])("shows MessageView for %s, preserves source and recovers after correction", async invalid => {
        diskContent = invalid;
        await mount();
        await vi.waitFor(() => expect(root.querySelector('[data-testid="message-view"]')).not.toBeNull());
        expect(chart.setOption).not.toHaveBeenCalled();
        await context.editor.saveFile()?.();
        expect(writes()[writes().length - 1]?.[1]).toMatchObject({ content: invalid });
        const action = root.querySelector<HTMLButtonElement>('[data-testid="message-view"] button');
        expect(action?.textContent).toBe("Show source code");
        action?.click();
        await vi.waitFor(() => expect(context.editor.sourceMode()).toBe(true));
        expect(source().state.doc.toString()).toBe(invalid);
        source().dispatch({ changes: { from: 0, to: source().state.doc.length, insert: "{}" } });
        await toggle();
        await vi.waitFor(() => expect(chart.setOption).toHaveBeenCalled());
        expect(root.querySelector('[data-testid="message-view"]')).toBeNull();
    });

    it.each(["setOption", "flush"] as const)("shows MessageView when ECharts %s fails", async stage => {
        chart[stage].mockImplementationOnce(() => { throw new Error("Render <script>bad()</script>\nDetails"); });
        await mount();
        await vi.waitFor(() => expect(root.querySelector('[data-testid="message-view"]')?.textContent).toContain("The chart could not be rendered"));
        expect(root.querySelector('[data-testid="message-view"]')?.textContent).not.toContain("Render <script>");
        expect(frontendLog).toHaveBeenCalledWith("error", "echarts.render.failed", {
            error: expect.stringContaining("Render <script>bad()</script>\nDetails"),
        });
        expect(root.querySelector("script")).toBeNull();
        expect(chart.dispose).toHaveBeenCalled();
        expect(context.editor.fileModified()).toBe(false);
    });

    it("changes native theme without marking the source modified", async () => {
        await mount();
        await vi.waitFor(() => expect(chart.setOption).toHaveBeenCalled());
        context.editor.setTheme("dark");
        await vi.waitFor(() => expect(chart.setTheme).toHaveBeenCalledWith("dark"));
        expect(context.editor.fileModified()).toBe(false);
        await context.editor.saveFile()?.();
        expect(writes()[writes().length - 1]?.[1]).toMatchObject({ content: diskContent });
    });

    it.each(["", " \n\t"])("shows an informational empty state for %j and renders after editing", async empty => {
        diskContent = empty;
        await mount();
        const message = root.querySelector('[data-testid="message-view"]');
        expect(message?.getAttribute("data-message-kind")).toBe("status");
        expect(message?.textContent).toContain("Add the chart configuration in JSON to get started.");
        expect(message?.querySelector("button")?.textContent).toBe("Show source code");
        expect(root.querySelector<HTMLElement>('[data-testid="echarts-view"]')?.style.display).toBe("none");
        expect(chart.setOption).not.toHaveBeenCalled();
        expect(frontendLog).not.toHaveBeenCalledWith("error", expect.anything(), expect.anything());
        expect(context.editor.fileModified()).toBe(false);
        await context.editor.saveFile()?.();
        expect(writes()[writes().length - 1]?.[1]).toMatchObject({ content: empty });
        await toggle();
        expect(source().state.doc.toString()).toBe(empty);
        expect(root.querySelector('[data-testid="message-view"]')).toBeNull();
        source().dispatch({ changes: { from: 0, to: source().state.doc.length, insert: "{}" } });
        await toggle();
        await vi.waitFor(() => expect(chart.setOption).toHaveBeenCalled());
        expect(root.querySelector('[data-testid="message-view"]')).toBeNull();
        diskContent = empty;
        await context.editor.reloadFile()?.();
        expect(root.querySelector('[data-testid="message-view"]')?.getAttribute("data-message-kind")).toBe("status");
        diskContent = "{}";
        context.main.setFilename("another.echarts.json");
        await vi.waitFor(() => expect(context.editor.toggleSourceMode()).not.toBeNull());
        expect(root.querySelector('[data-testid="message-view"]')).toBeNull();
    });
});
