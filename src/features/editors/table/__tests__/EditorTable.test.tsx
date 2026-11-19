/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { invoke } from "@tauri-apps/api/core";
import { render } from "solid-js/web";
import { afterEach, expect, it, vi } from "vitest";
import { useAppContext, type AppContextValues } from "@/app/AppContext";
import { StoryAppProvider } from "@/app/__stories__/support/StoryAppProvider";
import Toolbar from "@/features/toolbar/Toolbar";
import I18NProvider from "@/i18n/Localization";
import EditorTable from "../EditorTable";
import { parseCsv, serializeCsv } from "../CsvDocument";

let diskContent = "";
vi.mock("@tauri-apps/api/core", () => ({
    invoke: vi.fn(async (command: string) => {
        if (command === "read_file") return { content: diskContent, isNew: false };
        return undefined;
    }),
}));
vi.mock("@/shared/logging/frontendLog", () => ({ frontendLog: vi.fn() }));

let context: AppContextValues;
let root: HTMLDivElement;
let dispose: (() => void) | undefined;

function Probe() {
    context = useAppContext();
    return null;
}

async function mount(content: string): Promise<void> {
    diskContent = content;
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(400);
    root = document.createElement("div");
    document.body.append(root);
    dispose = render(() => (
        <I18NProvider>
            <StoryAppProvider filename="data.csv">
                <Probe />
                <Toolbar />
                <EditorTable />
            </StoryAppProvider>
        </I18NProvider>
    ), root);
    await vi.waitFor(() => expect(context.editor.saveFile()).not.toBeNull());
}

function cell(row: number, column: number): HTMLElement {
    const element = root.querySelector<HTMLElement>(
        `[row-index="${row}"] [role="gridcell"][col-id="${column}"]`
    );
    if (!element) throw new Error(`Cell ${row}, ${column} is missing`);
    return element;
}

async function enterText(row: number, column: number, value: string): Promise<void> {
    await selectCell(row, column);
    const input = await vi.waitFor(() => {
        const input = root.querySelector<HTMLInputElement>(".ag-cell input");
        expect(input).not.toBeNull();
        return input!;
    });
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

function deleteAction(kind: "row" | "column"): HTMLButtonElement {
    return root.querySelector<HTMLButtonElement>(`[data-testid="delete-table-${kind}"]`)!;
}

function editingTab(): HTMLButtonElement {
    return root.querySelector<HTMLButtonElement>('[role="tab"][data-tab-key="edit"]')!;
}

function rowIndicator(row: number): HTMLElement | null {
    return root.querySelector(`[row-index="${row}"] [role="gridcell"][col-id="row-number"]`);
}

async function selectCell(row: number, column: number): Promise<void> {
    const target = await vi.waitFor(() => cell(row, column));
    target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, detail: 1 }));
    target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, detail: 1 }));
    target.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
}

afterEach(() => {
    dispose?.();
    dispose = undefined;
    root?.remove();
    vi.restoreAllMocks();
    vi.mocked(invoke).mockClear();
    window.dispatchEvent(new Event("afterprint"));
});

it("writes default headers above the first pending edit in an empty CSV", async () => {
    await mount("");
    const labels = () => Array.from(
        root.querySelectorAll('[role="columnheader"]:not([col-id="row-number"])'),
        (header) => header.textContent?.trim()
    );
    await vi.waitFor(() => expect(labels()).toEqual(["A", "B", "C"]));
    await vi.waitFor(() => expect(rowIndicator(0)?.textContent).toBe("*"));
    await enterText(0, 0, "0012");
    await context.main.onunload()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content: "A,B,C\n0012,," }));
    await vi.waitFor(() => expect(cell(0, 1)).toBeTruthy());

    await enterText(0, 1, "false");
    await context.editor.toggleSourceMode()?.();
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content: "A,B,C\n0012,false," }));
    await context.editor.toggleSourceMode()?.();
    await vi.waitFor(() => expect(cell(0, 0).textContent).toBe("0012"));
});

it("shows read-only row numbers and moves the new-row marker when data is entered", async () => {
    await mount("Name\nAna\nLeo");
    await vi.waitFor(() => expect(rowIndicator(2)?.textContent).toBe("*"));
    expect(rowIndicator(0)?.textContent).toBe("1");
    expect(rowIndicator(1)?.textContent).toBe("2");
    expect(rowIndicator(1)?.getAttribute("aria-readonly")).toBe("true");
    expect(rowIndicator(1)?.getAttribute("aria-colindex")).toBe("1");
    expect(rowIndicator(2)?.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("New row");
    rowIndicator(1)?.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
    expect(root.querySelector('[col-id="row-number"] input')).toBeNull();

    await enterText(2, 0, "Eva");
    await context.editor.saveFile()?.();
    await vi.waitFor(() => expect(rowIndicator(3)?.textContent).toBe("*"));
    expect(rowIndicator(2)?.textContent).toBe("3");
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content: "Name\nAna\nLeo\nEva" }));
});

it("uses the first record as read-only column labels and keeps the second record editable", async () => {
    await mount('"Name, full";ID;ID\r\nAna;0012;0003\r\n');
    const firstHeader = root.querySelector<HTMLElement>('[role="columnheader"][col-id="0"]');
    expect(firstHeader?.textContent?.trim()).toBe("Name, full");
    firstHeader?.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, detail: 2 }));
    expect(root.querySelector('[role="columnheader"] input')).toBeNull();
    await vi.waitFor(() => expect(cell(0, 0).textContent).toBe("Ana"));
    await enterText(0, 0, "Leo");
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({
        content: 'Name, full;ID;ID\r\nLeo;0012;0003\r\n',
    }));
});

