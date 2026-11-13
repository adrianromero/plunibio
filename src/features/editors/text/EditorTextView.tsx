/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import type { LanguageSupport } from "@codemirror/language";
import { batch, createEffect, createSignal, onCleanup, Show, type Component, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { useAppContext } from "@/app/AppContext";
import {
    createFileEditorController,
    textFileStorage,
    type FileEditorAdapter,
} from "@/app/FileEditorController";
import { useI18N } from "@/i18n/Localization";
import { translateAppError } from "@/shared/errors/AppError";
import AppSidebar from "@/app/sidebar/AppSidebar";
import SearchPanel from "@/features/search/SearchPanel";
import SidebarTab from "@/shared/ui/sidebar/SidebarTab";
import SidebarTabSection from "@/shared/ui/sidebar/SidebarTabSection";
import {
    CodeMirrorSearchController,
    externalCodeMirrorSearch,
} from "@/features/search/CodeMirrorSearchController";
import type { SearchController } from "@/features/search/SearchController";
import MessageView from "@/shared/errors/MessageView";
import { codeMirrorSyntaxTheme } from "../shared/CodeMirrorTheme";
import { EditorTextViewContext } from "./EditorTextViewContext";
import styles from "./EditorTextView.module.css";

export type EditorTextViewProps = {
    extensions?: readonly LanguageSupport[];
    view?: Component | null;
};

export function EditorTextView(props: EditorTextViewProps): JSX.Element {
    let editorRef!: HTMLDivElement;
    let sourceScrollRef!: HTMLDivElement;
    let editorView: EditorView | null = null;
    let view: FileEditorAdapter | null = null;
    let search: CodeMirrorSearchController | null = null;
    let focusSearch: (() => void) | null = null;
    let documentKey: string | null = null;
    let currentFilename = "";
    let generation = 0;
    let notifyModified: () => void = () => undefined;
    let viewContent: string | null = null;
    let viewEdited = false;
    let pendingSwitch: Promise<void> | null = null;
    let disposed = false;
    const [sourceMode, setSourceMode] = createSignal(!props.view);
    const [switching, setSwitching] = createSignal(false);
    const [viewRevision, setViewRevision] = createSignal(1);
    const [searchController, setSearchController] = createSignal<SearchController | null>(null);
    const [selectedTab, setSelectedTab] = createSignal("search");
    const { t } = useI18N();
    const {
        main: { basepath, showAppMessage },
        editor: {
            setSearchFile,
            searchFile,
            setSidebarVisible,
            setSourceMode: publishSourceMode,
            setSourceModeAvailable,
            setToggleSourceMode,
        },
    } = useAppContext();

    const markModified = (source: boolean, version: number): void => {
        if (disposed || version !== generation || sourceMode() !== source || !ready()) return;
        if (!source) viewEdited = true;
        notifyModified();
    };
    const destroySource = (): void => {
        search?.destroy();
        search = null;
        setSearchController(null);
        editorView?.destroy();
        editorView = null;
    };
    const replaceSource = (content: string): void => {
        destroySource();
        const version = generation;
        editorView = new EditorView({
            doc: content,
            extensions: [
                basicSetup,
                codeMirrorSyntaxTheme,
                externalCodeMirrorSearch(),
                EditorView.lineWrapping,
                ...(props.extensions ?? []),
                EditorView.updateListener.of((update) => {
                    search?.handleEditorUpdate();
                    if (update.docChanged) markModified(true, version);
                }),
            ],
            parent: editorRef,
        });
        search = new CodeMirrorSearchController(editorView);
        setSearchController(search);
        setSelectedTab("search");
        sourceScrollRef.scrollTop = 0;
        sourceScrollRef.scrollLeft = 0;
    };
    const replaceView = async (content: string): Promise<void> => {
        if (!view) return;
        viewContent = null;
        await view.destroy();
        // Remount every destination view so its local UI state resets consistently,
        // independently of the document text and without a view-specific reset API.
        setViewRevision((revision) => revision + 1);
        const version = generation;
        await view.replaceContent(content, currentFilename, () => markModified(false, version));
        viewContent = content;
        viewEdited = false;
    };
    const focus = (): void | Promise<void> => {
        if (sourceMode()) {
            editorView?.requestMeasure();
            editorView?.focus();
        } else {
            return view?.focus?.();
        }
    };
    const adapter: FileEditorAdapter = {
        getContent: async () => {
            await pendingSwitch;
            return sourceMode()
                ? editorView?.state.doc.toString() ?? null
                : await view?.getContent() ?? null;
        },
        replaceContent: async (content, filename, onModified) => {
            const nextKey = JSON.stringify([basepath(), filename]);
            if (documentKey !== nextKey) setSourceMode(!props.view);
            documentKey = nextKey;
            currentFilename = filename;
            notifyModified = onModified;
            if (sourceMode()) replaceSource(content);
            else await replaceView(content);
        },
        focus,
        destroy: async () => {
            generation += 1;
            await pendingSwitch;
            destroySource();
            await view?.destroy();
            viewContent = null;
            viewEdited = false;
        },
    };
    const { state } = createFileEditorController("EditorTextView", adapter, textFileStorage);
    const ready = (): boolean => !disposed && state().status === "ready" && !switching();
    const viewActive = (): boolean => Boolean(props.view) && !sourceMode() && !error();
    const error = (): string | null => {
        const current = state();
        return current.status === "error" ? current.message : null;
    };

    const toggleSourceMode = (): Promise<void> => {
        if (!props.view || !view || !ready() || pendingSwitch) return Promise.resolve();
        const currentView = view;
        const version = generation;
        const wasSource = sourceMode();
        setSwitching(true);
        pendingSwitch = (async () => {
            // Install the pending promise before preparing the destination editor.
            await Promise.resolve();
            try {
                if (wasSource) {
                    await replaceView(editorView?.state.doc.toString() ?? "");
                } else {
                    const content = viewEdited ? await currentView.getContent() : viewContent;
                    if (content === null) throw new Error("The view has no document content");
                    if (version !== generation || disposed) return;
                    replaceSource(content);
                    viewContent = content;
                    viewEdited = false;
                }
                if (version !== generation || disposed) return;
                setSourceMode(!wasSource);
            } catch (err: unknown) {
                if (wasSource) {
                    viewContent = null;
                    try {
                        await view?.destroy();
                    } catch (cleanupError: unknown) {
                        console.error("Unable to clean up the failed view:", cleanupError);
                    }
                }
                if (version === generation && !disposed) {
                    await showAppMessage(translateAppError(err, t), "error");
                }
            } finally {
                pendingSwitch = null;
                setSwitching(false);
                if (version === generation && !disposed) {
                    requestAnimationFrame(() => {
                        if (version === generation && ready()) void focus();
                    });
                }
            }
        })();
        return pendingSwitch;
    };
    const openSearch = (): void => {
        setSidebarVisible(true);
        setSelectedTab("search");
        requestAnimationFrame(() => {
            if (sourceMode() && ready()) focusSearch?.();
        });
    };
    createEffect(() => {
        if (!sourceMode() || !ready()) return;
        setSearchFile(openSearch);
        onCleanup(() => {
            if (searchFile() === openSearch) setSearchFile(null);
        });
    });
    createEffect(() => {
        batch(() => {
            publishSourceMode(sourceMode());
            setSourceModeAvailable(Boolean(props.view));
            setToggleSourceMode(props.view && ready() ? toggleSourceMode : null);
        });
    });
    onCleanup(() => {
        disposed = true;
        generation += 1;
        setToggleSourceMode(null);
        setSourceModeAvailable(false);
        publishSourceMode(false);
    });

    return (
        <section class={styles.studio} data-testid="text-view">
            <Show when={error()}>
                <MessageView>{error() ?? t("errors.unknown")}</MessageView>
            </Show>
            <section
                class={styles.studio}
                style={{ display: sourceMode() && !error() ? undefined : "none" }}
                inert={!sourceMode() || !ready()}
            >
                <div ref={sourceScrollRef} class={`scrollingView ${error() ? "messageView" : ""}`}>
                    <div
                        ref={editorRef}
                        class={`contentView ${styles.editorText}`}
                        data-testid="text-editor"
                    />
                </div>
                <AppSidebar active={sourceMode() && !error()} disabled={!ready()}>
                    <SidebarTab
                        selectedKey={selectedTab()}
                        onSelectedKeyChange={(key) => key && setSelectedTab(key)}
                    >
                        <SidebarTabSection key="search" label={t("search.title")}>
                            <SearchPanel
                                controller={searchController()}
                                registerFocus={(handler) => { focusSearch = handler; }}
                            />
                        </SidebarTabSection>
                    </SidebarTab>
                </AppSidebar>
            </section>
            <EditorTextViewContext.Provider value={{
                active: viewActive,
                ready,
                register: (adapter) => { view = adapter; },
            }}>
                <Show when={viewRevision()} keyed>
                    {(_revision) => <Dynamic component={props.view ?? undefined} />}
                </Show>
            </EditorTextViewContext.Provider>
        </section>
    );
}

export default EditorTextView;
