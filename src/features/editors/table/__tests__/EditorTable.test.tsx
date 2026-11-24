/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { invoke } from "@tauri-apps/api/core";
import { getGridApi } from "ag-grid-community";
import { render } from "solid-js/web";
import { afterEach, expect, it, vi } from "vitest";
import { useAppContext, type AppContextValues } from "@/app/AppContext";
import { installWebKitKeyboardWorkaround } from "@/app/WebKitKeyboardWorkaround";
import { StoryAppProvider } from "@/app/__stories__/support/StoryAppProvider";
import Toolbar from "@/features/toolbar/Toolbar";
import I18NProvider, { useI18N } from "@/i18n/Localization";
import EditorTable from "../EditorTable";
import { parseCsv, serializeCsv } from "../CsvDocument";
import styles from "../ViewTable.module.css";
import csvWithMetadata from "./fixtures/with-metadata.csv?raw";
import csvMetadata from "./fixtures/with-metadata.meta.csv.json?raw";
import tableJson from "./fixtures/with-metadata.table.json?raw";
import jsonMetadata from "./fixtures/with-metadata.meta.json.json?raw";
import tableJsonl from "./fixtures/with-metadata.table.jsonl?raw";
import jsonlMetadata from "./fixtures/with-metadata.meta.jsonl.json?raw";
import inferredCsv from "./fixtures/inferred.csv?raw";
import inferredJson from "./fixtures/inferred.table.json?raw";
import inferredJsonl from "./fixtures/inferred.table.jsonl?raw";
import headerOnly from "./fixtures/header-only.csv?raw";
import emptyCsv from "./fixtures/empty.csv?raw";
import emptyJson from "./fixtures/empty.table.json?raw";
import emptyJsonl from "./fixtures/empty.table.jsonl?raw";
import noColumns from "./fixtures/no-columns.table.json?raw";
import invalidJson from "./fixtures/invalid.table.json?raw";
import invalidJsonl from "./fixtures/invalid.table.jsonl?raw";
import emptyColumns from "./fixtures/empty-columns.meta.csv.json?raw";
import duplicateColumns from "./fixtures/duplicate-columns.meta.json.json?raw";

type TestFiles = Record<string, string | { code: string; path: string }>;
let files: TestFiles = {};
vi.mock("@tauri-apps/api/core", () => ({
    invoke: vi.fn(async (command: string, args: { filename: string }) => {
        if (command === "read_file") {
            const content = files[args.filename];
            if (typeof content === "object") throw content;
            return { content: content ?? "", isNew: content === undefined };
        }
        return undefined;
    }),
}));
vi.mock("@/shared/logging/frontendLog", () => ({ frontendLog: vi.fn() }));

let context: AppContextValues;
let setLocale: ReturnType<typeof useI18N>["setLocale"];
let root: HTMLDivElement;
let dispose: (() => void) | undefined;
let removeKeyboardWorkaround: (() => void) | undefined;

function Probe() {
    context = useAppContext();
    setLocale = useI18N().setLocale;
    return null;
}

