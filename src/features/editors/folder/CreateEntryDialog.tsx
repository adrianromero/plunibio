/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import File from "lucide-solid/icons/file";
import FileText from "lucide-solid/icons/file-text";
import Folder from "lucide-solid/icons/folder";
import { createEffect, createSignal, createUniqueId, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { useI18N } from "@/i18n/Localization";
import dialogStyles from "@/shared/ui/dialog/Dialog.module.css";
import ModalDialog from "@/shared/ui/dialog/ModalDialog";
import styles from "./CreateEntryDialog.module.css";

export type CreateEntryKind = "directory" | "markdown" | "text" | "other";

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

export function CreateEntryDialog(props: CreateEntryDialogProps): JSX.Element {
    const { t } = useI18N();
    const titleId = createUniqueId();
    const inputId = createUniqueId();
    const [name, setName] = createSignal("");
    let inputRef!: HTMLInputElement;
    let wasOpen = false;

    const isDirectory = (): boolean => props.kind === "directory";
    const icon = () => (isDirectory() ? Folder : props.kind === "other" ? File : FileText);

    createEffect(() => {
        if (props.open && !wasOpen) {
            const value = initialName(props.kind);
            setName(value);
            queueMicrotask(() => {
                inputRef.focus();
                inputRef.setSelectionRange(0, 0);
            });
        }
        wasOpen = props.open;
    });

    const submit = (): void => {
        if (name().trim().length === 0) return;
        props.onConfirm(name());
    };

    return (
        <ModalDialog
            open={props.open}
            labelledBy={titleId}
            testId="create-entry-dialog"
            class={styles.createDialog}
            onCancel={props.onCancel}
            initialFocus={() => inputRef}
        >
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    submit();
                }}
            >
                <div class={`${dialogStyles.iconRow} ${styles.iconRow}`}>
                    <Dynamic component={icon()} class={dialogStyles.icon} aria-hidden="true" />
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
                    <button class="stdButton" type="submit" disabled={name().trim().length === 0}>
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
