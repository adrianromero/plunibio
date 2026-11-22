/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { expect, it } from "vitest";
import { metadataFilename, tableFormatForFilename } from "../TableFormats";

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
