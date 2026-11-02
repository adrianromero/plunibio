/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import FolderDot from "lucide-solid/icons/folder-dot";
import ChevronDown from "lucide-solid/icons/chevron-down";
import Pencil from "lucide-solid/icons/pencil";
import Trash2 from "lucide-solid/icons/trash-2";
import { invoke } from "@tauri-apps/api/core";
import { createEffect, createMemo, createSignal, For, JSX, onCleanup, Show } from "solid-js";
import { useAppContext } from "@/app/AppContext";
import type { PathKind } from "@/backend/rusttypes";
import { useI18N } from "@/i18n/Localization";
import { translateAppError } from "@/shared/errors/AppError";
import { UserMessageError } from "@/shared/errors/UserMessageError";
import { formatPathForDisplay } from "@/shared/paths/PathPresentation";
import Menu from "@/shared/ui/menu/Menu";
import RenameEntryDialog from "./RenameEntryDialog";
import styles from "./FileBreadcrumb.module.css";

type BreadcrumbSegment = {
    name: string;
    filename: string;
};

export function FileBreadcrumb(): JSX.Element {
    const { t } = useI18N();
    const {
        main: {
            basepath,
            filename,
            loadFilename,
            loadFilenameAfterMutation,
            setRenameEntry,
            onunload,
            showAppMessage,
            showAppConfirmation,
        },
        spinner: { showSpinner, hideSpinner, setSpinnerParams },
    } = useAppContext();
    const [renameOpen, setRenameOpen] = createSignal(false);
    const [entryKind, setEntryKind] = createSignal<"file" | "directory">("file");
    const [operationRunning, setOperationRunning] = createSignal(false);

    const segments = createMemo<BreadcrumbSegment[]>(() => {
        const names = filename()
            .split(/[\\/]+/)
            .filter(Boolean);
        return names.map((name, index) => ({
            name,
            filename: names.slice(0, index + 1).join("/"),
        }));
    });

    const visibleSegments = createMemo(() => segments().slice(-4));
    const currentName = createMemo(() => {
        const currentSegments = segments();
        return currentSegments[currentSegments.length - 1]?.name ?? "";
    });

    const parentFilename = (value: string): string => {
        const normalized = value.replace(/\\/g, "/");
        const separator = normalized.lastIndexOf("/");
        return separator < 0 ? "" : normalized.slice(0, separator);
    };

    const extension = (name: string): string => {
        const separator = name.lastIndexOf(".");
        return separator > 0 ? name.slice(separator + 1).toLowerCase() : "";
    };

    const inspectEntryKind = async (): Promise<"file" | "directory" | null> => {
        const currentBasepath = basepath();
        const currentFilename = filename();
        let result: "file" | "directory" | null = null;
        let errorMessage: string | null = null;
        setSpinnerParams(t("folder.inspectingEntry", { name: currentName() }));
        showSpinner();
        try {
            const kind = await invoke<PathKind>("path_kind", {
                basepath: currentBasepath,
                filename: currentFilename,
            });
            if (basepath() !== currentBasepath || filename() !== currentFilename) return null;
            if (kind === "file" || kind === "directory") result = kind;
            else errorMessage = t("errors.unsupportedPathType", { filename: currentFilename });
        } catch (error: unknown) {
            console.error("Unable to inspect entry:", error);
            errorMessage = translateAppError(error, t);
        } finally {
            hideSpinner();
        }
        if (errorMessage) await showAppMessage(errorMessage, "error");
        return result;
    };

    const openRenameDialog = async (): Promise<void> => {
        if (operationRunning()) return;
        setOperationRunning(true);
        const kind = await inspectEntryKind();
        setOperationRunning(false);
        if (!kind) return;
        setEntryKind(kind);
        setRenameOpen(true);
    };

    createEffect(() => {
        setRenameEntry(filename() === "" ? null : openRenameDialog);
    });

    onCleanup(() => {
        setRenameEntry(null);
    });

    const renameEntry = async (newName: string): Promise<void> => {
        setRenameOpen(false);
        const originalName = currentName();
        if (newName === originalName || operationRunning()) return;

        setOperationRunning(true);
        try {
            if (
                entryKind() === "file" &&
                extension(newName) !== extension(originalName) &&
                !(await showAppConfirmation(
                    t("dialog.renameExtensionWarning", { name: newName }),
                    "question",
                    "dialog.continue"
                ))
            ) {
                return;
            }

            const currentBasepath = basepath();
            const currentFilename = filename();
            try {
                await onunload()?.();
            } catch (error: unknown) {
                const message =
                    error instanceof UserMessageError
                        ? error.message
                        : translateAppError(error, t);
                await showAppMessage(message, "error");
                return;
            }

            setSpinnerParams(t("folder.renaming", { name: originalName }));
            showSpinner();
            let renamedFilename: string | null = null;
            let errorMessage: string | null = null;
            try {
                renamedFilename = await invoke<string>("rename_entry", {
                    basepath: currentBasepath,
                    filename: currentFilename,
                    newName,
                });
            } catch (error: unknown) {
                console.error("Unable to rename entry:", error);
                errorMessage = translateAppError(error, t);
            } finally {
                hideSpinner();
            }
            if (errorMessage) await showAppMessage(errorMessage, "error");
            else if (renamedFilename) await loadFilenameAfterMutation(renamedFilename);
        } finally {
            setOperationRunning(false);
        }
    };

    const deleteEntry = async (): Promise<void> => {
        if (operationRunning()) return;
        setOperationRunning(true);
        try {
            const kind = await inspectEntryKind();
            if (!kind) return;
            const name = currentName();
            const confirmed = await showAppConfirmation(
                kind === "directory"
                    ? t("dialog.deleteFolderWarning", { name })
                    : t("dialog.deleteFileWarning", { name }),
                "question",
                "folder.delete"
            );
            if (!confirmed) return;

            const currentBasepath = basepath();
            const currentFilename = filename();
            const parent = parentFilename(currentFilename);
            setSpinnerParams(t("folder.deleting", { name }));
            showSpinner();
            let errorMessage: string | null = null;
            try {
                await invoke("delete_entry", {
                    basepath: currentBasepath,
                    filename: currentFilename,
                });
            } catch (error: unknown) {
                console.error("Unable to delete entry:", error);
                errorMessage = translateAppError(error, t);
            } finally {
                hideSpinner();
            }
            if (errorMessage) await showAppMessage(errorMessage, "error");
            else await loadFilenameAfterMutation(parent);
        } finally {
            setOperationRunning(false);
        }
    };

    return (
        <div class={styles.container}>
            <nav
                class={styles.breadcrumb}
                aria-label={t("toolbar.pathNavigation")}
                data-testid="file-breadcrumb"
            >
                <button
                    type="button"
                    class={styles.segmentLink}
                    data-testid="breadcrumb-segment"
                    data-path=""
                    aria-label={formatPathForDisplay(basepath())}
                    title={formatPathForDisplay(basepath())}
                    disabled={segments().length === 0}
                    onClick={() => void loadFilename("")}
                >
                    <FolderDot class={styles.homeIcon} aria-hidden="true" />
                    {t("folder.root")}
                </button>
                <Show when={segments().length > 0}>
                    <span class={styles.separator} aria-hidden="true">
                        /
                    </span>
                    <Show when={segments().length > visibleSegments().length}>
                        <span>...</span>
                        <span class={styles.separator} aria-hidden="true">
                            /
                        </span>
                    </Show>
                    <For each={visibleSegments()}>
                        {(segment, index) => (
                            <>
                                <Show
                                    when={index() < visibleSegments().length - 1}
                                >
                                    <button
                                        type="button"
                                        class={styles.segmentLink}
                                        data-testid="breadcrumb-segment"
                                        data-path={segment.filename}
                                        onClick={() => void loadFilename(segment.filename)}
                                    >
                                        {segment.name}
                                    </button>
                                </Show>
                                <Show when={index() < visibleSegments().length - 1}>
                                    <span class={styles.separator} aria-hidden="true">
                                        /
                                    </span>
                                </Show>
                            </>
                        )}
                    </For>
                    <Menu
                        label={t("folder.entryActions")}
                        triggerIcon={ChevronDown}
                        triggerText={currentName()}
                        triggerClass={styles.actionsTrigger}
                        align="end"
                        blocks={[
                            {
                                kind: "action",
                                id: "rename-entry",
                                label: t("folder.rename"),
                                icon: Pencil,
                                shortcut: "F2",
                                disabled: operationRunning,
                                onSelect: () => void openRenameDialog(),
                            },
                            {
                                kind: "action",
                                id: "delete-entry",
                                label: t("folder.delete"),
                                icon: Trash2,
                                disabled: operationRunning,
                                onSelect: () => void deleteEntry(),
                            },
                        ]}
                    />
                </Show>
            </nav>
            <RenameEntryDialog
                open={renameOpen()}
                kind={entryKind()}
                currentName={currentName()}
                onCancel={() => setRenameOpen(false)}
                onConfirm={(name) => void renameEntry(name)}
            />
        </div>
    );
}

export default FileBreadcrumb;
