/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { invoke } from "@tauri-apps/api/core";
import { transformImage } from "@tauri-apps/api/image";
import { readImage, readText } from "@tauri-apps/plugin-clipboard-manager";

const imageMimeTypesByExtension: Readonly<Record<string, readonly string[]>> = {
    avif: ["image/avif"],
    bmp: ["image/bmp", "image/x-ms-bmp"],
    gif: ["image/gif"],
    ico: ["image/x-icon", "image/vnd.microsoft.icon"],
    jpeg: ["image/jpeg"],
    jpg: ["image/jpeg"],
    png: ["image/png"],
    svg: ["image/svg+xml"],
    webp: ["image/webp"],
};

type DirectMarkdownImage =
    | { kind: "web"; source: string; alt: string }
    | { kind: "file-uri"; uri: string; alt: string };

export type PastedMarkdownImage =
    | DirectMarkdownImage
    | { kind: "native"; fallbackFile: File | null; alt: string };

export type DroppedMarkdownImage =
    | DirectMarkdownImage
    | { kind: "file"; file: File };

export interface ResolvedMarkdownImage {
    source: string;
    alt: string;
}

export type PastedMarkdownLink =
    | { kind: "web"; href: string; label: string }
    | { kind: "file-uri"; uri: string; label: string };

export interface ResolvedMarkdownLink {
    href: string;
    label: string;
}

export interface ParsedMarkdownLink {
    href: string;
    label: string;
}

export class UnsupportedMarkdownImageError extends Error {
    constructor() {
        super("Unsupported Markdown image file.");
        this.name = "UnsupportedMarkdownImageError";
    }
}

function fileExtension(filename: string): string {
    const extensionIndex = filename.lastIndexOf(".");
    return extensionIndex >= 0 ? filename.slice(extensionIndex + 1).toLowerCase() : "";
}

function encodeMarkdownPathSegment(value: string): string {
    return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
        `%${character.charCodeAt(0).toString(16).toUpperCase()}`
    );
}

function encodeMarkdownHref(value: string): string {
    return value
        .split(/[\\/]/)
        .map((segment) =>
            segment === "." || segment === ".." ? segment : encodeMarkdownPathSegment(segment)
        )
        .join("/");
}

export function isSupportedMarkdownImage(file: File): boolean {
    const expectedMimeTypes = imageMimeTypesByExtension[fileExtension(file.name)];
    return (
        expectedMimeTypes !== undefined &&
        (file.type.length === 0 || expectedMimeTypes.includes(file.type.toLowerCase()))
    );
}

function imageNameFromUrl(source: string): string {
    try {
        const name = new URL(source).pathname.split("/").pop();
        return name ? decodeURIComponent(name) : "image";
    } catch {
        return "image";
    }
}

function isSupportedImageReference(source: string): boolean {
    try {
        return imageMimeTypesByExtension[fileExtension(new URL(source).pathname)] !== undefined;
    } catch {
        return imageMimeTypesByExtension[fileExtension(source)] !== undefined;
    }
}

function firstImageFromHtml(html: string): HTMLImageElement | null {
    if (!html) return null;
    const template = document.createElement("template");
    template.innerHTML = html;
    const image = template.content.querySelector<HTMLImageElement>("img[src]");
    template.remove();
    return image;
}

function webImageFromHtml(html: string): DirectMarkdownImage | null {
    const image = firstImageFromHtml(html);
    const source = image?.getAttribute("src") ?? "";
    if (!/^https?:/i.test(source)) return null;
    return {
        kind: "web",
        source,
        alt: image?.getAttribute("alt")?.trim() || imageNameFromUrl(source),
    };
}

function singleLinkFromHtml(html: string): { href: string; label: string } | null {
    if (!html) return null;
    const template = document.createElement("template");
    template.innerHTML = html;
    const anchor = template.content.querySelector<HTMLAnchorElement>("a[href]");
    const isOnlyLink =
        anchor !== null &&
        template.content.querySelectorAll("a[href]").length === 1 &&
        template.content.textContent?.trim() === anchor.textContent?.trim();
    const result = isOnlyLink
        ? {
              href: anchor.getAttribute("href") ?? "",
              label: anchor.textContent?.trim() || anchor.getAttribute("href") || "",
          }
        : null;
    template.remove();
    return result?.href ? result : null;
}

