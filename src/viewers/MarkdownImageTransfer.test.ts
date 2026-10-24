/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { invoke } from "@tauri-apps/api/core";
import { readImage, readText } from "@tauri-apps/plugin-clipboard-manager";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    droppedMarkdownImage,
    fileUriFromText,
    isSupportedMarkdownImage,
    pastedMarkdownImage,
    pastedMarkdownLink,
    resolveDroppedMarkdownImage,
    resolvePastedMarkdownImage,
    resolvePastedMarkdownLink,
    UnsupportedMarkdownImageError,
} from "./MarkdownImageTransfer";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));
vi.mock("@tauri-apps/api/image", () => ({ transformImage: vi.fn(() => 42) }));
vi.mock("@tauri-apps/plugin-clipboard-manager", () => ({
    readImage: vi.fn(),
    readText: vi.fn(),
}));

const invokeMock = vi.mocked(invoke);
const readImageMock = vi.mocked(readImage);
const readTextMock = vi.mocked(readText);

function transferData(values: {
    html?: string;
    text?: string;
    uriList?: string;
    files?: File[];
    types?: string[];
}): DataTransfer {
    const files = values.files ?? [];
    return {
        files: {
            length: files.length,
            item: (index: number): File | null => files[index] ?? null,
        },
        items: { length: 0 },
        types: values.types ?? [],
        getData: (type: string): string => {
            if (type === "text/html") return values.html ?? "";
            if (type === "text/plain") return values.text ?? "";
            if (type === "text/uri-list") return values.uriList ?? "";
            return "";
        },
    } as unknown as DataTransfer;
}

beforeEach(() => {
    invokeMock.mockReset();
    readImageMock.mockReset();
    readTextMock.mockReset();
});

describe("isSupportedMarkdownImage", () => {
    it.each([
        ["photo.PNG", "image/png"],
        ["photo.jpg", "image/jpeg"],
        ["drawing.svg", "image/svg+xml"],
        ["icon.ico", "image/vnd.microsoft.icon"],
        ["legacy.bmp", ""],
    ])("accepts the supported image %s", (name, type) => {
        expect(isSupportedMarkdownImage(new File(["image"], name, { type }))).toBe(true);
    });

    it.each([
        ["notes.txt", "text/plain"],
        ["photo.png", "text/plain"],
        ["photo.exe", "image/png"],
    ])("rejects the unsupported file %s", (name, type) => {
        expect(isSupportedMarkdownImage(new File(["content"], name, { type }))).toBe(false);
    });
});

describe("pasted Markdown images", () => {
    it("preserves a web image URL", () => {
        expect(
            pastedMarkdownImage(
                transferData({
                    html: '<img src="https://example.com/photo.png" alt="Remote photo">',
                    files: [new File(["pixels"], "photo.png", { type: "image/png" })],
                })
            )
        ).toEqual({
            kind: "web",
            source: "https://example.com/photo.png",
            alt: "Remote photo",
        });
    });

    it("turns a plain web image URL into an image", () => {
        const source =
            "https://i.etsystatic.com/66350043/r/il/deb4b9/8503239137/il_794xN.8503239137_6fbc.jpg";

        expect(pastedMarkdownImage(transferData({ text: source }))).toEqual({
            kind: "web",
            source,
            alt: "il_794xN.8503239137_6fbc.jpg",
        });
    });

    it("recognizes an image copied by a file manager as an HTML link", () => {
        expect(
            pastedMarkdownImage(
                transferData({
                    html: '<meta charset="utf-8"><a href="file:///home/adrian/Im%C3%A1genes/chatblank.jpeg">/home/adrian/Imágenes/chatblank.jpeg</a>',
                    text: "/home/adrian/Imágenes/chatblank.jpeg",
                })
            )
        ).toEqual({
            kind: "file-uri",
            uri: "file:///home/adrian/Im%C3%A1genes/chatblank.jpeg",
            alt: "chatblank.jpeg",
        });
    });

    it("recognizes a file image from the link parsed by Milkdown", () => {
        expect(
            pastedMarkdownImage(transferData({ types: ["Files"] }), false, {
                href: "file:///home/adrian/Im%C3%A1genes/chatblank.jpeg",
                label: "/home/adrian/Imágenes/chatblank.jpeg",
            })
        ).toEqual({
            kind: "file-uri",
            uri: "file:///home/adrian/Im%C3%A1genes/chatblank.jpeg",
            alt: "chatblank.jpeg",
        });
    });

    it("routes a blob image through the native clipboard", () => {
        expect(
            pastedMarkdownImage(
                transferData({ html: '<img src="blob:http://localhost/image-id">' })
            )
        ).toEqual({ kind: "native", fallbackFile: null, alt: "image" });
    });

    it("uses the relative link returned for an image inside the base path", async () => {
        readTextMock.mockResolvedValue("file:///home/adrian/Images/my%20photo.png");
        invokeMock.mockResolvedValue("../Images/my photo.png");
        const pasted = pastedMarkdownImage(transferData({ types: ["image/png"] }))!;

        await expect(
            resolvePastedMarkdownImage(pasted, "/home/adrian", "notes/readme.md")
        ).resolves.toEqual({
            source: "../Images/my%20photo.png",
            alt: "my photo.png",
        });
        expect(invokeMock).toHaveBeenCalledWith("import_linked_image_uri", {
            basepath: "/home/adrian",
            filename: "notes/readme.md",
            uri: "file:///home/adrian/Images/my%20photo.png",
        });
        expect(readImageMock).not.toHaveBeenCalled();
    });

    it("uses the new local link returned after copying an image from outside the base path", async () => {
        readTextMock.mockResolvedValue("file:///tmp/external%20photo.png");
        invokeMock.mockResolvedValue("./external photo.png");
        const pasted = pastedMarkdownImage(transferData({ types: ["image/png"] }))!;

        await expect(
            resolvePastedMarkdownImage(pasted, "/documents", "notes/readme.md")
        ).resolves.toEqual({
            source: "./external%20photo.png",
            alt: "external photo.png",
        });
        expect(invokeMock).toHaveBeenCalledWith("import_linked_image_uri", {
            basepath: "/documents",
            filename: "notes/readme.md",
            uri: "file:///tmp/external%20photo.png",
        });
        expect(readImageMock).not.toHaveBeenCalled();
    });

    it("saves native clipboard pixels as PNG when there is no file URI", async () => {
        const close = vi.fn(() => Promise.resolve());
        readTextMock.mockResolvedValue("");
        readImageMock.mockResolvedValue(
            { close } as unknown as Awaited<ReturnType<typeof readImage>>
        );
        invokeMock.mockResolvedValue("pasted-image-2.png");
        const pasted = pastedMarkdownImage(transferData({ types: ["image/png"] }))!;

        await expect(
            resolvePastedMarkdownImage(pasted, "/documents", "readme.md")
        ).resolves.toEqual({
            source: "./pasted-image-2.png",
            alt: "image",
        });
        expect(invokeMock).toHaveBeenCalledWith("save_linked_image_resource", {
            basepath: "/documents",
            filename: "readme.md",
            preferredName: "pasted-image.png",
            image: 42,
        });
        expect(close).toHaveBeenCalledOnce();
    });

    it("falls back to transferred file bytes if native image reading fails", async () => {
        const file = new File([new Uint8Array([0, 128, 255])], "photo.png", {
            type: "image/png",
        });
        readTextMock.mockRejectedValue(new Error("No text"));
        readImageMock.mockRejectedValue(new Error("No native image"));
        invokeMock.mockResolvedValue("photo.png");
        const pasted = pastedMarkdownImage(transferData({ files: [file] }))!;

        await expect(
            resolvePastedMarkdownImage(pasted, "/documents", "notes/readme.md")
        ).resolves.toEqual({ source: "./photo.png", alt: "photo.png" });
        expect(invokeMock).toHaveBeenCalledWith("save_linked_image", {
            basepath: "/documents",
            filename: "notes/readme.md",
            preferredName: "photo.png",
            content: [0, 128, 255],
        });
    });

    it("does not intercept ordinary pasted text", () => {
        expect(pastedMarkdownImage(transferData({ text: "ordinary text" }))).toBeNull();
    });
});

