/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createEffect, createSignal, onCleanup, JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Crepe } from "@milkdown/crepe";
import { editorViewCtx, editorViewOptionsCtx, prosePluginsCtx, EditorStatus } from "@milkdown/kit/core";
import { yaml } from "@codemirror/lang-yaml";
import { basicSetup } from "codemirror";
import { EditorView as CodeMirrorEditorView } from "@codemirror/view";
import { useAppContext } from "@/app/AppContext";
import { translateAppError } from "@/shared/errors/AppError";
import type { FileEditorAdapter } from "@/app/FileEditorController";
import { useI18N } from "@/i18n/Localization";
import { ProseMirrorSearchController } from "@/features/search/ProseMirrorSearchController";
import type { SearchController } from "@/features/search/SearchController";
import { useEditorTextView } from "../text/EditorTextViewContext";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { Plugin } from "@milkdown/kit/prose/state";
import type { Slice } from "@milkdown/kit/prose/model";
import type { EditorView as MilkdownEditorView } from "@milkdown/kit/prose/view";
import styles from "./ViewMarkdown.module.css";
import { frontendLog } from "@/shared/logging/frontendLog";
import EditorMarkdownSidebar from "./EditorMarkdownSidebar";
import { createMarkdownImageProxy, type MarkdownImageProxy } from "./MarkdownImageProxy";
import MarkdownImageActions from "./MarkdownImageActions";
import MarkdownLinkActions from "./MarkdownLinkActions";
import MarkdownMathActions, {
    disableNativeInlineMathTooltip,
} from "./MarkdownMathActions";
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

