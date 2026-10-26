/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

const WINDOWS_EXTENDED_PATH_PREFIX = "\\\\?\\";
const WINDOWS_EXTENDED_UNC_PREFIX = "\\\\?\\UNC\\";

/**
 * Converts canonical Windows paths to their familiar display form without
 * changing the path used for filesystem operations.
 */
export function formatPathForDisplay(path: string): string {
    if (
        path.slice(0, WINDOWS_EXTENDED_UNC_PREFIX.length).toUpperCase() ===
        WINDOWS_EXTENDED_UNC_PREFIX.toUpperCase()
    ) {
        return `\\\\${path.slice(WINDOWS_EXTENDED_UNC_PREFIX.length)}`;
    }

    if (
        path.startsWith(WINDOWS_EXTENDED_PATH_PREFIX) &&
        /^[A-Za-z]:[\\/]/.test(path.slice(WINDOWS_EXTENDED_PATH_PREFIX.length))
    ) {
        return path.slice(WINDOWS_EXTENDED_PATH_PREFIX.length);
    }

    return path;
}
