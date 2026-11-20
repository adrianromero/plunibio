/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { ColDef, GridApi, ICellRendererParams } from "ag-grid-community";
import Trash2 from "lucide-solid/icons/trash-2";
import { createEffect, createSignal, onCleanup, type JSX } from "solid-js";
import { useAppContext } from "@/app/AppContext";
import AppSidebar from "@/app/sidebar/AppSidebar";
import SearchPanel from "@/features/search/SearchPanel";
import { useI18N } from "@/i18n/Localization";
import SidebarTab from "@/shared/ui/sidebar/SidebarTab";
import SidebarTabSection from "@/shared/ui/sidebar/SidebarTabSection";
import { useEditorTextView } from "../text/EditorTextViewContext";
import { columnName, parseCsv, serializeCsv, type CsvDocument } from "./CsvDocument";
import { TableSearchController } from "./TableSearchController";
import styles from "./ViewTable.module.css";

type GridRow = { index: number; isNew: boolean };
type CellPosition = { row: number; column: number };
const initialColumnCount = 3;
const rowNumberColumnId = "row-number";
const tableRowHeight = 30;

function gridColumnCount(csv: CsvDocument): number {
    return csv.header
        ? csv.rows.reduce((width, row) => Math.max(width, row.length + 1), csv.header.length + 1)
        : initialColumnCount;
}

