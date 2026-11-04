/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { LanguageSupport } from "@codemirror/language";
import type { Component } from "solid-js";
import type { PathKind } from "@/backend/rusttypes";
import EditorFolder from "./folder/EditorFolder";
import { editorTextExtensionsForFilename } from "./text/CodeLanguages";
import EditorText from "./text/EditorText";
import { editorForFilename } from "./EditorForFilename";

export type PathResult = { kind: PathKind; error?: never } | { kind: "error"; error: string };

type ContentProps = {
    extensions?: readonly LanguageSupport[];
};

export type ContentSelection =
    | {
          kind: "content";
          component: Component<ContentProps>;
          props: ContentProps;
      }
    | {
          kind: "unsupported";
      }
    | {
          kind: "error";
          error: string;
      };

function contentForFile(filename: string): ContentSelection {
    const normalizedFilename = filename.toLowerCase();
    const editor = editorForFilename(normalizedFilename);

    const editorTextExtensions = editorTextExtensionsForFilename(normalizedFilename);
    if (editor === EditorText && editorTextExtensions) {
        return {
            kind: "content",
            component: editor,
            props: { extensions: editorTextExtensions },
        };
    }

    return {
        kind: "content",
        component: editor,
        props: {},
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
            };
        case "other":
            return { kind: "unsupported" };
        case "error":
            return {
                kind: "error",
                error: pathResult.error,
            };
        case undefined:
            return undefined;
    }
}
