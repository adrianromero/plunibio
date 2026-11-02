/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from "vitest";
import type { DirectoryEntry } from "@/backend/rusttypes";
import { sortFolderEntries } from "../FolderSorting";

const file = (name: string, sizeBytes = 0, modifiedAt: number | null = 0): DirectoryEntry => ({
    kind: "file", name, filename: name, sizeBytes, itemCount: null, modifiedAt,
});
const folder = (name: string, itemCount: number | null, modifiedAt: number | null = 0): DirectoryEntry => ({
    kind: "directory", name, filename: name, sizeBytes: null, itemCount, modifiedAt,
});
const names = (entries: DirectoryEntry[]) => entries.map((entry) => entry.name);

describe("folder sorting", () => {
    it("uses natural names, keeps folders first in either direction, and leaves the source intact", () => {
        const entries = [file("file10"), folder("folder10", 0), file("file2"), folder("folder2", 0)];
        expect(names(sortFolderEntries(entries, { attribute: "name", direction: "asc" }, "es")))
            .toEqual(["folder2", "folder10", "file2", "file10"]);
        expect(names(sortFolderEntries(entries, { attribute: "name", direction: "desc" }, "es")))
            .toEqual(["folder10", "folder2", "file10", "file2"]);
        expect(names(entries)).toEqual(["file10", "folder10", "file2", "folder2"]);
    });

    it.each(["asc", "desc"] as const)("sorts counts and bytes with missing sizes last (%s)", (direction) => {
        const entries = [folder("missing", null), file("large", 100), folder("many", 10), file("small", 1), folder("few", 1)];
        expect(names(sortFolderEntries(entries, { attribute: "size", direction }, "es"))).toEqual(
            direction === "asc" ? ["few", "many", "missing", "small", "large"] : ["many", "few", "missing", "large", "small"]
        );
    });

    it.each(["asc", "desc"] as const)("orders modification dates and breaks ties by name (%s)", (direction) => {
        const entries = [file("unknown", 0, null), file("b", 0, 10), file("a", 0, 10), file("old", 0, 0),
            folder("new-folder", 1, 20), folder("old-folder", 1, 0), folder("unknown-folder", 1, null)];
        expect(names(sortFolderEntries(entries, { attribute: "modified", direction }, "es"))).toEqual(
            direction === "asc"
                ? ["old-folder", "new-folder", "unknown-folder", "old", "a", "b", "unknown"]
                : ["new-folder", "old-folder", "unknown-folder", "a", "b", "old", "unknown"]
        );
    });

    it("breaks size ties by ascending name even when sorting descending", () => {
        expect(names(sortFolderEntries([file("b", 5), file("a", 5)], { attribute: "size", direction: "desc" }, "es")))
            .toEqual(["a", "b"]);
    });
});
