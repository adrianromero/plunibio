/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */

import { invoke } from "@tauri-apps/api/core";
import { EditorView } from "@codemirror/view";
import { ensureSyntaxTree } from "@codemirror/language";
import { classHighlighter, highlightTree } from "@lezer/highlight";
import { renderPrintPreviews } from "./PrintPreviews";
import "./PrintDocument.css";

let snapshotId = 0;
let cleanupPrevious: (() => void) | undefined;

type PrintOptions = { lineNumbers?: boolean };

function numberCodeLines(pre: HTMLElement): void {
    const fragments = Array.from(pre.childNodes);
    pre.replaceChildren();
    pre.classList.add("print-code-numbered");
    let number = 0;
    const addLine = (): HTMLSpanElement => {
        const line = document.createElement("span");
        line.className = "print-code-line";
        line.dataset.lineNumber = String(++number);
        pre.append(line);
        return line;
    };
    let line = addLine();
    for (const fragment of fragments) {
        const parts = (fragment.textContent ?? "").split("\n");
        parts.forEach((part, index) => {
            if (index > 0) {
                pre.append(document.createTextNode("\n"));
                line = addLine();
            }
            if (fragment instanceof HTMLElement) {
                const token = fragment.cloneNode(false) as HTMLElement;
                token.textContent = part;
                line.append(token);
            } else {
                line.append(document.createTextNode(part));
            }
        });
    }
    pre.style.setProperty("--print-line-number-width", `${String(number).length}ch`);
}

function appendHighlightedCode(pre: HTMLElement, editor: EditorView): void {
    const source = editor.state.doc.toString();
    const tree = ensureSyntaxTree(editor.state, source.length, 1000);
    if (!tree) {
        pre.textContent = source;
        return;
    }
    let offset = 0;
    highlightTree(tree, classHighlighter, (from, to, classes) => {
        pre.append(document.createTextNode(source.slice(offset, from)));
        const span = document.createElement("span");
        span.className = classes;
        span.textContent = source.slice(from, to);
        pre.append(span);
        offset = to;
    });
    pre.append(document.createTextNode(source.slice(offset)));
}

/** Wait for asynchronous previews without printing a loading placeholder. */
export async function waitForPrintContent(root: HTMLElement, valid: () => boolean): Promise<void> {
    const deadline = Date.now() + 15000;
    while (true) {
        if (!valid() || !root.isConnected) throw new Error("Print document is no longer active");
        if (root.querySelector('[role="alert"], .mermaid-preview-error, .echarts-preview-error')) {
            throw new Error("A document preview failed");
        }
        if (!root.matches('[aria-busy="true"]') && !root.querySelector('[aria-busy="true"]')) return;
        if (Date.now() >= deadline) throw new Error("Timed out waiting for document previews");
        await new Promise<void>((resolve) => setTimeout(resolve, 50));
    }
}

