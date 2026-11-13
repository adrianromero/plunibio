/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { mermaidThemeConfig } from "../MermaidTheme";
import { renderMermaid, type MermaidApi } from "../MermaidRenderer";

afterEach(() => {
    document.documentElement.removeAttribute("style");
    delete document.documentElement.dataset.theme;
});

describe("Mermaid theme", () => {
    it("resolves Plunibio CSS colors to opaque hex colors for the theme engine", () => {
        document.documentElement.dataset.theme = "dark";
        document.documentElement.style.setProperty("--color-secondary", "hsl(210, 50%, 20%)");
        document.documentElement.style.setProperty("--color-text", "rgb(220, 230, 240)");
        document.documentElement.style.setProperty("--color-surface", "#123456");
        const config = mermaidThemeConfig();
        expect(config.theme).toBe("base");
        expect(config.themeVariables).toMatchObject({
            darkMode: true,
            primaryColor: "#1a334d",
            primaryTextColor: "#dce6f0",
            background: "#123456",
        });
        for (const [key, value] of Object.entries(config.themeVariables)) {
            if (key !== "darkMode") expect(value).toMatch(/^#[\da-f]{6}$/);
        }
        expect(document.documentElement.querySelector("span[hidden]")).toBeNull();
    });

    it("keeps theme initialization and asynchronous rendering serialized", async () => {
        document.documentElement.dataset.theme = "light";
        let finish: ((value: { svg: string }) => void) | undefined;
        const initialize = vi.fn();
        const render = vi.fn()
            .mockImplementationOnce(() => new Promise<{ svg: string }>((resolve) => { finish = resolve; }))
            .mockResolvedValueOnce({ svg: "dark" });
        const load = async () => ({ initialize, render }) as unknown as MermaidApi;
        const first = renderMermaid("light", "flowchart LR; A-->B", load);
        await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
        document.documentElement.dataset.theme = "dark";
        const second = renderMermaid("dark", "flowchart LR; C-->D", load);
        await Promise.resolve();
        expect(initialize).toHaveBeenCalledTimes(1);
        expect(initialize.mock.calls[0]?.[0].themeVariables.darkMode).toBe(false);
        finish?.({ svg: "light" });
        expect(await first).toBe("light");
        expect(await second).toBe("dark");
        expect(initialize.mock.calls[1]?.[0].themeVariables.darkMode).toBe(true);
    });
});
