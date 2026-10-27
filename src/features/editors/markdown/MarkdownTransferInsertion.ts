/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { EditorView } from "@milkdown/kit/prose/view";
import { TextSelection, type Selection } from "@milkdown/kit/prose/state";

function insertionSelection(view: EditorView, position?: number): Selection {
    if (position === undefined) return view.state.selection;
    const boundedPosition = Math.max(0, Math.min(position, view.state.doc.content.size));
    return TextSelection.near(view.state.doc.resolve(boundedPosition));
}

export function canReplaceEmptyParagraphWithImageBlock(
    view: EditorView,
    position?: number
): boolean {
    const selection = insertionSelection(view, position);
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
    alt: string,
    position?: number
): void {
    const selection = insertionSelection(view, position);
    const imageBlock = view.state.schema.nodes["image-block"];
    if (imageBlock && canReplaceEmptyParagraphWithImageBlock(view, position)) {
        const { $from } = selection;
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
            .setSelection(selection)
            .replaceSelectionWith(image.create({ src: source, alt, title: "" }))
            .scrollIntoView()
    );
}

export function insertResolvedMarkdownLink(
    view: EditorView,
    href: string,
    label: string,
    position?: number
): void {
    const link = view.state.schema.marks.link;
    if (!link) return;

    const selection = insertionSelection(view, position);
    const { from, to } = selection;
    const transaction = view.state.tr.setSelection(selection);
    const mark = link.create({ href });
    if (from === to) {
        transaction.insertText(label, from);
        transaction.addMark(from, from + label.length, mark);
    } else {
        transaction.addMark(from, to, mark);
    }
    view.dispatch(transaction.scrollIntoView());
}
