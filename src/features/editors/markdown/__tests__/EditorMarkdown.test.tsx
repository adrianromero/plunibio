/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { render } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import type { DragDropEvent } from "@tauri-apps/api/webview";
import type { EventCallback } from "@tauri-apps/api/event";
import { StoryAppProvider } from "@/app/__stories__/support/StoryAppProvider";
import I18NProvider from "@/i18n/Localization";
import EditorMarkdown from "../EditorMarkdown";

let markdownContent =
    "![0.33](./plunibio-logo.png)\n\n# Plunibio\n\n[Open](./old.md) and [Other](./other.md)\n";
let nativeClipboardText = "";
let resolvedLinkedFileHref = "../files/document.pdf";
let nativeDragDropHandler: EventCallback<DragDropEvent> | null = null;
const nativeDropUnlistenMock = vi.fn();

vi.mock("@tauri-apps/api/core", () => ({
    invoke: vi.fn((command: string) => {
        if (command === "read_file") {
            return Promise.resolve({
                content: markdownContent,
                isNew: false,
            });
        }

        if (command === "read_linked_binary_file") {
            return new Promise<number[]>(() => undefined);
        }

        if (command === "save_linked_image") {
            return Promise.resolve("pasted.png");
        }

        if (command === "import_linked_image_uri") {
            return Promise.resolve("./adrianavatar.png");
        }

        if (command === "resolve_linked_file_uri") {
            return Promise.resolve(resolvedLinkedFileHref);
        }

        if (command === "plugin:clipboard-manager|read_text") {
            return Promise.resolve(nativeClipboardText);
        }

        if (command === "plugin:clipboard-manager|read_image") {
            return Promise.resolve(42);
        }

        if (command === "save_linked_image_resource") {
            return Promise.resolve("pasted-image.png");
        }

        return Promise.resolve(undefined);
    }),
}));

vi.mock("@tauri-apps/plugin-clipboard-manager", () => ({
    readText: vi.fn(() => Promise.resolve(nativeClipboardText)),
    readImage: vi.fn(() => Promise.reject(new Error("No native image configured"))),
}));

vi.mock("@tauri-apps/api/webview", () => ({
    getCurrentWebview: () => ({
        onDragDropEvent: (handler: EventCallback<DragDropEvent>) => {
            nativeDragDropHandler = handler;
            return Promise.resolve(nativeDropUnlistenMock);
        },
    }),
}));

vi.mock("@tauri-apps/api/window", () => ({
    getCurrentWindow: () => ({
        scaleFactor: () => Promise.resolve(1),
    }),
}));

const invokeMock = vi.mocked(invoke);