export function ViewMarkdown(): JSX.Element {
    const host = useEditorTextView();
    let editorRef!: HTMLDivElement;
    let frontmatterRef!: HTMLDivElement;
    let crepeInstance: Crepe | null = null;
    let frontmatterEditor: CodeMirrorEditorView | null = null;
    let imageProxy: MarkdownImageProxy | null = null;
    let nativeDropUnlisten: (() => void) | null = null;
    let currentSearchController: ProseMirrorSearchController | null = null;
    let focusSearch: (() => void) | null = null;
    let createLink: (() => void) | null = null;
    let createMath: (() => void) | null = null;
    const floatingActions = createMarkdownFloatingActionsController();
    const [editorReady, setEditorReady] = createSignal(false);
    const [floatingActionsCrepe, setFloatingActionsCrepe] = createSignal<Crepe | null>(null);
    const [frontmatterVisible, setFrontmatterVisible] = createSignal(false);
    const [searchController, setSearchController] = createSignal<SearchController | null>(null);
    const [selectedSidebarTab, setSelectedSidebarTab] = createSignal("format");

    const { t } = useI18N();
    const {
        main: { basepath, filename, loadFilename, showAppMessage },
        editor: { searchFile, setSearchFile, setSidebarVisible },
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
            setFloatingActionsCrepe(null);
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
                if (!host.active() || !host.ready() || !view.dom.isConnected || crepeInstance !== nextCrepe) return;
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
            nextCrepe.editor.config(disableNativeInlineMathTooltip);
            nextCrepe.editor.config(configureMarkdownSerialization);

            // Milkdown's markdownUpdated listener is debounced. Track edits synchronously
            // so switching mode or navigating immediately after typing cannot lose changes.
            nextCrepe.editor.config((ctx) => {
                ctx.update(prosePluginsCtx, (plugins) => [...plugins, new Plugin({
                    appendTransaction: (transactions) => {
                        if (editorReady() && transactions.some((transaction) =>
                            transaction.docChanged && transaction.getMeta("addToHistory") !== false
                        )) onModified();
                        return null;
                    },
                })]);
            });

            await nextCrepe.create();
            // Floating actions read editorViewCtx. Expose Crepe only after create()
            // has populated that context; an image-first document can otherwise
            // emit a selection update during editor initialization.
            let editorView!: MilkdownEditorView;
            nextCrepe.editor.action((ctx) => {
                editorView = ctx.get(editorViewCtx);
            });
            const unlisten = await getCurrentWebview().onDragDropEvent((event) => {
                const payload = event.payload;
                if (payload.type !== "drop" || !host.active() || !host.ready() || crepeInstance !== nextCrepe) return;

                void (async () => {
                    const scaleFactor = await getCurrentWindow().scaleFactor();
                    if (!host.active() || !host.ready() || crepeInstance !== nextCrepe) return;
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
        focus: () => {
            frontmatterEditor?.requestMeasure();
            let connected = false;
            let focused = false;
            crepeInstance?.editor.action((ctx) => {
                const editorView = ctx.get(editorViewCtx);
                connected = editorView.dom.isConnected;
                if (connected) editorView.focus();
                focused = editorView.dom.contains(document.activeElement);
            });
            frontendLog("debug", "editor.focused", { editor: "ViewMarkdown", connected, focused });
        },
        destroy: async () => {
            setEditorReady(false);
            setFloatingActionsCrepe(null);
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
    host.register(adapter);
    const editorDisabled = (): boolean => !host.ready();
    const toggleFrontmatter = (): void => {
        const visible = !frontmatterVisible();
        setFrontmatterVisible(visible);
        requestAnimationFrame(() => {
            if (!host.active() || !host.ready()) return;
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
        requestAnimationFrame(() => {
            if (host.active() && host.ready()) focusSearch?.();
        });
    };

    createEffect(() => {
        if (!host.active() || !host.ready()) return;
        setSearchFile(openSearch);
        onCleanup(() => {
            if (searchFile() === openSearch) setSearchFile(null);
        });
    });

    createEffect(() => {
        if (!host.active()) floatingActions.dismiss();
        setFloatingActionsCrepe(host.active() && editorReady() ? crepeInstance : null);
    });

    return (
        <section
            class={styles.studio}
            data-testid="markdown-view"
            style={{ display: host.active() ? undefined : "none" }}
            inert={!host.active() || !host.ready()}
        >
            <div class="scrollingView">
                <div
                    class={`contentView ${styles.frontmatterPanel}`}
                    data-testid="frontmatter-panel"
                    classList={{ [styles.hidden]: !frontmatterVisible() }}
                    aria-hidden={!frontmatterVisible()}
                >
                    <div class={styles.frontmatterTitle}>
                        {t("markdownToolbar.frontmatterEditor")}
                    </div>
                    <div
                        ref={frontmatterRef}
                        class={styles.frontmatterEditor}
                        data-testid="frontmatter-editor"
                    />
                </div>
                <div
                    ref={editorRef}
                    class={`contentView milkdowntheme ${styles.editorMarkdown}`}
                    data-testid="markdown-editor"
                />
                <MarkdownLinkActions
                    editorRoot={() => editorRef}
                    crepe={floatingActionsCrepe}
                    controller={floatingActions}
                    onNavigate={navigateToLink}
                    registerCreateLink={(handler) => {
                        createLink = handler;
                    }}
                />
                <MarkdownImageActions
                    editorRoot={() => editorRef}
                    crepe={floatingActionsCrepe}
                    controller={floatingActions}
                />
                <MarkdownMathActions
                    editorRoot={() => editorRef}
                    crepe={floatingActionsCrepe}
                    controller={floatingActions}
                    registerCreateMath={(handler) => {
                        createMath = handler;
                    }}
                />
                <MarkdownFloatingActionsHost
                    editorRoot={() => editorRef}
                    controller={floatingActions}
                />
            </div>
            <EditorMarkdownSidebar
                disabled={editorDisabled()}
                active={host.active()}
                getEditor={() => (host.active() && editorReady() && crepeInstance ? crepeInstance.editor : null)}
                frontmatterVisible={frontmatterVisible()}
                onToggleFrontmatter={toggleFrontmatter}
                searchController={searchController()}
                selectedTab={selectedSidebarTab()}
                onSelectedTabChange={setSelectedSidebarTab}
                registerSearchFocus={(focus) => {
                    focusSearch = focus;
                }}
                onCreateLink={() => createLink?.()}
                onCreateMath={() => createMath?.()}
            />
        </section>
    );
}

export default ViewMarkdown;
