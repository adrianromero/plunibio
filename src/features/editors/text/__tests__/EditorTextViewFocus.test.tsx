/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { render } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StoryAppProvider } from "@/app/__stories__/support/StoryAppProvider";
import I18NProvider from "@/i18n/Localization";
import EditorText from "../EditorText";

vi.mock("@tauri-apps/api/core", () => ({
    invoke: vi.fn((command: string) => {
        if (command === "read_file") {
            return Promise.resolve({ content: "Text content", isNew: false });
        }

        return Promise.resolve(undefined);
    }),
}));

describe("EditorTextView source focus", () => {
    let dispose: (() => void) | undefined;
    let root: HTMLDivElement | undefined;

    afterEach(() => {
        dispose?.();
        root?.remove();
        dispose = undefined;
        root = undefined;
    });

    it("focuses CodeMirror after loading the file", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="notes.txt">
                        <EditorText />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        await vi.waitFor(() => {
            expect(document.activeElement).toBe(root?.querySelector(".cm-content"));
        });
    });
});
