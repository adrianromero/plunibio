/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { JSX } from "solid-js";
import { useAppContext } from "@/app/AppContext";
import { editorTextExtensionsForFilename } from "../text/CodeLanguages";
import EditorTextView from "../text/EditorTextView";
import ViewTable from "./ViewTable";

export function EditorTable(): JSX.Element {
    const { main: { filename } } = useAppContext();
    return <EditorTextView
        printable
        view={ViewTable}
        extensions={editorTextExtensionsForFilename(filename().toLowerCase()) ?? []}
    />;
}

export default EditorTable;
