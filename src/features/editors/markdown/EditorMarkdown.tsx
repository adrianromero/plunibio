/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createEffect, createSignal, onCleanup, Show, JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Crepe } from "@milkdown/crepe";
import { editorViewCtx, editorViewOptionsCtx, EditorStatus } from "@milkdown/kit/core";
import { yaml } from "@codemirror/lang-yaml";
import { basicSetup } from "codemirror";
import { EditorView as CodeMirrorEditorView } from "@codemirror/view";
import { useAppContext } from "@/app/AppContext";
import { translateAppError } from "@/shared/errors/AppError";
import {
    createFileEditorController,
    textFileStorage,
    type FileEditorAdapter,
} from "@/app/FileEditorController";
import { useI18N } from "@/i18n/Localization";
import { ProseMirrorSearchController } from "@/features/search/ProseMirrorSearchController";
import type { SearchController } from "@/features/search/SearchController";
import ErrorView from "@/shared/errors/ErrorView";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { Ctx } from "@milkdown/kit/ctx";
import type { Slice } from "@milkdown/kit/prose/model";
import type { EditorView as MilkdownEditorView } from "@milkdown/kit/prose/view";
import styles from "./EditorMarkdown.module.css";
import EditorMarkdownSidebar from "./EditorMarkdownSidebar";
import { createMarkdownImageProxy, type MarkdownImageProxy } from "./MarkdownImageProxy";
import MarkdownImageActions from "./MarkdownImageActions";
import MarkdownLinkActions from "./MarkdownLinkActions";
import MarkdownFloatingActionsHost, {
    createMarkdownFloatingActionsController,
} from "./MarkdownFloatingActionsHost";
import { configureMarkdownSerialization } from "./MarkdownSerialization";
import { codeMirrorSyntaxTheme } from "../shared/CodeMirrorTheme";
import { configureCodeLanguages } from "../text/CodeLanguages";
import { joinMarkdownFrontmatter, splitMarkdownFrontmatter } from "./MarkdownFrontmatter";
import {
    insertResolvedMarkdownImage,
    insertResolvedMarkdownLink,
} from "./MarkdownTransferInsertion";
import {
    isLocalFileMarkdownTransfer,
    markdownTransfer,
    markdownTransferFromPath,
    resolveMarkdownTransfer,
    type MarkdownTransfer,
    type MarkdownTransferOptions,
    UnsupportedMarkdownImageError,
} from "./MarkdownTransfer";

function parsedTransferOptions(slice: Slice): MarkdownTransferOptions {
    let parsedContentContainsImage = false;
    let parsedLinkHref: string | null = null;
    let parsedLinkLabel = "";
    let parsedLinkIsExclusive = true;
    slice.content.descendants((node) => {
        if (node.type.name === "image" || node.type.name === "image-block") {
            parsedContentContainsImage = true;
        }
        if (!node.isText || !node.text?.trim()) return true;

        const linkMark = node.marks.find((mark) => mark.type.name === "link");
        const href = linkMark ? String(linkMark.attrs.href ?? "") : "";
        if (!href || (parsedLinkHref !== null && parsedLinkHref !== href)) {
            parsedLinkIsExclusive = false;
            return true;
        }
        parsedLinkHref = href;
        parsedLinkLabel += node.text;
        return true;
    });

    return {
        parsedContentContainsImage,
        parsedLink:
            parsedLinkIsExclusive && parsedLinkHref
                ? {
                      href: parsedLinkHref,
                      label: parsedLinkLabel.trim() || parsedLinkHref,
                  }
                : null,
    };
}

