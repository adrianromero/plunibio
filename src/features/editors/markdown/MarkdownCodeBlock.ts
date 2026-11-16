/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { CodeMirrorBlock, codeBlockView } from "@milkdown/kit/component/code-block";
import { codeBlockSchema } from "@milkdown/kit/preset/commonmark";
import { $view } from "@milkdown/kit/utils";

const printableBlocks = new WeakMap<HTMLElement, CodeMirrorBlock>();

/** Materialize lazy blocks and keep their previews alive while printing. */
export function prepareMarkdownCodeBlocksForPrint(root: HTMLElement): () => void {
    const restore: (() => void)[] = [];
    const focused = document.activeElement;
    const scroller = root.closest(".scrollingView");
    const scrollTop = scroller?.scrollTop ?? 0;
    const scrollLeft = scroller?.scrollLeft ?? 0;
    root.querySelectorAll<HTMLElement>(".milkdown-code-block").forEach((element) => {
        const block = printableBlocks.get(element);
        if (!block) return;
        element.dataset.printSource = block.node.textContent;
        element.dataset.printLanguage = String(block.node.attrs.language ?? "").toLowerCase();
        const selected = block.selected.value;
        block.selectNode();
        restore.push(() => { if (!selected) block.deselectNode(); });
    });
    if (focused instanceof HTMLElement) focused.focus({ preventScroll: true });
    if (scroller) { scroller.scrollTop = scrollTop; scroller.scrollLeft = scrollLeft; }
    return () => { for (const release of restore) release(); };
}

// Keep Milkdown's node view, including its lazy CodeMirror lifecycle. Its global
// preview-only default otherwise stays latent in empty blocks and hides the
// editor as soon as the first character produces a preview.
export const markdownCodeBlockView = $view(codeBlockSchema.node, () => {
    const createBlock = codeBlockView.view;
    return (...args) => {
        const block = createBlock(...args);
        if (block instanceof CodeMirrorBlock) {
            printableBlocks.set(block.dom, block);
            if (!args[0].textContent.trim()) {
                block.config = { ...block.config, previewOnlyByDefault: false };
            }
        }
        return block;
    };
});
