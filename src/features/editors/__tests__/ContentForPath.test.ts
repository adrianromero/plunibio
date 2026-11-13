/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from "vitest";
import { contentForPath } from "../ContentForPath";
import EditorFolder from "../folder/EditorFolder";
import EditorMarkdown from "../markdown/EditorMarkdown";
import EditorMermaid from "../mermaid/EditorMermaid";
import EditorText from "../text/EditorText";

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