function absolutePathToFileUri(value: string): string | null {
    const path = value.trim();
    if (path.includes("\n") || path.includes("\r")) return null;
    if (path.startsWith("/")) {
        return `file://${path
            .split("/")
            .map((segment) => encodeMarkdownPathSegment(segment))
            .join("/")}`;
    }
    if (/^[A-Za-z]:[\\/]/.test(path)) {
        const normalized = path.replace(/\\/g, "/");
        return `file:///${normalized
            .split("/")
            .map((segment) => encodeMarkdownPathSegment(segment))
            .join("/")}`;
    }
    return null;
}

function supportedLink(value: string): boolean {
    return /^(?:https?|mailto|file):/i.test(value);
}

function linkFromTransfer(
    transferData: DataTransfer,
    parsedLink: ParsedMarkdownLink | null = null
): ParsedMarkdownLink | null {
    const uri = transferData
        .getData("text/uri-list")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find((line) => line.length > 0 && !line.startsWith("#"));
    if (uri && supportedLink(uri)) return { href: uri, label: uri };

    const htmlLink = singleLinkFromHtml(transferData.getData("text/html"));
    if (htmlLink && supportedLink(htmlLink.href)) return htmlLink;

    const text = transferData.getData("text/plain").trim();
    if (supportedLink(text)) return { href: text, label: text };
    const fileUri = absolutePathToFileUri(text);
    if (fileUri) return { href: fileUri, label: text };
    return parsedLink && supportedLink(parsedLink.href) ? parsedLink : null;
}

export function fileUriFromText(value: string): string | null {
    return (
        value
            .split(/\r?\n/)
            .map((line) => line.trim())
            .find((line) => line.length > 0 && !line.startsWith("#") && /^file:/i.test(line)) ??
        null
    );
}

function fileUriFromTransfer(transferData: DataTransfer): string | null {
    return (
        fileUriFromText(transferData.getData("text/uri-list")) ??
        fileUriFromText(transferData.getData("text/plain"))
    );
}

function imageFileFromTransfer(transferData: DataTransfer): File | null {
    for (let index = 0; index < transferData.files.length; index += 1) {
        const file = transferData.files.item(index);
        if (
            file &&
            (file.type.toLowerCase().startsWith("image/") || isSupportedMarkdownImage(file))
        ) {
            return file;
        }
    }

    for (let index = 0; index < transferData.items.length; index += 1) {
        const item = transferData.items[index];
        if (item?.kind !== "file") continue;
        const file = item.getAsFile();
        if (
            file &&
            (item.type.toLowerCase().startsWith("image/") || isSupportedMarkdownImage(file))
        ) {
            return file;
        }
    }
    return null;
}

function transferContainsImage(transferData: DataTransfer): boolean {
    if (firstImageFromHtml(transferData.getData("text/html"))) return true;
    if (imageFileFromTransfer(transferData)) return true;
    return Array.from(transferData.types ?? []).some((type) =>
        type.toLowerCase().startsWith("image/")
    );
}

export function pastedMarkdownImage(
    transferData: DataTransfer,
    parsedContentContainsImage = false,
    parsedLink: ParsedMarkdownLink | null = null
): PastedMarkdownImage | null {
    const webImage = webImageFromHtml(transferData.getData("text/html"));
    if (webImage) return webImage;

    const link = linkFromTransfer(transferData, parsedLink);
    if (link?.href.match(/^file:/i) && isSupportedImageReference(link.href)) {
        return { kind: "file-uri", uri: link.href, alt: imageNameFromUrl(link.href) };
    }
    if (link?.href.match(/^https?:/i) && isSupportedImageReference(link.href)) {
        return { kind: "web", source: link.href, alt: imageNameFromUrl(link.href) };
    }

    const fallbackFile = imageFileFromTransfer(transferData);
    if (!fallbackFile && !parsedContentContainsImage && !transferContainsImage(transferData)) {
        return null;
    }
    return {
        kind: "native",
        fallbackFile,
        alt: fallbackFile?.name || "image",
    };
}

export function pastedMarkdownLink(
    transferData: DataTransfer,
    parsedLink: ParsedMarkdownLink | null = null
): PastedMarkdownLink | null {
    const link = linkFromTransfer(transferData, parsedLink);
    if (!link || isSupportedImageReference(link.href)) return null;
    return link.href.match(/^file:/i)
        ? { kind: "file-uri", uri: link.href, label: link.label }
        : { kind: "web", href: link.href, label: link.label };
}

