/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import File from "lucide-solid/icons/file";
import Folder from "lucide-solid/icons/folder";
import { createEffect, createSignal, createUniqueId, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { useI18N } from "@/i18n/Localization";
import dialogStyles from "@/shared/ui/dialog/Dialog.module.css";
import ModalDialog from "@/shared/ui/dialog/ModalDialog";
import formStyles from "@/features/editors/folder/CreateEntryDialog.module.css";

type RenameEntryDialogProps = {
    open: boolean;
    kind: "file" | "directory";
    currentName: string;
    onCancel: () => void;
    onConfirm: (name: string) => void;
};

function selectionEnd(name: string, kind: "file" | "directory"): number {
    if (kind === "directory") return name.length;
    const extensionSeparator = name.lastIndexOf(".");
    return extensionSeparator > 0 ? extensionSeparator : name.length;
}

export function RenameEntryDialog(props: RenameEntryDialogProps): JSX.Element {
    const { t } = useI18N();
    const titleId = createUniqueId();
    const inputId = createUniqueId();
    const [name, setName] = createSignal(props.currentName);
    let inputRef!: HTMLInputElement;
    let wasOpen = false;

    const isDirectory = (): boolean => props.kind === "directory";

    createEffect(() => {
        if (props.open && !wasOpen) {
            setName(props.currentName);
            queueMicrotask(() => {
                inputRef.focus();
                inputRef.setSelectionRange(0, selectionEnd(props.currentName, props.kind));
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
            testId="rename-entry-dialog"
            class={formStyles.createDialog}
            onCancel={props.onCancel}
        >
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    submit();
                }}
            >
                <div class={`${dialogStyles.iconRow} ${formStyles.iconRow}`}>
                    <Dynamic
                        component={isDirectory() ? Folder : File}
                        class={dialogStyles.icon}
                        aria-hidden="true"
                    />
                </div>
                <h2 id={titleId} class={dialogStyles.title}>
                    {isDirectory() ? t("folder.renameFolder") : t("folder.renameFile")}
                </h2>
                <div class={formStyles.formBody}>
                    <label for={inputId}>
                        {isDirectory() ? t("folder.folderName") : t("folder.fileName")}
                    </label>
                    <input
                        ref={inputRef}
                        id={inputId}
                        data-testid="rename-entry-name"
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

export default RenameEntryDialog;
