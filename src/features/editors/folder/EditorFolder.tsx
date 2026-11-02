/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createResource, createSignal, For, JSX, Match, onCleanup, Show, Switch } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import File from "lucide-solid/icons/file";
import FileImage from "lucide-solid/icons/file-image";
import FilePen from "lucide-solid/icons/file-pen";
import FileText from "lucide-solid/icons/file-text";
import Folder from "lucide-solid/icons/folder";
import { useAppContext } from "@/app/AppContext";
import { translateAppError } from "@/shared/errors/AppError";
import { useI18N } from "@/i18n/Localization";
import type { DirectoryEntry } from "@/backend/rusttypes";
import styles from "./EditorFolder.module.css";
import { Dynamic } from "solid-js/web";
import EditorFolderSidebar from "./EditorFolderSidebar";
import CreateEntryDialog, { type CreateEntryKind } from "./CreateEntryDialog";
import MessageView from "@/shared/errors/MessageView";
import EditorImage from "@/features/editors/image/EditorImage";
import EditorMarkdown from "@/features/editors/markdown/EditorMarkdown";
import { editorForFilename } from "@/features/editors/EditorForFilename";
import EditorText from "@/features/editors/text/EditorText";

type DirectoryResult =
    | { entries: DirectoryEntry[]; error?: never }
    | { entries?: never; error: string };

const FILE_SIZE_UNITS = [
    { minimum: 1024 ** 3, divisor: 1024 ** 3, label: "GB" },
    { minimum: 1024 ** 2, divisor: 1024 ** 2, label: "MB" },
    { minimum: 0, divisor: 1024, label: "KB" },
] as const;

export function fileIconForFilename(filename: string): typeof File {
    const editor = editorForFilename(filename);
    if (editor === EditorMarkdown) return FilePen;
    if (editor === EditorText) return FileText;
    if (editor === EditorImage) return FileImage;
    return File;
}

export function formatFileSize(sizeBytes: number, locale: string): string {
    const unit = FILE_SIZE_UNITS.find(({ minimum }) => sizeBytes >= minimum)!;
    const value = Math.max(0, sizeBytes) / unit.divisor;
    const amount = new Intl.NumberFormat(locale, {
        maximumFractionDigits: value > 0 && value < 10 ? 1 : 0,
    }).format(value);
    return `${amount} ${unit.label}`;
}

function formatModifiedAt(modifiedAt: number | null, locale: string): string | null {
    if (modifiedAt === null) return null;
    const date = new Date(modifiedAt);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export function EditorFolder(): JSX.Element {
    const { t, locale } = useI18N();
    const {
        main: { basepath, filename, loadFilename, showAppMessage, setCreateEntry },
        spinner: { showSpinner, hideSpinner, setSpinnerParams },
        editor: { setReloadFile, showHiddenFiles },
    } = useAppContext();
    const [createKind, setCreateKind] = createSignal<CreateEntryKind | null>(null);
    const openCreateDialog = (kind: CreateEntryKind): void => {
        if (!directoryResult()?.entries || directoryResult.loading) return;
        setCreateKind(kind);
    };
    setCreateEntry(openCreateDialog);

    const entryDetails = (entry: DirectoryEntry): string => {
        const size =
            entry.kind === "directory"
                ? entry.itemCount === null
                    ? t("folder.itemsUnavailable")
                    : entry.itemCount === 1
                      ? t("folder.itemCount", { count: entry.itemCount })
                      : t("folder.itemsCount", { count: entry.itemCount })
                : formatFileSize(entry.sizeBytes, locale());
        const modified = formatModifiedAt(entry.modifiedAt, locale()) ?? t("folder.dateUnavailable");
        return `${size} · ${modified}`;
    };
    const [directoryResult, { refetch }] = createResource(
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
        let createdFilename: string | null = null;
        try {
            const entry = await invoke<DirectoryEntry>(
                kind === "directory" ? "create_directory" : "create_file",
                { basepath: currentBasepath, filename: currentFilename, name }
            );
            if (basepath() !== currentBasepath || filename() !== currentFilename) return;
            createdFilename = entry.filename;
        } catch (error: unknown) {
            console.error("Unable to create directory entry:", error);
            errorMessage = translateAppError(error, t);
        } finally {
            hideSpinner();
        }
        if (errorMessage) await showAppMessage(errorMessage, "error");
        else if (createdFilename) await loadFilename(createdFilename);
    };

    const reloadDirectory = async (): Promise<void> => {
        await refetch();
    };
    setReloadFile(reloadDirectory);

    onCleanup(() => {
        setReloadFile(null);
        setCreateEntry(null);
    });

    return (
        <section class={styles.studio} data-testid="folder-view">
            <div class="scrollingView">
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
                                                                    : fileIconForFilename(
                                                                          entry.name
                                                                      )
                                                            }
                                                        />
                                                        <span class={styles.entryContent}>
                                                            <span class={styles.entryName}>
                                                                {entry.name}
                                                            </span>
                                                            <span class={styles.entryDetails}>
                                                                {entryDetails(entry)}
                                                            </span>
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
            <EditorFolderSidebar
                disabled={directoryResult.loading || !directoryResult()?.entries}
                onCreate={openCreateDialog}
            />
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
