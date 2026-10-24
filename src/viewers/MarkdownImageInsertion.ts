/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { EditorView } from "@milkdown/kit/prose/view";

export function canReplaceEmptyParagraphWithImageBlock(view: EditorView): boolean {
    const { selection } = view.state;
    const { $from } = selection;
    const imageBlock = view.state.schema.nodes["image-block"];
    const paragraph = view.state.schema.nodes.paragraph;
    if (!imageBlock || !paragraph) return false;

    const containerDepth = $from.depth - 1;
    if (
        !selection.empty ||
        $from.parent.type !== paragraph ||
        $from.parent.content.size !== 0 ||
        containerDepth < 0
    ) {
        return false;
    }

    const paragraphIndex = $from.index(containerDepth);
    return $from
        .node(containerDepth)
        .canReplaceWith(paragraphIndex, paragraphIndex + 1, imageBlock);
}

export function insertResolvedMarkdownImage(
    view: EditorView,
    source: string,
    alt: string
): void {
    const imageBlock = view.state.schema.nodes["image-block"];
    if (imageBlock && canReplaceEmptyParagraphWithImageBlock(view)) {
        const { $from } = view.state.selection;
        const paragraphStart = $from.before($from.depth);
        view.dispatch(
            view.state.tr
                .replaceWith(
                    paragraphStart,
                    paragraphStart + $from.parent.nodeSize,
                    imageBlock.create({ src: source, caption: "", ratio: 1 })
                )
                .scrollIntoView()
        );
        return;
    }

    const image = view.state.schema.nodes.image;
    if (!image) return;
    view.dispatch(
        view.state.tr
            .replaceSelectionWith(image.create({ src: source, alt, title: "" }))
            .scrollIntoView()
    );
}