describe("EditorMarkdown", () => {
    let dispose: (() => void) | undefined;
    let root: HTMLDivElement | undefined;

    beforeEach(() => {
        markdownContent =
            "![0.33](./plunibio-logo.png)\n\n# Plunibio\n\n[Open](./old.md) and [Other](./other.md)\n";
        nativeClipboardText = "";
        resolvedLinkedFileHref = "../files/document.pdf";
        nativeDragDropHandler = null;
        nativeDropUnlistenMock.mockReset();
    });

    const activateButton = (button: HTMLButtonElement): void => {
        button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        button.click();
    };

    const dropNativeFiles = async (paths: string[]): Promise<void> => {
        const handler = await vi.waitFor(() => {
            expect(nativeDragDropHandler).not.toBeNull();
            return nativeDragDropHandler!;
        });
        handler({
            event: "tauri://drag-drop",
            id: 1,
            payload: {
                type: "drop",
                paths,
                position: {
                    toLogical: () => ({ x: 0, y: 0 }),
                },
            } as unknown as DragDropEvent,
        });
    };

    afterEach(() => {
        dispose?.();
        root?.remove();
        vi.restoreAllMocks();
        dispose = undefined;
        root = undefined;
    });

    it("loads an image block followed by a heading", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        await vi.waitFor(() => {
            expect(root?.querySelector(".ProseMirror")).not.toBeNull();
            expect(root?.querySelector("h1")?.textContent).toBe("Plunibio");
        });
    });

    it("imports an image exposed by the clipboard as a local file URI", async () => {
        markdownContent = "Start";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="notes/README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const editor = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLElement>(".ProseMirror");
            expect(element).not.toBeNull();
            return element!;
        });
        const paste = new ClipboardEvent("paste", {
            bubbles: true,
            cancelable: true,
            clipboardData: {
                files: {
                    length: 0,
                    item: (): File | null => null,
                },
                items: { length: 0 },
                getData: (type: string): string =>
                    type === "text/uri-list" || type === "text/plain"
                        ? "file:///home/adrian/Im%C3%A1genes/adrianavatar.png"
                        : "",
            } as unknown as DataTransfer,
        });

        editor.dispatchEvent(paste);

        await vi.waitFor(() => {
            expect(invokeMock).toHaveBeenCalledWith("import_linked_image_uri", {
                basepath: "/home/adrian/documents",
                filename: "notes/README.md",
                uri: "file:///home/adrian/Im%C3%A1genes/adrianavatar.png",
            });
            expect(root?.querySelector(".milkdown-image-inline")).not.toBeNull();
        });
    });

    it("keeps the URL when pasting a web image", async () => {
        markdownContent = "Start";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const editor = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLElement>(".ProseMirror");
            expect(element).not.toBeNull();
            return element!;
        });
        editor.dispatchEvent(
            new ClipboardEvent("paste", {
                bubbles: true,
                cancelable: true,
                clipboardData: {
                    files: { length: 0, item: (): File | null => null },
                    items: { length: 0 },
                    getData: (type: string): string =>
                        type === "text/html"
                            ? '<img src="https://example.com/photo.png" alt="Web photo">'
                            : "",
                } as unknown as DataTransfer,
            })
        );

        await vi.waitFor(() => {
            const image = root?.querySelector<HTMLImageElement>(
                '.milkdown-image-inline img[src="https://example.com/photo.png"]'
            );
            expect(image).not.toBeNull();
            expect(image?.alt).toBe("Web photo");
        });
        expect(invokeMock).not.toHaveBeenCalledWith(
            "save_linked_image",
            expect.anything()
        );
    });

    it("creates an image block when pasting into an empty top-level line", async () => {
        markdownContent = "";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const editor = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLElement>(".ProseMirror");
            expect(element).not.toBeNull();
            return element!;
        });
        editor.dispatchEvent(
            new ClipboardEvent("paste", {
                bubbles: true,
                cancelable: true,
                clipboardData: {
                    files: { length: 0, item: (): File | null => null },
                    items: { length: 0 },
                    getData: (type: string): string =>
                        type === "text/html"
                            ? '<img src="https://example.com/photo.png" alt="Photo">'
                            : "",
                } as unknown as DataTransfer,
            })
        );

        await vi.waitFor(() => {
            expect(root?.querySelector(".milkdown-image-block")).not.toBeNull();
            expect(root?.querySelector(".milkdown-image-inline")).toBeNull();
        });
    });

    it("creates an image when pasting a plain web image URL", async () => {
        markdownContent = "Start";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const editor = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLElement>(".ProseMirror");
            expect(element).not.toBeNull();
            return element!;
        });
        const source = "https://example.com/catalog/photo.jpg";
        editor.dispatchEvent(
            new ClipboardEvent("paste", {
                bubbles: true,
                cancelable: true,
                clipboardData: {
                    files: { length: 0, item: (): File | null => null },
                    items: { length: 0 },
                    getData: (type: string): string =>
                        type === "text/plain" ? source : "",
                } as unknown as DataTransfer,
            })
        );

        await vi.waitFor(() => {
            expect(
                root?.querySelector(`.milkdown-image-inline img[src="${source}"]`)
            ).not.toBeNull();
        });
    });

    it("creates a relative link when pasting a non-image file from the base path", async () => {
        markdownContent = "Start";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="notes/README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const editor = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLElement>(".ProseMirror");
            expect(element).not.toBeNull();
            return element!;
        });
        editor.dispatchEvent(
            new ClipboardEvent("paste", {
                bubbles: true,
                cancelable: true,
                clipboardData: {
                    files: { length: 0, item: (): File | null => null },
                    items: { length: 0 },
                    getData: (type: string): string => {
                        if (type === "text/html") {
                            return '<a href="file:///home/adrian/documents/files/document.pdf">/home/adrian/documents/files/document.pdf</a>';
                        }
                        return type === "text/plain"
                            ? "/home/adrian/documents/files/document.pdf"
                            : "";
                    },
                } as unknown as DataTransfer,
            })
        );

        await vi.waitFor(() => {
            const link = root?.querySelector<HTMLAnchorElement>(
                '.ProseMirror a[href="../files/document.pdf"]'
            );
            expect(link?.textContent).toBe("../files/document.pdf");
        });
        expect(invokeMock).toHaveBeenCalledWith("resolve_linked_file_uri", {
            basepath: "/home/adrian/documents",
            filename: "notes/README.md",
            uri: "file:///home/adrian/documents/files/document.pdf",
        });
    });

    it("resolves a pasted blob image through the native clipboard", async () => {
        markdownContent = "Start";
        nativeClipboardText =
            "file:///home/adrian/Im%C3%A1genes/adrianavatar.png";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="notes/README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const editor = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLElement>(".ProseMirror");
            expect(element).not.toBeNull();
            return element!;
        });
        editor.dispatchEvent(
            new ClipboardEvent("paste", {
                bubbles: true,
                cancelable: true,
                clipboardData: {
                    files: { length: 0, item: (): File | null => null },
                    items: { length: 0 },
                    types: ["text/html", "image/png"],
                    getData: (type: string): string =>
                        type === "text/html"
                            ? '<img src="blob:http://localhost:1420/image-id">'
                            : "",
                } as unknown as DataTransfer,
            })
        );

        await vi.waitFor(() => {
            expect(invokeMock).toHaveBeenCalledWith("import_linked_image_uri", {
                basepath: "/home/adrian/documents",
                filename: "notes/README.md",
                uri: "file:///home/adrian/Im%C3%A1genes/adrianavatar.png",
            });
            expect(root?.querySelector(".milkdown-image-inline")).not.toBeNull();
        });
        expect(root.querySelector('img[src^="blob:"]')).toBeNull();
    });

    it("imports a dropped local image inline when the target paragraph has text", async () => {
        markdownContent = "Start";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="notes/README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const editor = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLElement>(".ProseMirror");
            expect(element).not.toBeNull();
            return element!;
        });
        const browserDrop = new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer: {
                files: { length: 0, item: (): File | null => null },
                items: { length: 0 },
                getData: (type: string): string =>
                    type === "text/uri-list"
                        ? "file:///home/adrian/Im%C3%A1genes/adrianavatar.png"
                        : "",
            } as unknown as DataTransfer,
        });
        editor.dispatchEvent(browserDrop);
        expect(browserDrop.defaultPrevented).toBe(true);
        expect(invokeMock).not.toHaveBeenCalledWith(
            "import_linked_image_uri",
            expect.anything()
        );

        await dropNativeFiles(["/home/adrian/Imágenes/adrianavatar.png"]);

        await vi.waitFor(() => {
            expect(invokeMock).toHaveBeenCalledWith("import_linked_image_uri", {
                basepath: "/home/adrian/documents",
                filename: "notes/README.md",
                uri: "file:///home/adrian/Im%C3%A1genes/adrianavatar.png",
            });
            expect(root?.querySelector(".milkdown-image-inline")).not.toBeNull();
            expect(root?.querySelector(".milkdown-image-block")).toBeNull();
            expect(editor.textContent).not.toContain("file://");
        });
    });

    it("keeps an image URL dropped from the browser", async () => {
        markdownContent = "Start";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="notes/README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const editor = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLElement>(".ProseMirror");
            expect(element).not.toBeNull();
            return element!;
        });
        const source = "https://example.com/photo.jpg?w=740&q=80";
        const dropEvent = new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer: {
                files: { length: 0, item: (): File | null => null },
                items: { length: 0 },
                getData: (type: string): string =>
                    type === "text/uri-list" ? source : "",
            } as unknown as DataTransfer,
        });
        editor.dispatchEvent(dropEvent);

        expect(dropEvent.defaultPrevented).toBe(true);
        await vi.waitFor(() => {
            const image = root?.querySelector<HTMLImageElement>(
                ".milkdown-image-inline img"
            );
            expect(image).not.toBeNull();
            expect(image?.getAttribute("src")).toBe(source);
        });
    });

    it("imports a dropped image as a block on an empty top-level line", async () => {
        markdownContent = "";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="notes/README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        await vi.waitFor(() => {
            const element = root?.querySelector<HTMLElement>(".ProseMirror");
            expect(element).not.toBeNull();
        });
        await dropNativeFiles(["/home/adrian/Imágenes/adrianavatar.png"]);

        await vi.waitFor(() => {
            expect(root?.querySelector(".milkdown-image-block")).not.toBeNull();
            expect(root?.querySelector(".milkdown-image-inline")).toBeNull();
        });
    });

    it("creates a relative link when dropping a non-image file from the base path", async () => {
        markdownContent = "Start";
        resolvedLinkedFileHref = "./Development plan.md";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="notes/README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const editor = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLElement>(".ProseMirror");
            expect(element).not.toBeNull();
            return element!;
        });
        await dropNativeFiles(["/home/adrian/documents/notes/Development plan.md"]);

        await vi.waitFor(() => {
            const link = root?.querySelector<HTMLAnchorElement>(
                '.ProseMirror a[href="./Development%20plan.md"]'
            );
            expect(link?.textContent).toBe("./Development plan.md");
            expect(editor.textContent).not.toContain("file://");
        });
        expect(invokeMock).toHaveBeenCalledWith("resolve_linked_file_uri", {
            basepath: "/home/adrian/documents",
            filename: "notes/README.md",
            uri: "file:///home/adrian/documents/notes/Development%20plan.md",
        });
    });

    it("edits and removes a link with the shared floating actions", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const link = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLAnchorElement>('.ProseMirror a[href="./old.md"]');
            expect(element).not.toBeNull();
            return element!;
        });
        link.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));

        const actions = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLFormElement>(
                'form[aria-label="Link actions"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Edit link"]')!);
        const input = actions.querySelector<HTMLInputElement>('input[aria-label="Link address"]');
        expect(input).not.toBeNull();
        input!.value = "./new.md";
        input!.dispatchEvent(new InputEvent("input", { bubbles: true }));
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="OK"]')!);

        await vi.waitFor(() => {
            expect(root?.querySelector('.ProseMirror a[href="./new.md"]')).not.toBeNull();
        });
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Remove link"]')!);
        await vi.waitFor(() => {
            expect(root?.querySelector('.ProseMirror a[href="./new.md"]')).toBeNull();
            expect(root?.querySelector('.ProseMirror a[href="./other.md"]')).not.toBeNull();
            expect(root?.querySelector(".ProseMirror")?.textContent).toContain("Open");
        });
    });

    it("locks the active link while editing and cancels when clicking outside", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const firstLink = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLAnchorElement>('.ProseMirror a[href="./old.md"]');
            expect(element).not.toBeNull();
            return element!;
        });
        const secondLink = root.querySelector<HTMLAnchorElement>(
            '.ProseMirror a[href="./other.md"]'
        )!;

        firstLink.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        const actions = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLFormElement>(
                'form[aria-label="Link actions"]'
            );
            expect(element?.closest("[hidden]")).toBeNull();
            return element!;
        });
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Edit link"]')!);
        const input = actions.querySelector<HTMLInputElement>('input[aria-label="Link address"]')!;
        expect(input.value).toBe("./old.md");

        secondLink.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        expect(actions.querySelector<HTMLInputElement>('input[aria-label="Link address"]')?.value).toBe(
            "./old.md"
        );

        document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        expect(actions.querySelector('input[aria-label="Link address"]')).toBeNull();

        secondLink.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        await vi.waitFor(() => {
            const nextActions = root?.querySelector<HTMLFormElement>(
                'form[aria-label="Link actions"]'
            );
            expect(nextActions?.querySelector('button[title="./other.md"]')).not.toBeNull();
            expect(nextActions?.closest("[hidden]")).toBeNull();
        });
    });

    it("keeps the editor attached to its link while scrolling", async () => {
        let anchorTop = 100;
        let layerTop = 300;
        const rangeRect = vi
            .spyOn(Range.prototype, "getBoundingClientRect")
            .mockImplementation(() => new DOMRect(40, anchorTop, 60, 20));
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const link = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLAnchorElement>('.ProseMirror a[href="./old.md"]');
            expect(element).not.toBeNull();
            return element!;
        });
        link.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        const actions = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLFormElement>(
                'form[aria-label="Link actions"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Edit link"]')!);

        const positioner = actions.parentElement as HTMLDivElement;
        const layer = positioner.parentElement as HTMLDivElement;
        Object.defineProperty(layer, "getBoundingClientRect", {
            configurable: true,
            value: () => new DOMRect(10, layerTop, 800, 0),
        });
        root.querySelector<HTMLElement>(".scrollingView")?.dispatchEvent(new Event("scroll"));
        await vi.waitFor(() => {
            expect(positioner.style.left).toBe("30px");
            expect(positioner.style.top).toBe("-174px");
        });

        const callsBeforeScroll = rangeRect.mock.calls.length;
        anchorTop -= 40;
        layerTop -= 40;
        root.querySelector<HTMLElement>(".scrollingView")?.dispatchEvent(new Event("scroll"));
        await vi.waitFor(() => {
            expect(rangeRect.mock.calls.length).toBeGreaterThan(callsBeforeScroll);
            expect(positioner.style.left).toBe("30px");
            expect(positioner.style.top).toBe("-174px");
        });
    });

    it("moves between hovered links and hides when leaving or clicking outside", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const firstLink = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLAnchorElement>('.ProseMirror a[href="./old.md"]');
            expect(element).not.toBeNull();
            return element!;
        });
        const secondLink = root.querySelector<HTMLAnchorElement>(
            '.ProseMirror a[href="./other.md"]'
        )!;

        firstLink.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        await vi.waitFor(() => {
            expect(root?.querySelector('form[aria-label="Link actions"] button[title="./old.md"]')).not.toBeNull();
        });

        firstLink.dispatchEvent(
            new PointerEvent("pointerout", { bubbles: true, relatedTarget: secondLink })
        );
        secondLink.dispatchEvent(
            new PointerEvent("pointerover", { bubbles: true, relatedTarget: firstLink })
        );
        await vi.waitFor(() => {
            expect(
                root?.querySelector('form[aria-label="Link actions"] button[title="./other.md"]')
            ).not.toBeNull();
        });

        document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        expect(root.querySelector('form[aria-label="Link actions"]')).toBeNull();

        secondLink.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        expect(root.querySelector('form[aria-label="Link actions"]')).not.toBeNull();
        secondLink.dispatchEvent(
            new PointerEvent("pointerout", { bubbles: true, relatedTarget: document.body })
        );
        await vi.waitFor(() => {
            expect(root?.querySelector('form[aria-label="Link actions"]')).toBeNull();
        });
    });

    it("copies the active link without locking its hover state", async () => {
        const writeText = vi.fn(() => Promise.resolve());
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText },
        });
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const link = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLAnchorElement>('.ProseMirror a[href="./old.md"]');
            expect(element).not.toBeNull();
            return element!;
        });
        link.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        const copyButton = root.querySelector<HTMLButtonElement>(
            'form[aria-label="Link actions"] button[aria-label="Copy link"]'
        )!;
        activateButton(copyButton);

        await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith("./old.md"));
        document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        expect(root.querySelector('form[aria-label="Link actions"]')).toBeNull();
    });

    it("shows the shared floating actions when hovering an image", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const image = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLImageElement>(
                '.milkdown-image-block img[data-type="image-block"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        image.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));

        await vi.waitFor(() => {
            const actions = root?.querySelector<HTMLFormElement>(
                'form[aria-label="Image actions"]'
            );
            expect(actions).not.toBeNull();
            expect(actions?.closest("[hidden]")).toBeNull();
        });
    });

    it("coordinates one floating rectangle between images and links", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const image = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLImageElement>(
                '.milkdown-image-block img[data-type="image-block"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        const link = root.querySelector<HTMLAnchorElement>('.ProseMirror a[href="./old.md"]')!;

        image.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        await vi.waitFor(() => {
            expect(root?.querySelector('form[aria-label="Image actions"]')).not.toBeNull();
            expect(root?.querySelectorAll("form")).toHaveLength(1);
        });

        image.dispatchEvent(
            new PointerEvent("pointerout", { bubbles: true, relatedTarget: link })
        );
        link.dispatchEvent(
            new PointerEvent("pointerover", { bubbles: true, relatedTarget: image })
        );
        const linkActions = await vi.waitFor(() => {
            const form = root?.querySelector<HTMLFormElement>('form[aria-label="Link actions"]');
            expect(form).not.toBeNull();
            expect(root?.querySelectorAll("form")).toHaveLength(1);
            return form!;
        });

        activateButton(
            linkActions.querySelector<HTMLButtonElement>('button[aria-label="Edit link"]')!
        );
        link.dispatchEvent(
            new PointerEvent("pointerout", { bubbles: true, relatedTarget: image })
        );
        image.dispatchEvent(
            new PointerEvent("pointerover", { bubbles: true, relatedTarget: link })
        );

        expect(root.querySelectorAll("form")).toHaveLength(1);
        expect(root.querySelector('form[aria-label="Image actions"]')).toBeNull();
        expect(
            linkActions.querySelector<HTMLInputElement>('input[aria-label="Link address"]')?.value
        ).toBe("./old.md");

        activateButton(
            linkActions.querySelector<HTMLButtonElement>('button[aria-label="Cancel"]')!
        );
        await vi.waitFor(() => {
            expect(root?.querySelector('form[aria-label="Image actions"]')).not.toBeNull();
            expect(root?.querySelectorAll("form")).toHaveLength(1);
        });
    });

    it("edits, cancels and toggles the caption from the image actions", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const hoverImage = async (): Promise<HTMLFormElement> => {
            const image = await vi.waitFor(() => {
                const element = root?.querySelector<HTMLImageElement>(
                    '.milkdown-image-block img[data-type="image-block"]'
                );
                expect(element).not.toBeNull();
                return element!;
            });
            image.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
            return await vi.waitFor(() => {
                const form = root?.querySelector<HTMLFormElement>(
                    'form[aria-label="Image actions"]'
                );
                expect(form?.closest("[hidden]")).toBeNull();
                return form!;
            });
        };

        let actions = await hoverImage();
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Edit link"]')!);
        let input = actions.querySelector<HTMLInputElement>('input[aria-label="Link address"]')!;
        expect(input.value).toBe("./plunibio-logo.png");
        input.value = "./discarded.png";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Cancel"]')!);
        expect(actions.querySelector('input[aria-label="Link address"]')).toBeNull();
        expect(actions.querySelector('button[title="./plunibio-logo.png"]')).not.toBeNull();

        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Edit link"]')!);
        input = actions.querySelector<HTMLInputElement>('input[aria-label="Link address"]')!;
        input.value = "./updated-logo.png";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="OK"]')!);

        actions = await hoverImage();
        await vi.waitFor(() => {
            expect(actions.querySelector('button[title="./updated-logo.png"]')).not.toBeNull();
        });
        activateButton(
            actions.querySelector<HTMLButtonElement>(
                'button[aria-label="Show or hide image caption"]'
            )!
        );
        await vi.waitFor(() => {
            expect(root?.querySelector(".milkdown-image-block .caption-input")).not.toBeNull();
        });
    });

    it("creates a link with its URL as text from the shared editor", async () => {
        markdownContent = "";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const linkButton = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLButtonElement>('button[aria-label="Link"]');
            expect(element).not.toBeNull();
            expect(element?.disabled).toBe(false);
            return element!;
        });
        linkButton.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));

        const input = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLInputElement>(
                'form[aria-label="Link actions"] input[aria-label="Link address"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        input.value = "https://example.com";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        activateButton(
            input.closest("form")!.querySelector<HTMLButtonElement>('button[aria-label="OK"]')!
        );

        await vi.waitFor(() => {
            const link = root?.querySelector<HTMLAnchorElement>(
                '.ProseMirror a[href="https://example.com"]'
            );
            expect(link?.textContent).toBe("https://example.com");
        });
    });

    it("does not create a link when the shared editor is cancelled", async () => {
        markdownContent = "Plain text";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const linkButton = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLButtonElement>('button[aria-label="Link"]');
            expect(element?.disabled).toBe(false);
            return element!;
        });
        linkButton.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));

        const cancelButton = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLButtonElement>(
                'form[aria-label="Link actions"] button[aria-label="Cancel"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        activateButton(cancelButton);

        expect(root.querySelector(".ProseMirror a")).toBeNull();
        expect(root.querySelector(".ProseMirror")?.textContent).toContain("Plain text");
    });
});