async function mount(content: string, filename = "data.csv", companions: TestFiles = {}): Promise<void> {
    files = { ...companions, [filename]: content };
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(400);
    root = document.createElement("div");
    document.body.append(root);
    dispose = render(() => (
        <I18NProvider>
            <StoryAppProvider filename={filename}>
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

async function openCellEditor(row: number, column: number): Promise<HTMLInputElement> {
    await selectCell(row, column);
    return vi.waitFor(() => {
        const target = cell(row, column);
        const input = target.classList.contains("ag-cell-inline-editing") && target.querySelector<HTMLInputElement>("input");
        if (!input) throw new Error(`Editor for cell ${row}, ${column} is missing`);
        return input;
    });
}

async function enterText(row: number, column: number, value: string): Promise<HTMLInputElement> {
    const input = await openCellEditor(row, column);
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return input;
}

function pressEnter(input: HTMLInputElement): void {
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
}

type EditExit = "Enter" | "Tab" | "outside click" | "Escape";

async function finishEdit(input: HTMLInputElement, exit: EditExit): Promise<void> {
    const cell = input.closest('[role="gridcell"]');
    const column = cell?.getAttribute("col-id");
    const row = cell?.closest("[row-index]")?.getAttribute("row-index");
    input.focus();
    if (exit === "outside click") {
        const outside = document.createElement("button");
        root.append(outside);
        outside.focus();
        outside.click();
        outside.remove();
    } else {
        input.dispatchEvent(new KeyboardEvent("keydown", { key: exit, bubbles: true, cancelable: true }));
    }
    await vi.waitFor(() => expect(input.isConnected, `${exit} closes the editor in cell ${row}, ${column}`).toBe(false));
    if (exit === "Tab") {
        // Tab can start a separate edit in the next cell.
        const nextEditor = root.querySelector<HTMLInputElement>(".ag-cell-inline-editing input");
        if (nextEditor) await finishEdit(nextEditor, "Escape");
    }
}

function rowIndicator(row: number): HTMLElement | null {
    return root.querySelector(`[row-index="${row}"] [role="gridcell"][col-id="row-number"]`);
}

function rowGrip(row: number): Element | null | undefined {
    return rowIndicator(row)?.querySelector(".ag-row-drag:not(.ag-invisible):not(.ag-hidden) .ag-icon-grip");
}

function dataHeaders(): (string | undefined)[] {
    return Array.from(
        root.querySelectorAll('[role="columnheader"]:not([col-id="row-number"])'),
        (header) => header.textContent?.trim()
    );
}

async function selectCell(row: number, column: number): Promise<void> {
    const target = await vi.waitFor(() => cell(row, column));
    target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, detail: 1 }));
    target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, detail: 1 }));
    const grid = root.querySelector<HTMLElement>(".ag-theme-mode")!;
    getGridApi(grid)?.setFocusedCell(row, String(column));
    target.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, detail: 2 }));
}

afterEach(() => {
    removeKeyboardWorkaround?.();
    removeKeyboardWorkaround = undefined;
    dispose?.();
    dispose = undefined;
    root?.remove();
    vi.restoreAllMocks();
    vi.mocked(invoke).mockClear();
    localStorage.clear();
    window.dispatchEvent(new Event("afterprint"));
});

it("navigates back to the previous cell when WebKitGTK reports Shift+Tab as unidentified", async () => {
    removeKeyboardWorkaround = installWebKitKeyboardWorkaround();
    await mount("A,B\nAna,Leo");
    const first = await vi.waitFor(() => cell(0, 0));
    const second = cell(0, 1);
    first.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, detail: 1 }));
    first.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, detail: 1 }));
    first.focus();

    first.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", code: "Tab", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(second);

    const backwardTab = new KeyboardEvent("keydown", {
        key: "Unidentified", code: "Tab", shiftKey: true, bubbles: true, cancelable: true,
    });
    second.dispatchEvent(backwardTab);
    expect(document.activeElement).toBe(first);
    expect(backwardTab.defaultPrevented).toBe(true);
});

it("writes default headers above the first pending edit in an empty CSV", async () => {
    await mount("");
    await vi.waitFor(() => expect(dataHeaders()).toEqual(["A", "B", "C"]));
    await vi.waitFor(() => expect(rowIndicator(0)?.textContent).toBe("*"));
    await enterText(0, 0, "0012");
    await context.main.onunload()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content: "A,B,C\n0012,," }));
    await vi.waitFor(() => expect(cell(0, 1)).toBeTruthy());

    await enterText(0, 2, "false");
    await context.editor.toggleSourceMode()?.();
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content: "A,B,C\n0012,,false" }));
    await context.editor.toggleSourceMode()?.();
    await vi.waitFor(() => expect(cell(0, 0).textContent).toBe("0012"));
    expect(dataHeaders()).toEqual(["A", "B", "C"]);
});

it("shows read-only row numbers and moves the new-row marker when data is entered", async () => {
    await mount("Name\nAna\nLeo");
    await vi.waitFor(() => expect(dataHeaders()).toEqual(["Name"]));
    await vi.waitFor(() => expect(rowIndicator(2)?.textContent).toBe("*"));
    expect(rowIndicator(0)?.textContent).toBe("1");
    expect(rowIndicator(1)?.textContent).toBe("2");
    expect(rowGrip(1)).toBeTruthy();
    expect(rowGrip(2)).toBeNull();
    expect(rowIndicator(1)?.getAttribute("aria-colindex")).toBe("1");
    expect(rowIndicator(2)?.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("New row");
    rowIndicator(1)?.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, detail: 2 }));
    expect(root.querySelector('[col-id="row-number"] input')).toBeNull();

    await enterText(2, 0, "Eva");
    await context.editor.saveFile()?.();
    await vi.waitFor(() => expect(rowIndicator(3)?.textContent).toBe("*"));
    expect(rowIndicator(2)?.textContent).toBe("3");
    await vi.waitFor(() => expect(rowGrip(2)).toBeTruthy());
    expect(rowGrip(3)).toBeNull();
    expect(dataHeaders()).toEqual(["Name"]);
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content: "Name\nAna\nLeo\nEva" }));
});

