/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { vi } from "vitest";

class ResizeObserverStub implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

class IntersectionObserverStub implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "0px";
    readonly scrollMargin = "0px";
    readonly thresholds = [0];

    disconnect(): void {}
    observe(): void {}
    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
    unobserve(): void {}
}

class ClipboardEventStub extends Event implements ClipboardEvent {
    readonly clipboardData: DataTransfer | null;

    constructor(type: string, eventInitDict: ClipboardEventInit = {}) {
        super(type, eventInitDict);
        this.clipboardData = eventInitDict.clipboardData ?? null;
    }
}

class DragEventStub extends MouseEvent implements DragEvent {
    readonly dataTransfer: DataTransfer | null;

    constructor(type: string, eventInitDict: DragEventInit = {}) {
        super(type, eventInitDict);
        this.dataTransfer = eventInitDict.dataTransfer ?? null;
    }
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);
vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
vi.stubGlobal("ClipboardEvent", ClipboardEventStub);
vi.stubGlobal("DragEvent", DragEventStub);
vi.stubGlobal("matchMedia", () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: (): void => {},
    removeListener: (): void => {},
    addEventListener: (): void => {},
    removeEventListener: (): void => {},
    dispatchEvent: (): boolean => false,
}));

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: (): void => {},
});

Object.defineProperty(Document.prototype, "elementFromPoint", {
    configurable: true,
    value: function (this: Document): Element | null {
        return this.querySelector(".ProseMirror") ?? this.body;
    },
});

Object.defineProperties(Range.prototype, {
    getBoundingClientRect: {
        configurable: true,
        value: (): DOMRect => new DOMRect(),
    },
    getClientRects: {
        configurable: true,
        value: (): DOMRectList => {
            const rectangles: DOMRect[] = [];
            return {
                length: 0,
                item: (index: number): DOMRect | null => rectangles[index] ?? null,
                [Symbol.iterator]: () => rectangles[Symbol.iterator](),
            };
        },
    },
});
