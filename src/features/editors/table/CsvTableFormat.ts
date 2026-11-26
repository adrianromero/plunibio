/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { parseCsv, serializeCsv } from "./CsvDocument";
import { tableCellTypes } from "./TableCellTypes";
import { createTableDocument, defaultTableColumns } from "./TableDocument";
import type { TableFormat } from "./TableFormat";

function csvType(value: string | undefined): "string" | "number" | "boolean" {
    if (value === undefined) return "string";
    if (tableCellTypes.boolean.parse(value) !== undefined) return "boolean";
    return tableCellTypes.number.parse(value) !== undefined ? "number" : "string";
}

export const csvTableFormat: TableFormat = {
    extension: ".csv",
    metadataExtension: ".meta.csv.json",
    load(source, metadata) {
        const csv = parseCsv(source);
        if (!csv) return { error: "errors.invalidCsv" };
        const indices = new Map<string, number>();
        csv.header?.forEach((id, index) => {
            if (!indices.has(id)) indices.set(id, index);
        });
        const columns = metadata ?? (csv.header
            ? Array.from(indices, ([id, index]) => ({ id, label: id, type: csvType(csv.rows[0]?.[index]) }))
            : defaultTableColumns());

        let width = csv.rows.reduce((maximum, row) => Math.max(maximum, row.length), csv.header?.length ?? 0);
        const ids = new Set(columns.map(({ id }) => id));
        let placeholder = "";
        while (ids.has(placeholder)) placeholder += "_";

        return {
            document: createTableDocument(columns, csv.rows, {
                supportsMultilineText: false,
                read(record, column) {
                    const { id, type } = column;
                    const index = indices.get(id);
                    const text = index === undefined ? undefined : record[index];
                    return {
                        rawText: text ?? "",
                        value: text === undefined ? undefined : tableCellTypes[type].parse(text, column),
                        missing: text === undefined,
                    };
                },
                write(record, { id }, value) {
                    const header = csv.header ??= [];
                    let index = indices.get(id);
                    if (index === undefined) {
                        // Keep extra fields at their physical positions, even when their header is absent.
                        index = width;
                        width += 1;
                        while (header.length < index) header.push(placeholder);
                        header.push(id);
                        indices.set(id, index);
                    }
                    while (record.length <= index) record.push("");
                    record[index] = String(value);
                },
                create() {
                    if (!metadata && !csv.header) {
                        csv.header = columns.map(({ id }, index) => {
                            indices.set(id, index);
                            return id;
                        });
                        width = csv.header.length;
                    }
                    return Array<string>(csv.header?.length ?? 0).fill("");
                },
                serialize: (rows) => serializeCsv({ ...csv, rows }),
            }),
        };
    },
};
