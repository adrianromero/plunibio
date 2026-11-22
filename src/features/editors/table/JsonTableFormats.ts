/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { tableCellTypes } from "./TableCellTypes";
import { createTableDocument, defaultTableColumns, type TableColumn } from "./TableDocument";
import type { TableFormat, TableLoadResult } from "./TableFormat";
import { isJsonObject, parseJson, type JsonObject } from "./TableJson";

function jsonType(value: unknown): TableColumn["type"] {
    const type = typeof value;
    return type === "number" || type === "boolean" ? type : "string";
}

function columnsForJson(rows: JsonObject[]): TableColumn[] {
    if (!rows.length) return defaultTableColumns();
    const columns = new Map<string, TableColumn>();
    for (const row of rows) {
        for (const [id, value] of Object.entries(row)) {
            if (!columns.has(id)) columns.set(id, { id, label: id, type: jsonType(value) });
        }
    }
    return Array.from(columns.values());
}

function loadJsonRows(
    rows: JsonObject[], metadata: TableColumn[] | null, serialize: (rows: JsonObject[]) => string
): TableLoadResult {
    const columns = metadata ?? columnsForJson(rows);
    if (!columns.length) return { error: "errors.noTableColumns" };
    return {
        document: createTableDocument<JsonObject>(columns, rows, {
            supportsMultilineText: true,
            read(record, { id, type }) {
                if (!Object.prototype.hasOwnProperty.call(record, id)) {
                    return { rawText: "", value: undefined, missing: true };
                }
                const raw = record[id];
                return {
                    rawText: typeof raw === "object" ? JSON.stringify(raw) : String(raw),
                    value: tableCellTypes[type].read(raw),
                    missing: false,
                };
            },
            write(record, { id }, value) {
                Object.defineProperty(record, id, { value, enumerable: true, writable: true, configurable: true });
            },
            create: () => ({}),
            serialize,
        }),
    };
}

export const jsonTableFormat: TableFormat = {
    extension: ".table.json",
    metadataExtension: ".meta.json.json",
    load(source, metadata) {
        const parsed = parseJson(source);
        if (!Array.isArray(parsed) || !parsed.every(isJsonObject)) return { error: "errors.invalidJsonTable" };
        return loadJsonRows(parsed, metadata, (rows) => JSON.stringify(rows, null, 2));
    },
};

export const jsonLinesTableFormat: TableFormat = {
    extension: ".table.jsonl",
    metadataExtension: ".meta.jsonl.json",
    load(source, metadata) {
        const rows: JsonObject[] = [];
        if (source.trim()) {
            const lines = source.split(/\r\n|\n|\r/);
            if (lines[lines.length - 1] === "") lines.pop();
            for (const [index, line] of lines.entries()) {
                const row = parseJson(line);
                if (!isJsonObject(row)) return { error: "errors.invalidJsonlTable", params: { line: index + 1 } };
                rows.push(row);
            }
        }
        return loadJsonRows(rows, metadata, (records) => records.map((row) => JSON.stringify(row)).join("\n"));
    },
};
