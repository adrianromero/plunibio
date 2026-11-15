/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { observeCodeBlockLayout } from "../MarkdownCodeBlockLayout";

const reservedHeight = (block: HTMLElement): string => block.style.getPropertyValue("--code-block-reserved-height");
const settle = async (): Promise<void> => { await Promise.resolve(); await Promise.resolve(); };
const resizeEntry = (target: HTMLElement): ResizeObserverEntry => ({
    target, borderBoxSize: [], contentBoxSize: [], devicePixelContentBoxSize: [], contentRect: new DOMRect(),
});

describe("Markdown code block layout", () => {
    let root: HTMLElement;
    let block: HTMLElement;
    let height: number;
    let stop: () => void;
    let resized: ResizeObserverCallback;
    let disconnect: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        height = 460;
        root = document.createElement("div");
        block = document.createElement("div");
        block.className = "milkdown-code-block";
        root.append(block);
        document.body.append(root);
        vi.spyOn(block, "getBoundingClientRect").mockImplementation(() => new DOMRect(0, 0, 600, height));
        disconnect = vi.fn();
        vi.stubGlobal("ResizeObserver", class {
            constructor(callback: ResizeObserverCallback) { resized = callback; }
            observe = vi.fn();
            unobserve = vi.fn();
            disconnect = disconnect;
        });
    });
    afterEach(() => {
        stop?.();
        document.body.replaceChildren();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it.each([
        ['<div class="echarts-preview" aria-busy="false"><svg></svg></div>', '<div class="echarts-preview" aria-busy="true">Loading</div>'],
        ['<div class="mermaid-preview" aria-busy="false"><svg><text>old</text></svg></div>', '<div class="mermaid-preview" aria-busy="true">Loading</div>'],
        ['<div class="katex-display">x²</div>', '<div class="katex-display">y²</div>'],
    ])("preserves height across teardown and remount: %s", async (ready, pending) => {
        block.innerHTML = ready;
        stop = observeCodeBlockLayout(root);
        // A large raw JSON/diagram source must not replace the preview's height.
        height = 1800;
        block.innerHTML = '<pre class="milkdown-code-block-placeholder">source</pre>';
        await settle();
        expect(reservedHeight(block)).toBe("460px");
        resized([resizeEntry(block)], {} as ResizeObserver);
        block.innerHTML = pending;
        await settle();
        if (pending.includes('aria-busy="true"')) {
            expect(reservedHeight(block)).toBe("460px");
            height = 520;
            block.innerHTML = ready;
            await settle();
        }
        expect(reservedHeight(block)).toBe("");
        expect(block.classList.contains("code-block-layout-reserved")).toBe(false);
    });

    it("keeps independent heights for multiple ECharts blocks through interleaved remounts", async () => {
        const ready = '<div class="echarts-preview" aria-busy="false"><svg></svg></div>';
        const placeholder = '<pre class="milkdown-code-block-placeholder">source</pre>';
        const pending = '<div class="echarts-preview" aria-busy="true">Loading</div>';
        const short = document.createElement("div");
        short.className = "milkdown-code-block";
        vi.spyOn(short, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 600, 220));
        height = 900;
        block.innerHTML = ready;
        short.innerHTML = ready;
        root.append(short);
        stop = observeCodeBlockLayout(root);
        block.innerHTML = placeholder;
        await settle();
        short.innerHTML = placeholder;
        await settle();
        expect(reservedHeight(block)).toBe("900px");
        expect(reservedHeight(short)).toBe("220px");
        short.innerHTML = pending;
        block.innerHTML = pending;
        await settle();
        expect(reservedHeight(short)).toBe("220px");
        expect(reservedHeight(block)).toBe("900px");
        short.querySelector(".echarts-preview")?.setAttribute("aria-busy", "false");
        await settle();
        expect(reservedHeight(short)).toBe("");
        expect(reservedHeight(block)).toBe("900px");
        short.innerHTML = placeholder;
        await settle();
        expect(reservedHeight(short)).toBe("220px");
    });

    it("keeps the last sanitized Mermaid diagram visible until the replacement is ready", async () => {
        block.innerHTML = '<div class="mermaid-preview" aria-busy="false"><svg><text>previous</text></svg></div>';
        stop = observeCodeBlockLayout(root);
        block.innerHTML = '<div class="mermaid-preview" aria-busy="true"><div role="status">Loading</div></div>';
        await settle();
        expect(block.querySelector("svg")?.textContent).toBe("previous");
        expect(reservedHeight(block)).toBe("460px");
        block.innerHTML = '<div class="mermaid-preview" aria-busy="false"><svg><text>next</text></svg></div>';
        await settle();
        expect(block.querySelector("svg")?.textContent).toBe("next");
        expect(reservedHeight(block)).toBe("");
    });

    it("accepts real size changes and ignores hidden editor measurements", async () => {
        block.innerHTML = '<div class="katex-display">formula</div>';
        stop = observeCodeBlockLayout(root);
        height = 720;
        resized([resizeEntry(block)], {} as ResizeObserver);
        height = 0;
        resized([resizeEntry(block)], {} as ResizeObserver);
        block.innerHTML = '<pre class="milkdown-code-block-placeholder">source</pre>';
        await settle();
        expect(reservedHeight(block)).toBe("720px");
        height = 250;
        block.innerHTML = '<div class="katex-display">edited</div>';
        await settle();
        block.innerHTML = '<pre class="milkdown-code-block-placeholder">edited</pre>';
        await settle();
        expect(reservedHeight(block)).toBe("250px");
    });

    it("tracks inserted blocks and releases reservations on removal and editor destruction", async () => {
        stop = observeCodeBlockLayout(root);
        const inserted = block.cloneNode() as HTMLElement;
        vi.spyOn(inserted, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 600, 350));
        inserted.innerHTML = '<div class="katex-display">formula</div>';
        root.append(inserted);
        await settle();
        inserted.innerHTML = '<pre class="milkdown-code-block-placeholder">source</pre>';
        await settle();
        expect(reservedHeight(inserted)).toBe("350px");
        inserted.remove();
        await settle();
        expect(reservedHeight(inserted)).toBe("");
        block.innerHTML = '<pre class="milkdown-code-block-placeholder">source</pre>';
        await settle();
        stop();
        expect(reservedHeight(block)).toBe("");
        expect(disconnect).toHaveBeenCalledOnce();
    });
});
