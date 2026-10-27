/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from "vitest";
import { translateAppError } from "./AppError";
import type { Translator } from "./Localization";

describe("translateAppError", () => {
    it("formats the canonical target of paths outside the workspace", () => {
        const t = vi.fn((key: string, values?: Record<string, string>) =>
            key === "backendErrors.path_outside_workspace"
                ? `${values?.path} -> ${values?.target}`
                : key
        ) as unknown as Translator;

        expect(
            translateAppError(
                {
                    code: "path_outside_workspace",
                    path: "Mis vídeos",
                    target: "\\\\?\\C:\\Users\\ana\\Videos",
                },
                t
            )
        ).toBe("Mis vídeos -> C:\\Users\\ana\\Videos");
    });
});
