/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { LanguageSupport } from "@codemirror/language";
import type { Component } from "solid-js";
import type { PathKind } from "@/backend/rusttypes";
import EditorExternalFile from "./external/EditorExternalFile";
import EditorFolder from "./folder/EditorFolder";
import EditorImage from "./image/EditorImage";
import EditorMarkdown from "./markdown/EditorMarkdown";
import { editorTextExtensionsForFilename } from "./text/CodeLanguages";
import EditorText from "./text/EditorText";

export type PathResult = { kind: PathKind; error?: never } | { kind: "error"; error: string };

export type ContextualToolbarSection = "markdown";

type ContentProps = {
    extensions?: readonly LanguageSupport[];
};

export type ContentSelection =
    | {
          kind: "content";
          component: Component<ContentProps>;
          props: ContentProps;
          toolbarSections: readonly ContextualToolbarSection[];
      }
    | {
          kind: "unsupported";
          toolbarSections: readonly ContextualToolbarSection[];
      }
    | {
          kind: "error";
          error: string;
          toolbarSections: readonly ContextualToolbarSection[];
      };

const noToolbarSections: readonly ContextualToolbarSection[] = [];

function contentForFile(filename: string): ContentSelection {
    const normalizedFilename = filename.toLowerCase();
    const extensionIndex = normalizedFilename.lastIndexOf(".");
    const extension = extensionIndex >= 0 ? normalizedFilename.slice(extensionIndex) : "";

    switch (extension) {
        case ".md":
        case ".markdown":
        case ".mdown":
        case ".mkd":
            return {
                kind: "content",
                component: EditorMarkdown,
                props: {},
                toolbarSections: ["markdown"],
            };
        case ".avif":
        case ".bmp":
        case ".gif":
        case ".ico":
        case ".jpeg":
        case ".jpg":
        case ".png":
        case ".webp":
            return {
                kind: "content",
                component: EditorImage,
                props: {},
                toolbarSections: noToolbarSections,
            };
    }

    const editorTextExtensions = editorTextExtensionsForFilename(normalizedFilename);
    if (editorTextExtensions) {
        return {
            kind: "content",
            component: EditorText,
            props: { extensions: editorTextExtensions },
            toolbarSections: noToolbarSections,
        };
    }

    return {
        kind: "content",
        component: EditorExternalFile,
        props: {},
        toolbarSections: noToolbarSections,
    };
}

export function contentForPath(
    filename: string,
    pathResult: PathResult | undefined
): ContentSelection | undefined {
    switch (pathResult?.kind) {
        case "file":
            return contentForFile(filename);
        case "directory":
            return {
                kind: "content",
                component: EditorFolder,
                props: {},
                toolbarSections: noToolbarSections,
            };
        case "other":
            return { kind: "unsupported", toolbarSections: noToolbarSections };
        case "error":
            return {
                kind: "error",
                error: pathResult.error,
                toolbarSections: noToolbarSections,
            };
        case undefined:
            return undefined;
    }
}
