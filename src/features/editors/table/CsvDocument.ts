/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import Papa from "papaparse";

export type CsvDocument = {
    header: string[] | undefined;
    rows: string[][];
    delimiter: string;
    newline: string;
    finalNewline: boolean;
    bom: string;
};

const delimiters = [",", ";"];

export function parseCsv(source: string): CsvDocument | null {
    const bom = source.startsWith("\uFEFF") ? "\uFEFF" : "";
    const text = source.slice(bom.length);
    let parsed = Papa.parse<string[]>(source, { delimitersToGuess: delimiters });

    // Guessing can fail on short CSVs, ragged rows or a final empty record.
    if (parsed.errors.length) {
        for (const delimiter of delimiters) {
            const candidate = Papa.parse<string[]>(source, { delimiter });
            if (!candidate.errors.length && candidate.data.some((row) => row.length > 1)) {
                parsed = candidate;
                break;
            }
        }
    }
    if (parsed.errors.some((error) => error.type !== "Delimiter")) return null;

    const { delimiter, linebreak: newline } = parsed.meta;
    const finalNewline = text.endsWith(newline);
    if (finalNewline) parsed.data.pop();
    const header = parsed.data.shift();
    return { header, rows: parsed.data, delimiter, newline, finalNewline, bom };
}

export function serializeCsv({ header, rows, delimiter, newline, finalNewline, bom }: CsvDocument): string {
    const records = header ? [header, ...rows] : rows;
    let content = Papa.unparse(records, { delimiter, newline });
    const lastRow = records[records.length - 1];
    if (finalNewline && lastRow) content += newline;
    // A final one-cell empty record without a terminator needs quotes to remain a record.
    else if (lastRow?.length === 1 && lastRow[0] === "") content += '""';
    return bom + content;
}

export function columnName(index: number): string {
    let name = "";
    for (let value = index + 1; value > 0; value = Math.floor((value - 1) / 26)) {
        name = String.fromCharCode(65 + (value - 1) % 26) + name;
    }
    return name;
}
