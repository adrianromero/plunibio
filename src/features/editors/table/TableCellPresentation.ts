/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { ColDef, ICellRendererParams, INumberCellEditorParams } from "ag-grid-community";
import type { Translator } from "@/i18n/Localization";
import { tableCellTypes, type CellValue, type ColumnType } from "./TableCellTypes";
import type { TableCell, TableColumn, TableRow } from "./TableDocument";
import type { TableSearchController } from "./TableSearchController";
import styles from "./ViewTable.module.css";

export type GridRow = { id: string; values?: TableRow };

type GridColumn = ColDef<GridRow, CellValue>;
type ColumnOptions = {
    t: Translator;
    decimalSeparator: () => string;
    supportsMultilineText: boolean;
    setCell: (row: GridRow, column: TableColumn, value: CellValue) => boolean;
    search: Pick<TableSearchController, "contentChanged" | "isMatch" | "isCurrent">;
};

type CellPresentation = {
    column(options: ColumnOptions & { read: (data?: GridRow) => TableCell | undefined }): GridColumn;
    printClass?: string;
    displayEmptyAsText?: boolean;
};

export const tableCellPresentation: Record<ColumnType, CellPresentation> = {
    string: {
        column({ read, supportsMultilineText }) {
            const multiline = (data?: GridRow): boolean => /[\r\n]/.test(read(data)?.rawText ?? "");
            return {
                cellDataType: "text",
                editable: ({ data }) => !!data && (supportsMultilineText || !multiline(data)),
                cellEditorSelector: ({ data }) => multiline(data) ? { component: "agLargeTextCellEditor" } : undefined,
                valueGetter: ({ data }) => read(data)?.rawText ?? "",
                valueParser: ({ newValue }) => typeof newValue === "string" ? tableCellTypes.string.parse(newValue) : newValue,
            };
        },
    },
    boolean: {
        column: () => ({ cellDataType: "boolean" }),
        displayEmptyAsText: true,
    },
    number: {
        column({ decimalSeparator, t }) {
            const getValidationErrors: INumberCellEditorParams<GridRow>["getValidationErrors"] = ({ value, internalErrors }) =>
                typeof value === "number" && Number.isFinite(value) ? internalErrors : [t("table.expected.number")];
            return {
                cellDataType: "number",
                cellClass: "ag-right-aligned-cell",
                cellEditorParams: { getValidationErrors },
                valueParser: ({ newValue }) => typeof newValue === "string" ? tableCellTypes.number.parse(newValue) : newValue,
                valueFormatter: ({ value }) => value == null ? "" : tableCellTypes.number.format(value, decimalSeparator()),
            };
        },
        printClass: styles.numeric,
    },
};

export function createTableGridColumn(definition: TableColumn, index: number, options: ColumnOptions): GridColumn {
    const { t, search, setCell } = options;
    const presentation = tableCellPresentation[definition.type];
    const read = (data?: GridRow): TableCell | undefined => data?.values?.read(definition);
    const cellIssue = (cell?: TableCell): string | undefined => {
        if (!cell) return undefined;
        if (cell.missing) return t("table.missingValue");
        return cell.value === undefined ? t(`table.expected.${definition.type}`) : undefined;
    };
    const renderFallback = ({ data }: ICellRendererParams<GridRow, CellValue>): HTMLElement => {
        const cell = read(data);
        const issue = cellIssue(cell);
        const display = document.createElement("span");
        display.className = styles.cellValue;
        display.textContent = cell?.rawText ?? "";
        if (issue) display.title = issue;
        return display;
    };
    return {
        colId: String(index),
        headerName: definition.label,
        editable: ({ data }) => !!data,
        valueGetter: ({ data }) => read(data)?.value,
        ...presentation.column({ ...options, read }),
        cellRendererSelector: ({ data, eGridCell }) => {
            const cell = read(data);
            const issue = cellIssue(cell);
            if (issue) eGridCell.setAttribute("aria-description", issue);
            else eGridCell.removeAttribute("aria-description");
            if (issue || (!cell && presentation.displayEmptyAsText)) return { component: renderFallback };
            return undefined;
        },
        valueSetter: ({ data, newValue }) => {
            if (!data || newValue == null || !setCell(data, definition, newValue)) return false;
            search.contentChanged();
            return true;
        },
        cellClassRules: {
            [styles.cellIssue]: ({ data }) => cellIssue(read(data)) !== undefined,
            [styles.match]: ({ node }) => node.rowIndex !== null && search.isMatch(node.rowIndex, index),
            [styles.current]: ({ node }) => node.rowIndex !== null && search.isCurrent(node.rowIndex, index),
        },
    };
}
