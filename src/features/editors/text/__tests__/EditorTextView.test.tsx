/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */
import { createSignal, type Component } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { EditorView } from "@codemirror/view";
import { undo, undoDepth } from "@codemirror/commands";
import { useAppContext, type AppContextValues } from "@/app/AppContext";
import { StoryAppProvider } from "@/app/__stories__/support/StoryAppProvider";
import I18NProvider from "@/i18n/Localization";
import Toolbar from "@/features/toolbar/Toolbar";
import ViewMarkdown from "../../markdown/ViewMarkdown";
import { editorTextExtensionsForFilename } from "../CodeLanguages";
import EditorTextView from "../EditorTextView";
import { useEditorTextView } from "../EditorTextViewContext";

let diskContent = "";
let failRead = false;
let nativeDrop: ((event: { payload: { type: string; paths: string[] } }) => void) | null = null;
vi.mock("@tauri-apps/api/core", () => ({
    invoke: vi.fn((command: string) => {
        if (command === "read_file") {
            return failRead ? Promise.reject(new Error("Read failed")) : Promise.resolve({ content: diskContent, isNew: false });
        }
        return Promise.resolve(undefined);
    }),
}));
vi.mock("@tauri-apps/api/webview", () => ({
    getCurrentWebview: () => ({
        onDragDropEvent: (handler: typeof nativeDrop) => {
            nativeDrop = handler;
            return Promise.resolve(() => { nativeDrop = null; });
        },
    }),
}));
vi.mock("@tauri-apps/api/window", () => ({ getCurrentWindow: () => ({ scaleFactor: async () => 1 }) }));

