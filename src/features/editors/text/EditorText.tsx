/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { JSX } from "solid-js";
import { useAppContext } from "@/app/AppContext";
import { editorTextExtensionsForFilename } from "./CodeLanguages";
import EditorTextView from "./EditorTextView";

export function EditorText(): JSX.Element {
    const { main: { filename } } = useAppContext();
    return (
        <EditorTextView
            view={null}
            extensions={editorTextExtensionsForFilename(filename().toLowerCase()) ?? []}
        />
    );
}

export default EditorText;
