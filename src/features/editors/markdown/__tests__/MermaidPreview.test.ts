/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { CodeBlockConfig } from "@milkdown/kit/component/code-block";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMermaidPreviewRenderer } from "../MermaidPreview";

type PreviewRenderer = CodeBlockConfig["renderPreview"];

afterEach(() => {
    document.body.replaceChildren();
    delete document.documentElement.dataset.theme;
});

function createRenderer(render: (id: string, content: string) => Promise<{ svg: string }>) {
    const fallback: PreviewRenderer = vi.fn(() => "fallback");
    const load = async () => ({ render, initialize: vi.fn() }) as never;
    const renderer = createMermaidPreviewRenderer(
        fallback,
        { loading: "Cargando...", errorText: "Diagrama no válido" },
        load
    );
    return { fallback, renderer };
}

describe("MermaidPreview", () => {
    it("delega los demás lenguajes al renderizador anterior", () => {
        const { fallback, renderer } = createRenderer(vi.fn());
        const applyPreview = vi.fn();

        expect(renderer("LaTeX", "x^2", applyPreview)).toBe("fallback");
        expect(fallback).toHaveBeenCalledWith("LaTeX", "x^2", applyPreview);
    });

    it("no muestra vista previa para un bloque Mermaid vacío", () => {
        const render = vi.fn();
        const { renderer } = createRenderer(render);

        expect(renderer("mermaid", "   ", vi.fn())).toBeNull();
        expect(render).not.toHaveBeenCalled();
    });

    it("renderiza Mermaid de forma asíncrona", async () => {
        const render = vi.fn(async () => ({ svg: '<svg aria-label="diagram"></svg>' }));
        const { renderer } = createRenderer(render);
        const applyPreview = vi.fn();
        const placeholder = renderer("Mermaid", "graph TD; A-->B;", applyPreview);

        expect(placeholder).toBeInstanceOf(HTMLElement);
        document.body.append(placeholder as HTMLElement);

        await vi.waitFor(() => {
            expect((applyPreview.mock.calls[0]?.[0] as HTMLElement).querySelector('svg[aria-label="diagram"]')).not.toBeNull();
        });
        expect(render).toHaveBeenCalledWith(
            expect.stringMatching(/^plunibio-mermaid-diagram-/),
            "graph TD; A-->B;"
        );
    });

    it("muestra de forma segura los errores de sintaxis", async () => {
        const render = vi.fn(async () => {
            throw new Error("Unexpected <script>alert(1)</script>\nmore details");
        });
        const { renderer } = createRenderer(render);
        const applyPreview = vi.fn();
        const placeholder = renderer("mermaid", "not a diagram", applyPreview);
        document.body.append(placeholder as HTMLElement);

        await vi.waitFor(() => expect(applyPreview).toHaveBeenCalledOnce());
        const error = applyPreview.mock.calls[0]?.[0];
        expect(error).toBeInstanceOf(HTMLElement);
        expect((error as HTMLElement).textContent).toContain(
            "Diagrama no válido: Unexpected <script>alert(1)</script>"
        );
        expect((error as HTMLElement).querySelector("script")).toBeNull();
    });

    it("descarta un resultado si su vista previa ya fue reemplazada", async () => {
        let finishFirstRender: ((value: { svg: string }) => void) | undefined;
        const render = vi
            .fn()
            .mockImplementationOnce(
                () =>
                    new Promise<{ svg: string }>((resolve) => {
                        finishFirstRender = resolve;
                    })
            )
            .mockResolvedValueOnce({ svg: "<svg>new</svg>" });
        const { renderer } = createRenderer(render);
        const firstApply = vi.fn();
        const secondApply = vi.fn();
        const first = renderer("mermaid", "graph TD; A-->B;", firstApply) as HTMLElement;
        document.body.append(first);
        const second = renderer("mermaid", "graph TD; A-->C;", secondApply) as HTMLElement;
        first.replaceWith(second);

        await vi.waitFor(() => expect(finishFirstRender).toBeTypeOf("function"));
        finishFirstRender?.({ svg: "<svg>old</svg>" });

        await vi.waitFor(() => expect((secondApply.mock.calls[0]?.[0] as HTMLElement)?.querySelector("svg")?.textContent).toBe("new"));
        expect(firstApply).not.toHaveBeenCalled();
    });

    it("actualiza la copia saneada de Milkdown al cambiar el tema y deja de observarla al eliminarla", async () => {
        document.documentElement.dataset.theme = "light";
        const render = vi.fn(async () => ({
            svg: `<svg>${document.documentElement.dataset.theme}</svg>`,
        }));
        const { renderer } = createRenderer(render);
        const applyPreview = vi.fn((result: string | HTMLElement | null) => {
            const live = document.querySelector(".mermaid-preview");
            // Milkdown sanitizes the result into a new DOM tree each time.
            if (result instanceof HTMLElement) live?.replaceWith(result.cloneNode(true));
        });
        const placeholder = renderer("mermaid", "flowchart LR; A-->B", applyPreview) as HTMLElement;
        document.body.append(placeholder.cloneNode(true));
        await vi.waitFor(() => expect(document.querySelector("svg")?.textContent).toBe("light"));
        document.documentElement.dataset.theme = "dark";
        await vi.waitFor(() => expect(document.querySelector("svg")?.textContent).toBe("dark"));
        expect(render).toHaveBeenCalledTimes(2);
        document.body.replaceChildren();
        await Promise.resolve();
        document.documentElement.dataset.theme = "light";
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(render).toHaveBeenCalledTimes(2);
    });

    it("descarta un render con el tema anterior si el tema cambia mientras está pendiente", async () => {
        document.documentElement.dataset.theme = "light";
        let finish: ((value: { svg: string }) => void) | undefined;
        const render = vi.fn()
            .mockImplementationOnce(() => new Promise<{ svg: string }>((resolve) => { finish = resolve; }))
            .mockResolvedValue({ svg: "<svg>dark</svg>" });
        const { renderer } = createRenderer(render);
        const applyPreview = vi.fn();
        document.body.append(renderer("mermaid", "flowchart LR; A-->B", applyPreview) as HTMLElement);
        await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
        document.documentElement.dataset.theme = "dark";
        await Promise.resolve();
        finish?.({ svg: "<svg>light</svg>" });
        await vi.waitFor(() => expect(applyPreview).toHaveBeenCalledOnce());
        expect((applyPreview.mock.calls[0]?.[0] as HTMLElement).textContent).toBe("dark");
    });

    it("mantiene la suscripción cuando Milkdown tarda en montar el placeholder", async () => {
        document.documentElement.dataset.theme = "light";
        let finish: ((value: { svg: string }) => void) | undefined;
        const render = vi.fn()
            .mockImplementationOnce(() => new Promise<{ svg: string }>((resolve) => { finish = resolve; }))
            .mockResolvedValue({ svg: "<svg>dark</svg>" });
        const { renderer } = createRenderer(render);
        const applyPreview = vi.fn((result: string | HTMLElement | null) => {
            if (result instanceof HTMLElement) document.querySelector(".mermaid-preview")?.replaceWith(result.cloneNode(true));
        });
        const placeholder = renderer("mermaid", "flowchart LR; A-->B", applyPreview) as HTMLElement;
        // Mermaid can mutate the document before Vue mounts the sanitized preview.
        document.body.append(document.createElement("div"));
        await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
        document.body.append(placeholder.cloneNode(true));
        finish?.({ svg: "<svg>light</svg>" });
        await vi.waitFor(() => expect(document.querySelector("svg")?.textContent).toBe("light"));
        document.documentElement.dataset.theme = "dark";
        await vi.waitFor(() => expect(document.querySelector("svg")?.textContent).toBe("dark"));
    });
});