it("deletes the selected data row and column from the editing sidebar and saves the resulting CSV", async () => {
    await mount("Name,ID,Note\r\nAna,0012,first\r\nLeo,0003,second\r\nEva,0007\r\n");
    expect(editingTab().getAttribute("aria-selected")).toBe("true");
    await vi.waitFor(() => expect(deleteAction("row").disabled).toBe(false));
    await selectCell(1, 1);
    await vi.waitFor(() => expect(deleteAction("row").textContent).toContain("2"));
    deleteAction("row").focus();
    expect(deleteAction("row").textContent).toContain("2");
    expect(root.querySelector('[data-toolbar-menu-entry^="delete-table-"]')).toBeNull();
    deleteAction("row").click();
    await vi.waitFor(() => {
        expect(cell(1, 0).textContent).toBe("Eva");
        expect(rowIndicator(1)?.textContent).toBe("2");
        expect(rowIndicator(2)?.textContent).toBe("*");
    });
    expect(context.editor.fileModified()).toBe(true);
    expect(invoke).not.toHaveBeenCalledWith("write_file", expect.anything());

    await selectCell(0, 1);
    await vi.waitFor(() => expect(deleteAction("column").textContent).toContain("ID"));
    deleteAction("column").click();
    await vi.waitFor(() => expect(cell(0, 1).textContent).toBe("first"));
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({
        content: "Name,Note\r\nAna,first\r\nEva\r\n",
    }));

    await selectCell(2, 2);
    await vi.waitFor(() => {
        expect(deleteAction("row").disabled).toBe(true);
        expect(deleteAction("column").disabled).toBe(true);
    });
    context.editor.searchFile()?.();
    await vi.waitFor(() => expect(document.activeElement).toBe(root.querySelector('[data-testid="search-input"]')));
    expect(editingTab().getAttribute("aria-selected")).toBe("false");
    editingTab().click();
    await context.editor.toggleSourceMode()?.();
    expect(editingTab()).toBeNull();
});

it("keeps the header after deleting the last row and clears the CSV after deleting the last column", async () => {
    await mount("Name\r\nAna\r\n");
    editingTab().click();
    await selectCell(0, 0);
    await vi.waitFor(() => expect(deleteAction("row").disabled).toBe(false));
    deleteAction("row").click();
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content: "Name\r\n" }));

    await vi.waitFor(() => expect(cell(0, 0).textContent).toBe(""));
    await selectCell(0, 0);
    await vi.waitFor(() => expect(deleteAction("column").disabled).toBe(false));
    deleteAction("column").click();
    await context.main.onunload()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content: "", createIfEmpty: false }));
});

it("prints all rows with column headings and restores source mode", async () => {
    const rows = Array.from({ length: 180 }, (_, index) => `${index},"text,${index}"`);
    const content = ["ID,Value", ...rows].join("\r\n");
    await mount(content);
    await context.editor.toggleSourceMode()?.();
    const print = vi.spyOn(window, "print").mockImplementation(() => {
        const table = document.querySelector<HTMLTableElement>(".print-document table");
        expect(table?.tHead?.textContent).toBe("IDValue");
        expect(table?.tBodies[0].rows).toHaveLength(180);
        expect(table?.rows[180].cells[1].textContent).toBe("text,179");
        expect(document.querySelector(".print-document .ag-root")).toBeNull();
    });
    await context.editor.printFile()?.();
    expect(print).toHaveBeenCalledOnce();
    expect(context.editor.sourceMode()).toBe(true);
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content }));
});

it("searches and replaces text in the grid through the shared sidebar", async () => {
    await mount('ID,abc\n0012,"abc abc"\nfalse,ABC');
    context.editor.searchFile()?.();
    const input = await vi.waitFor(() => {
        const input = root.querySelector<HTMLInputElement>('[data-testid="search-input"]');
        expect(input).not.toBeNull();
        return input!;
    });
    input.value = "abc";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const counter = () => root.querySelector('[data-testid="search-panel"] [aria-live]')?.textContent;
    expect(counter()).toBe("0 / 3");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(counter()).toBe("1 / 3");

    const replacement = root.querySelector<HTMLInputElement>('[data-testid="replace-input"]')!;
    replacement.value = "$1";
    replacement.dispatchEvent(new Event("input", { bubbles: true }));
    replacement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(counter()).toBe("1 / 2");
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content: "ID,abc\n0012,$1 abc\nfalse,ABC" }));
});

it("round-trips quoted and ragged records, UTF-8 BOM, delimiters and record endings", () => {
    const csv = parseCsv('\uFEFF"line\nnext";0012\r\nfalse;"a; ""b"""\r\n\r\n');
    expect(csv?.header).toEqual(["line\nnext", "0012"]);
    expect(csv?.rows).toEqual([["false", 'a; "b"'], [""]]);
    const serialized = serializeCsv(csv!);
    expect(serialized).toBe('\uFEFF"line\nnext";0012\r\nfalse;"a; ""b"""\r\n\r\n');
    expect(parseCsv('bad,"unterminated')).toBeNull();
    expect(parseCsv(serializeCsv(parseCsv('a\n""')!))?.rows).toEqual([[""]]);
});