export function EditorMarkdown(): JSX.Element {
    let editorRef!: HTMLDivElement;
    let frontmatterRef!: HTMLDivElement;
    let crepeInstance: Crepe | null = null;
    let frontmatterEditor: CodeMirrorEditorView | null = null;
    let imageProxy: MarkdownImageProxy | null = null;
    let nativeDropUnlisten: (() => void) | null = null;
    let currentSearchController: ProseMirrorSearchController | null = null;
    let focusSearch: (() => void) | null = null;
    let createLink: (() => void) | null = null;
    const floatingActions = createMarkdownFloatingActionsController();
    const [editorReady, setEditorReady] = createSignal(false);
    const [imageActionsCrepe, setImageActionsCrepe] = createSignal<Crepe | null>(null);
    const [frontmatterVisible, setFrontmatterVisible] = createSignal(false);
    const [searchController, setSearchController] = createSignal<SearchController | null>(null);
    const [selectedSidebarTab, setSelectedSidebarTab] = createSignal("format");

    const { t } = useI18N();
    const {
        main: { basepath, filename, loadFilename, showAppMessage },
        editor: { setSearchFile, setSidebarVisible },
    } = useAppContext();

    const navigateToAnchor = (href: string): boolean => {
        let anchor: string;
        try {
            anchor = decodeURIComponent(href.slice(1));
        } catch (err: unknown) {
            console.error("Unable to decode heading anchor:", err);
            return false;
        }

        if (!anchor) {
            return false;
        }

        const target = document.getElementById(anchor);
        if (!target || !editorRef.contains(target)) {
            return false;
        }

        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
    };

    const navigateToLink = async (href: string): Promise<void> => {
        if (href.startsWith("#")) {
            if (!navigateToAnchor(href)) {
                console.error("Heading anchor not found:", href);
            }
            return;
        }

        try {
            const resolvedFilename = await invoke<string | null>("resolve_link", {
                basepath: basepath(),
                filename: filename(),
                href,
            });
            if (resolvedFilename !== null) {
                await loadFilename(resolvedFilename);
            }
        } catch (err: unknown) {
            console.error("Unable to resolve editor link:", err);
            showAppMessage(translateAppError(err, t), "error");
        }
    };

    const adapter: FileEditorAdapter = {
        getContent: () => {
            if (!crepeInstance) {
                return Promise.resolve(null);
            }

            const frontmatter = frontmatterEditor?.state.doc.toString() ?? "";
            return Promise.resolve(
                joinMarkdownFrontmatter(frontmatter, crepeInstance.getMarkdown())
            );
        },
        replaceContent: async (content, currentFilename, onModified) => {
            setEditorReady(false);
            setImageActionsCrepe(null);
            currentSearchController?.destroy();
            currentSearchController = null;
            setSearchController(null);
            const document = splitMarkdownFrontmatter(content);
            setFrontmatterVisible(document.hasFrontmatter);
            frontmatterEditor = new CodeMirrorEditorView({
                doc: document.frontmatter,
                extensions: [
                    basicSetup,
                    codeMirrorSyntaxTheme,
                    CodeMirrorEditorView.lineWrapping,
                    yaml(),
                    CodeMirrorEditorView.contentAttributes.of({
                        "aria-label": t("markdownToolbar.frontmatterEditor"),
                    }),
                    CodeMirrorEditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            onModified();
                        }
                    }),
                ],
                parent: frontmatterRef,
            });
            const currentBasepath = basepath();
            const nextImageProxy = createMarkdownImageProxy(currentBasepath, currentFilename);
            const reportImageTransferError = async (err: unknown): Promise<void> => {
                console.error("Unable to import Markdown image:", err);
                await showAppMessage(
                    err instanceof UnsupportedMarkdownImageError
                        ? t("image.unsupportedFormat")
                        : translateAppError(err, t),
                    "error"
                );
            };
            const resolveAndInsertTransfer = async (
                view: MilkdownEditorView,
                transfer: MarkdownTransfer,
                position?: number
            ): Promise<void> => {
                const resolved = await resolveMarkdownTransfer(
                    transfer,
                    currentBasepath,
                    currentFilename
                );
                if (!view.dom.isConnected) return;
                if (resolved.kind === "image") {
                    insertResolvedMarkdownImage(
                        view,
                        resolved.source,
                        resolved.alt,
                        position
                    );
                } else {
                    insertResolvedMarkdownLink(
                        view,
                        resolved.href,
                        resolved.label,
                        position
                    );
                }
            };
            const reportTransferError = async (
                err: unknown,
                transfer: MarkdownTransfer
            ): Promise<void> => {
                if (transfer.kind === "image") {
                    await reportImageTransferError(err);
                    return;
                }
                console.error("Unable to import Markdown link:", err);
                await showAppMessage(translateAppError(err, t), "error");
            };
            let internalEditorDrag = false;
            const nextCrepe = new Crepe({
                root: editorRef,
                defaultValue: document.markdown,
                featureConfigs: {
                    [Crepe.Feature.LinkTooltip]: {
                        inputPlaceholder: t("markdownToolbar.linkPlaceholder"),
                    },
                    [Crepe.Feature.Placeholder]: {
                        text: t("markdownToolbar.editorPlaceholder"),
                    },
                    [Crepe.Feature.CodeMirror]: {
                        // Crepe defaults to oneDark. Token classes keep its embedded
                        // editors synchronized with the application theme instead.
                        theme: [CodeMirrorEditorView.theme({}), codeMirrorSyntaxTheme],
                        copyText: t("markdownToolbar.codeCopy"),
                        searchPlaceholder: t("markdownToolbar.codeLanguageSearch"),
                        noResultText: t("markdownToolbar.codeLanguageNoResult"),
                        previewToggleText: (previewOnlyMode) =>
                            t(
                                previewOnlyMode
                                    ? "markdownToolbar.codePreviewEdit"
                                    : "markdownToolbar.codePreviewHide"
                            ),
                        previewLabel: t("markdownToolbar.codePreviewLabel"),
                        previewLoading: t("markdownToolbar.codePreviewLoading"),
                        previewOnlyByDefault: true,
                    },
                    [Crepe.Feature.ImageBlock]: {
                        proxyDomURL: nextImageProxy.proxyDomURL,
                        blockUploadPlaceholderText: t("markdownToolbar.imageLinkPlaceholder"),
                        inlineUploadPlaceholderText: t("markdownToolbar.imageLinkPlaceholder"),
                        blockConfirmButton: t("markdownToolbar.imageLinkConfirm"),
                        blockCaptionPlaceholderText: t("markdownToolbar.imageCaptionPlaceholder"),
                    },
                },
                features: {
                    [Crepe.Feature.BlockEdit]: false,
                    [Crepe.Feature.Toolbar]: false,
                },
            });
            imageProxy = nextImageProxy;
            crepeInstance = nextCrepe;

            nextCrepe.editor.config((ctx) => {
                ctx.update(editorViewOptionsCtx, (value) => ({
                    ...value,
                    handleDOMEvents: {
                        ...value.handleDOMEvents,
                        dragstart: (view, event) => {
                            internalEditorDrag = true;
                            return value.handleDOMEvents?.dragstart?.(view, event) ?? false;
                        },
                        dragend: (view, event) => {
                            internalEditorDrag = false;
                            return value.handleDOMEvents?.dragend?.(view, event) ?? false;
                        },
                        drop: (view, event) => {
                            const wasInternalDrag = internalEditorDrag;
                            internalEditorDrag = false;
                            if (!(event instanceof DragEvent) || wasInternalDrag) {
                                return value.handleDOMEvents?.drop?.(view, event) ?? false;
                            }

                            const transferData = event.dataTransfer;
                            if (!transferData) {
                                return value.handleDOMEvents?.drop?.(view, event) ?? false;
                            }
                            const transfer = markdownTransfer(transferData);
                            if (!transfer) {
                                return value.handleDOMEvents?.drop?.(view, event) ?? false;
                            }
                            if (isLocalFileMarkdownTransfer(transfer)) {
                                event.preventDefault();
                                return true;
                            }

                            const dropPosition =
                                view.posAtCoords({
                                    left: event.clientX,
                                    top: event.clientY,
                                })?.pos ?? view.state.selection.from;
                            event.preventDefault();
                            void resolveAndInsertTransfer(view, transfer, dropPosition).catch(
                                async (err: unknown) => {
                                    await reportTransferError(err, transfer);
                                }
                            );
                            return true;
                        },
                    },
                    handlePaste: (view, event, slice) => {
                        const clipboardData = event.clipboardData;
                        if (!clipboardData) {
                            return value.handlePaste?.(view, event, slice) ?? false;
                        }

                        const transfer = markdownTransfer(clipboardData, {
                            ...parsedTransferOptions(slice),
                            allowNativeClipboardImage: true,
                        });
                        if (!transfer) {
                            return value.handlePaste?.(view, event, slice) ?? false;
                        }
                        void resolveAndInsertTransfer(view, transfer).catch(
                            async (err: unknown) => {
                                await reportTransferError(err, transfer);
                            }
                        );
                        return true;
                    },
                }));
            });
            nextCrepe.editor.config(
                configureCodeLanguages(t("markdownToolbar.codePreviewMermaidError"))
            );
            nextCrepe.editor.config(configureMarkdownSerialization);

            let firstUpdate = true;
            nextCrepe.on((listener) => {
                listener.markdownUpdated((_: Ctx, markdown: string, prevMarkdown: string) => {
                    // Mitigates Crepe load changes without user interaction
                    if (firstUpdate) {
                        firstUpdate = false;
                        if (
                            markdown.length === prevMarkdown.length + 1 &&
                            markdown.charAt(markdown.length - 1) === "\u000a" &&
                            markdown.substring(0, markdown.length - 1) === prevMarkdown
                        ) {
                            return;
                        }
                    }

                    onModified();
                });
            });

            await nextCrepe.create();
            // Markdown image actions read editorViewCtx. Expose Crepe only after
            // create() has populated that context; an image-first document can
            // otherwise emit a selection update during editor initialization.
            setImageActionsCrepe(nextCrepe);
            let editorView!: MilkdownEditorView;
            nextCrepe.editor.action((ctx) => {
                editorView = ctx.get(editorViewCtx);
                editorView.focus();
            });
            const unlisten = await getCurrentWebview().onDragDropEvent((event) => {
                const payload = event.payload;
                if (payload.type !== "drop" || crepeInstance !== nextCrepe) return;

                void (async () => {
                    const scaleFactor = await getCurrentWindow().scaleFactor();
                    const position = payload.position.toLogical(scaleFactor);
                    const editorRect = editorView.dom.getBoundingClientRect();
                    if (
                        editorRect.width > 0 &&
                        editorRect.height > 0 &&
                        (position.x < editorRect.left ||
                            position.x > editorRect.right ||
                            position.y < editorRect.top ||
                            position.y > editorRect.bottom)
                    ) {
                        return;
                    }

                    let insertionPosition =
                        editorView.posAtCoords({ left: position.x, top: position.y })?.pos ??
                        editorView.state.selection.from;
                    for (const path of payload.paths) {
                        const transfer = markdownTransferFromPath(path);
                        if (!transfer) continue;
                        try {
                            await resolveAndInsertTransfer(
                                editorView,
                                transfer,
                                insertionPosition
                            );
                            insertionPosition = editorView.state.selection.to;
                        } catch (err: unknown) {
                            await reportTransferError(err, transfer);
                        }
                    }
                })().catch(async (err: unknown) => {
                    console.error("Unable to process native file drop:", err);
                    await showAppMessage(translateAppError(err, t), "error");
                });
            });
            if (crepeInstance === nextCrepe) {
                nativeDropUnlisten = unlisten;
            } else {
                unlisten();
            }
            nextCrepe.editor.action((ctx) => {
                currentSearchController = new ProseMirrorSearchController(ctx.get(editorViewCtx));
                setSearchController(currentSearchController);
            });
            setEditorReady(true);
        },
        destroy: async () => {
            setEditorReady(false);
            setImageActionsCrepe(null);
            currentSearchController?.destroy();
            currentSearchController = null;
            setSearchController(null);
            setFrontmatterVisible(false);
            frontmatterEditor?.destroy();
            frontmatterEditor = null;
            frontmatterRef.replaceChildren();
            const currentCrepe = crepeInstance;
            crepeInstance = null;
            const currentNativeDropUnlisten = nativeDropUnlisten;
            nativeDropUnlisten = null;
            currentNativeDropUnlisten?.();
            const currentImageProxy = imageProxy;
            imageProxy = null;
            currentImageProxy?.dispose();

            try {
                // Milkdown leaves a failed create in OnCreate. Calling destroy in
                // that state retries forever, so remove its partial DOM directly.
                if (currentCrepe?.editor.status === EditorStatus.Created) {
                    await currentCrepe.destroy();
                }
            } finally {
                editorRef.replaceChildren();
            }
        },
    };
    const { state } = createFileEditorController("EditorMarkdown", adapter, textFileStorage);
    const error = (): string | null => {
        const current = state();
        return current.status === "error" ? current.message : null;
    };
    const editorDisabled = (): boolean => state().status !== "ready";
    const toggleFrontmatter = (): void => {
        const visible = !frontmatterVisible();
        setFrontmatterVisible(visible);
        requestAnimationFrame(() => {
            if (visible) {
                frontmatterEditor?.requestMeasure();
                frontmatterEditor?.focus();
                return;
            }

            crepeInstance?.editor.action((ctx) => ctx.get(editorViewCtx).focus());
        });
    };
    const openSearch = (): void => {
        setSidebarVisible(true);
        setSelectedSidebarTab("search");
        requestAnimationFrame(() => focusSearch?.());
    };

    createEffect(() => {
        setSearchFile(state().status === "ready" ? openSearch : null);
    });

    onCleanup(() => {
        setSearchFile(null);
    });

    return (
        <section class={styles.studio}>
            <Show when={error()}>
                <ErrorView>{error() ?? t("errors.unknown")}</ErrorView>
            </Show>
            <div class={`scrollingView ${error() ? "errorView" : ""}`}>
                <div
                    class={`contentView ${styles.frontmatterPanel}`}
                    classList={{ [styles.hidden]: !frontmatterVisible() }}
                    aria-hidden={!frontmatterVisible()}
                >
                    <div class={styles.frontmatterTitle}>
                        {t("markdownToolbar.frontmatterEditor")}
                    </div>
                    <div ref={frontmatterRef} class={styles.frontmatterEditor} />
                </div>
                <div ref={editorRef} class={`contentView milkdowntheme ${styles.editorMarkdown}`} />
                <MarkdownLinkActions
                    editorRoot={() => editorRef}
                    crepe={imageActionsCrepe}
                    controller={floatingActions}
                    onNavigate={navigateToLink}
                    registerCreateLink={(handler) => {
                        createLink = handler;
                    }}
                />
                <MarkdownImageActions
                    editorRoot={() => editorRef}
                    crepe={imageActionsCrepe}
                    controller={floatingActions}
                />
                <MarkdownFloatingActionsHost
                    editorRoot={() => editorRef}
                    controller={floatingActions}
                />
            </div>
            <EditorMarkdownSidebar
                disabled={editorDisabled()}
                getEditor={() => (editorReady() && crepeInstance ? crepeInstance.editor : null)}
                frontmatterVisible={frontmatterVisible()}
                onToggleFrontmatter={toggleFrontmatter}
                searchController={searchController()}
                selectedTab={selectedSidebarTab()}
                onSelectedTabChange={setSelectedSidebarTab}
                registerSearchFocus={(focus) => {
                    focusSearch = focus;
                }}
                onCreateLink={() => createLink?.()}
            />
        </section>
    );
}

export default EditorMarkdown;
