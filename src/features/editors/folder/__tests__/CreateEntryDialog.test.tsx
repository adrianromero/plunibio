/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { render } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vitest";
import CreateEntryDialog from "../CreateEntryDialog";

vi.mock("@/i18n/Localization", () => ({
    useI18N: () => ({ t: (key: string) => key }),
}));

describe("CreateEntryDialog", () => {
    let dispose: (() => void) | undefined;

    afterEach(() => {
        dispose?.();
        dispose = undefined;
        document.body.replaceChildren();
    });

    it("prefills Markdown extensions and submits the entered name", async () => {
        const onConfirm = vi.fn();
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <CreateEntryDialog
                    open
                    kind="markdown"
                    onCancel={vi.fn()}
                    onConfirm={onConfirm}
                />
            ),
            root
        );

        const input = root.querySelector<HTMLInputElement>('[data-testid="create-entry-name"]')!;
        await vi.waitFor(() => expect(document.activeElement).toBe(input));
        expect(input.value).toBe(".md");
        expect(input.selectionStart).toBe(0);

        input.value = "notes.md";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        input.closest("form")?.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
        expect(onConfirm).toHaveBeenCalledWith("notes.md");
    });
});