it("uses the first record as read-only column labels and keeps the second record editable", async () => {
    await mount('"Name, full";ID;ID\r\nAna;0012;0003\r\n');
    expect(dataHeaders()).toEqual(["Name, full", "ID"]);
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

it("keeps only the search tab in the table sidebar and uses the selected theme", async () => {
    await mount("Name\nAna");
    const sidebar = root.querySelector('[data-testid="table-view"] [data-testid="app-sidebar"]');
    expect(Array.from(sidebar?.querySelectorAll('[role="tab"]') ?? [], (tab) => tab.getAttribute("data-tab-key")))
        .toEqual(["search"]);
    expect(context.editor.toggleSidebar()).not.toBeNull();
    expect(context.editor.searchFile()).not.toBeNull();
    expect(root.querySelector(".ag-theme-mode")?.getAttribute("data-ag-theme-mode")).toBe("light");
    context.editor.setTheme("dark");
    expect(root.querySelector(".ag-theme-mode")?.getAttribute("data-ag-theme-mode")).toBe("dark");

    await context.editor.toggleSourceMode()?.();
    context.editor.searchFile()?.();
    await vi.waitFor(() => expect(document.activeElement).toBe(root.querySelector('[data-testid="search-input"]')));
});

it("preserves multiline fields while editing other cells with the default text editor", async () => {
    await mount('Name,Note\nAna,"line one\nline two"');
    const multiline = await vi.waitFor(() => cell(0, 1));
    multiline.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, detail: 2 }));
    expect(multiline.querySelector("input, textarea")).toBeNull();

    await enterText(0, 0, "Leo");
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({
        content: 'Name,Note\nLeo,"line one\nline two"',
    }));
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
        expect(table?.tHead?.querySelector(`.${styles.numeric}`)).toBeNull();
        expect(table?.rows[180].cells[0].classList.contains(styles.numeric)).toBe(true);
        expect(table?.rows[180].cells[1].classList.contains(styles.numeric)).toBe(false);
        expect(table?.rows[180].cells[1].textContent).toBe("text,179");
        expect(document.querySelector(".print-document .ag-root")).toBeNull();
    });
    await context.editor.printFile()?.();
    expect(print).toHaveBeenCalledOnce();
    expect(context.editor.sourceMode()).toBe(true);
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content: ["ID,Value", ...rows].join("\n") }));
});

it("normalizes CSV line endings when returning from source mode", async () => {
    await mount('Name,Note\r\nAna,"first line\r\nsecond line"\r\n');
    await context.editor.toggleSourceMode()?.();
    await context.editor.toggleSourceMode()?.();
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({
        content: 'Name,Note\nAna,"first line\nsecond line"\n',
    }));
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
    await vi.waitFor(() => {
        expect(cell(0, 1).classList.contains(styles.current)).toBe(true);
        expect(cell(1, 1).classList.contains(styles.match)).toBe(true);
    });

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

it.each([
    ["empty.csv", emptyCsv],
    ["empty.table.json", emptyJson],
    ["empty.table.jsonl", emptyJsonl],
])("shows the default columns without changing %s", async (filename, content) => {
    await mount(content, filename);
    expect(dataHeaders()).toEqual(["A", "B", "C"]);
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ filename, content }));
    expect(vi.mocked(invoke).mock.calls.filter(([command]) => command === "write_file")).toHaveLength(1);
});

it("uses string editors for a CSV containing only headers", async () => {
    await mount(headerOnly, "header-only.csv");
    expect(dataHeaders()).toEqual(["Name", "ID", "Note"]);
    await enterText(0, 1, "0012");
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content: "Name,ID,Note\n,0012,\n" }));
});

