/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import {
    createEffect,
    createResource,
    createSignal,
    For,
    JSX,
    Match,
    onCleanup,
    Show,
    Switch,
} from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import File from "lucide-solid/icons/file";
import FilePen from "lucide-solid/icons/file-pen";
import FileText from "lucide-solid/icons/file-text";
import Folder from "lucide-solid/icons/folder";
import Plus from "lucide-solid/icons/plus";
import { useAppContext } from "@/app/AppContext";
import { translateAppError } from "@/shared/errors/AppError";
import { useI18N } from "@/i18n/Localization";
import type { DirectoryEntry } from "@/backend/rusttypes";
import styles from "./EditorFolder.module.css";
import { Dynamic } from "solid-js/web";
import Menu from "@/shared/ui/menu/Menu";
import CreateEntryDialog, { type CreateEntryKind } from "./CreateEntryDialog";
import MessageView from "@/shared/errors/MessageView";

type DirectoryResult =
    | { entries: DirectoryEntry[]; error?: never }
    | { entries?: never; error: string };

export function EditorFolder(): JSX.Element {
    const { t } = useI18N();
    const {
        main: { basepath, filename, loadFilename, showAppMessage },
        spinner: { showSpinner, hideSpinner, setSpinnerParams },
        editor: { setReloadFile, showHiddenFiles },
    } = useAppContext();
    const [createKind, setCreateKind] = createSignal<CreateEntryKind | null>(null);
    const [pendingScrollPath, setPendingScrollPath] = createSignal<string | null>(null);
    let scrollingView: HTMLDivElement | undefined;
    const [directoryResult, { mutate, refetch }] = createResource(
        () => ({ basepath: basepath(), filename: filename(), showHidden: showHiddenFiles() }),
        async (path): Promise<DirectoryResult> => {
            setSpinnerParams(t("folder.loading", { path: path.filename }));
            showSpinner();
            try {
                const entries = await invoke<DirectoryEntry[]>("list_directory", path);
                return { entries };
            } catch (error: unknown) {
                console.error("Unable to list directory:", error);
                return { error: translateAppError(error, t) };
            } finally {
                hideSpinner();
            }
        }
    );

    const insertCreatedEntry = (
        entries: readonly DirectoryEntry[],
        created: DirectoryEntry
    ): DirectoryEntry[] => {
        const next = [...entries];
        if (created.kind === "directory") {
            const firstFile = next.findIndex((entry) => entry.kind === "file");
            next.splice(firstFile < 0 ? next.length : firstFile, 0, created);
        } else {
            next.push(created);
        }
        return next;
    };

    const createEntry = async (kind: CreateEntryKind, name: string): Promise<void> => {
        const currentBasepath = basepath();
        const currentFilename = filename();
        setCreateKind(null);
        setSpinnerParams(
            kind === "directory"
                ? t("folder.creatingFolder", { name })
                : t("folder.creatingFile", { name })
        );
        showSpinner();
        let errorMessage: string | null = null;
        try {
            const entry = await invoke<DirectoryEntry>(
                kind === "directory" ? "create_directory" : "create_file",
                { basepath: currentBasepath, filename: currentFilename, name }
            );
            if (basepath() !== currentBasepath || filename() !== currentFilename) return;
            mutate((current) =>
                current?.entries
                    ? { entries: insertCreatedEntry(current.entries, entry) }
                    : current
            );
            setPendingScrollPath(entry.filename);
        } catch (error: unknown) {
            console.error("Unable to create directory entry:", error);
            errorMessage = translateAppError(error, t);
        } finally {
            hideSpinner();
        }
        if (errorMessage) await showAppMessage(errorMessage, "error");
    };

    createEffect(() => {
        directoryResult();
        const path = pendingScrollPath();
        if (!path) return;
        queueMicrotask(() => {
            const entry = Array.from(
                scrollingView?.querySelectorAll<HTMLElement>("[data-path]") ?? []
            ).find((element) => element.dataset.path === path);
            if (!entry) return;
            entry.scrollIntoView({ block: "nearest" });
            setPendingScrollPath(null);
        });
    });

    const reloadDirectory = async (): Promise<void> => {
        await refetch();
    };
    setReloadFile(reloadDirectory);

    onCleanup(() => {
        setReloadFile(null);
    });

    return (
        <section class={styles.studio} data-testid="folder-view">
            <div ref={scrollingView} class="scrollingView">
                <div class={styles.newAction}>
                    <Menu
                        label={t("folder.new")}
                        triggerText={t("folder.new")}
                        triggerIcon={Plus}
                        triggerClass={`stdButton secondary ${styles.newButton}`}
                        align="start"
                        blocks={[
                            {
                                kind: "action",
                                id: "new-directory",
                                label: t("folder.directory"),
                                icon: Folder,
                                onSelect: () => setCreateKind("directory"),
                            },
                            {
                                kind: "section",
                                id: "new-files",
                                items: [
                                    {
                                        kind: "action",
                                        id: "new-markdown",
                                        label: t("folder.markdown"),
                                icon: FilePen,
                                        onSelect: () => setCreateKind("markdown"),
                                    },
                                    {
                                        kind: "action",
                                        id: "new-text",
                                        label: t("folder.text"),
                                        icon: FileText,
                                        onSelect: () => setCreateKind("text"),
                                    },
                                    {
                                        kind: "action",
                                        id: "new-other",
                                        label: t("folder.other"),
                                        icon: File,
                                        onSelect: () => setCreateKind("other"),
                                    },
                                ],
                            },
                        ]}
                    />
                </div>
                <Show when={!directoryResult.loading}>
                    <Switch>
                        <Match when={directoryResult()?.error}>
                            <div class={styles.folderError}>{directoryResult()?.error}</div>
                        </Match>
                        <Match when={directoryResult()?.entries}>
                            <Show
                                when={(directoryResult()?.entries?.length ?? 0) > 0}
                                fallback={
                                    <MessageView info="status">{t("folder.empty")}</MessageView>
                                }
                            >
                                <div class="contentView">
                                    <ul class={styles.entryList}>
                                        <For each={directoryResult()?.entries}>
                                            {(entry) => (
                                                <li>
                                                    <button
                                                        class={styles.entryButton}
                                                        data-testid="folder-entry"
                                                        data-path={entry.filename}
                                                        data-entry-kind={entry.kind}
                                                        onClick={() =>
                                                            void loadFilename(entry.filename)
                                                        }
                                                    >
                                                        <Dynamic
                                                            class={`${styles.entryIcon} ${
                                                                entry.kind === "directory"
                                                                    ? styles.directoryIcon
                                                                    : styles.fileIcon
                                                            }`}
                                                            aria-hidden="true"
                                                            component={
                                                                entry.kind === "directory"
                                                                    ? Folder
                                                                    : File
                                                            }
                                                        />
                                                        <span class={styles.entryName}>
                                                            {entry.name}
                                                        </span>
                                                    </button>
                                                </li>
                                            )}
                                        </For>
                                    </ul>
                                </div>
                            </Show>
                        </Match>
                    </Switch>
                </Show>
            </div>
            <CreateEntryDialog
                open={createKind() !== null}
                kind={createKind() ?? "other"}
                onCancel={() => setCreateKind(null)}
                onConfirm={(name) => {
                    const kind = createKind();
                    if (kind) void createEntry(kind, name);
                }}
            />
        </section>
    );
}

export default EditorFolder;