describe("EditorTextView mode and document lifecycle", () => {
    let root: HTMLDivElement;
    let dispose: (() => void) | undefined;
    let context: AppContextValues;
    function Probe() { context = useAppContext(); return null; }
    const mount = async (markdown = true, view: Component = ViewMarkdown): Promise<void> => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => (
            <I18NProvider>
                <StoryAppProvider filename={markdown ? "notes.md" : "notes.txt"}>
                    <Probe />
                    <Toolbar />
                    <EditorTextView view={markdown ? view : null}
                        extensions={editorTextExtensionsForFilename(markdown ? "notes.md" : "notes.txt") ?? []} />
                </StoryAppProvider>
            </I18NProvider>
        ), root);
        await vi.waitFor(() => expect(context.editor.saveFile()).not.toBeNull());
    };
    const toggle = async (): Promise<void> => {
        const action = context.editor.toggleSourceMode();
        expect(action).not.toBeNull();
        await action?.();
    };
    const source = (): EditorView => {
        const dom = root.querySelector<HTMLElement>('[data-testid="text-editor"] .cm-editor');
        if (!dom) throw new Error("Missing source editor");
        const editor = EditorView.findFromDOM(dom);
        if (!editor) throw new Error("Missing CodeMirror instance");
        return editor;
    };
    const sourceButton = (): HTMLButtonElement | null => root.querySelector('[data-testid="source-mode-toggle"]');
    const writes = () => vi.mocked(invoke).mock.calls.filter(([command]) => command === "write_file");
    beforeEach(() => {
        diskContent = "---\ntitle: Example\n---\n# Original\n\nText\n";
        failRead = false;
        vi.mocked(invoke).mockClear();
    });
    afterEach(async () => {
        dispose?.();
        root?.remove();
        // FileEditorController deliberately queues asynchronous engine disposal.
        await new Promise((resolve) => setTimeout(resolve, 0));
    });

    it("keeps plain text fully editable with search, save and reload, without a view toggle", async () => {
        diskContent = "plain text";
        await mount(false);
        expect(context.editor.sourceMode()).toBe(true);
        expect(sourceButton()).toBeNull();
        expect(context.editor.toggleSourceMode()).toBeNull();
        source().dispatch({ changes: { from: 10, insert: " edited" } });
        expect(context.editor.fileModified()).toBe(true);
        context.editor.searchFile()?.();
        expect(context.editor.sidebarVisible()).toBe(true);
        await context.editor.saveFile()?.();
        expect(writes()[writes().length - 1]?.[1]).toMatchObject({ content: "plain text edited" });
        expect(context.editor.fileModified()).toBe(false);
        diskContent = "reloaded";
        await context.editor.reloadFile()?.();
        expect(source().state.doc.toString()).toBe("reloaded");
    });

    it("transfers the original text unchanged while resetting both engines on every return", async () => {
        diskContent = "---\n\n---\n* item\n\n<!-- comment -->\n";
        await mount();
        const prose = root.querySelector(".ProseMirror");
        expect(sourceButton()?.getAttribute("aria-pressed")).toBe("false");
        context.editor.setSidebarVisible(false);
        const visualSearch = context.editor.searchFile();
        await toggle();
        const editor = source();
        expect(editor.state.doc.toString()).toBe(diskContent);
        expect(sourceButton()?.getAttribute("aria-pressed")).toBe("true");
        expect(context.editor.searchFile()).not.toBe(visualSearch);
        expect(context.editor.sidebarVisible()).toBe(false);
        await vi.waitFor(() => expect(document.activeElement).toBe(editor.contentDOM));
        await toggle();
        expect(root.querySelector(".ProseMirror")).not.toBe(prose);
        expect(context.editor.searchFile()).not.toBe(visualSearch);
        await vi.waitFor(() => expect(document.activeElement).toBe(root.querySelector(".ProseMirror")));
        await toggle();
        expect(source()).not.toBe(editor);
        expect(source().state.doc.toString()).toBe(diskContent);
        expect(context.editor.fileModified()).toBe(false);
        expect(writes()).toHaveLength(0);
    });

    it("imports source changes into Markdown, preserves unsaved state and saves frontmatter from either mode", async () => {
        await mount();
        await toggle();
        const text = "---\ntitle: Changed\n---\n# Source edit\n";
        source().dispatch({ changes: { from: 0, to: source().state.doc.length, insert: text } });
        expect(context.editor.fileModified()).toBe(true);
        await toggle();
        expect(root.querySelector("h1")?.textContent).toBe("Source edit");
        expect(context.editor.fileModified()).toBe(true);
        expect(writes()).toHaveLength(0);
        await context.editor.saveFile()?.();
        expect(writes()[writes().length - 1]?.[1]).toMatchObject({ content: text });
        expect(context.editor.fileModified()).toBe(false);
        await toggle();
        expect(source().state.doc.toString()).toBe(text);
        source().dispatch({ changes: { from: source().state.doc.length, insert: "\nMore" } });
        await context.main.onunload()?.();
        expect(writes()[writes().length - 1]?.[1]).toMatchObject({ content: `${text}\nMore`, createIfEmpty: false });
    });

    it("resets source history on every return and tracks immediate visual changes", async () => {
        await mount();
        await toggle();
        const editor = source();
        editor.dispatch({ changes: { from: editor.state.doc.length, insert: "\nExtra" } });
        expect(undoDepth(editor.state)).toBeGreaterThan(0);
        await toggle();
        await toggle();
        expect(source()).not.toBe(editor);
        expect(undoDepth(source().state)).toBe(0);
        await toggle();
        await context.editor.saveFile()?.();
        const heading = root.querySelector<HTMLElement>("h1")!;
        // Formatting commands use the real ProseMirror selection, without waiting
        // for Milkdown's former 200 ms markdownUpdated debounce.
        heading.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        const button = [...root.querySelectorAll<HTMLButtonElement>('[data-testid="markdown-view"] button')]
            .find((candidate) => candidate.querySelector('svg.lucide-heading2, svg.lucide-heading-2'));
        expect(button).toBeDefined();
        button!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        button!.click();
        expect(context.editor.fileModified()).toBe(true);
        await toggle();
        expect(source().state.doc.toString()).toContain("## Original");
        expect(undoDepth(source().state)).toBe(0);
        expect(undo(source())).toBe(false);
    });

    it("retains source mode on reload and recovery, but starts another Markdown in its visual view", async () => {
        await mount();
        await toggle();
        source().dispatch({ changes: { from: 0, insert: "changed\n" } });
        diskContent = "# Reloaded\n";
        await context.editor.reloadFile()?.();
        expect(context.editor.sourceMode()).toBe(true);
        expect(source().state.doc.toString()).toBe(diskContent);
        expect(undoDepth(source().state)).toBe(0);
        failRead = true;
        await context.editor.reloadFile()?.();
        expect(root.querySelector('[data-testid="message-view"]')).not.toBeNull();
        expect(context.editor.toggleSourceMode()).toBeNull();
        failRead = false;
        await context.editor.reloadFile()?.();
        expect(context.editor.sourceMode()).toBe(true);
        diskContent = "# Another\n";
        context.main.setFilename("another.md");
        await vi.waitFor(() => {
            expect(context.editor.sourceMode()).toBe(false);
            expect(root.querySelector("h1")?.textContent).toBe("Another");
            expect(context.editor.saveFile()).not.toBeNull();
        });
    });

    it("ignores native drops from the hidden Markdown view and prevents repeated toggles", async () => {
        await mount();
        const handler = nativeDrop;
        const first = context.editor.toggleSourceMode()!();
        expect(context.editor.toggleSourceMode()).toBeNull();
        await first;
        const before = vi.mocked(invoke).mock.calls.length;
        handler?.({ payload: { type: "drop", paths: ["/tmp/image.png"] } });
        await Promise.resolve();
        expect(vi.mocked(invoke).mock.calls).toHaveLength(before);
        expect(context.editor.sourceMode()).toBe(true);
    });
    it("tracks YAML edits made in the visual view and transfers the complete document", async () => {
        await mount();
        const dom = root.querySelector<HTMLElement>('[data-testid="frontmatter-editor"] .cm-editor')!;
        const yaml = EditorView.findFromDOM(dom)!;
        yaml.dispatch({ changes: { from: 0, to: yaml.state.doc.length, insert: "title: YAML edit" } });
        expect(context.editor.fileModified()).toBe(true);
        await toggle();
        expect(source().state.doc.toString()).toBe("---\ntitle: YAML edit\n---\n# Original\n\nText\n");
        expect(writes()).toHaveLength(0);
    });

    it.each([false, true])("resets Markdown panels and search on return (source edited: %s)", async (edited) => {
        diskContent = "---\ntitle: Example\n---\n# Original\n\nText Text Text Text\n";
        await mount();
        const frontmatterToggle = root.querySelector<HTMLButtonElement>(
            '[data-testid="markdown-view"] button:has(svg.lucide-file-cog)'
        )!;
        frontmatterToggle.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        expect(root.querySelector('[data-testid="frontmatter-panel"]')?.getAttribute("aria-hidden")).toBe("true");
        context.editor.searchFile()?.();
        const input = root.querySelector<HTMLInputElement>('[data-testid="search-input"]')!;
        input.value = "Text";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        root.querySelector<HTMLInputElement>('[data-testid="search-match-case"] input')!.click();
        const replacement = root.querySelector<HTMLInputElement>('[data-testid="replace-input"]')!;
        replacement.value = "Other";
        replacement.dispatchEvent(new Event("input", { bubbles: true }));
        for (let index = 0; index < 3; index++) {
            input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        }
        expect(root.querySelector('[data-testid="search-panel"]')?.textContent).toContain("3 / 4");
        await toggle();
        if (edited) source().dispatch({ changes: { from: source().state.doc.length, insert: "\nExtra" } });
        await toggle();
        expect(root.querySelector('[data-testid="frontmatter-panel"]')?.getAttribute("aria-hidden")).toBe("false");
        expect(root.querySelector('[data-testid="sidebar-tab"][data-tab-key="format"]')?.getAttribute("aria-selected")).toBe("true");
        context.editor.searchFile()?.();
        expect(root.querySelector<HTMLInputElement>('[data-testid="search-input"]')?.value).toBe("");
        expect(root.querySelector<HTMLInputElement>('[data-testid="replace-input"]')?.value).toBe("");
        expect(root.querySelector<HTMLInputElement>('[data-testid="search-match-case"] input')?.checked).toBe(false);
        expect(root.querySelector('[data-testid="search-panel"]')?.textContent).toContain("0 / 0");
        expect(context.editor.fileModified()).toBe(edited);
        expect(writes()).toHaveLength(0);
    });

    it.each([false, true])("resets source selection, scroll and search on return (view edited: %s)", async (edited) => {
        diskContent = "# Original\n\nText Text Text Text\n";
        await mount();
        await toggle();
        const editor = source();
        const scroll = root.querySelector<HTMLElement>('[data-testid="text-editor"]')!.parentElement!;
        scroll.scrollTop = 100;
        scroll.scrollLeft = 20;
        context.editor.searchFile()?.();
        const input = root.querySelector<HTMLInputElement>('[data-testid="search-input"]')!;
        input.value = "Text";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        root.querySelector<HTMLInputElement>('[data-testid="search-whole-word"] input')!.click();
        for (let index = 0; index < 3; index++) {
            input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        }
        expect(root.querySelector('[data-testid="search-panel"]')?.textContent).toContain("3 / 4");
        expect(editor.state.selection.main.anchor).toBeGreaterThan(0);
        await toggle();
        if (edited) {
            const dom = root.querySelector<HTMLElement>('[data-testid="frontmatter-editor"] .cm-editor')!;
            const yaml = EditorView.findFromDOM(dom)!;
            yaml.dispatch({ changes: { from: 0, insert: "title: Changed" } });
        }
        await toggle();
        expect(source()).not.toBe(editor);
        expect(source().state.selection.main.anchor).toBe(0);
        expect(scroll.scrollTop).toBe(0);
        expect(scroll.scrollLeft).toBe(0);
        expect(root.querySelector<HTMLInputElement>('[data-testid="search-input"]')?.value).toBe("");
        expect(root.querySelector<HTMLInputElement>('[data-testid="search-whole-word"] input')?.checked).toBe(false);
        expect(root.querySelector('[data-testid="search-panel"]')?.textContent).toContain("0 / 0");
        expect(context.editor.fileModified()).toBe(edited);
        expect(writes()).toHaveLength(0);
    });

    it("resets arbitrary view-local state without a view-specific reset method", async () => {
        const TestView: Component = () => {
            const host = useEditorTextView();
            const [localState, setLocalState] = createSignal(0);
            let content = "";
            host.register({
                getContent: async () => content,
                replaceContent: async (text) => { content = text; },
                destroy: () => { content = ""; },
            });
            return <button data-testid="custom-view" onClick={() => setLocalState((value) => value + 1)}>{localState()}</button>;
        };
        await mount(true, TestView);
        const button = root.querySelector<HTMLButtonElement>('[data-testid="custom-view"]')!;
        button.click();
        expect(button.textContent).toBe("1");
        await toggle();
        await toggle();
        const nextButton = root.querySelector<HTMLButtonElement>('[data-testid="custom-view"]')!;
        expect(nextButton).not.toBe(button);
        expect(nextButton.textContent).toBe("0");
        expect(context.editor.fileModified()).toBe(false);
    });

    it("keeps source content and actions available after a failed view creation, then permits retry", async () => {
        let content = "";
        let fail = false;
        const TestView: Component = () => {
            const host = useEditorTextView();
            host.register({
                getContent: async () => content,
                replaceContent: async (text) => {
                    if (fail) throw new Error("View creation failed");
                    content = text;
                },
                destroy: () => { content = ""; },
            });
            return null;
        };
        await mount(true, TestView);
        expect(context.editor.toggleSidebar()).toBeNull();
        expect(context.editor.searchFile()).toBeNull();
        await toggle();
        source().dispatch({ changes: { from: 0, insert: "Edited\n" } });
        const text = source().state.doc.toString();
        fail = true;
        await toggle();
        expect(context.editor.sourceMode()).toBe(true);
        expect(source().state.doc.toString()).toBe(text);
        expect(context.editor.fileModified()).toBe(true);
        expect(context.editor.searchFile()).not.toBeNull();
        expect(context.editor.toggleSidebar()).not.toBeNull();
        fail = false;
        await toggle();
        expect(context.editor.sourceMode()).toBe(false);
        expect(content).toBe(text);
        expect(context.editor.toggleSidebar()).toBeNull();
    });

    it("discards an obsolete mode transition when another document starts loading", async () => {
        let content = "";
        let pending: Promise<void> | null = null;
        let finish: () => void = () => undefined;
        const TestView: Component = () => {
            const host = useEditorTextView();
            host.register({
                getContent: async () => content,
                replaceContent: async (text) => { await pending; content = text; },
                destroy: () => { content = ""; },
            });
            return null;
        };
        await mount(true, TestView);
        await toggle();
        source().dispatch({ changes: { from: 0, insert: "Old edits\n" } });
        pending = new Promise<void>((resolve) => { finish = resolve; });
        const switching = context.editor.toggleSourceMode()!();
        diskContent = "# New document\n";
        context.main.setFilename("new.md");
        await Promise.resolve();
        pending = null;
        finish();
        await switching;
        await vi.waitFor(() => {
            expect(context.editor.saveFile()).not.toBeNull();
            expect(context.editor.sourceMode()).toBe(false);
            expect(content).toBe(diskContent);
        });
        expect(context.editor.fileModified()).toBe(false);
        await context.editor.saveFile()?.();
        expect(writes()[writes().length - 1]?.[1]).toMatchObject({ filename: "new.md", content: diskContent });
    });

});