it("infers CSV types and preserves the spelling of unedited numbers in the file", async () => {
    await mount(inferredCsv, "inferred.csv");
    expect(cell(0, 1).textContent).toBe("0012");
    expect(cell(0, 4).textContent).toBe("0.00004");
    expect(cell(0, 3).querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(true);
    expect(cell(1, 3).querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(false);
    expect(cell(0, 3).getAttribute("aria-description")).toBeNull();
    expect(cell(1, 4).getAttribute("aria-description")).toBe("Expected a number.");
    await enterText(1, 2, "-7.5");
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({
        content: inferredCsv.replace("-44", "-7.5"),
    }));
});

it.each([
    ["values.csv", "amount,active\n1.30,true\n4e-5,false"],
    ["values.table.json", '[{"amount":1.30,"active":true},{"amount":4e-5,"active":false}]'],
    ["values.table.jsonl", '{"amount":1.30,"active":true}\n{"amount":4e-5,"active":false}'],
])("uses the same native format and alignment in %s", async (filename, content) => {
    await mount(content, filename);
    expect(cell(0, 0).textContent).toBe("1.3");
    expect(cell(1, 0).textContent).toBe("0.00004");
    expect(cell(0, 0).classList.contains("ag-right-aligned-cell")).toBe(true);
    expect(cell(0, 1).classList.contains("ag-right-aligned-cell")).toBe(false);
    await vi.waitFor(() => {
        expect(cell(0, 1).querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(true);
        expect(cell(1, 1).querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(false);
    });
    const header = root.querySelector('[role="columnheader"][col-id="0"]');
    expect(root.querySelector('[role="columnheader"].ag-right-aligned-header')).toBeNull();
    expect(header?.querySelector(".ag-header-cell-resize:not(.ag-hidden)")).not.toBeNull();
    const rowHeader = root.querySelector('[role="columnheader"][col-id="row-number"]');
    expect(rowHeader?.querySelector(".ag-header-cell-resize:not(.ag-hidden)")).toBeNull();

    setLocale("es");
    await vi.waitFor(() => expect(cell(0, 0).textContent).toBe("1,3"));
    expect(cell(1, 0).textContent).toBe("0,00004");
    expect(context.editor.fileModified()).toBe(false);
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ filename, content }));
});

it("uses localized decimals for searching, replacing and printing without changing the file format", async () => {
    await mount("amount\n1234.125\n1.2e-7");
    setLocale("es");
    await vi.waitFor(() => expect(cell(0, 0).textContent).toBe("1234,125"));
    expect(cell(1, 0).textContent).toBe("1.2e-7");

    context.editor.searchFile()?.();
    const input = root.querySelector<HTMLInputElement>('[data-testid="search-input"]')!;
    input.value = "1234,125";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    pressEnter(input);
    const replacement = root.querySelector<HTMLInputElement>('[data-testid="replace-input"]')!;
    replacement.value = "2,5";
    replacement.dispatchEvent(new Event("input", { bubbles: true }));
    pressEnter(replacement);
    await vi.waitFor(() => expect(cell(0, 0).textContent).toBe("2,5"));

    const print = vi.spyOn(window, "print").mockImplementation(() => {
        const table = document.querySelector<HTMLTableElement>(".print-document table");
        expect(table?.tBodies[0].rows[0].cells[0].textContent).toBe("2,5");
    });
    await context.editor.printFile()?.();
    expect(print).toHaveBeenCalledOnce();
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content: "amount\n2.5\n1.2e-7" }));
});

it("adds a metadata-only CSV column after unmapped and extra fields without moving them", async () => {
    await mount(csvWithMetadata, "folder/with-metadata.CSV", { "folder/with-metadata.meta.csv.json": csvMetadata });
    expect(dataHeaders()).toEqual(["Count", "Name", "Ready"]);
    expect(cell(1, 0).getAttribute("aria-description")).toBe("Expected a number.");
    expect(cell(0, 2).getAttribute("aria-description")).toBe("Value missing.");
    await selectCell(0, 2);
    const toggle = root.querySelector<HTMLInputElement>(".ag-cell input[type=checkbox]");
    expect(toggle).not.toBeNull();
    toggle?.click();
    toggle?.click();
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({
        content: "name,count,hidden,hidden,,ready\nAna,1.3,x,y,extra,false\nLeo,false,keep,also keep\n",
    }));
    expect(cell(0, 2).getAttribute("aria-description")).toBeNull();
    expect(cell(0, 2).querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(false);
});

