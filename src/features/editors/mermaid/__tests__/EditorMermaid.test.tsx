/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { render } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditorView } from "@codemirror/view";
import { invoke } from "@tauri-apps/api/core";
import { useAppContext, type AppContextValues } from "@/app/AppContext";
import { StoryAppProvider } from "@/app/__stories__/support/StoryAppProvider";
import I18NProvider from "@/i18n/Localization";
import EditorMermaid from "../EditorMermaid";

const mermaid = vi.hoisted(() => ({ initialize: vi.fn(), render: vi.fn() }));
vi.mock("mermaid", () => ({ default: mermaid }));
vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));

describe("EditorMermaid", () => {
    let root: HTMLDivElement;
    let dispose: (() => void) | undefined;
    let context: AppContextValues;
    let diskContent: string;
    function Probe() { context = useAppContext(); return null; }
    const mount = async (): Promise<void> => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => (
            <I18NProvider>
                <StoryAppProvider filename="diagram.mmd">
                    <Probe />
                    <EditorMermaid />
                </StoryAppProvider>
            </I18NProvider>
        ), root);
        await vi.waitFor(() => expect(context.editor.toggleSourceMode()).not.toBeNull());
    };
    const toggle = async (): Promise<void> => {
        await context.editor.toggleSourceMode()?.();
    };
    const source = (): EditorView => {
        const dom = root.querySelector<HTMLElement>('[data-testid="text-editor"] .cm-editor');
        const editor = dom && EditorView.findFromDOM(dom);
        if (!editor) throw new Error("Missing source editor");
        return editor;
    };
    const writes = () => vi.mocked(invoke).mock.calls.filter(([command]) => command === "write_file");

    beforeEach(() => {
        document.documentElement.dataset.theme = "light";
        diskContent = "%% original spacing\nflowchart LR\n  A --> B\n";
        vi.mocked(invoke).mockReset();
        vi.mocked(invoke).mockImplementation(async (command) => (
            command === "read_file" ? { content: diskContent, isNew: false } : undefined
        ));
        mermaid.render.mockReset();
        mermaid.render.mockResolvedValue({ svg: '<svg aria-label="diagram"></svg>' });
    });
    afterEach(async () => {
        dispose?.();
        root?.remove();
        await new Promise((resolve) => setTimeout(resolve, 0));
    });

    it("starts with a read-only diagram and preserves the exact source when saving", async () => {
        await mount();
        await vi.waitFor(() => expect(root.querySelector('[data-testid="mermaid-preview"] svg')).not.toBeNull());
        expect(context.editor.sourceMode()).toBe(false);
        expect(root.querySelector('[contenteditable="true"]')).toBeNull();
        expect(context.editor.fileModified()).toBe(false);
        await context.editor.saveFile()?.();
        expect(writes()[writes().length - 1]?.[1]).toMatchObject({ content: diskContent });
        expect(mermaid.initialize).toHaveBeenCalledWith(expect.objectContaining({
            securityLevel: "strict", theme: "base", suppressErrorRendering: true,
        }));
    });

    it("edits with Mermaid highlighting and search, renders changes and reloads", async () => {
        await mount();
        await toggle();
        expect(source().state.doc.toString()).toBe(diskContent);
        expect(root.querySelector('[data-testid="text-editor"] .tok-typeName')?.textContent).toBe("flowchart");
        expect(context.editor.searchFile()).not.toBeNull();
        const updated = "flowchart TD\n  C --> D\n";
        source().dispatch({ changes: { from: 0, to: source().state.doc.length, insert: updated } });
        expect(context.editor.fileModified()).toBe(true);
        await toggle();
        await vi.waitFor(() => expect(mermaid.render).toHaveBeenLastCalledWith(expect.any(String), updated));
        await context.editor.saveFile()?.();
        expect(writes()[writes().length - 1]?.[1]).toMatchObject({ content: updated });
        diskContent = "flowchart LR\n  Reloaded --> Diagram";
        await context.editor.reloadFile()?.();
        await vi.waitFor(() => expect(mermaid.render).toHaveBeenLastCalledWith(expect.any(String), diskContent));
        await toggle();
        expect(source().state.doc.toString()).toBe(diskContent);
    });

    it("shows MessageView on invalid syntax and recovers after editing the source", async () => {
        diskContent = "invalid diagram";
        mermaid.render.mockRejectedValueOnce(new Error("Unexpected <script>bad()</script>\nDetails"));
        await mount();
        await vi.waitFor(() => expect(root.querySelector('[data-testid="message-view"]')?.textContent)
            .toContain("Unexpected <script>bad()</script>"));
        expect(root.querySelector("script")).toBeNull();
        await context.editor.saveFile()?.();
        expect(writes()[writes().length - 1]?.[1]).toMatchObject({ content: diskContent });
        await toggle();
        source().dispatch({ changes: { from: 0, to: source().state.doc.length, insert: "flowchart LR\n A --> B" } });
        await toggle();
        await vi.waitFor(() => expect(root.querySelector('[data-testid="mermaid-preview"] svg')).not.toBeNull());
        expect(root.querySelector('[data-testid="message-view"]')).toBeNull();
    });

    it("leaves an empty document blank without trying to render it", async () => {
        diskContent = " \n";
        await mount();
        expect(mermaid.render).not.toHaveBeenCalled();
        expect(root.querySelector('[data-testid="message-view"]')).toBeNull();
        await toggle();
        expect(source().state.doc.toString()).toBe(diskContent);
    });

    it("updates the diagram theme without changing its source or marking it modified", async () => {
        await mount();
        await vi.waitFor(() => expect(root.querySelector('[data-testid="mermaid-preview"] svg')).not.toBeNull());
        const sourceBefore = diskContent;
        context.editor.setTheme("dark");
        await vi.waitFor(() => expect(mermaid.initialize).toHaveBeenLastCalledWith(expect.objectContaining({
            theme: "base", themeVariables: expect.objectContaining({ darkMode: true }),
        })));
        expect(mermaid.render).toHaveBeenCalledTimes(2);
        expect(context.editor.fileModified()).toBe(false);
        await context.editor.saveFile()?.();
        expect(writes()[writes().length - 1]?.[1]).toMatchObject({ content: sourceBefore });
        context.editor.setTheme("light");
        await vi.waitFor(() => expect(mermaid.initialize).toHaveBeenLastCalledWith(expect.objectContaining({
            themeVariables: expect.objectContaining({ darkMode: false }),
        })));
        expect(context.editor.fileModified()).toBe(false);
    });

    it("ignores a pending diagram after replacing the document", async () => {
        let finish: ((value: { svg: string }) => void) | undefined;
        mermaid.render.mockImplementationOnce(() => new Promise<{ svg: string }>((resolve) => { finish = resolve; }));
        await mount();
        await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
        expect(root.querySelector('[role="status"]')).not.toBeNull();
        diskContent = "flowchart LR\n New --> Diagram";
        await context.editor.reloadFile()?.();
        finish?.({ svg: "<svg>stale diagram</svg>" });
        await vi.waitFor(() => expect(root.querySelector('[data-testid="mermaid-preview"] svg')).not.toBeNull());
        expect(root.textContent).not.toContain("stale diagram");
        expect(mermaid.render).toHaveBeenLastCalledWith(expect.any(String), diskContent);
    });
});
