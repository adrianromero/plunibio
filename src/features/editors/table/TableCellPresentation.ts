/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type {
    ColDef, ICellEditorParams, ICellRendererParams, ITextCellEditorParams,
} from "ag-grid-community";
import type { Translator } from "@/i18n/Localization";
import { tableCellTypes, type CellValue, type ColumnType, type TableFormatting } from "./TableCellTypes";
import type { TableCell, TableColumn, TableRow } from "./TableDocument";
import type { TableSearchController } from "./TableSearchController";
import styles from "./ViewTable.module.css";

export type GridRow = { id: string; values?: TableRow };

type GridColumn = ColDef<GridRow, CellValue>;
type ColumnOptions = {
    t: Translator;
    formatting: () => TableFormatting;
    supportsMultilineText: boolean;
    setCell: (row: GridRow, column: TableColumn, value: CellValue) => boolean;
    search: Pick<TableSearchController, "contentChanged" | "isMatch" | "isCurrent">;
};

type ColumnPresentationOptions = ColumnOptions & {
    definition: TableColumn;
    read: (data?: GridRow) => TableCell | undefined;
};

type CellPresentation = {
    defaultWidth: number;
    column(options: ColumnPresentationOptions): GridColumn;
    printClass?: string;
    displayEmptyAsText?: boolean;
};

function textColumn(read: (data?: GridRow) => TableCell | undefined, editorParams: { maxLength?: number } = {}): GridColumn {
    return {
        cellDataType: "text",
        // Seed an editable string even when the underlying value is missing or invalid.
        cellEditorParams: ({ data, value }: ICellEditorParams<GridRow, CellValue>) => ({
            ...editorParams,
            value: value ?? read(data)?.rawText ?? "",
        }),
        // Keep the empty string as a valid value instead of the grid's default null.
        valueParser: ({ newValue }) => newValue,
    };
}

function formattedTextColumn(
    type: "number" | "date" | "datetime",
    cellDataType: "number" | "dateString" | "dateTimeString",
    example: CellValue,
    { t, formatting, read }: ColumnPresentationOptions,
): GridColumn {
    const adapter = tableCellTypes[type];
    const format = (value: CellValue): string => adapter.format(value, formatting());
    const parse = (text: string): CellValue | undefined => adapter.parse(text, { formatting: formatting() });
    const cellEditorParams = ({ data, value }: ICellEditorParams<GridRow, CellValue>): Pick<
        ITextCellEditorParams<GridRow, CellValue>, "useFormatter" | "value" | "formatValue" | "getValidationErrors"
    > => {
        const rawText = read(data)?.rawText ?? "";
        return {
            useFormatter: true,
            // Run a valid source string through the same validation even when confirmed untouched.
            value: value ?? parse(rawText),
            formatValue: () => value == null ? rawText : format(value),
            getValidationErrors: ({ value, internalErrors }) =>
                adapter.read(value) === undefined || (typeof value === "number" && !Number.isFinite(value))
                    ? [t("table.expectedFormat", { example: format(example) })] : internalErrors,
        };
    };
    return {
        cellDataType,
        cellEditor: "agTextCellEditor",
        cellEditorParams,
        valueParser: ({ newValue }) => typeof newValue === "string" ? parse(newValue) : adapter.read(newValue),
        valueFormatter: ({ value }) => value == null ? "" : format(value),
    };
}

export const tableCellPresentation: Record<ColumnType, CellPresentation> = {
    string: {
        defaultWidth: 240,
        column({ read, supportsMultilineText }) {
            const multiline = (data?: GridRow): boolean => {
                const value = read(data)?.value;
                return typeof value === "string" && /[\r\n]/.test(value);
            };
            return {
                ...textColumn(read),
                editable: ({ data }) => !!data && (supportsMultilineText || !multiline(data)),
                cellEditorSelector: ({ data }) => multiline(data) ? { component: "agLargeTextCellEditor" } : undefined,
            };
        },
    },
    longtext: {
        defaultWidth: 320,
        column: ({ read }) => ({
            // Use the maximum HTML textarea length in place of the grid's 200-character default.
            ...textColumn(read, { maxLength: 2_147_483_647 }),
            cellEditor: "agLargeTextCellEditor",
            cellEditorPopup: true,
        }),
    },
    boolean: {
        defaultWidth: 100,
        column: () => ({ cellDataType: "boolean", cellClass: styles.booleanCell }),
        displayEmptyAsText: true,
    },
    number: {
        defaultWidth: 140,
        column: (options) => ({
            ...formattedTextColumn("number", "number", 1.25, options),
            cellClass: "ag-right-aligned-cell",
        }),
        printClass: styles.numeric,
    },
    date: {
        defaultWidth: 140,
        column: (options) => formattedTextColumn("date", "dateString", "2026-12-10", options),
    },
    datetime: {
        defaultWidth: 220,
        column: (options) => formattedTextColumn("datetime", "dateTimeString", "2026-12-10T16:45:30", options),
    },
    enum: {
        defaultWidth: 180,
        column({ definition, t }) {
            const values = definition.values ?? [];
            return {
                cellDataType: "text",
                cellEditor: "agSelectCellEditor",
                // The native editor displays its first option when the cell has no selection.
                cellEditorParams: ({ value }: ICellEditorParams<GridRow, CellValue>) => ({
                    values: value == null ? [null, ...values] : [...values],
                }),
                valueFormatter: ({ value }) => value === null ? t("table.selectOption") : String(value ?? ""),
                valueParser: ({ newValue }) => tableCellTypes.enum.read(newValue, definition),
            };
        },
    },
};

export function createTableGridColumn(definition: TableColumn, index: number, options: ColumnOptions): GridColumn {
    const { t, search, setCell } = options;
    const presentation = tableCellPresentation[definition.type];
    const read = (data?: GridRow): TableCell | undefined => data?.values?.read(definition);
    const cellIssue = (cell?: TableCell): string | undefined => {
        if (!cell) return undefined;
        if (cell.missing) return t("table.missingValue");
        const type = definition.type === "longtext" ? "string" : definition.type;
        return cell.value === undefined ? t(`table.expected.${type}`) : undefined;
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
        initialWidth: definition.width ?? presentation.defaultWidth,
        editable: ({ data }) => !!data,
        valueGetter: ({ data }) => read(data)?.value,
        ...presentation.column({ ...options, definition, read }),
        cellRendererSelector: ({ data, eGridCell }) => {
            const cell = read(data);
            const issue = cellIssue(cell);
            if (issue) eGridCell.setAttribute("aria-description", issue);
            else eGridCell.removeAttribute("aria-description");
            if (issue || (!cell && presentation.displayEmptyAsText)) return { component: renderFallback };
            return undefined;
        },
        valueSetter: ({ data, newValue }) => {
            const value = tableCellTypes[definition.type].read(newValue, definition);
            if (!data || value === undefined || !setCell(data, definition, value)) return false;
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
