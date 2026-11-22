/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { ColDef, GridApi } from "ag-grid-community";
import { createEffect, createMemo, createSignal, on, onCleanup, Show, type JSX } from "solid-js";
import { useAppContext } from "@/app/AppContext";
import { textFileStorage } from "@/app/FileEditorController";
import AppSidebar from "@/app/sidebar/AppSidebar";
import SearchPanel from "@/features/search/SearchPanel";
import { useI18N } from "@/i18n/Localization";
import SidebarTab from "@/shared/ui/sidebar/SidebarTab";
import SidebarTabSection from "@/shared/ui/sidebar/SidebarTabSection";
import { useEditorTextView } from "../text/EditorTextViewContext";
import { tableCellTypes, type CellValue } from "./TableCellTypes";
import { createTableGridColumn, tableCellPresentation, type GridRow } from "./TableCellPresentation";
import type { TableColumn, TableDocument, TableRow } from "./TableDocument";
import { metadataFilename, parseTableColumns, tableFormatForFilename } from "./TableFormats";
import { TableSearchController } from "./TableSearchController";
import styles from "./ViewTable.module.css";

const rowNumberColumnId = "row-number";

export function ViewTable(): JSX.Element {
    const host = useEditorTextView();
    const { t, locale } = useI18N();
    const { main: { basepath }, editor: { theme, searchFile, setSearchFile, setSidebarVisible } } = useAppContext();
    const [rejectedReplacements, setRejectedReplacements] = createSignal(0);
    const decimalSeparator = createMemo(() => new Intl.NumberFormat(locale()).formatToParts(1.1)
        .find(({ type }) => type === "decimal")?.value ?? ".");
    let gridRef!: HTMLDivElement;
    let printRef!: HTMLDivElement;
    let grid: GridApi<GridRow> | null = null;
    let model: TableDocument | null = null;
    let source: string | null = null;
    let dirty = false;
    let nextRowId = 0;
    let modified = (): void => undefined;
    let focusSearch: (() => void) | null = null;
    let refreshQueued = false;
    let generation = 0;

    const createRow = (values?: TableRow): GridRow => ({ id: String(nextRowId++), values });
    const displayCell = (row: TableRow, column: TableColumn): string => {
        const cell = row.read(column);
        return cell.value === undefined ? cell.rawText : tableCellTypes[column.type].format(cell.value, decimalSeparator());
    };
    const flushEdits = (): void => { grid?.stopEditing(); };
    const focusGrid = (): void => {
        const cell = grid?.getFocusedCell();
        const column = cell?.column.getColId();
        grid?.setFocusedCell(cell?.rowIndex ?? 0, column && column !== rowNumberColumnId ? column : "0");
    };

    const setCell = (row: GridRow, column: TableColumn, value: CellValue): boolean => {
        if (!model) return false;
        if (Object.is(row.values?.read(column).value, value)) return false;
        if (!row.values) {
            row.values = model.appendRow(column, value);
            const activeGrid = grid;
            // A cell editor is still being closed while the value setter runs.
            queueMicrotask(() => {
                if (activeGrid && grid === activeGrid) {
                    activeGrid.applyTransaction({ update: [{ ...row }], add: [createRow()] });
                }
            });
        } else {
            row.values.write(column, value);
        }
        dirty = true;
        modified();
        return true;
    };

    const search = new TableSearchController(
        () => model ? displayRows(model) : [],
        (edits) => {
            let rejected = 0;
            for (const { row, column, value } of edits) {
                const definition = model?.columns[column];
                const data = grid?.getDisplayedRowAtIndex(row)?.data;
                if (!definition || !data?.values) continue;
                const parsed = tableCellTypes[definition.type].parse(value, decimalSeparator());
                if (parsed === undefined) rejected += 1;
                else setCell(data, definition, parsed);
            }
            setRejectedReplacements(rejected);
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
    createEffect(on(decimalSeparator, () => search.contentChanged(), { defer: true }));

    const displayRows = (table: TableDocument): string[][] => table.rows.map((row) =>
        table.columns.map((column) => displayCell(row, column))
    );

    const rowNumberColumn: ColDef<GridRow, string> = {
        colId: rowNumberColumnId,
        headerName: "",
        cellDataType: false,
        pinned: "left",
        lockPinned: true,
        width: 88,
        resizable: false,
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
        if (!model || grid !== activeGrid) return;
        const previous = model.rows;
        const indices = new Map(previous.map((row, index) => [row, index]));
        const order: number[] = [];
        activeGrid.forEachNodeAfterFilterAndSort(({ data }) => {
            const index = data?.values && indices.get(data.values);
            if (index !== undefined) order.push(index);
        });
        if (order.length !== previous.length || order.every((row, index) => row === index)) return;
        model.reorderRows(order);
        dirty = true;
        modified();
        search.contentChanged();
    };

    const destroy = (): void => {
        generation += 1;
        grid?.destroy();
        grid = null;
        refreshQueued = false;
        model = null;
        source = null;
        dirty = false;
        nextRowId = 0;
        setRejectedReplacements(0);
        search.clear();
        printRef?.replaceChildren();
    };

    host.register({
        flushEdits,
        getContent: async () => {
            flushEdits();
            return dirty && model ? model.serialize() : source;
        },
        replaceContent: async (content, filename, onModified) => {
            destroy();
            source = content;
            const version = generation;
            const format = tableFormatForFilename(filename);
            if (!format) {
                host.reportError(t("errors.renderViewFailed"));
                return;
            }
            const metadataPath = metadataFilename(filename, format);
            let columns: TableColumn[] | null = null;
            try {
                const metadata = await textFileStorage.read(basepath(), metadataPath);
                if (version !== generation) return;
                if (!metadata.isNew) {
                    columns = parseTableColumns(metadata.content);
                    if (!columns) {
                        host.reportError(t("errors.invalidTableMetadata", { filename: metadataPath }));
                        return;
                    }
                }
            } catch {
                if (version === generation) host.reportError(t("errors.invalidTableMetadata", { filename: metadataPath }));
                return;
            }
            const loaded = format.load(content, columns);
            if ("error" in loaded) {
                host.reportError(t(loaded.error, loaded.params));
                return;
            }
            const {
                CellStyleModule, CheckboxEditorModule, ClientSideRowModelApiModule, ClientSideRowModelModule,
                LargeTextEditorModule, NumberEditorModule, RenderApiModule, RowApiModule, RowDragModule,
                ScrollApiModule, TextEditorModule, TooltipModule, createGrid, themeQuartz,
            } = await import("ag-grid-community");
            if (version !== generation) return;

            modified = onModified;
            model = loaded.document;
            const table = model;
            grid = createGrid<GridRow>(gridRef, {
                theme: themeQuartz,
                defaultColDef: {
                    sortable: false,
                    suppressMovable: true,
                },
                columnDefs: [
                    rowNumberColumn,
                    ...table.columns.map((column, index) => createTableGridColumn(column, index, {
                        t, decimalSeparator, supportsMultilineText: table.supportsMultilineText, setCell, search,
                    })),
                ],
                rowData: [...table.rows.map(createRow), createRow()],
                getRowId: ({ data }) => data.id,
                stopEditingWhenCellsLoseFocus: true,
                rowDragManaged: true,
                suppressMoveWhenRowDragging: true,
                isRowValidDropPosition: ({ target }) => target?.data?.values ? true : { position: "above" },
                onRowDragEnter: flushEdits,
                onRowDragEnd: ({ api }) => queueMicrotask(() => saveRowOrder(api)),
            }, {
                modules: [
                    CellStyleModule, CheckboxEditorModule, ClientSideRowModelModule, ClientSideRowModelApiModule,
                    LargeTextEditorModule, NumberEditorModule, RenderApiModule, RowApiModule, RowDragModule,
                    ScrollApiModule, TextEditorModule, TooltipModule,
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
            const columns = model?.columns ?? [];
            for (const { label } of columns) {
                const cell = document.createElement("th");
                cell.scope = "col";
                cell.textContent = label;
                header.append(cell);
            }
            for (const row of model?.rows ?? []) {
                const line = body.insertRow();
                for (const column of columns) {
                    const cell = line.insertCell();
                    cell.textContent = displayCell(row, column);
                    cell.className = tableCellPresentation[column.type].printClass ?? "";
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
                        <Show when={rejectedReplacements() > 0}>
                            <p class={styles.replacementError} role="status">
                                {t("table.replacementRejected", { count: rejectedReplacements() })}
                            </p>
                        </Show>
                    </SidebarTabSection>
                </SidebarTab>
            </AppSidebar>
        </section>
    );
}

export default ViewTable;
