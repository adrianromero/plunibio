/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import EditorExternalFile from "./external/EditorExternalFile";
import EditorImage from "./image/EditorImage";
import EditorMarkdown from "./markdown/EditorMarkdown";
import EditorMermaid from "./mermaid/EditorMermaid";
import EditorECharts from "./echarts/EditorECharts";
import { editorTextExtensionsForFilename } from "./text/CodeLanguages";
import EditorText from "./text/EditorText";
import EditorTable from "./table/EditorTable";
import { tableFormatForFilename } from "./table/TableFormats";

export type EditorForFilename =
    | typeof EditorMarkdown
    | typeof EditorMermaid
    | typeof EditorECharts
    | typeof EditorText
    | typeof EditorTable
    | typeof EditorImage
    | typeof EditorExternalFile;

export function editorForFilename(filename: string): EditorForFilename {
    const normalizedFilename = filename.toLowerCase();
    if (normalizedFilename.endsWith(".echarts.json")) return EditorECharts;
    if (tableFormatForFilename(normalizedFilename)) return EditorTable;
    const extensionIndex = normalizedFilename.lastIndexOf(".");
    const extension = extensionIndex >= 0 ? normalizedFilename.slice(extensionIndex) : "";

    switch (extension) {
        case ".md":
        case ".markdown":
        case ".mdown":
        case ".mkd":
            return EditorMarkdown;
        case ".mmd":
        case ".mermaid":
            return EditorMermaid;
        case ".avif":
        case ".bmp":
        case ".gif":
        case ".ico":
        case ".jpeg":
        case ".jpg":
        case ".png":
        case ".webp":
            return EditorImage;
    }

    return editorTextExtensionsForFilename(normalizedFilename) ? EditorText : EditorExternalFile;
}

