/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { invoke } from "@tauri-apps/api/core";
import { render } from "solid-js/web";
import { expect, it, vi } from "vitest";
import { AppContext, useAppContext } from "@/app/AppContext";
import { StoryAppProvider } from "@/app/__stories__/support/StoryAppProvider";
import I18NProvider from "@/i18n/Localization";
import EditorExternalFile from "../EditorExternalFile";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));

it("disables the external file action while opening and restores it after an error", async () => {
    const filename = "example.plunibio-unknown";
    const showAppMessage = vi.fn(async () => undefined);
    const logError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(invoke)
        .mockRejectedValueOnce({ code: "open_file_failed", path: filename })
        .mockResolvedValueOnce(undefined);

    function EditorWithMessageHandler() {
        const context = useAppContext();
        return (
            <AppContext.Provider value={{ ...context, main: { ...context.main, showAppMessage } }}>
                <EditorExternalFile />
            </AppContext.Provider>
        );
    }

    const root = document.createElement("div");
    document.body.append(root);
    const dispose = render(() => (
        <I18NProvider>
            <StoryAppProvider basepath="/workspace" filename={filename}>
                <EditorWithMessageHandler />
            </StoryAppProvider>
        </I18NProvider>
    ), root);

    try {
        const notice = root.querySelector('[data-testid="external-file-view"]');
        const action = notice?.querySelector<HTMLButtonElement>('[data-testid="open-external-file"]');
        expect(notice?.getAttribute("data-message-kind")).toBe("status");
        expect(action?.textContent).toBe("Open with the default application");

        action?.click();
        expect(action?.disabled).toBe(true);
        expect(action?.textContent).toBe("Opening...");
        action?.click();
        expect(invoke).toHaveBeenCalledExactlyOnceWith("open_file", { basepath: "/workspace", filename });

        await vi.waitFor(() => expect(action?.disabled).toBe(false));
        expect(showAppMessage).toHaveBeenCalledExactlyOnceWith(
            `The file ${filename} could not be opened with its default application.`,
            "error",
        );
        expect(action?.textContent).toBe("Open with the default application");

        action?.click();
        await vi.waitFor(() => expect(action?.disabled).toBe(false));
        expect(invoke).toHaveBeenCalledTimes(2);
        expect(showAppMessage).toHaveBeenCalledTimes(1);
    } finally {
        dispose();
        root.remove();
        logError.mockRestore();
    }
});