it("toggles valid booleans by clicking or pressing Space and keeps invalid values visible", async () => {
    await mount('[{"flag":true},{"flag":false},{"flag":"false"},{}]', "data.table.json");
    const first = cell(0, 0).querySelector<HTMLInputElement>('input[type="checkbox"]');
    expect(first?.checked).toBe(true);
    first?.click();

    const second = cell(1, 0);
    expect(second.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(false);
    second.focus();
    second.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", bubbles: true, cancelable: true }));

    expect(cell(2, 0).querySelector('input[type="checkbox"]')).toBeNull();
    expect(cell(2, 0).textContent).toBe("false");
    expect(cell(2, 0).getAttribute("aria-description")).toBe("Expected a boolean.");
    expect(cell(3, 0).querySelector('input[type="checkbox"]')).toBeNull();
    expect(cell(3, 0).textContent).toBe("");
    expect(cell(3, 0).getAttribute("aria-description")).toBe("Value missing.");
    await context.editor.saveFile()?.();
    const write = vi.mocked(invoke).mock.calls.find(([command]) => command === "write_file");
    expect(JSON.parse((write?.[1] as { content: string }).content)).toEqual([
        { flag: false }, { flag: true }, { flag: "false" }, {},
    ]);
});

it.each([
    ["json", inferredJson],
    ["jsonl", inferredJsonl],
])("infers columns across all %s records and displays incompatible and absent values", async (format, content) => {
    await mount(content, `inferred.table.${format}`);
    expect(dataHeaders()).toEqual(["a", "c", "d", "e", "b", "f"]);
    expect(cell(0, 1).textContent).toBe("null");
    expect(cell(0, 2).textContent).toBe('{"nested":true}');
    expect(cell(0, 3).textContent).toBe("[1,2,3]");
    expect(cell(0, 4).getAttribute("aria-description")).toBe("Value missing.");
    expect(cell(1, 0).getAttribute("aria-description")).toBe("Expected a number.");
    expect(cell(2, 4).getAttribute("aria-description")).toBe("Expected a number.");
    expect(cell(2, 5).getAttribute("aria-description")).toBeNull();
});

it.each([
    ["json", tableJson, jsonMetadata],
    ["jsonl", tableJsonl, jsonlMetadata],
])("preserves %s values and hidden properties while editing and inserting typed cells", async (format, content, metadata) => {
    const filename = `with-metadata.table.${format}`;
    await mount(content, filename, { [`with-metadata.meta.${format}.json`]: metadata });
    expect(dataHeaders()).toEqual(["Text", "Number", "Boolean"]);
    expect(cell(0, 0).textContent).toBe("true");
    expect(cell(0, 0).getAttribute("aria-description")).toBe("Expected text.");
    expect(cell(2, 0).getAttribute("aria-description")).toBe("Value missing.");
    pressEnter(await enterText(1, 0, "value"));
    await finishEdit(await openCellEditor(2, 0), "Escape");
    pressEnter(await enterText(2, 1, "4e-5"));
    await enterText(3, 0, "New");
    await context.editor.toggleSourceMode()?.();
    await context.editor.saveFile()?.();

    const write = vi.mocked(invoke).mock.calls.find(([command]) => command === "write_file");
    const saved = (write?.[1] as { filename: string; content: string });
    expect(saved.filename).toBe(filename);
    expect(format === "json" ? JSON.parse(saved.content) : saved.content.split("\n").map((line) => JSON.parse(line))).toEqual([
        { a: true, b: 10, hidden: { x: [1, null] } },
        { a: "value", c: "false", hidden: "keep" },
        { b: 4e-5 },
        { a: "New" },
    ]);
    await context.editor.toggleSourceMode()?.();
    await vi.waitFor(() => expect(cell(1, 0).textContent).toBe("value"));
    expect(cell(0, 0).getAttribute("aria-description")).toBe("Expected text.");
});

it("rejects empty numeric edits and reports replacements that fail type validation", async () => {
    await mount(tableJson, "with-metadata.table.json", { "with-metadata.meta.json.json": jsonMetadata });
    await enterText(0, 1, "");
    await context.editor.saveFile()?.();
    expect(cell(0, 1).textContent).toBe("10");
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ content: tableJson }));

    context.editor.searchFile()?.();
    const input = root.querySelector<HTMLInputElement>('[data-testid="search-input"]')!;
    input.value = "10";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    const replacement = root.querySelector<HTMLInputElement>('[data-testid="replace-input"]')!;
    replacement.value = "invalid";
    replacement.dispatchEvent(new Event("input", { bubbles: true }));
    replacement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(root.querySelector('[role="status"]')?.textContent).toContain("Cells skipped");
    expect(cell(0, 1).textContent).toBe("10");
});

