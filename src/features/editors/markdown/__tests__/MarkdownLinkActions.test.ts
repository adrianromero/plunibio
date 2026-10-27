/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from "vitest";
import { editorViewCtx } from "@milkdown/kit/core";
import { runCrepeMarkdownAction } from "./support/crepeMarkdownTest";
import { createMarkdownLink } from "../MarkdownLinkActions";

describe("createMarkdownLink", () => {
    it("applies the link to the selected text", async () => {
        const result = await runCrepeMarkdownAction("Before [[selected text]] after", (ctx) => {
            const { from, to } = ctx.get(editorViewCtx).state.selection;
            createMarkdownLink(ctx, from, to, "./target.md");
        });

        expect(result.replace("[[", "").replace("]]", "").trimEnd()).toBe(
            "Before [selected text](./target.md) after"
        );
    });

    it("inserts the URL as linked text when the selection is empty", async () => {
        const result = await runCrepeMarkdownAction("Before [[]]after", (ctx) => {
            const { from, to } = ctx.get(editorViewCtx).state.selection;
            createMarkdownLink(ctx, from, to, "https://example.com");
        });

        expect(result.replace("[[", "").replace("]]", "").trimEnd()).toBe(
            "Before [https://example.com](https://example.com)after"
        );
    });
});
