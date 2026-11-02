/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createUniqueId, JSX } from "solid-js";
import styles from "./Dialog.module.css";
import { Dynamic } from "solid-js/web";
import { messagesinfo, type MessageInfo, type MessageInfoKind } from "@/shared/errors/messagesinfo";
import { useI18N } from "@/i18n/Localization";
import ModalDialog from "./ModalDialog";

type DialogProps = {
    open: boolean;
    message: JSX.Element;
    info?: MessageInfoKind;
    onCancel: () => void;
    cancelLabel?: string;
    onConfirm?: () => void;
    confirmLabel?: string;
    onClose?: () => void;
};

export function Dialog(props: DialogProps): JSX.Element {
    const { t } = useI18N();
    const titleId = createUniqueId();
    const kind = (): MessageInfoKind => props.info ?? (props.confirmLabel ? "question" : "error");
    const info = (): MessageInfo => messagesinfo[kind()];
    const cancel = (): void => props.onCancel();

    return (
        <ModalDialog
            open={props.open}
            class={styles[info().class]}
            testId="message-dialog"
            messageKind={kind()}
            labelledBy={titleId}
            onCancel={cancel}
            onClose={props.onClose}
        >
            <div class={styles.iconRow}>
                <Dynamic component={info().icon} class={styles.icon} aria-hidden="true" />
            </div>
            <h2 id={titleId} class={styles.title} tabIndex={-1}>
                {t(info().literal)}
            </h2>
            <div class={styles.message}>{props.message}</div>
            <div class={styles.actions}>
                {props.confirmLabel ? (
                    <button
                        class="stdButton"
                        type="button"
                        onClick={() => {
                            void props.onConfirm?.();
                        }}
                    >
                        {props.confirmLabel ?? t("dialog.confirm")}
                    </button>
                ) : null}
                {props.cancelLabel ? (
                    <button class="stdButton" type="button" onClick={cancel}>
                        {props.cancelLabel}
                    </button>
                ) : null}
            </div>
        </ModalDialog>
    );
}

export default Dialog;
