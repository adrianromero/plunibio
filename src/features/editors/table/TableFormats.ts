/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { csvTableFormat } from "./CsvTableFormat";
import { jsonLinesTableFormat, jsonTableFormat } from "./JsonTableFormats";
import type { TableColumn } from "./TableDocument";
import type { TableFormat } from "./TableFormat";
import { isJsonObject, parseJson } from "./TableJson";

const tableFormats = [csvTableFormat, jsonTableFormat, jsonLinesTableFormat]
    .sort((a, b) => b.extension.length - a.extension.length);

export function tableFormatForFilename(filename: string): TableFormat | undefined {
    const lower = filename.toLowerCase();
    return tableFormats.find(({ extension }) => lower.endsWith(extension.toLowerCase()));
}

export function metadataFilename(filename: string, format: TableFormat): string {
    return filename.slice(0, -format.extension.length) + format.metadataExtension;
}

export function parseTableColumns(source: string): TableColumn[] | null {
    const metadata = parseJson(source);
    if (!isJsonObject(metadata) || !Array.isArray(metadata.columns) || !metadata.columns.length) return null;
    const columns: TableColumn[] = [];
    const ids = new Set<string>();
    for (const column of metadata.columns as unknown[]) {
        if (!isJsonObject(column)) return null;
        const { id, label, type } = column;
        if (typeof id !== "string" || ids.has(id) || typeof label !== "string" ||
            (type !== "string" && type !== "number" && type !== "boolean")) return null;
        ids.add(id);
        columns.push({ id, label, type });
    }
    return columns;
}