export function ViewTable(): JSX.Element {
    const host = useEditorTextView();
    const { t } = useI18N();
    const { editor: { searchFile, setSearchFile, setSidebarVisible } } = useAppContext();
    const [sidebarTab, setSidebarTab] = createSignal("edit");
    const [rowTarget, setRowTarget] = createSignal<number | null>(null);
    const [columnTarget, setColumnTarget] = createSignal<{ index: number; label: string } | null>(null);
    let selectedCell: CellPosition | null = null;
    let gridRef!: HTMLDivElement;
    let printRef!: HTMLDivElement;
    let grid: GridApi<GridRow> | null = null;
    let csv: CsvDocument | null = null;
    let source: string | null = null;
    let dirty = false;
    let refreshQueued = false;
    let columnCount = initialColumnCount;
    let displayedColumns = 0;
    let displayedHeaderLength = 0;
    let displayedRows = 0;
    let modified = (): void => undefined;
    let focusSearch: (() => void) | null = null;
    let generation = 0;

    const focusGrid = (): void => {
        const cell = grid?.getFocusedCell();
        const column = cell?.column.getColId();
        grid?.setFocusedCell(cell?.rowIndex ?? 0, column && column !== rowNumberColumnId ? column : "0");
    };

    const queueRefresh = (): void => {
        if (refreshQueued || !grid) return;
        refreshQueued = true;
        const activeGrid = grid;
        queueMicrotask(() => {
            if (grid !== activeGrid) return;
            refreshQueued = false;
            syncGrid();
            activeGrid.refreshCells({ force: true });
        });
    };

    const setCell = (row: number, column: number, value: string): boolean => {
        if (!csv || (csv.rows[row]?.[column] ?? "") === value) return false;
        csv.header ??= Array.from({ length: initialColumnCount }, (_, index) => columnName(index));
        while (csv.header.length <= column) csv.header.push(columnName(csv.header.length));
        const cells = csv.rows[row] ?? (csv.rows[row] = Array<string>(csv.header.length).fill(""));
        while (cells.length <= column) cells.push("");
        cells[column] = value;
        columnCount = Math.max(columnCount, cells.length + 1);
        dirty = true;
        modified();
        updateDeleteTargets();
        return true;
    };

    const search = new TableSearchController(
        () => csv?.rows ?? [],
        (edits) => {
            for (const { row, column, value } of edits) setCell(row, column, value);
        },
        ({ row, column }) => {
            const id = String(column);
            grid?.ensureIndexVisible(row);
            grid?.ensureColumnVisible(id);
        },
        focusGrid,
        queueRefresh
    );

    const columnLabel = (column: number): string => csv?.header ? csv.header[column] ?? "" : columnName(column);
    const deleteRowLabel = (): string => {
        const row = rowTarget();
        return row === null ? t("table.deleteRow") : t("table.deleteRowNumber", { row: row + 1 });
    };
    const deleteColumnLabel = (): string => {
        const column = columnTarget();
        return column === null ? t("table.deleteColumn") : t("table.deleteColumnNamed", { name: column.label });
    };

    const updateDeleteTargets = (): void => {
        const row = selectedCell?.row;
        const column = selectedCell?.column;
        setRowTarget(csv && row !== undefined && row < csv.rows.length ? row : null);
        setColumnTarget(csv?.header && column !== undefined && column < columnCount - 1
            ? { index: column, label: columnLabel(column).trim() || columnName(column) }
            : null);
    };

    const createColumn = (column: number): ColDef<GridRow, string> => ({
        colId: String(column),
        headerName: columnLabel(column),
        valueGetter: ({ data }) => data ? csv?.rows[data.index]?.[column] ?? "" : "",
        valueSetter: ({ data, newValue, oldValue }) => {
            const value = newValue ?? "";
            // The browser normalizes newlines in a textarea even if the user leaves it untouched.
            if (!data || value === oldValue?.replace(/\r\n?/g, "\n")) return false;
            if (!setCell(data.index, column, value)) return false;
            search.contentChanged();
            return true;
        },
        cellClassRules: {
            [styles.match]: ({ data }) => !!data && search.isMatch(data.index, column),
            [styles.current]: ({ data }) => !!data && search.isCurrent(data.index, column),
        },
    });

    const rowNumberColumn: ColDef<GridRow, string> = {
        colId: rowNumberColumnId,
        headerName: "",
        pinned: "left",
        lockPinned: true,
        width: 60,
        editable: false,
        suppressNavigable: true,
        cellClass: styles.rowNumber,
        valueGetter: ({ data }) => {
            if (!data) return "";
            return data.isNew ? "*" : String(data.index + 1);
        },
        cellRenderer: ({ data, value, eGridCell }: ICellRendererParams<GridRow, string>) => {
            eGridCell.setAttribute("aria-readonly", "true");
            const label = document.createElement("span");
            label.textContent = value ?? "";
            if (data?.isNew) {
                const newRowLabel = t("table.newRow");
                label.className = styles.newRowMarker;
                label.setAttribute("role", "img");
                label.setAttribute("aria-label", newRowLabel);
                label.title = newRowLabel;
            }
            return label;
        },
        cellRendererParams: { suppressMouseEventHandling: () => true },
    };
    const columns = () => [rowNumberColumn, ...Array.from({ length: columnCount }, (_, column) => createColumn(column))];
    const rows = (count: number) => Array.from({ length: count }, (_, index) => ({ index, isNew: index === count - 1 }));

    const syncGrid = (): void => {
        if (!grid || !csv) return;
        const headerLength = csv.header?.length ?? 0;
        if (displayedColumns !== columnCount || displayedHeaderLength !== headerLength) {
            grid.setGridOption("columnDefs", columns());
            displayedColumns = columnCount;
            displayedHeaderLength = headerLength;
        }
        const rowCount = csv.rows.length + 1;
        if (displayedRows !== rowCount) {
            grid.setGridOption("rowData", rows(rowCount));
            displayedRows = rowCount;
        }
    };

    const flushEdits = (): void => { grid?.stopEditing(); };

    const remove = (kind: "row" | "column", index: number): void => {
        if (!csv || !host.active() || !host.ready()) return;
        flushEdits();
        if (kind === "row") {
            if (index >= csv.rows.length) return;
            csv.rows.splice(index, 1);
        } else {
            if (!csv.header || index >= columnCount - 1) return;
            if (columnCount === 2) {
                csv.header = undefined;
                csv.rows = [];
            } else {
                csv.header.splice(index, 1);
                if (!csv.header.length) csv.header.push("");
                for (const row of csv.rows) {
                    row.splice(index, 1);
                    if (!row.length) row.push("");
                }
            }
        }
        columnCount = gridColumnCount(csv);
        dirty = true;
        modified();
        updateDeleteTargets();
        search.contentChanged();
    };

    const destroy = (): void => {
        generation += 1;
        grid?.destroy();
        grid = null;
        refreshQueued = false;
        displayedColumns = 0;
        displayedHeaderLength = 0;
        displayedRows = 0;
        csv = null;
        selectedCell = null;
        updateDeleteTargets();
        source = null;
        dirty = false;
        search.clear();
        search.contentChanged();
        printRef?.replaceChildren();
    };

    host.register({
        flushEdits,
        getContent: async () => {
            flushEdits();
            return dirty && csv ? serializeCsv(csv) : source;
        },
        replaceContent: async (content, _filename, onModified) => {
            destroy();
            source = content;
            csv = parseCsv(content);
            if (!csv) {
                host.reportError(t("errors.invalidCsv"));
                return;
            }
            const version = generation;
            const {
                CellStyleModule, ClientSideRowModelModule, LargeTextEditorModule, RenderApiModule,
                ScrollApiModule, TextEditorModule, createGrid, themeQuartz,
            } = await import("ag-grid-community");
            if (version !== generation) return;

            modified = onModified;
            columnCount = gridColumnCount(csv);
            displayedColumns = columnCount;
            displayedHeaderLength = csv.header?.length ?? 0;
            displayedRows = csv.rows.length + 1;
            grid = createGrid<GridRow>(gridRef, {
                theme: themeQuartz.withParams({
                    accentColor: "var(--color-primary)",
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border-subtle)",
                    foregroundColor: "var(--color-text)",
                    headerBackgroundColor: "var(--color-surface-subtle)",
                    headerFontWeight: 700,
                    fontFamily: "var(--font-interface)",
                    columnBorder: true,
                    wrapperBorder: { width: 1, style: "solid", color: "var(--color-border)" },
                    wrapperBorderRadius: "var(--radius-medium)",
                }),
                headerHeight: tableRowHeight,
                rowHeight: tableRowHeight,
                defaultColDef: {
                    editable: true,
                    cellDataType: false,
                    cellEditor: "agTextCellEditor",
                    cellEditorSelector: ({ value }) => typeof value === "string" && /[\r\n]/.test(value)
                        ? { component: "agLargeTextCellEditor", popup: true, params: { maxLength: Math.max(value.length, 524288) } }
                        : undefined,
                    sortable: false,
                    resizable: false,
                    suppressMovable: true,
                    width: 152,
                },
                columnDefs: columns(),
                rowData: rows(displayedRows),
                getRowId: ({ data }) => String(data.index),
                singleClickEdit: true,
                stopEditingWhenCellsLoseFocus: true,
                onCellFocused: ({ rowIndex, column }) => {
                    if (rowIndex === null || column === null) return;
                    const id = typeof column === "string" ? column : column.getColId();
                    if (id === rowNumberColumnId) return;
                    selectedCell = { row: rowIndex, column: Number(id) };
                    updateDeleteTargets();
                },
            }, {
                modules: [
                    CellStyleModule, ClientSideRowModelModule, LargeTextEditorModule,
                    RenderApiModule, ScrollApiModule, TextEditorModule,
                ],
            });
            gridRef.querySelector('[role="grid"]')?.setAttribute("aria-label", t("folder.table"));
        },
        focus: focusGrid,
        preparePrint: () => {
            flushEdits();
            const table = document.createElement("table");
            const header = table.createTHead().insertRow();
            const body = table.createTBody();
            const width = csv?.header ? columnCount - 1 : initialColumnCount;
            for (let index = 0; index < width; index += 1) {
                const cell = document.createElement("th");
                cell.scope = "col";
                cell.textContent = columnLabel(index);
                header.append(cell);
            }
            for (const row of csv?.rows ?? []) {
                const line = body.insertRow();
                for (let index = 0; index < width; index += 1) {
                    line.insertCell().textContent = row[index] ?? "";
                }
            }
            printRef.replaceChildren(table);
            return () => printRef.replaceChildren();
        },
        destroy,
    });

    const openSearch = (): void => {
        flushEdits();
        setSidebarVisible(true);
        setSidebarTab("search");
        requestAnimationFrame(() => {
            if (host.active() && host.ready()) focusSearch?.();
        });
    };
    createEffect(() => {
        if (!host.active() || !host.ready()) return;
        setSearchFile(openSearch);
        onCleanup(() => {
            if (searchFile() === openSearch) setSearchFile(null);
        });
    });
    createEffect(() => {
        t("table.newRow");
        grid?.refreshCells({ columns: [rowNumberColumnId], force: true });
    });
    onCleanup(() => {
        destroy();
        search.destroy();
    });

    return (
        <section
            class={styles.studio}
            data-testid="table-view"
            style={{ display: host.active() ? undefined : "none" }}
            inert={!host.active() || !host.ready()}
        >
            <div ref={gridRef} class={styles.grid} />
            <div ref={printRef} class={styles.print} data-print-content />
            <AppSidebar active={host.active()} disabled={!host.ready()}>
                <SidebarTab selectedKey={sidebarTab()} onSelectedKeyChange={(key) => key && setSidebarTab(key)}>
                    <SidebarTabSection key="edit" label={t("table.editing")}>
                        <section class="sidebarSection">
                            <button
                                type="button"
                                class="stdButton toolbar sidebarAction"
                                data-testid="delete-table-row"
                                disabled={!host.ready() || rowTarget() === null}
                                onClick={() => {
                                    const row = rowTarget();
                                    if (row !== null) remove("row", row);
                                }}
                            >
                                <Trash2 aria-hidden="true" />
                                <span class="sidebarActionLabel">{deleteRowLabel()}</span>
                            </button>
                            <button
                                type="button"
                                class="stdButton toolbar sidebarAction"
                                data-testid="delete-table-column"
                                disabled={!host.ready() || columnTarget() === null}
                                onClick={() => {
                                    const column = columnTarget();
                                    if (column !== null) remove("column", column.index);
                                }}
                            >
                                <Trash2 aria-hidden="true" />
                                <span class="sidebarActionLabel">{deleteColumnLabel()}</span>
                            </button>
                        </section>
                    </SidebarTabSection>
                    <SidebarTabSection key="search" label={t("search.title")}>
                        <SearchPanel controller={search} registerFocus={(handler) => { focusSearch = handler; }} />
                    </SidebarTabSection>
                </SidebarTab>
            </AppSidebar>
        </section>
    );
}

export default ViewTable;
