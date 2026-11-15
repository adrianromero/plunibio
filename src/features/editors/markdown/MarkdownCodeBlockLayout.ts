/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */

import { prosePluginsCtx } from "@milkdown/kit/core";
import type { Ctx } from "@milkdown/kit/ctx";
import { Plugin } from "@milkdown/kit/prose/state";
import "./MarkdownCodeBlockLayout.css";

const selector = ".milkdown-code-block";

type BlockLayout = {
    height: number;
    mermaid: SVGElement | null;
    retainedMermaid: SVGElement | null;
};

/** Milkdown replaces off-screen code blocks with a raw <pre> after five seconds.
 * Keep their last rendered border-box height until the mounted preview is ready.
 * This also covers LaTeX, which uses the same code-block node view. */
export function observeCodeBlockLayout(root: HTMLElement): () => void {
    const blocks = new Map<HTMLElement, BlockLayout>();
    const release = (block: HTMLElement): void => {
        block.classList.remove("code-block-layout-reserved");
        block.style.removeProperty("--code-block-reserved-height");
    };
    const measure = (block: HTMLElement, layout: BlockLayout): void => {
        const height = block.getBoundingClientRect().height;
        // Switching editor modes hides the whole view. Never cache zero sizes.
        if (height > 0) layout.height = height;
    };
    const reconcile = (block: HTMLElement, layout: BlockLayout): void => {
        const placeholder = block.querySelector(".milkdown-code-block-placeholder");
        const mermaid = block.querySelector<HTMLElement>('.mermaid-preview[aria-busy="true"]');
        const loading = mermaid || block.querySelector('.echarts-preview:not([aria-busy="false"])');
        if (placeholder || loading) {
            if (layout.height > 0) {
                block.style.setProperty("--code-block-reserved-height", `${layout.height}px`);
                block.classList.add("code-block-layout-reserved");
            }
            // The snapshot comes from Milkdown's sanitized live DOM. Keep the
            // previous diagram visible while a replacement is being rendered.
            if (mermaid && layout.retainedMermaid && !mermaid.querySelector("svg")) {
                mermaid.append(layout.retainedMermaid.cloneNode(true));
            }
            return;
        }
        release(block);
        measure(block, layout);
        const svg = block.querySelector<SVGElement>(".mermaid-preview svg");
        if (svg !== layout.mermaid) {
            layout.mermaid = svg;
            layout.retainedMermaid = svg ? svg.cloneNode(true) as SVGElement : null;
        }
    };
    const resize = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const block = entry.target as HTMLElement;
            const layout = blocks.get(block);
            if (layout && !block.classList.contains("code-block-layout-reserved")) reconcile(block, layout);
        }
    });
    const register = (block: HTMLElement): void => {
        if (blocks.has(block)) return;
        const layout: BlockLayout = { height: 0, mermaid: null, retainedMermaid: null };
        blocks.set(block, layout);
        resize.observe(block);
        reconcile(block, layout);
    };
    const mutations = new MutationObserver((records) => {
        const dirty = new Set<HTMLElement>();
        for (const record of records) {
            const target = record.target instanceof Element ? record.target : record.target.parentElement;
            const block = target?.closest<HTMLElement>(selector);
            if (block && blocks.has(block)) dirty.add(block);
            for (const added of record.addedNodes) {
                if (!(added instanceof HTMLElement)) continue;
                if (added.matches(selector)) register(added);
                added.querySelectorAll<HTMLElement>(selector).forEach(register);
            }
        }
        for (const [block] of blocks) {
            if (root.contains(block)) continue;
            resize.unobserve(block);
            blocks.delete(block);
            release(block);
        }
        for (const block of dirty) {
            const layout = blocks.get(block);
            if (layout) reconcile(block, layout);
        }
    });
    root.querySelectorAll<HTMLElement>(selector).forEach(register);
    mutations.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-busy"] });
    return () => {
        mutations.disconnect();
        resize.disconnect();
        blocks.forEach((_, block) => release(block));
        blocks.clear();
    };
}

export function configureCodeBlockLayout(ctx: Ctx): void {
    ctx.update(prosePluginsCtx, (plugins) => [...plugins, new Plugin({
        view: (view) => ({ destroy: observeCodeBlockLayout(view.dom) }),
    })]);
}
