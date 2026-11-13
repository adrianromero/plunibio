/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createSignal, type Accessor, type Setter } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import File from "lucide-solid/icons/file";
import FileChartLine from "lucide-solid/icons/file-chart-line";
import FileImage from "lucide-solid/icons/file-image";
import FilePen from "lucide-solid/icons/file-pen";
import FileText from "lucide-solid/icons/file-text";
import type { CreateEntryHandler, ReloadFileHandler } from "@/app/AppContext";
import { loadFolderSort, saveFolderSort, type FolderSort } from "@/preferences/FolderSortPreferences";
import type { DirectoryEntry } from "@/backend/rusttypes";
import EditorFolder, { fileIconForFilename, formatFileSize } from "../EditorFolder";

const invokeMock = vi.hoisted(() => vi.fn());
const showSpinnerMock = vi.hoisted(() => vi.fn());
const hideSpinnerMock = vi.hoisted(() => vi.fn());
const setSpinnerParamsMock = vi.hoisted(() => vi.fn());
const showAppMessageMock = vi.hoisted(() => vi.fn(async () => undefined));
const loadFilenameMock = vi.hoisted(() => vi.fn(async () => undefined));
let reloadFile: ReloadFileHandler | null;
let createEntryShortcut: CreateEntryHandler | null;
let folderSort: Accessor<FolderSort>;
let setFolderSort: Setter<FolderSort>;
let showHiddenFiles: Accessor<boolean>;
let setShowHiddenFiles: Setter<boolean>;

vi.mock("@tauri-apps/api/core", () => ({ invoke: invokeMock }));
vi.mock("@/shared/logging/frontendLog", () => ({ frontendLog: vi.fn() }));

vi.mock("@/app/AppContext", () => ({
    useAppContext: () => ({
        main: {
            basepath: () => "/notes",
            filename: () => "docs",
            loadFilename: loadFilenameMock,
            showAppMessage: showAppMessageMock,
            setCreateEntry: (handler: CreateEntryHandler | null) => {
                createEntryShortcut = handler;
            },
        },
        spinner: {
            showSpinner: showSpinnerMock,
            hideSpinner: hideSpinnerMock,
            setSpinnerParams: setSpinnerParamsMock,
        },
        editor: {
            sidebarVisible: () => true,
            setSidebarVisible: vi.fn(),
            toggleSidebar: () => null,
            setToggleSidebar: vi.fn(),
            setReloadFile: (handler: ReloadFileHandler | null) => {
                reloadFile = handler;
            },
            folderSort,
            setFolderSort: (value: FolderSort | ((previous: FolderSort) => FolderSort)) => {
                const next = setFolderSort(value);
                saveFolderSort(next);
                return next;
            },
            showHiddenFiles,
        },
    }),
}));

vi.mock("@/i18n/Localization", () => ({
    useI18N: () => ({
        t: (key: string, params?: { count?: number }) =>
            params?.count === undefined ? key : `${key}:${params.count}`,
        locale: () => "en",
    }),
}));

const fileEntry = (name: string, sizeBytes = 0): DirectoryEntry => ({
    name,
    filename: `docs/${name}`,
    kind: "file",
    sizeBytes,
    itemCount: null,
    modifiedAt: Date.UTC(2026, 10, 2, 10, 30),
});

const directoryEntry = (name: string, itemCount = 0): DirectoryEntry => ({
    name,
    filename: `docs/${name}`,
    kind: "directory",
    sizeBytes: null,
    itemCount,
    modifiedAt: Date.UTC(2026, 10, 2, 10, 30),
});

