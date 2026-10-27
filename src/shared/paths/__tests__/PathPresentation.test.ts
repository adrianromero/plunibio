/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from "vitest";
import { formatPathForDisplay } from "../PathPresentation";

describe("formatPathForDisplay", () => {
    it("hides the extended prefix from Windows drive paths", () => {
        expect(formatPathForDisplay("\\\\?\\C:\\Users\\ana\\Documents")).toBe(
            "C:\\Users\\ana\\Documents"
        );
        expect(formatPathForDisplay("\\\\?\\C:\\")).toBe("C:\\");
    });

    it("converts extended UNC paths to their familiar form", () => {
        expect(formatPathForDisplay("\\\\?\\UNC\\server\\share\\notes")).toBe(
            "\\\\server\\share\\notes"
        );
        expect(formatPathForDisplay("\\\\?\\unc\\server\\share")).toBe(
            "\\\\server\\share"
        );
    });

    it("leaves ordinary and unsupported paths unchanged", () => {
        expect(formatPathForDisplay("C:\\Users\\ana")).toBe("C:\\Users\\ana");
        expect(formatPathForDisplay("/home/ana/Documents")).toBe("/home/ana/Documents");
        expect(formatPathForDisplay("\\\\?\\Volume{1234}\\notes")).toBe(
            "\\\\?\\Volume{1234}\\notes"
        );
        expect(formatPathForDisplay("")).toBe("");
    });
});
