/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { batch, createSignal } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { NavigateFileHandler } from "./AppContext";
import FileNavigation from "./FileNavigation";

const [basepath, setBasepath] = createSignal("/first");
const [filename, setFilename] = createSignal("");
const loadFilename = vi.fn(async (nextFilename: string) => {
    setFilename(nextFilename);
});
let navigateBackShortcut: NavigateFileHandler | null = null;
let navigateForwardShortcut: NavigateFileHandler | null = null;

vi.mock("./AppContext", () => ({
    useAppContext: () => ({
        main: {
            basepath,
            filename,
            loadFilename,
            setNavigateBack: (handler: NavigateFileHandler | null) => {
                navigateBackShortcut = handler;
            },
            setNavigateForward: (handler: NavigateFileHandler | null) => {
                navigateForwardShortcut = handler;
            },
        },
    }),
}));
vi.mock("./Localization", () => ({
    useI18N: () => ({ t: (key: string) => key }),
}));

describe("FileNavigation", () => {
    let dispose: (() => void) | undefined;

    const renderNavigation = () => {
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <FileNavigation />, root);
        return {
            back: root.querySelector<HTMLButtonElement>('[aria-label="toolbar.back"]'),
            forward: root.querySelector<HTMLButtonElement>('[aria-label="toolbar.forward"]'),
        };
    };

    afterEach(() => {
        dispose?.();
        dispose = undefined;
        document.body.replaceChildren();
        setBasepath("/first");
        setFilename("");
        loadFilename.mockClear();
        navigateBackShortcut = null;
        navigateForwardShortcut = null;
    });

    it("uses the borderless main bar button style", () => {
        const { back, forward } = renderNavigation();

        expect(back?.classList.contains("mainbar")).toBe(true);
        expect(forward?.classList.contains("mainbar")).toBe(true);
        expect(back?.classList.contains("toolbar")).toBe(false);
        expect(forward?.classList.contains("toolbar")).toBe(false);
    });

    it("navigates backward and forward without deleting history", () => {
        const { back, forward } = renderNavigation();

        setFilename("first.md");
        setFilename("second.md");

        back?.click();
        expect(filename()).toBe("first.md");
        expect(back?.disabled).toBe(false);
        expect(forward?.disabled).toBe(false);

        forward?.click();
        expect(filename()).toBe("second.md");
        expect(forward?.disabled).toBe(true);
        expect(loadFilename).toHaveBeenNthCalledWith(1, "first.md");
        expect(loadFilename).toHaveBeenNthCalledWith(2, "second.md");
    });

    it("registers shortcuts only while each navigation direction is available", async () => {
        renderNavigation();

        expect(navigateBackShortcut).toBeNull();
        expect(navigateForwardShortcut).toBeNull();

        setFilename("first.md");
        setFilename("second.md");
        expect(navigateBackShortcut).not.toBeNull();
        expect(navigateForwardShortcut).toBeNull();

        await navigateBackShortcut?.();
        expect(filename()).toBe("first.md");
        expect(navigateForwardShortcut).not.toBeNull();

        dispose?.();
        dispose = undefined;
        expect(navigateBackShortcut).toBeNull();
        expect(navigateForwardShortcut).toBeNull();
    });

    it("discards forward history when a different file is opened", () => {
        const { back, forward } = renderNavigation();

        setFilename("first.md");
        setFilename("second.md");
        back?.click();
        setFilename("branch.md");

        expect(forward?.disabled).toBe(true);
        back?.click();
        expect(filename()).toBe("first.md");
    });

    it("clears navigation history when the base path changes", () => {
        const { back, forward } = renderNavigation();

        setFilename("notes.md");
        expect(back?.disabled).toBe(false);

        batch(() => {
            setBasepath("/second");
            setFilename("");
        });
        expect(back?.disabled).toBe(true);
        expect(forward?.disabled).toBe(true);
    });
});