export function createPrintSnapshot(content: HTMLElement, options: PrintOptions = {}): HTMLElement {
    const snapshot = content.cloneNode(true) as HTMLElement;
    // CodeMirror virtualizes long blocks: the DOM contains only visible lines.
    const originals = content.querySelectorAll<HTMLElement>(".cm-editor");
    snapshot.querySelectorAll<HTMLElement>(".cm-editor").forEach((copy, index) => {
        const editor = EditorView.findFromDOM(originals[index]);
        const pre = document.createElement("pre");
        pre.className = "print-code";
        if (editor) appendHighlightedCode(pre, editor);
        else pre.textContent = copy.textContent;
        if (options.lineNumbers) numberCodeLines(pre);
        copy.replaceWith(pre);
    });
    snapshot.querySelectorAll(".milkdown-code-block").forEach((block) => {
        const preview = block.querySelector(".mermaid-preview, .echarts-preview");
        if (preview) {
            // Print diagrams once, independently of the preview/source toggle.
            block.replaceChildren(preview);
        }
    });
    snapshot.querySelectorAll<HTMLInputElement>(".caption-input").forEach((input) => {
        const caption = document.createElement("div");
        caption.className = "print-image-caption";
        caption.textContent = input.value;
        input.replaceWith(caption);
    });
    snapshot.querySelectorAll("button, input, .image-resize-handle, .tools, .preview-label, .preview-divider, .milkdown-block-handle, .milkdown-image-block .operation, .milkdown-table-block .handle, .milkdown-table-block .drag-preview").forEach((control) => control.remove());
    snapshot.querySelectorAll("[contenteditable]").forEach((element) => element.removeAttribute("contenteditable"));
    [snapshot, ...snapshot.querySelectorAll<HTMLElement>(".mermaid-preview, .echarts-preview")].forEach((preview) => {
        if (!preview.matches(".mermaid-preview, .echarts-preview")) return;
        preview.dataset.theme = "light";
    });
    snapshot.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
        image.loading = "eager";
    });
    // Clones must not become live preview subscription targets. Rename IDs,
    // including SVG markers, and preserve their internal references.
    const prefix = `plunibio-print-${++snapshotId}-`;
    const ids = new Map<string, string>();
    const elements = [snapshot, ...snapshot.querySelectorAll("*")];
    for (const element of elements) {
        if (element.id) { ids.set(element.id, prefix + element.id); element.id = prefix + element.id; }
        element.classList.remove("ProseMirror-selectednode", "selected");
    }
    for (const element of elements) {
        for (const attribute of Array.from(element.attributes)) {
            if (attribute.name === "id") continue;
            let value = attribute.value;
            for (const [oldId, newId] of ids) {
                value = value.split(`url(#${oldId})`).join(`url(#${newId})`);
                if ((attribute.name === "href" || attribute.name === "xlink:href") && value === `#${oldId}`) value = `#${newId}`;
                if (attribute.name === "aria-labelledby" || attribute.name === "aria-describedby") {
                    value = value.split(" ").map(id => id === oldId ? newId : id).join(" ");
                }
            }
            if (value !== attribute.value) element.setAttribute(attribute.name, value);
        }
        if (element.tagName.toLowerCase() === "style") {
            let css = element.textContent ?? "";
            for (const [oldId, newId] of ids) {
                const escaped = oldId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                css = css.replace(new RegExp(`#${escaped}(?=[\\s{.:>+~\\[),]|$)`, "g"), `#${newId}`);
            }
            element.textContent = css;
        }
    }
    snapshot.querySelectorAll<SVGSVGElement>("svg").forEach((svg) => {
        // ECharts supplies pixel dimensions without a viewBox. Add one so the
        // entire vector chart scales to paper width instead of being clipped.
        if (!svg.hasAttribute("viewBox")) {
            const width = parseFloat(svg.getAttribute("width") ?? "");
            const height = parseFloat(svg.getAttribute("height") ?? "");
            if (width > 0 && height > 0) svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        }
    });
    snapshot.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
        const next = heading.nextElementSibling;
        if (!next || /^H[1-6]$/.test(next.tagName)) return;
        const group = document.createElement("section");
        group.className = "print-heading-group";
        heading.before(group);
        group.append(heading, next);
    });
    return snapshot;
}

export async function printDocument(content: HTMLElement, title: string, valid: () => boolean, releaseContent?: () => void, options: PrintOptions = {}): Promise<void> {
    cleanupPrevious?.();
    const root = document.createElement("article");
    root.className = "print-document";
    root.dataset.theme = "light";
    root.append(createPrintSnapshot(content, options));
    document.body.append(root);
    let assetTimeout: ReturnType<typeof setTimeout> | undefined;
    try {
        root.classList.add("print-preparing");
        await renderPrintPreviews(root);
        root.classList.remove("print-preparing");
        await Promise.race([
            Promise.all([
                document.fonts?.ready,
                ...Array.from(root.querySelectorAll("img"), image => image.decode()),
            ]),
            new Promise<never>((_, reject) => {
                assetTimeout = setTimeout(() => reject(new Error("Timed out loading print assets")), 15000);
            }),
        ]).finally(() => clearTimeout(assetTimeout));
        if (!valid()) throw new Error("Print document is no longer active");
        releaseContent?.();
        // Let the editor update its selection before the native dialog appears.
        await Promise.resolve();
        if (!valid()) throw new Error("Print document is no longer active");
        const previousTitle = document.title;
        document.title = title;
        const cleanup = (): void => {
            root.remove();
            document.title = previousTitle;
            window.removeEventListener("afterprint", cleanup);
            if (cleanupPrevious === cleanup) cleanupPrevious = undefined;
        };
        cleanupPrevious = cleanup;
        window.addEventListener("afterprint", cleanup);
        try {
            if ("__TAURI_INTERNALS__" in window && /Linux/.test(navigator.userAgent)) {
                const outputPath = import.meta.env.VITE_PLUNIBIO_AUTOMATION === "1"
                    ? document.documentElement.dataset.automationPrintOutput : undefined;
                await invoke("plugin:printing|print_document", { outputPath });
                cleanup();
            } else {
                await window.print();
            }
        } catch (error: unknown) { cleanup(); throw error; }
        // Some webviews return before the dialog closes. Keep the snapshot
        // until afterprint (or the next print), rather than removing it early.
    } catch (error: unknown) {
        root.remove();
        throw error;
    }
}

