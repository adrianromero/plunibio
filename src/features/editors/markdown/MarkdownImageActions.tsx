/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { type Accessor, createEffect, onCleanup, onMount, type JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { type Crepe } from "@milkdown/crepe";
import { editorViewCtx } from "@milkdown/kit/core";
import { type Ctx } from "@milkdown/kit/ctx";
import { NodeSelection, type Selection } from "@milkdown/kit/prose/state";
import Captions from "lucide-solid/icons/captions";
import { useAppContext } from "@/app/AppContext";
import { translateAppError } from "@/shared/errors/AppError";
import { useI18N } from "@/i18n/Localization";
import {
    imageNavigationHref,
    imageSourceFromDOM,
    navigableImageFromTarget,
    updateImageSourceFromDOM,
} from "./MarkdownImageNavigation";
import type {
    MarkdownFloatingActionsController,
    MarkdownFloatingTarget,
} from "./MarkdownFloatingActionsHost";
import "./MarkdownImageActions.module.css";

interface MarkdownImageActionsProps {
    editorRoot: () => HTMLDivElement;
    crepe: Accessor<Crepe | null>;
    controller: MarkdownFloatingActionsController;
}

export default function MarkdownImageActions(props: MarkdownImageActionsProps): JSX.Element {
    let hoveredImage: HTMLImageElement | null = null;
    let selectedImage: HTMLImageElement | null = null;
    let reportedImage: HTMLImageElement | null = null;
    const { t } = useI18N();
    const {
        main: { basepath, filename, loadFilename, showAppMessage },
    } = useAppContext();

    const sourceForImage = (image: HTMLImageElement): string => {
        const crepe = props.crepe();
        if (!crepe) return "";

        let source: string | null = null;
        crepe.editor.action((ctx) => {
            source = imageSourceFromDOM(ctx.get(editorViewCtx), image);
        });
        return source ?? "";
    };

    const navigateToImage = async (image: HTMLImageElement): Promise<void> => {
        const source = sourceForImage(image);
        if (!source) return;

        try {
            const resolvedFilename = await invoke<string | null>("resolve_link", {
                basepath: basepath(),
                filename: filename(),
                href: imageNavigationHref(source),
                mustExist: true,
            });
            if (resolvedFilename !== null) await loadFilename(resolvedFilename);
        } catch (err: unknown) {
            console.error("Unable to resolve editor image:", err);
            showAppMessage(translateAppError(err, t), "error");
        }
    };

    const focusEditor = (): void => {
        props.crepe()?.editor.action((ctx) => ctx.get(editorViewCtx).focus());
    };

    const saveEditedSource = (image: HTMLImageElement, source: string): boolean => {
        const crepe = props.crepe();
        if (!crepe) return false;

        let updated = false;
        crepe.editor.action((ctx) => {
            updated = updateImageSourceFromDOM(ctx.get(editorViewCtx), image, source);
        });
        return updated;
    };

    const toggleImageCaption = (image: HTMLImageElement): void => {
        const nativeCaptionButton = image
            .closest(".milkdown-image-block")
            ?.querySelector<HTMLElement>(":scope > .image-wrapper > .operation > .operation-item");
        nativeCaptionButton?.dispatchEvent(
            new PointerEvent("pointerdown", { bubbles: true, cancelable: true })
        );
    };

    const imageAnchorRect = (image: HTMLImageElement): DOMRect | null => {
        if (!image.isConnected) return null;
        const imageRect = image.getBoundingClientRect();
        const nodeViewRect = image
            .closest<HTMLElement>(".milkdown-image-block, .milkdown-image-inline")
            ?.getBoundingClientRect();
        const anchor =
            imageRect.width > 0 || imageRect.height > 0 ? imageRect : (nodeViewRect ?? imageRect);
        return new DOMRect(anchor.left + 12, anchor.top + 6, 0, 0);
    };

    const handleActionPointerLeave = (
        image: HTMLImageElement,
        event: PointerEvent
    ): void => {
        const relatedTarget = event.relatedTarget;
        if (
            props.controller.containsActions(relatedTarget) ||
            (relatedTarget instanceof Node &&
                image
                    .closest(".milkdown-image-block, .milkdown-image-inline")
                    ?.contains(relatedTarget))
        ) {
            return;
        }

        hoveredImage = null;
        syncActiveImage();
    };

    const createImageTarget = (
        image: HTMLImageElement,
        activation: "selection" | "hover"
    ): MarkdownFloatingTarget => ({
        key: image,
        kind: "image",
        activation,
        href: () => sourceForImage(image),
        getAnchorRect: () => imageAnchorRect(image),
        isConnected: () => image.isConnected,
        onNavigate: () => navigateToImage(image),
        onSaveHref: (source) => saveEditedSource(image, source),
        onEditingEnd: () => requestAnimationFrame(focusEditor),
        onPointerLeave: (event) => handleActionPointerLeave(image, event),
        actions: () =>
            image.closest(".milkdown-image-block")
                ? [
                      {
                          label: t("markdownToolbar.toggleImageCaption"),
                          icon: () => <Captions aria-hidden="true" />,
                          onClick: () => toggleImageCaption(image),
                      },
                  ]
                : [],
    });

    const syncActiveImage = (): void => {
        const nextImage = hoveredImage ?? selectedImage;
        if (reportedImage && reportedImage !== nextImage) {
            props.controller.deactivate(reportedImage);
        }
        reportedImage = nextImage;
        if (nextImage) {
            props.controller.activate(
                createImageTarget(nextImage, hoveredImage ? "hover" : "selection")
            );
        }
    };

    const selectedImageFromSelection = (
        ctx: Ctx,
        selection: Selection
    ): HTMLImageElement | null => {
        if (!(selection instanceof NodeSelection)) return null;
        const editorView = ctx.get(editorViewCtx);
        if (typeof editorView.nodeDOM !== "function") return null;
        const nodeDOM = editorView.nodeDOM(selection.from);
        if (!(nodeDOM instanceof Element)) return null;
        return navigableImageFromTarget(
            nodeDOM.matches("img") ? nodeDOM : (nodeDOM.querySelector("img") ?? nodeDOM),
            props.editorRoot()
        );
    };

    const handleImagePointerOver = (event: PointerEvent): void => {
        if (!(event.target instanceof Element)) return;
        const image = navigableImageFromTarget(event.target, props.editorRoot());
        if (!image) return;
        hoveredImage = image;
        syncActiveImage();
    };

    const handleImagePointerOut = (event: PointerEvent): void => {
        const image = hoveredImage;
        if (!image) return;
        const relatedTarget = event.relatedTarget;
        if (
            props.controller.containsActions(relatedTarget) ||
            (relatedTarget instanceof Node &&
                image
                    .closest(".milkdown-image-block, .milkdown-image-inline")
                    ?.contains(relatedTarget))
        ) {
            return;
        }
        hoveredImage = null;
        syncActiveImage();
    };

    const handleEditorPointerDown = (event: PointerEvent): void => {
        if (
            event.target instanceof Element &&
            event.target.closest(".milkdown-image-block, .milkdown-image-inline")
        ) {
            return;
        }
        hoveredImage = null;
        selectedImage = null;
        syncActiveImage();
    };

    createEffect(() => {
        const crepe = props.crepe();
        hoveredImage = null;
        selectedImage = null;
        reportedImage = null;
        if (!crepe) return;
        crepe.on((listener) => {
            listener.selectionUpdated((ctx, selection) => {
                selectedImage = selectedImageFromSelection(ctx, selection);
                syncActiveImage();
            });
        });
    });

    onMount(() => {
        const root = props.editorRoot();
        root.addEventListener("pointerover", handleImagePointerOver, { capture: true });
        root.addEventListener("pointerout", handleImagePointerOut, { capture: true });
        root.addEventListener("pointerdown", handleEditorPointerDown, { capture: true });
    });

    onCleanup(() => {
        const root = props.editorRoot();
        root.removeEventListener("pointerover", handleImagePointerOver, { capture: true });
        root.removeEventListener("pointerout", handleImagePointerOut, { capture: true });
        root.removeEventListener("pointerdown", handleEditorPointerDown, { capture: true });
    });

    return <></>;
}
