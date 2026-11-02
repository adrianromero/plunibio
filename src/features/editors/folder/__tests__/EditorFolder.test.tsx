/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createSignal, type Accessor, type Setter } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import File from "lucide-solid/icons/file";
import FilePen from "lucide-solid/icons/file-pen";
import FileText from "lucide-solid/icons/file-text";
import type { ReloadFileHandler } from "@/app/AppContext";
import type { DirectoryEntry } from "@/backend/rusttypes";
import EditorFolder, { fileIconForFilename, formatFileSize } from "../EditorFolder";

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

    it("uses distinct icons for Markdown, plain text and other files", () => {
        expect(fileIconForFilename("notes.md")).toBe(FilePen);
        expect(fileIconForFilename("notes.MARKDOWN")).toBe(FilePen);
        expect(fileIconForFilename("notes.txt")).toBe(FileText);
        expect(fileIconForFilename("server.log")).toBe(FileText);
        expect(fileIconForFilename("photo.png")).toBe(File);
        expect(fileIconForFilename("script.ts")).toBe(File);
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
