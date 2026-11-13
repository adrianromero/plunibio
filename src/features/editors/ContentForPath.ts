/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { Component } from "solid-js";
import type { PathKind } from "@/backend/rusttypes";
import EditorFolder from "./folder/EditorFolder";
import { editorForFilename } from "./EditorForFilename";

export type PathResult = { kind: PathKind; error?: never } | { kind: "error"; error: string };

export type ContentSelection =
    | {
          kind: "content";
          component: Component;
          props: Record<string, never>;
      }
    | {
          kind: "unsupported";
      }
    | {
          kind: "error";
          error: string;
      };

export function contentForPath(
    filename: string,
    pathResult: PathResult | undefined
): ContentSelection | undefined {
    switch (pathResult?.kind) {
        case "file":
            return {
                kind: "content",
                component: editorForFilename(filename),
                props: {},
            };
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
