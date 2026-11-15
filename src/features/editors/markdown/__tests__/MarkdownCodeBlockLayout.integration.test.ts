/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */

import { Crepe } from "@milkdown/crepe";
import { codeBlockConfig } from "@milkdown/kit/component/code-block";
import { afterEach, expect, it, vi } from "vitest";
import { configureCodeBlockLayout } from "../MarkdownCodeBlockLayout";
import { markdownCodeBlockView } from "../MarkdownCodeBlock";

let crepe: Crepe | undefined;
afterEach(async () => {
    await crepe?.destroy();
    crepe = undefined;
    document.body.replaceChildren();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

it("preserves the height through Milkdown's actual five-second teardown for ECharts, Mermaid and LaTeX", async () => {
    const visibility = new Map<Element, (visible: boolean) => void>();
    vi.stubGlobal("IntersectionObserver", class {
        constructor(private callback: IntersectionObserverCallback) {}
        observe(target: Element): void {
            visibility.set(target, (visible) => this.callback([
                { target, isIntersecting: visible } as IntersectionObserverEntry,
            ], this as unknown as IntersectionObserver));
        }
        unobserve(target: Element): void { visibility.delete(target); }
        disconnect(): void {}
    });
    // jsdom has no layout; simulate very tall source replacing a short preview.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
        return new DOMRect(0, 0, 600, this.querySelector(".milkdown-code-block-placeholder") ? 1800 : 440);
    });
    const root = document.createElement("div");
    document.body.append(root);
    crepe = new Crepe({
        root,
        defaultValue: '```ECharts\n{}\n```\n\n```Mermaid\ngraph TD; A-->B\n```\n\n$$\nx^2\n$$\n',
        features: { [Crepe.Feature.Toolbar]: false, [Crepe.Feature.BlockEdit]: false },
        featureConfigs: { [Crepe.Feature.CodeMirror]: { previewOnlyByDefault: true } },
    });
    crepe.editor.config(configureCodeBlockLayout);
    crepe.editor.use(markdownCodeBlockView);
    crepe.editor.config((ctx) => ctx.update(codeBlockConfig.key, (config) => ({
        ...config,
        renderPreview: (language, content, apply) => {
            if (["echarts", "mermaid"].includes(language.toLowerCase())) {
                const preview = document.createElement("div");
                preview.className = `${language.toLowerCase()}-preview`;
                preview.setAttribute("aria-busy", "false");
                preview.innerHTML = "<svg></svg>";
                return preview;
            }
            // Exercise Crepe's real KaTeX renderer for the third block.
            return config.renderPreview(language, content, apply);
        },
    })));
    await crepe.create();
    const blocks = [...root.querySelectorAll<HTMLElement>(".milkdown-code-block")];
    expect(blocks).toHaveLength(3);
    blocks.forEach((block) => visibility.get(block)?.(true));
    await vi.waitFor(() => {
        expect(root.querySelector(".echarts-preview")).not.toBeNull();
        expect(root.querySelector(".mermaid-preview")).not.toBeNull();
        expect(root.querySelector(".katex-display")).not.toBeNull();
    });
    blocks.forEach((block) => visibility.get(block)?.(false));
    await vi.waitFor(() => {
        for (const block of blocks) {
            expect(block.querySelector(".milkdown-code-block-placeholder")).not.toBeNull();
            expect(block.style.getPropertyValue("--code-block-reserved-height")).toBe("440px");
        }
    }, { timeout: 6500, interval: 100 });
    blocks.forEach((block) => visibility.get(block)?.(true));
    await vi.waitFor(() => {
        for (const block of blocks) {
            expect(block.querySelector(".milkdown-code-block-placeholder")).toBeNull();
            expect(block.style.getPropertyValue("--code-block-reserved-height")).toBe("");
        }
        expect(root.querySelector(".katex-display")).not.toBeNull();
    });
}, 15000);
