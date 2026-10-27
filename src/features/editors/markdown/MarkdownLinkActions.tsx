/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { type Accessor, createEffect, onCleanup, onMount, type JSX } from "solid-js";
import { type Crepe } from "@milkdown/crepe";
import { editorViewCtx } from "@milkdown/kit/core";
import type { Ctx } from "@milkdown/kit/ctx";
import { posToDOMRect } from "@milkdown/kit/prose";
import type { Mark } from "@milkdown/kit/prose/model";
import { linkSchema } from "@milkdown/kit/preset/commonmark";
import Unlink from "lucide-solid/icons/unlink";
import { useI18N } from "@/i18n/Localization";
import type {
    MarkdownFloatingActionsController,
    MarkdownFloatingTarget,
} from "./MarkdownFloatingActionsHost";

interface MarkdownLinkActionsProps {
    editorRoot: () => HTMLDivElement;
    crepe: Accessor<Crepe | null>;
    controller: MarkdownFloatingActionsController;
    onNavigate: (href: string) => void | Promise<void>;
    registerCreateLink?: (createLink: (() => void) | null) => void;
}

type ExistingLink = {
    element: HTMLAnchorElement;
    href: string;
    from: number;
    to: number;
    mark: Mark;
};

export function createMarkdownLink(ctx: Ctx, from: number, to: number, href: string): void {
    if (!href) return;

    const view = ctx.get(editorViewCtx);
    const mark = linkSchema.type(ctx).create({ href });
    const transaction = view.state.tr;
    if (from === to) {
        transaction.insertText(href, from);
        transaction.addMark(from, from + href.length, mark);
    } else {
        transaction.addMark(from, to, mark);
    }
    view.dispatch(transaction.scrollIntoView());
}

export default function MarkdownLinkActions(props: MarkdownLinkActionsProps): JSX.Element {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const { t } = useI18N();

    const linkFromElement = (element: HTMLAnchorElement): ExistingLink | null => {
        const crepe = props.crepe();
        if (!crepe) return null;

        let result: ExistingLink | null = null;
        crepe.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            try {
                const from = view.posAtDOM(element, 0);
                const to = view.posAtDOM(element, element.childNodes.length);
                const type = linkSchema.type(ctx);
                let mark: Mark | undefined;
                view.state.doc.nodesBetween(from, Math.max(from + 1, to), (node) => {
                    mark ??= type.isInSet(node.marks);
                    return mark ? false : undefined;
                });
                if (!mark) return;
                result = {
                    element,
                    href: String(mark.attrs.href ?? element.getAttribute("href") ?? ""),
                    from,
                    to,
                    mark,
                };
            } catch (err: unknown) {
                console.error("Unable to locate Markdown link:", err);
            }
        });
        return result;
    };

    const anchorRect = (from: number, to: number): DOMRect | null => {
        const crepe = props.crepe();
        if (!crepe) return null;

        let rect: DOMRect | null = null;
        crepe.editor.action((ctx) => {
            try {
                rect = posToDOMRect(ctx.get(editorViewCtx), from, to);
            } catch (err: unknown) {
                console.error("Unable to position Markdown link actions:", err);
            }
        });
        return rect as DOMRect | null;
    };

    const focusEditor = (): void => {
        props.crepe()?.editor.action((ctx) => ctx.get(editorViewCtx).focus());
    };

    const scheduleHide = (key: object): void => {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => props.controller.deactivate(key), 50);
    };

    const createExistingTarget = (link: ExistingLink): MarkdownFloatingTarget => {
        let href = link.href;
        let mark = link.mark;
        return {
            key: link.element,
            kind: "link",
            activation: "hover",
            href: () => href,
            getAnchorRect: () => anchorRect(link.from, link.to),
            onNavigate: () => props.onNavigate(href),
            onSaveHref: (nextHref) => {
                const crepe = props.crepe();
                if (!crepe) return false;

                let updated = false;
                crepe.editor.action((ctx) => {
                    const view = ctx.get(editorViewCtx);
                    const nextMark = linkSchema.type(ctx).create({ ...mark.attrs, href: nextHref });
                    view.dispatch(
                        view.state.tr
                            .removeMark(link.from, link.to, mark)
                            .addMark(link.from, link.to, nextMark)
                    );
                    mark = nextMark;
                    href = nextHref;
                    updated = true;
                });
                return updated;
            },
            onEditingEnd: () => requestAnimationFrame(focusEditor),
            onPointerEnter: () => {
                if (hideTimer) clearTimeout(hideTimer);
            },
            onPointerLeave: () => scheduleHide(link.element),
            actions: () => [
                {
                    label: t("markdownToolbar.removeLink"),
                    icon: () => <Unlink aria-hidden="true" />,
                    onClick: () => {
                        const crepe = props.crepe();
                        if (!crepe) return;
                        crepe.editor.action((ctx) => {
                            const view = ctx.get(editorViewCtx);
                            view.dispatch(
                                view.state.tr.removeMark(
                                    link.from,
                                    link.to,
                                    linkSchema.type(ctx)
                                )
                            );
                            view.focus();
                        });
                        props.controller.deactivate(link.element);
                    },
                },
            ],
        };
    };

    const showLink = (element: HTMLAnchorElement): void => {
        if (hideTimer) clearTimeout(hideTimer);
        const link = linkFromElement(element);
        if (link) props.controller.activate(createExistingTarget(link));
    };

    const handlePointerOver = (event: PointerEvent): void => {
        if (!(event.target instanceof Element)) return;
        const element = event.target.closest<HTMLAnchorElement>(".milkdown .editor a[href]");
        if (element && props.editorRoot().contains(element)) showLink(element);
    };

    const handlePointerOut = (event: PointerEvent): void => {
        if (!(event.target instanceof Element)) return;
        const element = event.target.closest<HTMLAnchorElement>(".milkdown .editor a[href]");
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

    const startCreatingLink = (): void => {
        const crepe = props.crepe();
        if (!crepe) return;

        crepe.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const { from, to } = view.state.selection;
            props.controller.activate({
                key: {},
                kind: "link",
                activation: "explicit",
                href: () => "",
                getAnchorRect: () => anchorRect(from, to),
                onNavigate: () => undefined,
                onSaveHref: (href) => {
                    createMarkdownLink(ctx, from, to, href);
                    return Boolean(href);
                },
                actions: () => [],
                dismissAfterEditing: true,
                onEditingEnd: () => requestAnimationFrame(focusEditor),
            });
            props.controller.startEditing();
        });
    };

    props.registerCreateLink?.(startCreatingLink);

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
        props.registerCreateLink?.(null);
        const root = props.editorRoot();
        root.removeEventListener("pointerover", handlePointerOver, { capture: true });
        root.removeEventListener("pointerout", handlePointerOut, { capture: true });
        if (hideTimer) clearTimeout(hideTimer);
    });

    return <></>;
}
