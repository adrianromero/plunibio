/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

export type FolderSortAttribute = "name" | "size" | "modified";
export type FolderSort = {
    attribute: FolderSortAttribute;
    direction: "asc" | "desc";
};

const FOLDER_SORT_KEY = "plunibio.folderSort";
export const DEFAULT_FOLDER_SORT: Readonly<FolderSort> = { attribute: "name", direction: "asc" };

export function loadFolderSort(storage?: Pick<Storage, "getItem">): FolderSort {
    try {
        const stored: unknown = JSON.parse((storage ?? window.localStorage).getItem(FOLDER_SORT_KEY) ?? "null");
        if (
            typeof stored === "object" && stored !== null &&
            "attribute" in stored && "direction" in stored &&
            (stored.attribute === "name" || stored.attribute === "size" || stored.attribute === "modified") &&
            (stored.direction === "asc" || stored.direction === "desc")
        ) {
            return { attribute: stored.attribute, direction: stored.direction };
        }
    } catch (error: unknown) {
        console.error("Unable to load folder sorting:", error);
    }
    return { ...DEFAULT_FOLDER_SORT };
}

export function saveFolderSort(sort: FolderSort, storage?: Pick<Storage, "setItem">): void {
    try {
        (storage ?? window.localStorage).setItem(FOLDER_SORT_KEY, JSON.stringify(sort));
    } catch (error: unknown) {
        console.error("Unable to save folder sorting:", error);
    }
}

export function nextFolderSort(current: FolderSort, attribute: FolderSortAttribute): FolderSort {
    return {
        attribute,
        direction: current.attribute === attribute && current.direction === "asc" ? "desc" : "asc",
    };
}
