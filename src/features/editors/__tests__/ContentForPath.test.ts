/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from "vitest";
import { contentForPath } from "../ContentForPath";
import EditorFolder from "../folder/EditorFolder";
import EditorMarkdown from "../markdown/EditorMarkdown";
import EditorMermaid from "../mermaid/EditorMermaid";
import EditorECharts from "../echarts/EditorECharts";
import EditorText from "../text/EditorText";
import EditorTable from "../table/EditorTable";

describe("contentForPath", () => {
    it.each(["README.md", "notes.markdown", "draft.mdown", "document.mkd"])(
        "opens %s with EditorMarkdown",
        (filename) => {
            const selection = contentForPath(filename, { kind: "file" });

            expect(selection?.kind).toBe("content");
            if (selection?.kind !== "content") return;
            expect(selection.component).toBe(EditorMarkdown);
            expect(selection.props).toEqual({});
        }
    );

    it.each(["diagram.mmd", "diagram.mermaid", "diagram.MMD", "diagram.MERMAID"])(
        "opens %s with EditorMermaid",
        (filename) => {
            const selection = contentForPath(filename, { kind: "file" });
            expect(selection?.kind).toBe("content");
            if (selection?.kind !== "content") return;
            expect(selection.component).toBe(EditorMermaid);
        }
    );

    it.each(["chart.echarts.json", "chart.ECHARTS.JSON", "folder/chart.echarts.json"])("opens %s with EditorECharts", filename => {
        const selection = contentForPath(filename, { kind: "file" });
        expect(selection?.kind).toBe("content");
        if (selection?.kind === "content") expect(selection.component).toBe(EditorECharts);
    });

    it.each(["chart.json", "chart.echarts.json.bak.json", "events.jsonl", "folder/events.JSONL"])("opens %s with EditorText", filename => {
        expect(contentForPath(filename, { kind: "file" })).toEqual({ kind: "content", component: EditorText, props: {} });
    });

    it.each(["data.csv", "folder/data.CSV", "data.table.json", "folder/data.TABLE.JSONL"])("opens %s with EditorTable", (filename) => {
        expect(contentForPath(filename, { kind: "file" })).toEqual({ kind: "content", component: EditorTable, props: {} });
    });

    it("opens LaTeX files with EditorText", () => {
        const selection = contentForPath("formula.tex", { kind: "file" });

        expect(selection?.kind).toBe("content");
        if (selection?.kind !== "content") return;
        expect(selection.component).toBe(EditorText);
        expect(selection.props).toEqual({});
    });

    it("selects EditorFolder from the path kind even if its name has a Markdown extension", () => {
        const selection = contentForPath("docs.md", { kind: "directory" });

        expect(selection?.kind).toBe("content");
        if (selection?.kind !== "content") return;
        expect(selection.component).toBe(EditorFolder);
    });

    it("handles unsupported paths and errors", () => {
        expect(contentForPath("socket", { kind: "other" })).toEqual({
            kind: "unsupported",
        });
        expect(contentForPath("missing.md", { kind: "error", error: "Not found" })).toEqual({
            kind: "error",
            error: "Not found",
        });
        expect(contentForPath("loading.md", undefined)).toBeUndefined();
    });
});
