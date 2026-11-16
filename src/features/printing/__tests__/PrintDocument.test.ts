/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPrintSnapshot, printDocument, waitForPrintContent } from "../PrintDocument";

afterEach(() => {
    window.dispatchEvent(new Event("afterprint"));
    document.body.replaceChildren();
    vi.restoreAllMocks();
});

describe("print documents", () => {
    it("numbers original lines including empty lines while preserving multiline highlighting", () => {
        const root = document.createElement("div");
        document.body.append(root);
        const code = "/* first\n\nlast */\n";
        const editor = new EditorView({ doc: code, extensions: [javascript()], parent: root });
        try {
            const printed = createPrintSnapshot(root, { lineNumbers: true }).querySelector(".print-code");
            expect(printed?.textContent).toBe(code);
            const lines = Array.from(printed?.querySelectorAll<HTMLElement>(".print-code-line") ?? []);
            expect(lines.map(line => line.dataset.lineNumber)).toEqual(["1", "2", "3", "4"]);
            expect(lines.map(line => line.textContent)).toEqual(["/* first", "", "last */", ""]);
            expect(lines[2].querySelector(".tok-comment")?.textContent).toBe("last */");
        } finally { editor.destroy(); }
    });

    it("highlights complete code without interpreting it as HTML", () => {
        const root = document.createElement("div");
        document.body.append(root);
        const code = Array.from({ length: 500 }, (_, i) => `const value${i} = "<tag>"; // comment`).join("\n");
        const editor = new EditorView({ doc: code, extensions: [javascript()], parent: root });
        try {
            const printed = createPrintSnapshot(root).querySelector(".print-code");
            expect(printed?.textContent).toBe(code);
            expect(printed?.querySelector(".tok-keyword")?.textContent).toBe("const");
            expect(printed?.querySelector(".tok-comment")?.textContent).toBe("// comment");
            expect(printed?.querySelector("tag")).toBeNull();
        } finally { editor.destroy(); }
    });

    it("copies complete virtualized code and keeps a diagram once without editor controls", () => {
        const root = document.createElement("div");
        root.innerHTML = '<div class="milkdown-code-block"><div class="tools">Copy</div><div class="mermaid-preview"><svg viewBox="0 0 100 50"></svg></div></div><div class="milkdown-table-block"><div class="handle">Drag</div><table><tr><td>Cell</td></tr></table></div>';
        document.body.append(root);
        const code = Array.from({ length: 500 }, (_, i) => `line ${i}`).join("\n");
        const editor = new EditorView({ doc: code, parent: root });
        try {
            const snapshot = createPrintSnapshot(root);
            expect(snapshot.querySelector(".print-code")?.textContent).toBe(code);
            expect(snapshot.querySelector(".print-code-line")).toBeNull();
            expect(snapshot.querySelectorAll("svg")).toHaveLength(1);
            expect(snapshot.querySelector(".tools, .handle, .cm-editor")).toBeNull();
            expect(snapshot.querySelector("td")?.textContent).toBe("Cell");
            expect(root.querySelector(".tools")).not.toBeNull();
        } finally { editor.destroy(); }
    });

    it("keeps a section title with its following content on page breaks", () => {
        const root = document.createElement("div");
        root.innerHTML = '<h2>City panorama</h2><p><img alt="City"></p><p>Following paragraph</p>';
        const snapshot = createPrintSnapshot(root);
        const group = snapshot.querySelector(".print-heading-group");
        expect(group?.firstElementChild?.tagName).toBe("H2");
        expect(group?.lastElementChild?.querySelector("img")?.alt).toBe("City");
        expect(snapshot.lastElementChild?.textContent).toBe("Following paragraph");
    });

    it("preserves image captions as text and removes resize controls", () => {
        const root = document.createElement("div");
        root.innerHTML = '<div class="milkdown-image-block"><div class="image-resize-handle"></div><input class="caption-input" value="Figure caption"></div>';
        const snapshot = createPrintSnapshot(root);
        expect(snapshot.querySelector(".print-image-caption")?.textContent).toBe("Figure caption");
        expect(snapshot.querySelector("input, .image-resize-handle")).toBeNull();
    });

    it("renames preview IDs and SVG references without changing the original", () => {
        const root = document.createElement("div");
        root.id = "preview";
        root.innerHTML = '<svg id="chart" width="600" height="400"><style>#chart .edge { marker-end: url(#arrow) }</style><defs><marker id="arrow"></marker></defs><path marker-end="url(#arrow)"></path></svg>';
        const snapshot = createPrintSnapshot(root);
        const svg = snapshot.querySelector("svg");
        const markerId = snapshot.querySelector("marker")?.id;
        expect(snapshot.id).not.toBe(root.id);
        expect(svg?.id).not.toBe("chart");
        expect(svg?.getAttribute("viewBox")).toBe("0 0 600 400");
        expect(snapshot.querySelector("path")?.getAttribute("marker-end")).toBe(`url(#${markerId})`);
        expect(snapshot.querySelector("style")?.textContent).toContain(`#${svg?.id} .edge`);
        expect(root.querySelector("svg")?.id).toBe("chart");
    });

    it("waits for a standalone preview's own busy state", async () => {
        const root = document.createElement("div");
        root.setAttribute("aria-busy", "true");
        document.body.append(root);
        let finished = false;
        const ready = waitForPrintContent(root, () => true).then(() => { finished = true; });
        await Promise.resolve();
        expect(finished).toBe(false);
        root.setAttribute("aria-busy", "false");
        await ready;
        expect(finished).toBe(true);
    });

    it("waits for previews and rejects failed or abandoned documents", async () => {
        const root = document.createElement("div");
        root.innerHTML = '<div aria-busy="true"></div>';
        document.body.append(root);
        const ready = waitForPrintContent(root, () => true);
        root.firstElementChild?.setAttribute("aria-busy", "false");
        await ready;
        root.innerHTML = '<div role="alert">Invalid chart</div>';
        await expect(waitForPrintContent(root, () => true)).rejects.toThrow("preview failed");
        await expect(waitForPrintContent(root, () => false)).rejects.toThrow("no longer active");
    });

    it("cleans up when a native asynchronous print request fails", async () => {
        document.title = "Plunibio";
        const root = document.createElement("div");
        document.body.append(root);
        vi.spyOn(window, "print").mockImplementation(async () => { throw new Error("Native print failed"); });
        await expect(printDocument(root, "notes.md", () => true)).rejects.toThrow("Native print failed");
        expect(document.querySelector(".print-document")).toBeNull();
        expect(document.title).toBe("Plunibio");
    });

    it("retains an isolated snapshot until afterprint and restores the title on cancellation", async () => {
        document.title = "Plunibio";
        const root = document.createElement("div");
        root.textContent = "Unsaved content";
        document.body.append(root);
        const releaseContent = vi.fn(() => { root.textContent = "Released content"; });
        const print = vi.spyOn(window, "print").mockImplementation(() => {
            expect(document.title).toBe("notes.md");
            expect(releaseContent).toHaveBeenCalledOnce();
            expect(root.textContent).toBe("Released content");
            expect(document.querySelector(".print-document")?.textContent).toBe("Unsaved content");
        });
        await printDocument(root, "notes.md", () => true, releaseContent);
        expect(print).toHaveBeenCalledOnce();
        root.textContent = "Later changes";
        expect(document.querySelector(".print-document")?.textContent).toBe("Unsaved content");
        window.dispatchEvent(new Event("afterprint"));
        expect(document.querySelector(".print-document")).toBeNull();
        expect(document.title).toBe("Plunibio");
    });
});
