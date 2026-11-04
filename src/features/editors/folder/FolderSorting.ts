/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { DirectoryEntry } from "@/backend/rusttypes";
import type { FolderSort } from "@/preferences/FolderSortPreferences";

export function sortFolderEntries(
    entries: readonly DirectoryEntry[], sort: FolderSort, locale: string
): DirectoryEntry[] {
    const collator = new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
    const compareNames = (left: DirectoryEntry, right: DirectoryEntry): number =>
        collator.compare(left.name, right.name) ||
        (left.name < right.name ? -1 : left.name > right.name ? 1 : 0) ||
        (left.filename < right.filename ? -1 : left.filename > right.filename ? 1 : 0);
    const multiplier = sort.direction === "asc" ? 1 : -1;
    const value = (entry: DirectoryEntry): number | null => {
        const result = sort.attribute === "size"
            ? entry.kind === "directory" ? entry.itemCount : entry.sizeBytes
            : entry.modifiedAt;
        return result !== null && Number.isFinite(result) ? result : null;
    };
    return [...entries].sort((left, right) => {
        if (left.kind !== right.kind) return left.kind === "directory" ? -1 : 1;
        if (sort.attribute === "name") return multiplier * compareNames(left, right);
        const a = value(left);
        const b = value(right);
        if (a === null && b !== null) return 1;
        if (a !== null && b === null) return -1;
        return (a !== null && b !== null ? multiplier * (a - b) : 0) || compareNames(left, right);
    });
}
