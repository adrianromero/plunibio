/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from "vitest";
import { dismissDialogOnBackdropClick } from "../DialogDismiss";

describe("dismissDialogOnBackdropClick", () => {
    const createDialog = (): HTMLDialogElement => {
        const dialog = document.createElement("dialog");
        vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue({
            left: 100,
            top: 100,
            right: 300,
            bottom: 200,
            width: 200,
            height: 100,
            x: 100,
            y: 100,
            toJSON: () => undefined,
        });
        return dialog;
    };

    it("dismisses a click on the backdrop", () => {
        const dialog = createDialog();
        const dismiss = vi.fn();
        const event = new MouseEvent("click", { clientX: 50, clientY: 50 });
        Object.defineProperty(event, "currentTarget", { value: dialog });
        Object.defineProperty(event, "target", { value: dialog });

        dismissDialogOnBackdropClick(
            event as MouseEvent & { currentTarget: HTMLDialogElement },
            dismiss
        );

        expect(dismiss).toHaveBeenCalledOnce();
    });

    it("keeps the dialog open for clicks inside it or on its contents", () => {
        const dialog = createDialog();
        const dismiss = vi.fn();
        const insideEvent = new MouseEvent("click", { clientX: 150, clientY: 150 });
        Object.defineProperty(insideEvent, "currentTarget", { value: dialog });
        Object.defineProperty(insideEvent, "target", { value: dialog });
        const contentEvent = new MouseEvent("click", { clientX: 50, clientY: 50 });
        Object.defineProperty(contentEvent, "currentTarget", { value: dialog });
        Object.defineProperty(contentEvent, "target", { value: document.createElement("button") });

        dismissDialogOnBackdropClick(
            insideEvent as MouseEvent & { currentTarget: HTMLDialogElement },
            dismiss
        );
        dismissDialogOnBackdropClick(
            contentEvent as MouseEvent & { currentTarget: HTMLDialogElement },
            dismiss
        );

        expect(dismiss).not.toHaveBeenCalled();
    });
});
