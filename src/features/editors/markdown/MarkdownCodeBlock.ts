/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { CodeMirrorBlock, codeBlockView } from "@milkdown/kit/component/code-block";
import { codeBlockSchema } from "@milkdown/kit/preset/commonmark";
import { $view } from "@milkdown/kit/utils";

// Keep Milkdown's node view, including its lazy CodeMirror lifecycle. Its global
// preview-only default otherwise stays latent in empty blocks and hides the
// editor as soon as the first character produces a preview.
export const markdownCodeBlockView = $view(codeBlockSchema.node, () => {
    const createBlock = codeBlockView.view;
    return (...args) => {
        const block = createBlock(...args);
        if (block instanceof CodeMirrorBlock && !args[0].textContent.trim()) {
            block.config = { ...block.config, previewOnlyByDefault: false };
        }
        return block;
    };
});
