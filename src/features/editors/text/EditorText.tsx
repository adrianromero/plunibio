/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { createEffect, createSignal, JSX, onCleanup, Show } from "solid-js";
import { useAppContext } from "@/app/AppContext";
import {
    createFileEditorController,
    textFileStorage,
    type FileEditorAdapter,
} from "@/app/FileEditorController";
import { useI18N } from "@/i18n/Localization";
import styles from "./EditorText.module.css";
import type { LanguageSupport } from "@codemirror/language";
import AppSidebar from "@/app/sidebar/AppSidebar";
import SearchPanel from "@/features/search/SearchPanel";
import SidebarTab from "@/shared/ui/sidebar/SidebarTab";
import SidebarTabSection from "@/shared/ui/sidebar/SidebarTabSection";
import {
    CodeMirrorSearchController,
    externalCodeMirrorSearch,
} from "@/features/search/CodeMirrorSearchController";
import type { SearchController } from "@/features/search/SearchController";
import ErrorView from "@/shared/errors/ErrorView";
import { codeMirrorSyntaxTheme } from "../shared/CodeMirrorTheme";

type EditorTextProps = {
    extensions?: readonly LanguageSupport[];
};

export function EditorText(props: EditorTextProps): JSX.Element {
    let editorRef!: HTMLDivElement;
    let editorView: EditorView | null = null;
    let currentSearchController: CodeMirrorSearchController | null = null;
    let focusSearch: (() => void) | null = null;
    const [searchController, setSearchController] = createSignal<SearchController | null>(null);
    const [selectedTab, setSelectedTab] = createSignal("search");

    const { t } = useI18N();
    const {
        editor: { setSearchFile, setSidebarVisible },
    } = useAppContext();
    const adapter: FileEditorAdapter = {
        getContent: () => Promise.resolve(editorView?.state.doc.toString() ?? null),
        replaceContent: async (content, _currentFilename, onModified) => {
            currentSearchController?.destroy();
            currentSearchController = null;
            setSearchController(null);
            editorView?.destroy();
            editorView = new EditorView({
                doc: content,
                extensions: [
                    basicSetup,
                    codeMirrorSyntaxTheme,
                    externalCodeMirrorSearch(),
                    EditorView.lineWrapping,
                    ...(props.extensions ?? []),
                    EditorView.updateListener.of((update) => {
                        currentSearchController?.handleEditorUpdate();
                        if (update.docChanged) {
                            onModified();
                        }
                    }),
                ],
                parent: editorRef,
            });
            currentSearchController = new CodeMirrorSearchController(editorView);
            setSearchController(currentSearchController);
        },
        destroy: () => {
            currentSearchController?.destroy();
            currentSearchController = null;
            setSearchController(null);
            editorView?.destroy();
            editorView = null;
        },
    };
    const { state } = createFileEditorController("EditorText", adapter, textFileStorage);
    const error = (): string | null => {
        const current = state();
        return current.status === "error" ? current.message : null;
    };
    const editorDisabled = (): boolean => state().status !== "ready";
    const openSearch = (): void => {
        setSidebarVisible(true);
        setSelectedTab("search");
        requestAnimationFrame(() => focusSearch?.());
    };

    createEffect(() => {
        setSearchFile(state().status === "ready" ? openSearch : null);
    });
    onCleanup(() => setSearchFile(null));

    return (
        <section class={styles.studio} data-testid="text-view">
            <Show when={error()}>
                <ErrorView>{error() ?? t("errors.unknown")}</ErrorView>
            </Show>
            <div class={`scrollingView ${error() ? "errorView" : ""}`}>
                <div
                    ref={editorRef}
                    class={`contentView ${styles.editorText}`}
                    data-testid="text-editor"
                />
            </div>
            <AppSidebar disabled={editorDisabled()}>
                <SidebarTab
                    selectedKey={selectedTab()}
                    onSelectedKeyChange={(key) => key && setSelectedTab(key)}
                >
                    <SidebarTabSection key="search" label={t("search.title")}>
                        <SearchPanel
                            controller={searchController()}
                            registerFocus={(focus) => {
                                focusSearch = focus;
                            }}
                        />
                    </SidebarTabSection>
                </SidebarTab>
            </AppSidebar>
        </section>
    );
}

export default EditorText;