it.each([["value", "value"], [123.4, "123.4"]] as const)("can clear a text editor prefilled with %s", async (original, text) => {
    await mount(JSON.stringify([{ a: original }]), "data.table.json", { "data.meta.json.json": jsonMetadata });
    const input = await openCellEditor(0, 0);
    expect(input.value).toBe(text);
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await context.editor.saveFile()?.();
    const write = vi.mocked(invoke).mock.calls.find(([command]) => command === "write_file");
    expect(JSON.parse((write?.[1] as { content: string }).content)).toEqual([{ a: "" }]);
    expect(cell(0, 0).getAttribute("aria-description")).toBeNull();
});

it.each(["Enter", "Tab", "outside click", "Escape"] as const)(
    "uses the native text editor for incompatible values and closes with %s",
    async (exit) => {
        await mount(tableJson, "with-metadata.table.json", { "with-metadata.meta.json.json": jsonMetadata });
        const input = await openCellEditor(0, 0);
        expect(input.type).toBe("text");
        expect(input.value).toBe("true");
        if (exit === "Escape") {
            input.value = "discard this";
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
        await finishEdit(input, exit);
        expect(context.editor.fileModified()).toBe(exit !== "Escape");
        await context.editor.saveFile()?.();

        const expected = JSON.parse(tableJson) as Record<string, unknown>[];
        if (exit !== "Escape") expected[0].a = "true";
        const write = vi.mocked(invoke).mock.calls.find(([command]) => command === "write_file");
        expect(JSON.parse((write?.[1] as { content: string }).content)).toEqual(expected);
        expect(cell(0, 0).getAttribute("aria-description")).toBe(exit === "Escape" ? "Expected text." : null);
    }
);

it.each([
    ["empty.csv", emptyCsv, "Enter", "A,B,C\n,,"],
    ["empty.table.json", emptyJson, "Tab", JSON.stringify([{ A: "" }], null, 2)],
    ["empty.table.jsonl", emptyJsonl, "outside click", '{"A":""}'],
] as const)("inserts an explicitly empty string on the new row of %s", async (filename, content, exit, expected) => {
    await mount(content, filename);
    const input = await openCellEditor(0, 0);
    expect(input.value).toBe("");
    await finishEdit(input, "Escape");
    expect(context.editor.fileModified()).toBe(false);
    expect(rowIndicator(0)?.textContent).toBe("*");

    await finishEdit(await openCellEditor(0, 0), exit);
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({ filename, content: expected }));
    await vi.waitFor(() => expect(rowIndicator(1)?.textContent).toBe("*"));
    expect(rowIndicator(0)?.textContent).toBe("1");
    expect(cell(0, 0).getAttribute("aria-description")).toBeNull();
});

it("saves an untouched empty text input immediately when the field was missing", async () => {
    await mount(noColumns, "no-columns.table.json", { "no-columns.meta.json.json": jsonMetadata });
    expect((await openCellEditor(0, 0)).value).toBe("");
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({
        content: JSON.stringify([{ a: "" }], null, 2),
    }));
});

it.each(["Enter", "Tab", "outside click", "Escape"] as const)(
    "keeps or applies numeric and boolean values from native editors on %s",
    async (exit) => {
        await mount(tableJson, "with-metadata.table.json", { "with-metadata.meta.json.json": jsonMetadata });
        const emptyNumber = await openCellEditor(1, 1);
        expect(emptyNumber.type).toBe("number");
        expect(emptyNumber.value).toBe("");
        await vi.waitFor(() => expect(cell(1, 1).classList.contains("ag-cell-editing-error")).toBe(true));
        await finishEdit(emptyNumber, exit);
        expect(cell(1, 1).getAttribute("aria-description")).toBe("Value missing.");

        const indeterminate = await openCellEditor(1, 2);
        expect(indeterminate.type).toBe("checkbox");
        expect(indeterminate.indeterminate).toBe(true);
        await finishEdit(indeterminate, exit);
        expect(cell(1, 2).getAttribute("aria-description")).toBe("Expected a boolean.");
        expect(context.editor.fileModified()).toBe(false);

        await finishEdit(await enterText(1, 1, "2.5"), exit);
        const checkbox = await openCellEditor(1, 2);
        checkbox.click();
        checkbox.click();
        expect(checkbox.checked).toBe(false);
        expect(checkbox.indeterminate).toBe(false);
        await finishEdit(checkbox, exit);
        expect(context.editor.fileModified()).toBe(exit !== "Escape");
        await context.editor.saveFile()?.();

        const expected = JSON.parse(tableJson) as Record<string, unknown>[];
        if (exit !== "Escape") {
            expected[1].b = 2.5;
            expected[1].c = false;
        }
        const write = vi.mocked(invoke).mock.calls.find(([command]) => command === "write_file");
        expect(JSON.parse((write?.[1] as { content: string }).content)).toEqual(expected);
    }
);

