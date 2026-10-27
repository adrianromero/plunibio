/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

/**
 * Dismisses a modal dialog when the pointer click lands on its backdrop.
 *
 * Native dialog backdrop clicks are dispatched to the dialog itself. Checking
 * the coordinates as well keeps clicks on empty space inside the dialog from
 * being mistaken for backdrop clicks.
 */
export function dismissDialogOnBackdropClick(
    event: MouseEvent & { currentTarget: HTMLDialogElement },
    dismiss: () => void
): void {
    if (event.target !== event.currentTarget) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const isOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;

    if (isOutside) dismiss();
}
