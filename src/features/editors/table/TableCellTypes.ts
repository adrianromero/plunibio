/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

export type ColumnType = "string" | "number" | "boolean";
export type CellValue = string | number | boolean;

interface TableCellType {
    read(value: unknown): CellValue | undefined;
    parse(text: string, decimalSeparator?: string): CellValue | undefined;
    format(value: CellValue, decimalSeparator?: string): string;
}

const decimal = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

export const tableCellTypes: Record<ColumnType, TableCellType> = {
    string: {
        read: (value) => typeof value === "string" ? value : undefined,
        parse: (text) => text,
        format: String,
    },
    boolean: {
        read: (value) => typeof value === "boolean" ? value : undefined,
        parse(text) {
            if (text === "true") return true;
            if (text === "false") return false;
            return undefined;
        },
        format: String,
    },
    number: {
        read: (value) => typeof value === "number" ? value : undefined,
        parse(text, decimalSeparator = ".") {
            const input = text.replace(decimalSeparator, ".");
            if (input !== input.trim() || !decimal.test(input)) return undefined;
            const value = Number(input);
            return Number.isFinite(value) ? value : undefined;
        },
        format(value, decimalSeparator = ".") {
            const text = String(value);
            // Native number inputs leave scientific notation alone.
            return text.includes("e") ? text : text.replace(".", decimalSeparator);
        },
    },
};