describe("pasted Markdown links", () => {
    it("makes a file inside the base path relative to the Markdown document", async () => {
        invokeMock.mockResolvedValue("../documents/specification.pdf");
        const pasted = pastedMarkdownLink(
            transferData({ uriList: "file:///workspace/documents/specification.pdf" })
        )!;

        await expect(
            resolvePastedMarkdownLink(pasted, "/workspace", "notes/readme.md")
        ).resolves.toEqual({
            href: "../documents/specification.pdf",
            label: "../documents/specification.pdf",
        });
        expect(invokeMock).toHaveBeenCalledWith("resolve_linked_file_uri", {
            basepath: "/workspace",
            filename: "notes/readme.md",
            uri: "file:///workspace/documents/specification.pdf",
        });
    });

    it("keeps an outside file as an absolute file link", async () => {
        invokeMock.mockResolvedValue("file:///tmp/external%20notes.pdf");
        const pasted = pastedMarkdownLink(
            transferData({ text: "/tmp/external notes.pdf" })
        )!;

        await expect(
            resolvePastedMarkdownLink(pasted, "/workspace", "readme.md")
        ).resolves.toEqual({
            href: "file:///tmp/external%20notes.pdf",
            label: "/tmp/external notes.pdf",
        });
    });

    it.each([
        "https://example.com/document.pdf",
        "mailto:pepe@example.com",
    ])("keeps the direct link %s", async (href) => {
        const pasted = pastedMarkdownLink(transferData({ text: href }))!;
        await expect(
            resolvePastedMarkdownLink(pasted, "/workspace", "readme.md")
        ).resolves.toEqual({ href, label: href });
        expect(invokeMock).not.toHaveBeenCalled();
    });

    it("does not intercept normal text", () => {
        expect(pastedMarkdownLink(transferData({ text: "ordinary text" }))).toBeNull();
    });
});

describe("dropped Markdown images", () => {
    it("prioritizes a local URI so Rust can link or copy it", () => {
        expect(
            droppedMarkdownImage(
                transferData({ uriList: "file:///documents/images/photo.png" })
            )
        ).toEqual({
            kind: "file-uri",
            uri: "file:///documents/images/photo.png",
            alt: "photo.png",
        });
    });

    it("rejects unsupported dropped file content", async () => {
        const dropped = droppedMarkdownImage(
            transferData({ files: [new File(["notes"], "notes.txt", { type: "image/png" })] })
        )!;
        await expect(
            resolveDroppedMarkdownImage(dropped, "/documents", "readme.md")
        ).rejects.toBeInstanceOf(UnsupportedMarkdownImageError);
    });
});

describe("fileUriFromText", () => {
    it("reads the first local file URI and ignores comments", () => {
        expect(fileUriFromText("# copied file\nfile:///home/adrian/Images/photo.png\n")).toBe(
            "file:///home/adrian/Images/photo.png"
        );
    });
});
