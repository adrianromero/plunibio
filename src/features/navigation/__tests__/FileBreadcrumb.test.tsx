/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { render } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserMessageError } from "@/shared/errors/UserMessageError";
import FileBreadcrumb from "../FileBreadcrumb";

const invokeMock = vi.hoisted(() => vi.fn());
const useAppContextMock = vi.hoisted(() => vi.fn());

vi.mock("@tauri-apps/api/core", () => ({ invoke: invokeMock }));
vi.mock("@/app/AppContext", () => ({ useAppContext: useAppContextMock }));
vi.mock("@/i18n/Localization", () => ({
    useI18N: () => ({
        t: (key: string, params?: Record<string, unknown>) =>
            params ? `${key}:${JSON.stringify(params)}` : key,
    }),
}));

describe("FileBreadcrumb entry actions", () => {
    let dispose: (() => void) | undefined;
    let currentFilename: string;
    let onunload: ReturnType<typeof vi.fn>;
    let loadFilename: ReturnType<typeof vi.fn>;
    let loadFilenameAfterMutation: ReturnType<typeof vi.fn>;
    let showAppMessage: ReturnType<typeof vi.fn>;
    let showAppConfirmation: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        currentFilename = "docs/note.md";
        onunload = vi.fn(async () => undefined);
        loadFilename = vi.fn(async () => undefined);
        loadFilenameAfterMutation = vi.fn(async (nextFilename: string) => {
            currentFilename = nextFilename;
        });
        showAppMessage = vi.fn(async () => undefined);
        showAppConfirmation = vi.fn(async () => true);
        useAppContextMock.mockReturnValue({
            main: {
                basepath: () => "/workspace",
                filename: () => currentFilename,
                loadFilename,
                loadFilenameAfterMutation,
                setRenameEntry: vi.fn(),
                onunload: () => onunload,
                showAppMessage,
                showAppConfirmation,
            },
            spinner: {
                showSpinner: vi.fn(),
                hideSpinner: vi.fn(),
                setSpinnerParams: vi.fn(),
            },
        });
        invokeMock.mockImplementation(async (command: string) => {
            if (command === "path_kind") return "file";
            if (command === "rename_entry") return "docs/renamed.md";
            if (command === "delete_entry") return undefined;
            throw new Error(`Unexpected command: ${command}`);
        });
    });

    afterEach(() => {
        dispose?.();
        dispose = undefined;
        invokeMock.mockReset();
        useAppContextMock.mockReset();
        document.body.replaceChildren();
    });

    const renderBreadcrumb = (): HTMLElement => {
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <FileBreadcrumb />, root);
        return root;
    };

    it("does not show entry actions at the workspace root", () => {
        currentFilename = "";
        const root = renderBreadcrumb();
        expect(root.querySelector('[data-testid="toolbar-menu-trigger"]')).toBeNull();
    });

    it("prefills the current name and treats an unchanged name as cancel", async () => {
        const root = renderBreadcrumb();
        const trigger = root.querySelector<HTMLButtonElement>('[data-testid="toolbar-menu-trigger"]');
        expect(trigger?.textContent).toContain("note.md");
        expect(trigger?.querySelector(".lucide-chevron-down")).not.toBeNull();
        expect(root.querySelector('[data-toolbar-menu-entry="rename-entry"] .lucide-pencil')).not.toBeNull();
        expect(root.querySelector('[data-toolbar-menu-entry="delete-entry"] .lucide-trash-2')).not.toBeNull();

        root.querySelector<HTMLButtonElement>('[data-toolbar-menu-entry="rename-entry"]')?.click();
        const dialog = root.querySelector<HTMLDialogElement>('[data-testid="rename-entry-dialog"]')!;
        await vi.waitFor(() => expect(dialog.open).toBe(true));
        const input = root.querySelector<HTMLInputElement>('[data-testid="rename-entry-name"]')!;
        expect(input.value).toBe("note.md");
        expect(input.selectionEnd).toBe(4);
        input.closest("form")?.dispatchEvent(
            new SubmitEvent("submit", { bubbles: true, cancelable: true })
        );

        expect(invokeMock).not.toHaveBeenCalledWith("rename_entry", expect.anything());
        expect(onunload).not.toHaveBeenCalled();
    });

    it("warns before changing a file extension, saves, renames and reloads the new path", async () => {
        const root = renderBreadcrumb();
        root.querySelector<HTMLButtonElement>('[data-toolbar-menu-entry="rename-entry"]')?.click();
        const dialog = root.querySelector<HTMLDialogElement>('[data-testid="rename-entry-dialog"]')!;
        await vi.waitFor(() => expect(dialog.open).toBe(true));
        const input = root.querySelector<HTMLInputElement>('[data-testid="rename-entry-name"]')!;
        expect(input.value).toBe("note.md");
        input.value = "renamed.txt";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        input.closest("form")?.dispatchEvent(
            new SubmitEvent("submit", { bubbles: true, cancelable: true })
        );

        await vi.waitFor(() => expect(loadFilenameAfterMutation).toHaveBeenCalledWith("docs/renamed.md"));
        expect(showAppConfirmation).toHaveBeenCalledWith(
            expect.stringContaining("dialog.renameExtensionWarning"),
            "question",
            "dialog.continue"
        );
        expect(onunload).toHaveBeenCalledOnce();
        expect(invokeMock).toHaveBeenCalledWith("rename_entry", {
            basepath: "/workspace",
            filename: "docs/note.md",
            newName: "renamed.txt",
        });
        expect(onunload.mock.invocationCallOrder[0]).toBeLessThan(
            invokeMock.mock.invocationCallOrder.find(
                (_, index) => invokeMock.mock.calls[index]?.[0] === "rename_entry"
            ) ?? Number.POSITIVE_INFINITY
        );
    });

    it("cancels a rename when automatic saving fails", async () => {
        onunload.mockRejectedValue(new UserMessageError("save failed"));
        const root = renderBreadcrumb();
        root.querySelector<HTMLButtonElement>('[data-toolbar-menu-entry="rename-entry"]')?.click();
        const dialog = root.querySelector<HTMLDialogElement>('[data-testid="rename-entry-dialog"]')!;
        await vi.waitFor(() => expect(dialog.open).toBe(true));
        const input = root.querySelector<HTMLInputElement>('[data-testid="rename-entry-name"]')!;
        expect(input.value).toBe("note.md");
        input.value = "renamed.md";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        input.closest("form")?.dispatchEvent(
            new SubmitEvent("submit", { bubbles: true, cancelable: true })
        );

        await vi.waitFor(() => expect(showAppMessage).toHaveBeenCalledWith("save failed", "error"));
        expect(invokeMock).not.toHaveBeenCalledWith("rename_entry", expect.anything());
        expect(loadFilenameAfterMutation).not.toHaveBeenCalled();
    });

    it("deletes the current entry and navigates to its parent", async () => {
        const root = renderBreadcrumb();
        root.querySelector<HTMLButtonElement>('[data-toolbar-menu-entry="delete-entry"]')?.click();

        await vi.waitFor(() => expect(loadFilenameAfterMutation).toHaveBeenCalledWith("docs"));
        expect(showAppConfirmation).toHaveBeenCalledWith(
            expect.stringContaining("dialog.deleteFileWarning"),
            "question",
            "folder.delete"
        );
        expect(invokeMock).toHaveBeenCalledWith("delete_entry", {
            basepath: "/workspace",
            filename: "docs/note.md",
        });
        expect(onunload).not.toHaveBeenCalled();
    });
});