it("creates new rows only when a numeric or boolean edit is confirmed with a value", async () => {
    await mount(emptyJson, "empty.table.json", { "empty.meta.json.json": jsonMetadata });
    await finishEdit(await openCellEditor(0, 1), "Enter");
    await finishEdit(await openCellEditor(0, 2), "outside click");
    await finishEdit(await enterText(0, 1, "8"), "Escape");
    const pendingBoolean = await openCellEditor(0, 2);
    pendingBoolean.click();
    await finishEdit(pendingBoolean, "Escape");
    expect(context.editor.fileModified()).toBe(false);
    expect(rowIndicator(0)?.textContent).toBe("*");

    await finishEdit(await enterText(0, 1, "8"), "Tab");
    await vi.waitFor(() => expect(rowIndicator(1)?.textContent).toBe("*"));
    const checkbox = await openCellEditor(1, 2);
    expect(checkbox.indeterminate).toBe(true);
    checkbox.click();
    await finishEdit(checkbox, "outside click");
    await vi.waitFor(() => expect(rowIndicator(2)?.textContent).toBe("*"));
    await context.editor.saveFile()?.();
    expect(invoke).toHaveBeenCalledWith("write_file", expect.objectContaining({
        content: JSON.stringify([{ b: 8 }, { c: true }], null, 2),
    }));
});

it("opens a table of empty objects when explicit columns are available", async () => {
    await mount(noColumns, "no-columns.table.json", { "no-columns.meta.json.json": jsonMetadata });
    expect(dataHeaders()).toEqual(["Text", "Number", "Boolean"]);
    expect(cell(0, 0).getAttribute("aria-description")).toBe("Value missing.");
});

it.each([
    ["invalid.table.json", invalidJson, {}, "array of objects"],
    ["invalid.table.json", '[1,"value",null]', {}, "array of objects"],
    ["invalid.table.json", '{"a":3}', {}, "array of objects"],
    ["invalid.table.json", '"value"', {}, "array of objects"],
    ["invalid.table.json", '[{a: 7}]', {}, "array of objects"],
    ["invalid.table.json", "", {}, "array of objects"],
    ["invalid.table.jsonl", invalidJsonl, {}, "Line 2"],
    ["invalid.table.jsonl", '{"a":1}\n[]\n', {}, "Line 2"],
    ["no-columns.table.json", noColumns, {}, "no columns"],
    [
        "empty-columns.csv", emptyCsv, { "empty-columns.meta.csv.json": emptyColumns },
        "Could not read valid table metadata from empty-columns.meta.csv.json.",
    ],
    [
        "unreadable.csv", emptyCsv,
        { "unreadable.meta.csv.json": { code: "permission_denied", path: "unreadable.meta.csv.json" } },
        "You do not have permission to access unreadable.meta.csv.json.",
    ],
    ["duplicate-columns.table.json", emptyJson, { "duplicate-columns.meta.json.json": duplicateColumns }, "duplicate-columns.meta.json.json"],
    ["bad-metadata.table.jsonl", emptyJsonl, { "bad-metadata.meta.jsonl.json": "{columns: []}" }, "bad-metadata.meta.jsonl.json"],
] as const)("shows a load error for %s and keeps the source available", async (filename, content, metadata, error) => {
    await mount(content, filename, metadata);
    expect(root.textContent).toContain(error);
    expect(root.querySelector('[role="grid"]')).toBeNull();
    await context.editor.toggleSourceMode()?.();
    expect(root.querySelector(".cm-content")).not.toBeNull();
});
