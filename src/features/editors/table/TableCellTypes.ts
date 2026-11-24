/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

export type ColumnType = "string" | "number" | "boolean" | "date";
export type CellValue = string | number | boolean;

interface TableCellType {
    read(value: unknown): CellValue | undefined;
    parse(text: string, decimalSeparator?: string): CellValue | undefined;
    format(value: CellValue, decimalSeparator?: string): string;
}

const decimal = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;
const isoDate = /^(?!0000)\d{4}-\d{2}-\d{2}$/;

function parseDate(text: string): string | undefined {
    if (text.length !== 10 || !isoDate.test(text)) return undefined;
    const date = new Date(`${text}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === text ? text : undefined;
}

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
    date: {
        read: (value) => typeof value === "string" ? parseDate(value) : undefined,
        parse: parseDate,
        format: String,
    },
};

export function isColumnType(value: unknown): value is ColumnType {
    return typeof value === "string" && Object.prototype.hasOwnProperty.call(tableCellTypes, value);
}
