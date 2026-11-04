/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FOLDER_SORT, loadFolderSort, nextFolderSort, saveFolderSort } from "../FolderSortPreferences";

describe("folder sorting preferences", () => {
    afterEach(() => vi.restoreAllMocks());

    it.each([null, "null", "[]", "{}", '"name"', '{"attribute":"name","direction":"invalid"}', '{"attribute":"unknown","direction":"asc"}'])("uses the default for %s", (stored) => {
        expect(loadFolderSort({ getItem: () => stored })).toEqual(DEFAULT_FOLDER_SORT);
    });

    it("round trips every valid sorting option", () => {
        for (const attribute of ["name", "size", "modified"] as const) {
            for (const direction of ["asc", "desc"] as const) {
                const sort = { attribute, direction };
                const writer = { setItem: vi.fn() };
                saveFolderSort(sort, writer);
                expect(writer.setItem).toHaveBeenCalledWith("plunibio.folderSort", JSON.stringify(sort));
                expect(loadFolderSort({ getItem: () => JSON.stringify(sort) })).toEqual(sort);
            }
        }
    });

    it("recovers from corrupt JSON and unavailable storage", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        expect(loadFolderSort({ getItem: () => "invalid" })).toEqual(DEFAULT_FOLDER_SORT);
        expect(loadFolderSort({ getItem: () => { throw new Error("unavailable"); } })).toEqual(DEFAULT_FOLDER_SORT);
        expect(() => saveFolderSort(DEFAULT_FOLDER_SORT, { setItem: () => { throw new Error("unavailable"); } })).not.toThrow();
    });

    it("starts new criteria ascending and alternates the active criterion", () => {
        expect(nextFolderSort({ attribute: "name", direction: "desc" }, "size"))
            .toEqual({ attribute: "size", direction: "asc" });
        expect(nextFolderSort({ attribute: "size", direction: "asc" }, "size"))
            .toEqual({ attribute: "size", direction: "desc" });
        expect(nextFolderSort({ attribute: "size", direction: "desc" }, "size"))
            .toEqual({ attribute: "size", direction: "asc" });
    });
});
