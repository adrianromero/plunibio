/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { expect, it } from "vitest";
import { formattingLocales } from "@/preferences/LocalePreferences";
import { createTableFormatting, tableCellTypes } from "../TableCellTypes";
import { metadataFilename, parseTableColumns, tableFormatForFilename } from "../TableFormats";
import allTypes from "./fixtures/all-types.table.json?raw";
import allTypesMetadata from "./fixtures/all-types.meta.json.json?raw";

it.each([
    ["data.csv", "name,hidden\nAna,1\nLeo,2", "name,hidden\nLeo,2\nAna,1"],
    ["data.table.json", '[{"name":"Ana","hidden":1},{"name":"Leo","hidden":2}]',
        JSON.stringify([{ name: "Leo", hidden: 2 }, { name: "Ana", hidden: 1 }], null, 2)],
    ["data.table.jsonl", '{"name":"Ana","hidden":1}\n{"name":"Leo","hidden":2}',
        '{"name":"Leo","hidden":2}\n{"name":"Ana","hidden":1}'],
] as const)("reorders complete rows from %s through the common document interface", (filename, source, expected) => {
    const format = tableFormatForFilename(filename);
    if (!format) throw new Error(`Missing table format for ${filename}`);
    const result = format.load(source, [{ id: "name", label: "Name", type: "string" }]);
    if ("error" in result) throw new Error(result.error);
    const { document } = result;
    const [first, second] = document.rows;
    document.reorderRows([1, 0]);

    expect(document.rows[0]).toBe(second);
    expect(document.rows[1]).toBe(first);
    expect(document.serialize()).toBe(expected);
});

it.each([
    ["folder/data.CSV", "folder/data.meta.csv.json"],
    ["folder/data.TABLE.JSON", "folder/data.meta.json.json"],
    ["folder/data.TABLE.JSONL", "folder/data.meta.jsonl.json"],
])("resolves the registered metadata filename for %s", (filename, expected) => {
    const format = tableFormatForFilename(filename);
    if (!format) throw new Error(`Missing table format for ${filename}`);
    expect(metadataFilename(filename, format)).toBe(expected);
});

it.each(["0", "-10", '"180"', "null", "1e309"])("rejects a metadata width of %s", (width) => {
    expect(parseTableColumns(`{"columns":[{"id":"a","label":"A","type":"string","width":${width}}]}`)).toBeNull();
});

it("accepts only real calendar dates in YYYY-MM-DD format", () => {
    expect(tableCellTypes.date.parse("2024-02-29")).toBe("2024-02-29");
    for (const text of ["", "2023-02-29", "2024-04-31", "2024-2-9", "2024-02-29\n", "2024-02-29T00:00:00", "0000-01-01"]) {
        expect(tableCellTypes.date.parse(text), text).toBeUndefined();
    }
});

it("requires a real date and a local time with seconds for datetime columns", () => {
    expect(tableCellTypes.datetime.parse("2024-02-29T23:59:59")).toBe("2024-02-29T23:59:59");
    for (const text of ["2023-02-29T12:30:00", "2024-02-29T24:00:00", "2024-02-29T12:30", "2024-02-29T12:30:00Z"]) {
        expect(tableCellTypes.datetime.parse(text), text).toBeUndefined();
    }
});

it.each(Object.values(formattingLocales))("round-trips localized dates and times for replacement in %s", (locale) => {
    const formatting = createTableFormatting(locale);
    for (const [type, value] of [
        ["date", "2024-02-29"],
        ["datetime", "2024-02-29T00:30:25"],
        ["datetime", "2024-02-29T16:45:30"],
    ] as const) {
        const adapter = tableCellTypes[type];
        const visible = adapter.format(value, formatting);
        if (type === "datetime") expect(visible).toMatch(/^\S+ \d{2}:\d{2}:\d{2}(?:\s+\S+)?$/);
        expect(adapter.parse(visible, { formatting })).toBe(value);
        expect(adapter.parse(visible.replace("29", "30"), { formatting })).toBeUndefined();
        expect(adapter.read(visible)).toBeUndefined();
    }
});

it("loads the fixture with all registered column types and valid values", () => {
    const columns = parseTableColumns(allTypesMetadata);
    const format = tableFormatForFilename("all-types.table.json");
    if (!format || !columns) throw new Error("Missing table format or fixture metadata");
    const result = format.load(allTypes, columns);
    if ("error" in result) throw new Error(result.error);
    expect(new Set(columns.map(({ type }) => type))).toEqual(new Set(Object.keys(tableCellTypes)));
    for (const row of result.document.rows) {
        for (const column of columns) expect(row.read(column).value, column.id).toBeDefined();
    }
});
