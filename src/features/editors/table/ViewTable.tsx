/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { ColDef, GridApi } from "ag-grid-community";
import { createEffect, onCleanup, type JSX } from "solid-js";
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

type GridRow = { id: string; values?: string[] };

const initialColumnCount = 3;
const rowNumberColumnId = "row-number";

function gridColumnCount(csv: CsvDocument): number {
    return csv.header
        ? csv.rows.reduce((width, row) => Math.max(width, row.length), csv.header.length)
        : initialColumnCount;
}

export function ViewTable(): JSX.Element {
    const host = useEditorTextView();
    const { t } = useI18N();
    const { editor: { theme, searchFile, setSearchFile, setSidebarVisible } } = useAppContext();
    let gridRef!: HTMLDivElement;
    let printRef!: HTMLDivElement;
    let grid: GridApi<GridRow> | null = null;
    let csv: CsvDocument | null = null;
    let source: string | null = null;
    let dirty = false;
    let columnCount = initialColumnCount;
    let nextRowId = 0;
    let modified = (): void => undefined;
    let focusSearch: (() => void) | null = null;
    let refreshQueued = false;
    let generation = 0;

    const createRow = (values?: string[]): GridRow => ({ id: String(nextRowId++), values });
    const columnLabel = (column: number): string => csv?.header ? csv.header[column] ?? "" : columnName(column);
    const flushEdits = (): void => { grid?.stopEditing(); };
    const focusGrid = (): void => {
        const cell = grid?.getFocusedCell();
        const column = cell?.column.getColId();
        grid?.setFocusedCell(cell?.rowIndex ?? 0, column && column !== rowNumberColumnId ? column : "0");
    };

    const setCell = (row: GridRow, column: number, value: string): boolean => {
        if (!csv || (row.values?.[column] ?? "") === value) return false;
        if (!row.values) {
            csv.header ??= Array.from({ length: initialColumnCount }, (_, index) => columnName(index));
            row.values = Array<string>(csv.header.length).fill("");
            csv.rows.push(row.values);
            const activeGrid = grid;
            // A cell editor is still being closed while the value setter runs.
            queueMicrotask(() => {
                if (activeGrid && grid === activeGrid) {
                    activeGrid.applyTransaction({ update: [{ ...row }], add: [createRow()] });
                }
            });
        }
        while (row.values.length <= column) row.values.push("");
        row.values[column] = value;
        dirty = true;
        modified();
        return true;
    };

    const search = new TableSearchController(
        () => csv?.rows ?? [],
        (edits) => {
            for (const { row, column, value } of edits) {
                const data = grid?.getDisplayedRowAtIndex(row)?.data;
                if (data?.values) setCell(data, column, value);
            }
        },
        ({ row, column }) => {
            grid?.ensureIndexVisible(row);
            grid?.ensureColumnVisible(String(column));
        },
        focusGrid,
        () => {
            if (refreshQueued || !grid) return;
            refreshQueued = true;
            const activeGrid = grid;
            queueMicrotask(() => {
                if (grid !== activeGrid) return;
                refreshQueued = false;
                activeGrid.refreshCells({ force: true });
            });
        }
    );

    const createColumn = (column: number): ColDef<GridRow, string> => ({
        colId: String(column),
        headerName: columnLabel(column),
        // The default text input strips line breaks. Multiline values can be edited in source mode.
        editable: ({ data }) => !!data && !/[\r\n]/.test(data.values?.[column] ?? ""),
        valueGetter: ({ data }) => data?.values?.[column] ?? "",
        valueSetter: ({ data, newValue }) => {
            if (!data || !setCell(data, column, newValue ?? "")) return false;
            search.contentChanged();
            return true;
        },
        cellClassRules: {
            [styles.match]: ({ node }) => node.rowIndex !== null && search.isMatch(node.rowIndex, column),
            [styles.current]: ({ node }) => node.rowIndex !== null && search.isCurrent(node.rowIndex, column),
        },
    });

    const rowNumberColumn: ColDef<GridRow, string> = {
        colId: rowNumberColumnId,
        headerName: "",
        pinned: "left",
        lockPinned: true,
        width: 88,
        suppressNavigable: true,
        rowDrag: ({ data }) => !!data?.values,
        valueGetter: ({ data, node }) => {
            if (!data) return "";
            return data.values ? String((node?.rowIndex ?? 0) + 1) : "*";
        },
        cellRendererSelector: ({ data }) => data && !data.values ? {
            component: () => {
                const marker = document.createElement("span");
                marker.textContent = "*";
                marker.setAttribute("role", "img");
                marker.setAttribute("aria-label", t("table.newRow"));
                return marker;
            },
        } : undefined,
    };

    const saveRowOrder = (activeGrid: GridApi<GridRow>): void => {
        if (!csv || grid !== activeGrid) return;
        const previous = csv.rows;
        const rows: string[][] = [];
        activeGrid.forEachNodeAfterFilterAndSort(({ data }) => {
            if (data?.values) rows.push(data.values);
        });
        if (rows.length !== previous.length || rows.every((row, index) => row === previous[index])) return;
        csv.rows = rows;
        dirty = true;
        modified();
        search.contentChanged();
    };

    const destroy = (): void => {
        generation += 1;
        grid?.destroy();
        grid = null;
        refreshQueued = false;
        csv = null;
        source = null;
        dirty = false;
        nextRowId = 0;
        search.clear();
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
                CellStyleModule, ClientSideRowModelApiModule, ClientSideRowModelModule, RenderApiModule,
                RowApiModule, RowDragModule, ScrollApiModule, TextEditorModule, createGrid, themeQuartz,
            } = await import("ag-grid-community");
            if (version !== generation) return;

            modified = onModified;
            columnCount = gridColumnCount(csv);
            grid = createGrid<GridRow>(gridRef, {
                theme: themeQuartz,
                defaultColDef: {
                    cellDataType: false,
                    sortable: false,
                    resizable: false,
                    suppressMovable: true,
                },
                columnDefs: [rowNumberColumn, ...Array.from({ length: columnCount }, (_, index) => createColumn(index))],
                rowData: [...csv.rows.map(createRow), createRow()],
                getRowId: ({ data }) => data.id,
                stopEditingWhenCellsLoseFocus: true,
                rowDragManaged: true,
                suppressMoveWhenRowDragging: true,
                isRowValidDropPosition: ({ target }) => target?.data?.values ? true : { position: "above" },
                onRowDragEnter: flushEdits,
                onRowDragEnd: ({ api }) => queueMicrotask(() => saveRowOrder(api)),
            }, {
                modules: [
                    CellStyleModule, ClientSideRowModelModule, ClientSideRowModelApiModule, RenderApiModule,
                    RowApiModule, RowDragModule, ScrollApiModule, TextEditorModule,
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
            for (let index = 0; index < columnCount; index += 1) {
                const cell = document.createElement("th");
                cell.scope = "col";
                cell.textContent = columnLabel(index);
                header.append(cell);
            }
            for (const row of csv?.rows ?? []) {
                const line = body.insertRow();
                for (let index = 0; index < columnCount; index += 1) {
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
            <div ref={gridRef} class={`${styles.grid} ag-theme-mode`} data-ag-theme-mode={theme()} />
            <div ref={printRef} class={styles.print} data-print-content />
            <AppSidebar active={host.active()} disabled={!host.ready()}>
                <SidebarTab defaultKey="search">
                    <SidebarTabSection key="search" label={t("search.title")}>
                        <SearchPanel controller={search} registerFocus={(handler) => { focusSearch = handler; }} />
                    </SidebarTabSection>
                </SidebarTab>
            </AppSidebar>
        </section>
    );
}

export default ViewTable;
