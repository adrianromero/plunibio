/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { TranslationKey } from "@/i18n/Localization";
import type { TableColumn, TableDocument } from "./TableDocument";

export type TableLoadResult =
    | { document: TableDocument }
    | { error: TranslationKey; params?: Record<string, string | number> };

export interface TableFormat {
    readonly extension: `.${string}`;
    readonly metadataExtension: `.${string}`;
    load(source: string, metadata: TableColumn[] | null): TableLoadResult;
}