describe("EditorFolder", () => {
    let dispose: (() => void) | undefined;

    beforeEach(() => {
        reloadFile = null;
        createEntryShortcut = null;
        window.localStorage.removeItem("plunibio.folderSort");
        [folderSort, setFolderSort] = createSignal<FolderSort>(loadFolderSort());
        [showHiddenFiles, setShowHiddenFiles] = createSignal(false);
        invokeMock.mockImplementation(
            async (_command: string, args: { showHidden: boolean }): Promise<DirectoryEntry[]> =>
                args.showHidden
                    ? [
                          fileEntry(".hidden.md"),
                          fileEntry("visible.md"),
                      ]
                    : [fileEntry("visible.md")]
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
        loadFilenameMock.mockClear();
        document.body.replaceChildren();
        window.localStorage.removeItem("plunibio.folderSort");
    });

    it("sorts immediately, toggles exclusively, and restores the saved order on remount", async () => {
        invokeMock.mockResolvedValue([
            fileEntry("b.md", 2), fileEntry("a.md", 10),
            directoryEntry("folder-b", 1), directoryEntry("folder-a", 5),
        ]);
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <EditorFolder />, root);
        const names = () => Array.from(root.querySelectorAll<HTMLElement>("[data-path]"))
            .map((entry) => entry.dataset.path?.replace("docs/", ""));
        const sortButton = (attribute: string) => {
            const button = root.querySelector<HTMLButtonElement>(`[data-sort-attribute="${attribute}"]`);
            if (!button) throw new Error("Missing sort button");
            return button;
        };
        await vi.waitFor(() => expect(names()).toEqual(["folder-a", "folder-b", "a.md", "b.md"]));
        expect(sortButton("name").getAttribute("data-sort-direction")).toBe("asc");
        sortButton("name").click();
        expect(names()).toEqual(["folder-b", "folder-a", "b.md", "a.md"]);
        sortButton("size").click();
        expect(names()).toEqual(["folder-b", "folder-a", "b.md", "a.md"]);
        expect(sortButton("size").getAttribute("data-sort-direction")).toBe("asc");
        expect(sortButton("name").getAttribute("data-sort-direction")).toBe("none");
        expect(root.querySelectorAll('[data-sort-attribute][aria-pressed="true"]')).toHaveLength(1);
        sortButton("size").click();
        expect(names()).toEqual(["folder-a", "folder-b", "a.md", "b.md"]);
        sortButton("size").click();
        expect(sortButton("size").getAttribute("data-sort-direction")).toBe("asc");
        sortButton("size").click();
        expect(loadFolderSort()).toEqual({ attribute: "size", direction: "desc" });
        expect(invokeMock).toHaveBeenCalledTimes(1);
        dispose();
        [folderSort, setFolderSort] = createSignal<FolderSort>(loadFolderSort());
        dispose = render(() => <EditorFolder />, root);
        await vi.waitFor(() => expect(names()).toEqual(["folder-a", "folder-b", "a.md", "b.md"]));
        expect(sortButton("size").getAttribute("data-sort-direction")).toBe("desc");
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

        expect(root.querySelector('[data-testid="app-sidebar"]')).not.toBeNull();
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
            fileEntry("first.md"),
        ];
        invokeMock.mockImplementation(async (): Promise<DirectoryEntry[]> => entries);

        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <EditorFolder />, root);

        await vi.waitFor(() => {
            expect(root.textContent).toContain("first.md");
            expect(reloadFile).not.toBeNull();
        });

        entries = [fileEntry("external.md")];
        await reloadFile?.();

        await vi.waitFor(() => {
            expect(root.textContent).toContain("external.md");
        });
        expect(root.textContent).not.toContain("first.md");

        dispose();
        dispose = undefined;
        expect(reloadFile).toBeNull();
        expect(createEntryShortcut).toBeNull();
    });

    it("registers contextual creation shortcuts and shows them in sidebar tooltips", async () => {
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <EditorFolder />, root);
        await vi.waitFor(() => expect(root.textContent).toContain("visible.md"));
        expect(createEntryShortcut).not.toBeNull();

        const shortcuts = Array.from(
            root.querySelectorAll<HTMLElement>("[data-create-kind]")
        ).map((entry) => entry.title);
        expect(shortcuts).toEqual(
            expect.arrayContaining([
                expect.stringContaining("CTRL+SHIFT+N"),
                expect.stringContaining("CTRL+SHIFT+M"),
                expect.stringContaining("CTRL+SHIFT+T"),
            ])
        );

        createEntryShortcut?.("text");
        await vi.waitFor(() =>
            expect(
                root.querySelector<HTMLInputElement>('[data-testid="create-entry-name"]')?.value
            ).toBe(".txt")
        );
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

    it.each([
        ["directory", ""],
        ["markdown", ".md"],
        ["text", ".txt"],
        ["other", ""],
    ])("opens the creation dialog for the %s sidebar action", async (kind, initialName) => {
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <EditorFolder />, root);
        await vi.waitFor(() => expect(root.textContent).toContain("visible.md"));

        root.querySelector<HTMLButtonElement>(`[data-create-kind="${kind}"]`)?.click();
        await vi.waitFor(() => {
            expect(root.querySelector<HTMLDialogElement>('[data-testid="create-entry-dialog"]')?.open)
                .toBe(true);
            expect(root.querySelector<HTMLInputElement>('[data-testid="create-entry-name"]')?.value)
                .toBe(initialName);
        });
    });

    it("disables creation while the folder is loading", async () => {
        invokeMock.mockReturnValue(new Promise<DirectoryEntry[]>(() => undefined));
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <EditorFolder />, root);

        const buttons = root.querySelectorAll<HTMLButtonElement>("[data-create-kind]");
        expect(buttons).toHaveLength(4);
        expect(Array.from(buttons).every((button) => button.disabled)).toBe(true);
        createEntryShortcut?.("markdown");
        expect(root.querySelector<HTMLDialogElement>('[data-testid="create-entry-dialog"]')?.open)
            .toBe(false);
    });

    it("creates a Markdown file and navigates directly to it", async () => {
        invokeMock.mockImplementation(async (command: string) => {
            if (command === "list_directory") {
                return [
                    directoryEntry("folder"),
                    fileEntry("old.md"),
                ];
            }
            if (command === "create_file") {
                return fileEntry("new.md");
            }
            throw new Error(`Unexpected command: ${command}`);
        });

        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <EditorFolder />, root);
        await vi.waitFor(() => expect(root.textContent).toContain("old.md"));

        expect(
            root
                .querySelector('[data-create-kind="markdown"]')
                ?.querySelector(".lucide-file-pen")
        ).not.toBeNull();

        root.querySelector<HTMLButtonElement>('[data-create-kind="markdown"]')?.click();
        const input = root.querySelector<HTMLInputElement>('[data-testid="create-entry-name"]')!;
        await vi.waitFor(() => expect(input.value).toBe(".md"));
        expect(input.value).toBe(".md");
        input.value = "new.md";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        root.querySelector<HTMLButtonElement>('[data-testid="create-entry-dialog"] button[type="submit"]')?.click();

        await vi.waitFor(() => expect(loadFilenameMock).toHaveBeenCalledWith("docs/new.md"));
        expect(invokeMock).toHaveBeenCalledWith("create_file", {
            basepath: "/notes",
            filename: "docs",
            name: "new.md",
        });
        expect(invokeMock.mock.calls.filter(([command]) => command === "list_directory")).toHaveLength(1);
        expect(showSpinnerMock).toHaveBeenCalled();
        expect(hideSpinnerMock).toHaveBeenCalled();
        const lastHideCall =
            hideSpinnerMock.mock.invocationCallOrder[
                hideSpinnerMock.mock.invocationCallOrder.length - 1
            ]!;
        expect(lastHideCall).toBeLessThan(
            loadFilenameMock.mock.invocationCallOrder[0]!
        );
    });

    it("uses distinct icons for Markdown, plain text and other files", () => {
        expect(fileIconForFilename("notes.md")).toBe(FilePen);
        expect(fileIconForFilename("notes.MARKDOWN")).toBe(FilePen);
        expect(fileIconForFilename("diagram.mmd")).toBe(FileChartLine);
        expect(fileIconForFilename("diagram.MERMAID")).toBe(FileChartLine);
        expect(fileIconForFilename("notes.txt")).toBe(FileText);
        expect(fileIconForFilename("server.log")).toBe(FileText);
        expect(fileIconForFilename("photo.png")).toBe(FileImage);
        expect(fileIconForFilename("script.ts")).toBe(FileText);
        expect(fileIconForFilename("archive.bin")).toBe(File);
    });

    it("formats file sizes using the most appropriate unit", () => {
        expect(formatFileSize(0, "en")).toBe("0 KB");
        expect(formatFileSize(1536, "en")).toBe("1.5 KB");
        expect(formatFileSize(5 * 1024 ** 2, "en")).toBe("5 MB");
        expect(formatFileSize(2 * 1024 ** 3, "en")).toBe("2 GB");
    });

    it("shows entry metadata on a second line", async () => {
        invokeMock.mockResolvedValue([
            directoryEntry("assets", 3),
            fileEntry("notes.md", 1536),
        ]);
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <EditorFolder />, root);

        await vi.waitFor(() => expect(root.textContent).toContain("notes.md"));
        const entries = root.querySelectorAll<HTMLElement>('[data-testid="folder-entry"]');
        expect(entries[0]?.querySelector(".lucide-folder")).not.toBeNull();
        expect(entries[0]?.textContent).toContain("folder.itemsCount:3");
        expect(entries[1]?.querySelector(".lucide-file-pen")).not.toBeNull();
        expect(entries[1]?.textContent).toContain("1.5 KB");
        expect(entries[1]?.textContent).toContain("Nov 2, 2026");
    });
});
