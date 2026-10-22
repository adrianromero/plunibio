/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from "vitest";
import { contentForPath } from "./ContentForPath";
import EditorFolder from "./EditorFolder";
import EditorMarkdown from "./EditorMarkdown";
import EditorText from "./EditorText";

describe("contentForPath", () => {
    it.each(["README.md", "notes.markdown", "draft.mdown", "document.mkd"])(
        "opens %s with EditorMarkdown and enables its menu section",
        (filename) => {
            const selection = contentForPath(filename, { kind: "file" });

            expect(selection?.kind).toBe("content");
            if (selection?.kind !== "content") return;
            expect(selection.component).toBe(EditorMarkdown);
            expect(selection.toolbarSections).toEqual(["markdown"]);
        }
    );

    it("opens LaTeX files with EditorText without contextual menu sections", () => {
        const selection = contentForPath("formula.tex", { kind: "file" });

        expect(selection?.kind).toBe("content");
        if (selection?.kind !== "content") return;
        expect(selection.component).toBe(EditorText);
        expect(selection.props.extensions).toHaveLength(1);
        expect(selection.toolbarSections).toEqual([]);
    });

    it("selects EditorFolder from the path kind even if its name has a Markdown extension", () => {
        const selection = contentForPath("docs.md", { kind: "directory" });

        expect(selection?.kind).toBe("content");
        if (selection?.kind !== "content") return;
        expect(selection.component).toBe(EditorFolder);
        expect(selection.toolbarSections).toEqual(["files"]);
    });

    it("does not expose contextual sections for unsupported paths and errors", () => {
        expect(contentForPath("socket", { kind: "other" })).toEqual({
            kind: "unsupported",
            toolbarSections: [],
        });
        expect(contentForPath("missing.md", { kind: "error", error: "Not found" })).toEqual({
            kind: "error",
            error: "Not found",
            toolbarSections: [],
        });
        expect(contentForPath("loading.md", undefined)).toBeUndefined();
    });
});
