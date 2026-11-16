/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { EditorView as CodeMirror } from "@codemirror/view";
import { Crepe } from "@milkdown/crepe";
import { codeBlockConfig } from "@milkdown/kit/component/code-block";
import { editorViewCtx } from "@milkdown/kit/core";
import { TextSelection } from "@milkdown/kit/prose/state";
import { insertTypedCodeBlock } from "../EditorMarkdownSidebar";
import { markdownCodeBlockView, prepareMarkdownCodeBlocksForPrint } from "../MarkdownCodeBlock";

describe("Markdown code block preview mode", () => {
    let crepe: Crepe;
    let root: HTMLDivElement;

    async function createEditor(markdown = "", asyncPreview = false): Promise<void> {
        root = document.createElement("div");
        document.body.append(root);
        crepe = new Crepe({
            root,
            defaultValue: markdown,
            features: { [Crepe.Feature.Toolbar]: false },
            featureConfigs: {
                [Crepe.Feature.CodeMirror]: {
                    previewOnlyByDefault: true,
                },
            },
        });
        // Exercise Milkdown's visibility and toggle state independently of the
        // diagram libraries (covered by their renderer tests).
        crepe.editor.config((ctx) => ctx.update(codeBlockConfig.key, (config) => ({
            ...config,
            renderPreview: (_language, content, applyPreview) => {
                if (!content.trim()) return null;
                if (asyncPreview) {
                    queueMicrotask(() => applyPreview("<div>Preview</div>"));
                    return undefined;
                }
                return "<div>Preview</div>";
            },
        })));
        crepe.editor.use(markdownCodeBlockView);
        await crepe.create();
    }

    it("materializes offscreen blocks for printing without changing the document", async () => {
        await createEditor("```mermaid\nflowchart LR\n A --> B\n```\n\n```js\nconst x = 1\n```");
        expect(root.querySelectorAll(".milkdown-code-block-placeholder")).toHaveLength(2);
        const original = crepe.getMarkdown();
        const release = prepareMarkdownCodeBlocksForPrint(root);
        await vi.waitFor(() => expect(root.querySelectorAll(".preview")).toHaveLength(2));
        expect(root.querySelector(".milkdown-code-block-placeholder")).toBeNull();
        expect(crepe.getMarkdown()).toBe(original);
        release();
        await vi.waitFor(() => expect(root.querySelector(".milkdown-code-block.selected")).toBeNull());
    });

    afterEach(async () => {
        await crepe?.destroy();
        root?.remove();
    });

    function codeMirror(): CodeMirror {
        const dom = root.querySelector<HTMLElement>(".cm-editor");
        expect(dom).not.toBeNull();
        return CodeMirror.findFromDOM(dom!)!;
    }

    function host(): HTMLElement {
        return root.querySelector<HTMLElement>(".codemirror-host")!;
    }

    it.each(["LaTeX", "ECharts", "Mermaid"].flatMap((language) => [
        { language, asyncPreview: false },
        { language, asyncPreview: true },
    ]))(
        "keeps a new $language block editable when its first preview appears (async: $asyncPreview)",
        async ({ language, asyncPreview }) => {
            await createEditor("", asyncPreview);
            crepe.editor.action((ctx) => {
                insertTypedCodeBlock(ctx, language);
                ctx.get(editorViewCtx).focus();
            });
            await vi.waitFor(() => expect(root.querySelector(".cm-editor")).not.toBeNull());
            const cm = codeMirror();
            cm.focus();
            expect(host().classList.contains("hidden")).toBe(false);
            expect(root.querySelector(".preview-toggle-button")).toBeNull();

            cm.dispatch({ changes: { from: 0, insert: "x" }, selection: { anchor: 1 } });
            await vi.waitFor(() => expect(root.querySelector(".preview-toggle-button")).not.toBeNull());
            expect(host().classList.contains("hidden")).toBe(false);
            expect(cm.hasFocus).toBe(true);
            expect(crepe.getMarkdown()).toContain(language === "LaTeX"
                ? "$$\nx\n$$"
                : `\`\`\`${language}\nx\n\`\`\``);

            cm.dispatch({ changes: { from: 1, insert: "y" }, selection: { anchor: 2 } });
            await vi.waitFor(() => expect(root.querySelector(".preview")?.textContent).toBe("Preview"));
            expect(host().classList.contains("hidden")).toBe(false);

            // Switching to preview remains an explicit, reversible action.
            root.querySelector<HTMLButtonElement>(".preview-toggle-button")!.click();
            await vi.waitFor(() => expect(host().classList.contains("hidden")).toBe(true));
            root.querySelector<HTMLButtonElement>(".preview-toggle-button")!.click();
            await vi.waitFor(() => expect(host().classList.contains("hidden")).toBe(false));
        }
    );

    it.each(["LaTeX", "ECharts", "Mermaid"])(
        "preserves preview-only mode for an existing %s block",
        async (language) => {
            await createEditor(`\`\`\`${language}\nx\n\`\`\``);
            // The test IntersectionObserver does not initialize off-screen views.
            crepe.editor.action((ctx) => {
                const view = ctx.get(editorViewCtx);
                view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 1)));
                view.focus();
            });
            await vi.waitFor(() => expect(root.querySelector(".preview")).not.toBeNull());
            expect(host().classList.contains("hidden")).toBe(true);

            root.querySelector<HTMLButtonElement>(".preview-toggle-button")!.click();
            await vi.waitFor(() => expect(host().classList.contains("hidden")).toBe(false));
            const cm = codeMirror();
            cm.focus();
            cm.dispatch({ changes: { from: 1, insert: "y" } });
            await vi.waitFor(() => expect(crepe.getMarkdown()).toContain("xy"));
            expect(host().classList.contains("hidden")).toBe(false);
        }
    );
});
