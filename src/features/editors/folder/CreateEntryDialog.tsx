/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import File from "lucide-solid/icons/file";
import FileText from "lucide-solid/icons/file-text";
import FileChartColumn from "lucide-solid/icons/file-chart-column";
import FileChartLine from "lucide-solid/icons/file-chart-line";
import FileSpreadsheet from "lucide-solid/icons/file-spreadsheet";
import Folder from "lucide-solid/icons/folder";
import { createEffect, createSignal, createUniqueId, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { useI18N } from "@/i18n/Localization";
import dialogStyles from "@/shared/ui/dialog/Dialog.module.css";
import ModalDialog from "@/shared/ui/dialog/ModalDialog";
import styles from "./CreateEntryDialog.module.css";
import { frontendLog } from "@/shared/logging/frontendLog";
import type { CreateEntryKind } from "@/app/AppContext";
import { templateExtensions } from "./NewFileTemplates";

type CreateEntryDialogProps = {
    open: boolean;
    kind: CreateEntryKind;
    onCancel: () => void;
    onConfirm: (name: string) => void;
};

function initialName(kind: CreateEntryKind): string {
    if (kind === "markdown") return ".md";
    if (kind === "text") return ".txt";
    return "";
}

const icons = {
    directory: Folder,
    markdown: FileText,
    text: FileText,
    diagram: FileChartLine,
    chart: FileChartColumn,
    table: FileSpreadsheet,
    other: File,
};

export function CreateEntryDialog(props: CreateEntryDialogProps): JSX.Element {
    const { t } = useI18N();
    const titleId = createUniqueId();
    const inputId = createUniqueId();
    const [name, setName] = createSignal("");
    let inputRef!: HTMLInputElement;
    let wasOpen = false;

    const isDirectory = (): boolean => props.kind === "directory";
    const templateExtension = () =>
        props.kind === "diagram" || props.kind === "chart" || props.kind === "table"
            ? templateExtensions[props.kind] : "";
    const canSubmit = (): boolean => {
        const value = name().trim().toLowerCase();
        return value.length > 0 && value !== templateExtension();
    };

    createEffect(() => {
        if (props.open && !wasOpen) {
            const value = templateExtension() || initialName(props.kind);
            setName(value);
            queueMicrotask(() => {
                inputRef.focus();
                inputRef.setSelectionRange(0, 0);
            });
        }
        wasOpen = props.open;
    });

    const submit = (): void => {
        if (!canSubmit()) return;
        const extension = templateExtension();
        const value = extension ? name().trim() : name();
        props.onConfirm(value.toLowerCase().endsWith(extension) ? value : value + extension);
    };

    return (
        <ModalDialog
            open={props.open}
            labelledBy={titleId}
            testId="create-entry-dialog"
            class={styles.createDialog}
            onCancel={props.onCancel}
            initialFocus={() => inputRef}
            onOpened={() => frontendLog("debug", "entry_dialog.opened", { kind: props.kind })}
        >
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    submit();
                }}
            >
                <div class={`${dialogStyles.iconRow} ${styles.iconRow}`}>
                    <Dynamic component={icons[props.kind]} class={dialogStyles.icon} aria-hidden="true" />
                </div>
                <h2 id={titleId} class={dialogStyles.title}>
                    {isDirectory() ? t("folder.createFolder") : t("folder.createFile")}
                </h2>
                <div class={styles.formBody}>
                    <label for={inputId}>
                        {isDirectory() ? t("folder.folderName") : t("folder.fileName")}
                    </label>
                    <input
                        ref={inputRef}
                        id={inputId}
                        data-testid="create-entry-name"
                        autofocus
                        autocomplete="off"
                        value={name()}
                        onInput={(event) => setName(event.currentTarget.value)}
                    />
                </div>
                <div class={dialogStyles.actions}>
                    <button class="stdButton" type="submit" disabled={!canSubmit()}>
                        {t("dialog.confirm")}
                    </button>
                    <button class="stdButton" type="button" onClick={props.onCancel}>
                        {t("dialog.cancel")}
                    </button>
                </div>
            </form>
        </ModalDialog>
    );
}

export default CreateEntryDialog;
