/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createEffect, type JSX, type ParentProps } from "solid-js";
import { dismissDialogOnBackdropClick } from "./DialogDismiss";
import styles from "./Dialog.module.css";

export type ModalDialogProps = ParentProps<{
    open: boolean;
    labelledBy: string;
    describedBy?: string;
    onCancel: () => void;
    onClose?: () => void;
    class?: string;
    testId?: string;
    messageKind?: string;
    initialFocus?: () => HTMLElement | undefined;
}>;

export function ModalDialog(props: ModalDialogProps): JSX.Element {
    let dialogRef!: HTMLDialogElement;
    let previouslyFocusedElement: HTMLElement | null = null;

    createEffect(() => {
        if (props.open && !dialogRef.open) {
            previouslyFocusedElement = document.activeElement as HTMLElement | null;
            dialogRef.showModal();
            queueMicrotask(() => props.initialFocus?.()?.focus());
        } else if (!props.open && dialogRef.open) {
            dialogRef.close();
            queueMicrotask(() => {
                if (previouslyFocusedElement?.isConnected) previouslyFocusedElement.focus();
            });
        }
    });

    return (
        <dialog
            ref={dialogRef}
            class={`${styles.dialog}${props.class ? ` ${props.class}` : ""}`}
            data-testid={props.testId}
            data-message-kind={props.messageKind}
            aria-labelledby={props.labelledBy}
            aria-describedby={props.describedBy}
            tabIndex={-1}
            onCancel={(event) => {
                event.preventDefault();
                props.onCancel();
            }}
            onClick={(event) => dismissDialogOnBackdropClick(event, props.onCancel)}
            onClose={() => props.onClose?.()}
        >
            {props.children}
        </dialog>
    );
}

export default ModalDialog;
