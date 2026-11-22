/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { CellValue, ColumnType } from "./TableCellTypes";

export type TableColumn = { id: string; label: string; type: ColumnType };

export function defaultTableColumns(): TableColumn[] {
    return ["A", "B", "C"].map((id) => ({ id, label: id, type: "string" }));
}

export type TableCell = {
    rawText: string;
    value: CellValue | undefined;
    missing: boolean;
};

export interface TableRow {
    read(column: TableColumn): TableCell;
    write(column: TableColumn, value: CellValue): void;
}

export interface TableDocument {
    readonly columns: readonly TableColumn[];
    readonly rows: readonly TableRow[];
    readonly supportsMultilineText: boolean;
    appendRow(column: TableColumn, value: CellValue): TableRow;
    reorderRows(order: readonly number[]): void;
    serialize(): string;
}

type TableStorage<RowData> = {
    supportsMultilineText: boolean;
    read(record: RowData, column: TableColumn): TableCell;
    write(record: RowData, column: TableColumn, value: CellValue): void;
    create(): RowData;
    serialize(records: RowData[]): string;
};

export function createTableDocument<RowData>(
    columns: TableColumn[], records: RowData[], storage: TableStorage<RowData>
): TableDocument {
    const wrap = (record: RowData) => ({
        record,
        read: (column: TableColumn) => storage.read(record, column),
        write: (column: TableColumn, value: CellValue) => storage.write(record, column, value),
    });
    let rows = records.map(wrap);
    return {
        columns,
        get rows() { return rows; },
        supportsMultilineText: storage.supportsMultilineText,
        appendRow(column, value) {
            const row = wrap(storage.create());
            row.write(column, value);
            rows.push(row);
            return row;
        },
        reorderRows(order) {
            rows = order.map((index) => rows[index]);
        },
        serialize() {
            return storage.serialize(rows.map(({ record }) => record));
        },
    };
}
