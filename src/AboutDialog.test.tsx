/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { getName, getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AboutDialog from "./AboutDialog";

vi.mock("@tauri-apps/api/app", () => ({
    getName: vi.fn(async () => "Plunibio"),
    getVersion: vi.fn(async () => "1.2.3"),
}));

vi.mock("@tauri-apps/plugin-opener", () => ({
    openUrl: vi.fn(async () => undefined),
}));

vi.mock("./Localization", () => ({
    useI18N: () => ({
        t: (key: string, params?: Record<string, string>) =>
            key === "about.version" ? `Version ${params?.version}` : key,
    }),
}));

describe("AboutDialog", () => {
    let dispose: (() => void) | undefined;

    beforeEach(() => {
        vi.mocked(getName).mockClear();
        vi.mocked(getVersion).mockClear();
        vi.mocked(openUrl).mockClear();

        if (typeof HTMLDialogElement.prototype.showModal !== "function") {
            Object.defineProperties(HTMLDialogElement.prototype, {
                showModal: {
                    configurable: true,
                    value(this: HTMLDialogElement): void {
                        this.setAttribute("open", "");
                    },
                },
                close: {
                    configurable: true,
                    value(this: HTMLDialogElement): void {
                        this.removeAttribute("open");
                    },
                },
            });
        }
    });

    afterEach(() => {
        dispose?.();
        dispose = undefined;
        document.body.replaceChildren();
    });

    it("shows application details and opens the project links externally", async () => {
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(() => <AboutDialog open onClose={vi.fn()} />, root);

        await vi.waitFor(() => expect(root.textContent).toContain("Version 1.2.3"));
        expect(root.textContent).toContain("Plunibio");
        expect(root.textContent).toContain("Copyright © 2026 Adrián Romero Corchado");
        expect(root.textContent).toContain("about.homepage");
        expect(root.textContent).toContain("about.license");

        const links = root.querySelectorAll<HTMLAnchorElement>("a");
        links[0]?.click();
        links[1]?.click();

        expect(openUrl).toHaveBeenNthCalledWith(
            1,
            "https://github.com/adrianromero/plunibio"
        );
        expect(openUrl).toHaveBeenNthCalledWith(
            2,
            "https://github.com/adrianromero/plunibio/blob/main/LICENSE"
        );
    });

    it("closes from the button and the Escape cancel event", async () => {
        const trigger = document.createElement("button");
        const root = document.createElement("div");
        document.body.append(trigger, root);
        trigger.focus();
        const [open, setOpen] = createSignal(true);
        const close = vi.fn(() => setOpen(false));
        dispose = render(() => <AboutDialog open={open()} onClose={close} />, root);

        const dialog = root.querySelector("dialog");
        const closeButton = root.querySelector<HTMLButtonElement>("button");
        await vi.waitFor(() => expect(document.activeElement).toBe(closeButton));

        closeButton?.click();
        expect(close).toHaveBeenCalledOnce();
        expect(dialog?.open).toBe(false);
        await vi.waitFor(() => expect(document.activeElement).toBe(trigger));

        setOpen(true);
        expect(dialog?.open).toBe(true);
        const cancel = new Event("cancel", { cancelable: true });
        dialog?.dispatchEvent(cancel);
        expect(cancel.defaultPrevented).toBe(true);
        expect(close).toHaveBeenCalledTimes(2);
        expect(dialog?.open).toBe(false);
    });
});
