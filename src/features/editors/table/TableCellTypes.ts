/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

export type ColumnType = "string" | "number" | "boolean" | "date" | "datetime" | "longtext" | "enum";
export type CellValue = string | number | boolean;

export function createTableFormatting(locale: string) {
    const dateOptions: Intl.DateTimeFormatOptions = {
        year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC",
    };
    return {
        decimalSeparator: new Intl.NumberFormat(locale).formatToParts(1.1)
            .find(({ type }) => type === "decimal")?.value ?? ".",
        date: new Intl.DateTimeFormat(locale, dateOptions),
        time: new Intl.DateTimeFormat(locale, {
            timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit",
        }),
    };
}

export type TableFormatting = ReturnType<typeof createTableFormatting>;

type CellInputOptions = {
    formatting?: TableFormatting;
    values?: readonly string[];
};

interface TableCellType {
    read(value: unknown, options?: CellInputOptions): CellValue | undefined;
    parse(text: string, options?: CellInputOptions): CellValue | undefined;
    format(value: CellValue, formatting: TableFormatting): string;
}

const decimal = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;
const isoDate = /^(?!0000)\d{4}-\d{2}-\d{2}$/;
const isoTime = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

function parseDate(text: string): string | undefined {
    if (text.length !== 10 || !isoDate.test(text)) return undefined;
    const date = new Date(`${text}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === text ? text : undefined;
}

function readEnum(value: unknown, options?: CellInputOptions): string | undefined {
    return typeof value === "string" && options?.values?.includes(value) ? value : undefined;
}

function parseDateTime(text: string): string | undefined {
    return text.length === 19 && text[10] === "T" &&
        parseDate(text.slice(0, 10)) && isoTime.test(text.slice(11)) ? text : undefined;
}

function localDateCellType(type: "date" | "datetime", parse: (text: string) => string | undefined): TableCellType {
    return {
        read: (value) => typeof value === "string" ? parse(value) : undefined,
        parse: (text, options) => parse(text) ?? (options?.formatting
            ? parseLocalizedDate(text, type, options.formatting, parse) : undefined),
        // Use UTC to display the stored calendar fields without shifting the wall-clock time.
        format(value, { date, time }) {
            const stored = new Date(String(value) + (type === "date" ? "T00:00:00Z" : "Z"));
            const day = date.format(stored);
            return type === "date" ? day : day + " " + time.format(stored);
        },
    };
}

function parseLocalizedDate(
    text: string, type: "date" | "datetime", { date, time }: TableFormatting,
    parse: (text: string) => string | undefined,
): string | undefined {
    const sample = new Date("2026-11-24T09:30:15Z");
    const formatParts = date.formatToParts(sample);
    const morning = type === "datetime" ? time.formatToParts(sample) : [];
    if (type === "datetime") formatParts.push({ type: "literal", value: " " }, ...morning);
    const pattern = formatParts.map(({ type, value }) => {
        if (type === "literal") {
            return value.replace(/[.*+?^$(){}|\[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
        }
        return "(?<" + type + ">" + (type === "dayPeriod" ? ".+?" : type === "year" ? "\\d{1,4}" : "\\d{2}") + ")";
    }).join("");
    const parts = new RegExp("^" + pattern + "$", "iu").exec(text)?.groups;
    if (!parts) return undefined;

    const isoDay = [parts.year.padStart(4, "0"), parts.month, parts.day].join("-");
    if (parts.hour === undefined) return parse(isoDay);
    let hour = Number(parts.hour);
    if (parts.dayPeriod !== undefined) {
        const am = morning.find(({ type }) => type === "dayPeriod")?.value.toLowerCase();
        const pm = time.formatToParts(new Date("2026-11-24T21:30:15Z"))
            .find(({ type }) => type === "dayPeriod")?.value.toLowerCase();
        const period = parts.dayPeriod.toLowerCase();
        if (hour < 1 || hour > 12 || (period !== am && period !== pm)) return undefined;
        hour = hour % 12 + (period === pm ? 12 : 0);
    }
    return parse(isoDay + "T" + [String(hour).padStart(2, "0"), parts.minute, parts.second].join(":"));
}

const textCellType: TableCellType = {
    read: (value) => typeof value === "string" ? value : undefined,
    parse: (text) => text,
    format: String,
};

export const tableCellTypes: Record<ColumnType, TableCellType> = {
    string: textCellType,
    longtext: textCellType,
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
        parse(text, options) {
            const input = text.replace(options?.formatting?.decimalSeparator ?? ".", ".");
            if (input !== input.trim() || !decimal.test(input)) return undefined;
            const value = Number(input);
            return Number.isFinite(value) ? value : undefined;
        },
        format(value, { decimalSeparator }) {
            const text = String(value);
            // Keep scientific notation in its canonical form.
            return text.includes("e") ? text : text.replace(".", decimalSeparator);
        },
    },
    date: localDateCellType("date", parseDate),
    datetime: localDateCellType("datetime", parseDateTime),
    enum: {
        read: readEnum,
        parse: readEnum,
        format: String,
    },
};

export function isColumnType(value: unknown): value is ColumnType {
    return typeof value === "string" && Object.prototype.hasOwnProperty.call(tableCellTypes, value);
}