export function droppedMarkdownImage(transferData: DataTransfer): DroppedMarkdownImage | null {
    const fileUri = fileUriFromTransfer(transferData);
    if (fileUri) {
        return { kind: "file-uri", uri: fileUri, alt: imageNameFromUrl(fileUri) };
    }

    const webImage = webImageFromHtml(transferData.getData("text/html"));
    if (webImage) return webImage;
    const file = imageFileFromTransfer(transferData);
    return file ? { kind: "file", file } : null;
}

async function importLinkedImageUri(
    uri: string,
    basepath: string,
    markdownFilename: string
): Promise<string> {
    const href = await invoke<string>("import_linked_image_uri", {
        basepath,
        filename: markdownFilename,
        uri,
    });
    return encodeMarkdownHref(href);
}

async function saveLinkedImageFile(
    file: File,
    basepath: string,
    markdownFilename: string
): Promise<string> {
    if (!isSupportedMarkdownImage(file)) throw new UnsupportedMarkdownImageError();
    const content = Array.from(new Uint8Array(await file.arrayBuffer()));
    const savedName = await invoke<string>("save_linked_image", {
        basepath,
        filename: markdownFilename,
        preferredName: file.name,
        content,
    });
    return encodeMarkdownHref(`./${savedName}`);
}

async function resolveDirectImage(
    image: DirectMarkdownImage,
    basepath: string,
    markdownFilename: string
): Promise<ResolvedMarkdownImage> {
    if (image.kind === "web") return { source: image.source, alt: image.alt };
    return {
        source: await importLinkedImageUri(image.uri, basepath, markdownFilename),
        alt: image.alt,
    };
}

export async function resolvePastedMarkdownImage(
    image: PastedMarkdownImage,
    basepath: string,
    markdownFilename: string
): Promise<ResolvedMarkdownImage> {
    if (image.kind !== "native") {
        return await resolveDirectImage(image, basepath, markdownFilename);
    }

    try {
        const nativeUri = fileUriFromText(await readText());
        if (nativeUri) {
            return {
                source: await importLinkedImageUri(nativeUri, basepath, markdownFilename),
                alt: imageNameFromUrl(nativeUri),
            };
        }
    } catch {
        // Some clipboards expose only image data.
    }

    try {
        const clipboardImage = await readImage();
        try {
            const savedName = await invoke<string>("save_linked_image_resource", {
                basepath,
                filename: markdownFilename,
                preferredName: "pasted-image.png",
                image: transformImage(clipboardImage),
            });
            return {
                source: encodeMarkdownHref(`./${savedName}`),
                alt: image.alt,
            };
        } finally {
            await clipboardImage.close();
        }
    } catch (error: unknown) {
        if (!image.fallbackFile) throw error;
        return {
            source: await saveLinkedImageFile(image.fallbackFile, basepath, markdownFilename),
            alt: image.alt,
        };
    }
}

function localPathFromFileUri(uri: string): string {
    try {
        const url = new URL(uri);
        const path = decodeURIComponent(url.pathname);
        return /^\/[A-Za-z]:\//.test(path) ? path.slice(1) : path;
    } catch {
        return uri;
    }
}

export async function resolvePastedMarkdownLink(
    link: PastedMarkdownLink,
    basepath: string,
    markdownFilename: string
): Promise<ResolvedMarkdownLink> {
    if (link.kind === "web") return { href: link.href, label: link.label };

    const href = await invoke<string>("resolve_linked_file_uri", {
        basepath,
        filename: markdownFilename,
        uri: link.uri,
    });
    if (href.startsWith("./") || href.startsWith("../")) {
        return { href: encodeMarkdownHref(href), label: href };
    }
    return { href, label: localPathFromFileUri(href) };
}

export async function resolveDroppedMarkdownImage(
    image: DroppedMarkdownImage,
    basepath: string,
    markdownFilename: string
): Promise<ResolvedMarkdownImage> {
    if (image.kind !== "file") {
        return await resolveDirectImage(image, basepath, markdownFilename);
    }
    return {
        source: await saveLinkedImageFile(image.file, basepath, markdownFilename),
        alt: image.file.name,
    };
}
