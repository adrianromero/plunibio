/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { invoke } from "@tauri-apps/api/core";
import { render } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProvider, type AppContextValues, useAppContext } from "../AppContext";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn(async () => undefined) }));
vi.mock("@tauri-apps/api/window", () => ({
    getCurrentWindow: () => ({
        onCloseRequested: vi.fn(async () => vi.fn()),
        destroy: vi.fn(async () => undefined),
    }),
}));
vi.mock("@/i18n/Localization", () => ({
    useI18N: () => ({ t: (key: string) => key }),
}));
vi.mock("@/shared/ui/dialog/Dialog", () => ({ default: () => null }));
vi.mock("@/shared/ui/SpinnerPanel", () => ({ SpinnerPanel: () => null }));
vi.mock("@/features/workspace/OpenWorkspaceDialog", () => ({
    default: (props: {
        open: boolean;
        onConfirm: (path: string) => Promise<boolean>;
    }) => (
        <button
            data-testid="confirm-workspace"
            disabled={!props.open}
            onClick={() => void props.onConfirm("/new-workspace")}
        />
    ),
}));
vi.mock("@/features/about/AboutDialog", () => ({
    default: (props: { open: boolean; onClose: () => void }) => (
        <button data-testid="close-about" disabled={!props.open} onClick={props.onClose} />
    ),
}));

describe("AppProvider workspace changes", () => {
    let dispose: (() => void) | undefined;

    afterEach(() => {
        dispose?.();
        dispose = undefined;
        document.body.replaceChildren();
        vi.mocked(invoke).mockReset();
    });

    const pressShortcut = (key: string, code: string): KeyboardEvent => {
        const event = new KeyboardEvent("keydown", {
            key,
            code,
            ctrlKey: true,
            altKey: true,
            bubbles: true,
            cancelable: true,
        });
        document.dispatchEvent(event);
        return event;
    };

    const renderProvider = (): AppContextValues => {
        let context: AppContextValues | undefined;

        function Probe() {
            context = useAppContext();
            return null;
        }

        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <AppProvider initialBasepath="/workspace" initialFilename="note.md">
                    <Probe />
                </AppProvider>
            ),
            root
        );

        if (!context) throw new Error("App context was not initialized");
        return context;
    };

    it("routes navigation and sidebar shortcuts only to registered handlers", () => {
        const context = renderProvider();
        const navigateBack = vi.fn(() => Promise.resolve());
        const navigateForward = vi.fn(() => Promise.resolve());
        const toggleSidebar = vi.fn();
        context.main.setNavigateBack(navigateBack);
        context.main.setNavigateForward(navigateForward);
        context.editor.setToggleSidebar(toggleSidebar);

        expect(pressShortcut(",", "Comma").defaultPrevented).toBe(true);
        expect(pressShortcut(".", "Period").defaultPrevented).toBe(true);
        expect(pressShortcut("b", "KeyX").defaultPrevented).toBe(true);
        expect(navigateBack).toHaveBeenCalledOnce();
        expect(navigateForward).toHaveBeenCalledOnce();
        expect(toggleSidebar).toHaveBeenCalledOnce();

        context.main.setNavigateBack(null);
        context.editor.setToggleSidebar(null);
        pressShortcut(",", "Comma");
        pressShortcut("b", "KeyX");
        expect(navigateBack).toHaveBeenCalledOnce();
        expect(toggleSidebar).toHaveBeenCalledOnce();
    });

    it("opens and closes the About dialog through the application context", () => {
        const context = renderProvider();
        const closeButton = document.querySelector<HTMLButtonElement>(
            '[data-testid="close-about"]'
        );

        expect(closeButton?.disabled).toBe(true);
        context.main.showAbout();
        expect(closeButton?.disabled).toBe(false);
        closeButton?.click();
        expect(closeButton?.disabled).toBe(true);
    });

    it("uses a friendly Windows path in the window title", async () => {
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <AppProvider
                    initialBasepath={"\\\\?\\C:\\Users\\ana\\Documents"}
                    initialFilename=""
                >
                    <div />
                </AppProvider>
            ),
            root
        );

        await vi.waitFor(() =>
            expect(invoke).toHaveBeenCalledWith("set_window_title", {
                title: "Plunibio - C:\\Users\\ana\\Documents",
            })
        );
    });

    it("blocks shortcuts while loading or while any dialog is open", () => {
        const context = renderProvider();
        const navigateBack = vi.fn(() => Promise.resolve());
        context.main.setNavigateBack(navigateBack);

        context.spinner.showSpinner();
        pressShortcut(",", "Comma");
        expect(navigateBack).not.toHaveBeenCalled();
        context.spinner.hideSpinner();

        const dialog = document.createElement("dialog");
        dialog.setAttribute("open", "");
        document.body.append(dialog);
        pressShortcut(",", "Comma");
        expect(navigateBack).not.toHaveBeenCalled();

        dialog.remove();
        pressShortcut(",", "Comma");
        expect(navigateBack).toHaveBeenCalledOnce();
    });

    it("saves pending editor changes before changing basepath and filename", async () => {
        const calls: string[] = [];
        vi.mocked(invoke).mockImplementation(async command => {
            if (command === "set_current_basepath") {
                calls.push("backend");
                return { basepath: "/new-workspace", filename: "" };
            }
            return undefined;
        });
        let context: AppContextValues | undefined;

        function Probe() {
            context = useAppContext();
            context.main.setOnunload(async () => {
                calls.push("save");
            });
            return null;
        }

        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <AppProvider initialBasepath="/old-workspace" initialFilename="note.md">
                    <Probe />
                </AppProvider>
            ),
            root
        );

        await vi.waitFor(() =>
            expect(invoke).toHaveBeenCalledWith("set_window_title", {
                title: "Plunibio - /old-workspace",
            })
        );

        context?.main.openWorkspace();
        root.querySelector<HTMLButtonElement>('[data-testid="confirm-workspace"]')?.click();

        await vi.waitFor(() => expect(context?.main.basepath()).toBe("/new-workspace"));
        await vi.waitFor(() =>
            expect(invoke).toHaveBeenCalledWith("set_window_title", {
                title: "Plunibio - /new-workspace",
            })
        );
        expect(context?.main.filename()).toBe("");
        expect(calls).toEqual(["save", "backend"]);
    });
});
