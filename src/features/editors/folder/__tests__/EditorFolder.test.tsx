/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createSignal, type Accessor, type Setter } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReloadFileHandler } from "@/app/AppContext";
import type { DirectoryEntry } from "@/backend/rusttypes";
import EditorFolder from "../EditorFolder";

const invokeMock = vi.hoisted(() => vi.fn());
const showSpinnerMock = vi.hoisted(() => vi.fn());
const hideSpinnerMock = vi.hoisted(() => vi.fn());
const setSpinnerParamsMock = vi.hoisted(() => vi.fn());
const showAppMessageMock = vi.hoisted(() => vi.fn(async () => undefined));
let reloadFile: ReloadFileHandler | null;
let showHiddenFiles: Accessor<boolean>;
let setShowHiddenFiles: Setter<boolean>;

vi.mock("@tauri-apps/api/core", () => ({ invoke: invokeMock }));

vi.mock("@/app/AppContext", () => ({
    useAppContext: () => ({
        main: {
            basepath: () => "/notes",
            filename: () => "docs",
            loadFilename: vi.fn(),
            showAppMessage: showAppMessageMock,
        },
        spinner: {
            showSpinner: showSpinnerMock,
            hideSpinner: hideSpinnerMock,
            setSpinnerParams: setSpinnerParamsMock,
        },
        editor: {
            setReloadFile: (handler: ReloadFileHandler | null) => {
                reloadFile = handler;
            },
            showHiddenFiles,
        },
    }),
}));

vi.mock("@/i18n/Localization", () => ({
    useI18N: () => ({ t: (key: string) => key }),
}));

describe("EditorFolder", () => {
    let dispose: (() => void) | undefined;

    beforeEach(() => {
        reloadFile = null;
        [showHiddenFiles, setShowHiddenFiles] = createSignal(false);
        invokeMock.mockImplementation(
            async (_command: string, args: { showHidden: boolean }): Promise<DirectoryEntry[]> =>
                args.showHidden
                    ? [
                          { name: ".hidden.md", filename: "docs/.hidden.md", kind: "file" },
                          { name: "visible.md", filename: "docs/visible.md", kind: "file" },
                      ]
                    : [{ name: "visible.md", filename: "docs/visible.md", kind: "file" }]
        );
    });

    afterEach(() => {
        dispose?.();
        dispose = undefined;
        invokeMock.mockReset();
        showSpinnerMock.mockReset();
        hideSpinnerMock.mockReset();
        setSpinnerParamsMock.mockReset();
        showAppMessageMock.mockClear();
        document.body.replaceChildren();
    });

    it("reloads the directory when the hidden files preference changes", async () => {
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <EditorFolder />, root);

        await vi.waitFor(() => {
            expect(root.textContent).toContain("visible.md");
        });
        expect(root.textContent).not.toContain(".hidden.md");
        expect(invokeMock).toHaveBeenLastCalledWith("list_directory", {
            basepath: "/notes",
            filename: "docs",
            showHidden: false,
        });

        expect(root.querySelector("aside")).toBeNull();
        setShowHiddenFiles(true);

        await vi.waitFor(() => {
            expect(root.textContent).toContain(".hidden.md");
        });
        expect(invokeMock).toHaveBeenLastCalledWith("list_directory", {
            basepath: "/notes",
            filename: "docs",
            showHidden: true,
        });
    });

    it("registers a context reload handler and removes it on cleanup", async () => {
        let entries: DirectoryEntry[] = [
            { name: "first.md", filename: "docs/first.md", kind: "file" },
        ];
        invokeMock.mockImplementation(async (): Promise<DirectoryEntry[]> => entries);

        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <EditorFolder />, root);

        await vi.waitFor(() => {
            expect(root.textContent).toContain("first.md");
            expect(reloadFile).not.toBeNull();
        });

        entries = [{ name: "external.md", filename: "docs/external.md", kind: "file" }];
        await reloadFile?.();

        await vi.waitFor(() => {
            expect(root.textContent).toContain("external.md");
        });
        expect(root.textContent).not.toContain("first.md");

        dispose();
        dispose = undefined;
        expect(reloadFile).toBeNull();
    });

    it("shows an empty folder as a status message", async () => {
        invokeMock.mockResolvedValue([]);
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <EditorFolder />, root);

        await vi.waitFor(() =>
            expect(root.querySelector('[data-testid="message-view"]')).not.toBeNull()
        );
        const message = root.querySelector<HTMLElement>('[data-testid="message-view"]');
        expect(message?.dataset.messageKind).toBe("status");
        expect(message?.textContent).toContain("folder.empty");
    });

    it("creates a Markdown file, inserts it without reloading and scrolls it into view", async () => {
        const scrollIntoView = vi.fn();
        Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
            configurable: true,
            value: scrollIntoView,
        });
        invokeMock.mockImplementation(async (command: string) => {
            if (command === "list_directory") {
                return [
                    { name: "folder", filename: "docs/folder", kind: "directory" },
                    { name: "old.md", filename: "docs/old.md", kind: "file" },
                ];
            }
            if (command === "create_file") {
                return { name: "new.md", filename: "docs/new.md", kind: "file" };
            }
            throw new Error(`Unexpected command: ${command}`);
        });

        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <EditorFolder />, root);
        await vi.waitFor(() => expect(root.textContent).toContain("old.md"));

        const fileSection = root.querySelector<HTMLElement>(
            '[data-toolbar-menu-section="new-files"]'
        );
        expect(fileSection?.previousElementSibling?.getAttribute("data-toolbar-menu-entry")).toBe(
            "new-directory"
        );
        expect(
            root
                .querySelector('[data-toolbar-menu-entry="new-markdown"]')
                ?.querySelector(".lucide-file-pen")
        ).not.toBeNull();

        root.querySelector<HTMLButtonElement>('[data-toolbar-menu-entry="new-markdown"]')?.click();
        const input = root.querySelector<HTMLInputElement>('[data-testid="create-entry-name"]')!;
        await vi.waitFor(() => expect(input.value).toBe(".md"));
        expect(input.value).toBe(".md");
        input.value = "new.md";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        root.querySelector<HTMLButtonElement>('[data-testid="create-entry-dialog"] button[type="submit"]')?.click();

        await vi.waitFor(() => expect(root.textContent).toContain("new.md"));
        expect(invokeMock).toHaveBeenCalledWith("create_file", {
            basepath: "/notes",
            filename: "docs",
            name: "new.md",
        });
        expect(invokeMock.mock.calls.filter(([command]) => command === "list_directory")).toHaveLength(1);
        expect(showSpinnerMock).toHaveBeenCalled();
        expect(hideSpinnerMock).toHaveBeenCalled();
        await vi.waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" }));
    });
});
