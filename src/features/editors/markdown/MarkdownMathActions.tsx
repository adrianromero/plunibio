/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { type Accessor, createEffect, onCleanup, onMount, type JSX } from "solid-js";
import { type Crepe } from "@milkdown/crepe";
import { editorViewCtx, EditorStatus } from "@milkdown/kit/core";
import type { Ctx } from "@milkdown/kit/ctx";
import { posToDOMRect } from "@milkdown/kit/prose";
import { NodeSelection, type PluginSpec } from "@milkdown/kit/prose/state";
import type {
    MarkdownFloatingActionsController,
    MarkdownFloatingTarget,
} from "./MarkdownFloatingActionsHost";

const MATH_INLINE_NODE = "math_inline";
const INLINE_LATEX_TOOLTIP_SPEC = "INLINE_LATEX_TOOLTIP_SPEC";
const MATH_INLINE_SELECTOR = `span[data-type="${MATH_INLINE_NODE}"]`;

interface MarkdownMathActionsProps {
    editorRoot: () => HTMLDivElement;
    crepe: Accessor<Crepe | null>;
    controller: MarkdownFloatingActionsController;
    registerCreateMath?: (createMath: (() => void) | null) => void;
}

type ExistingMath = {
    element: HTMLElement;
    position: number;
    value: string;
};

/**
 * Crepe's LaTeX feature bundles its schema and input rules with a Vue tooltip.
 * Replacing only the tooltip spec preserves the rest of the feature unchanged.
 */
export function disableNativeInlineMathTooltip(ctx: Ctx): void {
    ctx.set<PluginSpec<unknown>, typeof INLINE_LATEX_TOOLTIP_SPEC>(
        INLINE_LATEX_TOOLTIP_SPEC,
        {}
    );
}

export default function MarkdownMathActions(props: MarkdownMathActionsProps): JSX.Element {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const focusEditor = (): void => {
        const crepe = props.crepe();
        if (!crepe || crepe.editor.status !== EditorStatus.Created) return;
        crepe.editor.action((ctx) => ctx.get(editorViewCtx).focus());
    };

    const mathFromElement = (element: HTMLElement): ExistingMath | null => {
        const crepe = props.crepe();
        if (!crepe) return null;

        let result: ExistingMath | null = null;
        crepe.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            try {
                const position = view.posAtDOM(element, 0);
                const node = view.state.doc.nodeAt(position);
                if (node?.type.name !== MATH_INLINE_NODE) return;
                result = {
                    element,
                    position,
                    value: String(node.attrs.value ?? ""),
                };
            } catch (err: unknown) {
                console.error("Unable to locate inline math:", err);
            }
        });
        return result;
    };

    const anchorRect = (position: number): DOMRect | null => {
        const crepe = props.crepe();
        if (!crepe) return null;

        let rect: DOMRect | null = null;
        crepe.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            try {
                rect = posToDOMRect(view, position, position + 1);
            } catch (err: unknown) {
                console.error("Unable to position inline math actions:", err);
            }
        });
        return rect as DOMRect | null;
    };

    const scheduleHide = (key: object): void => {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => props.controller.deactivate(key), 50);
    };

    const createMathTarget = (
        math: ExistingMath,
        activation: "hover" | "explicit" = "hover"
    ): MarkdownFloatingTarget => {
        let value = math.value;
        return {
            key: math.element,
            kind: "math",
            activation,
            value: () => value,
            getAnchorRect: () => anchorRect(math.position),
            isConnected: () => math.element.isConnected,
            onSaveValue: (nextValue) => {
                const crepe = props.crepe();
                if (!crepe) return false;

                let updated = false;
                crepe.editor.action((ctx) => {
                    const view = ctx.get(editorViewCtx);
                    const node = view.state.doc.nodeAt(math.position);
                    if (node?.type.name !== MATH_INLINE_NODE) return;
                    view.dispatch(
                        view.state.tr.setNodeAttribute(math.position, "value", nextValue)
                    );
                    value = nextValue;
                    updated = true;
                });
                return updated;
            },
            onEditingEnd: () => requestAnimationFrame(focusEditor),
            onPointerEnter: () => {
                if (hideTimer) clearTimeout(hideTimer);
            },
            onPointerLeave: () => scheduleHide(math.element),
            dismissAfterEditing: activation === "explicit",
        };
    };

    const showMath = (element: HTMLElement): void => {
        if (hideTimer) clearTimeout(hideTimer);
        const math = mathFromElement(element);
        if (math) props.controller.activate(createMathTarget(math));
    };

    const handlePointerOver = (event: PointerEvent): void => {
        if (!(event.target instanceof Element)) return;
        const element = event.target.closest<HTMLElement>(MATH_INLINE_SELECTOR);
        if (!element || !props.editorRoot().contains(element)) return;
        const related = event.relatedTarget;
        if (related instanceof Node && element.contains(related)) return;
        showMath(element);
    };

    const handlePointerOut = (event: PointerEvent): void => {
        if (!(event.target instanceof Element)) return;
        const element = event.target.closest<HTMLElement>(MATH_INLINE_SELECTOR);
        if (!element) return;
        const related = event.relatedTarget;
        if (
            (related instanceof Node && element.contains(related)) ||
            props.controller.containsActions(related)
        ) {
            return;
        }
        scheduleHide(element);
    };

    const startEditingSelectedMath = (): void => {
        const crepe = props.crepe();
        if (!crepe) return;

        crepe.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const { selection } = view.state;
            if (!(selection instanceof NodeSelection)) return;
            if (selection.node.type.name !== MATH_INLINE_NODE) return;
            const nodeDOM = view.nodeDOM(selection.from);
            const element =
                nodeDOM instanceof HTMLElement
                    ? nodeDOM
                    : nodeDOM?.parentElement?.closest<HTMLElement>(MATH_INLINE_SELECTOR);
            if (!element) return;

            props.controller.activate(
                createMathTarget(
                    {
                        element,
                        position: selection.from,
                        value: String(selection.node.attrs.value ?? ""),
                    },
                    "explicit"
                )
            );
            props.controller.startEditing();
        });
    };

    props.registerCreateMath?.(startEditingSelectedMath);

    createEffect(() => {
        props.crepe();
        props.controller.dismiss();
    });

    onMount(() => {
        const root = props.editorRoot();
        root.addEventListener("pointerover", handlePointerOver, { capture: true });
        root.addEventListener("pointerout", handlePointerOut, { capture: true });
    });

    onCleanup(() => {
        props.registerCreateMath?.(null);
        const root = props.editorRoot();
        root.removeEventListener("pointerover", handlePointerOver, { capture: true });
        root.removeEventListener("pointerout", handlePointerOut, { capture: true });
        if (hideTimer) clearTimeout(hideTimer);
    });

    return <></>;
}
