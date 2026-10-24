/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { render } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import I18NProvider from "../Localization";
import { StoryAppProvider } from "../stories/StoryAppProvider";
import EditorMarkdown from "./EditorMarkdown";

let markdownContent =
    "![0.33](./plunibio-logo.png)\n\n# Plunibio\n\n[Open](./old.md) and [Other](./other.md)\n";

vi.mock("@tauri-apps/api/core", () => ({
    invoke: vi.fn((command: string) => {
        if (command === "read_file") {
            return Promise.resolve({
                content: markdownContent,
                isNew: false,
            });
        }

        if (command === "read_linked_binary_file") {
            return new Promise<number[]>(() => undefined);
        }

        return Promise.resolve(undefined);
    }),
}));

describe("EditorMarkdown", () => {
    let dispose: (() => void) | undefined;
    let root: HTMLDivElement | undefined;

    beforeEach(() => {
        markdownContent =
            "![0.33](./plunibio-logo.png)\n\n# Plunibio\n\n[Open](./old.md) and [Other](./other.md)\n";
    });

    const activateButton = (button: HTMLButtonElement): void => {
        button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        button.click();
    };

    afterEach(() => {
        dispose?.();
        root?.remove();
        vi.restoreAllMocks();
        dispose = undefined;
        root = undefined;
    });

    it("loads an image block followed by a heading", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        await vi.waitFor(() => {
            expect(root?.querySelector(".ProseMirror")).not.toBeNull();
            expect(root?.querySelector("h1")?.textContent).toBe("Plunibio");
        });
    });

    it("edits and removes a link with the shared floating actions", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const link = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLAnchorElement>('.ProseMirror a[href="./old.md"]');
            expect(element).not.toBeNull();
            return element!;
        });
        link.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));

        const actions = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLFormElement>(
                'form[aria-label="Link actions"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Edit link"]')!);
        const input = actions.querySelector<HTMLInputElement>('input[aria-label="Link address"]');
        expect(input).not.toBeNull();
        input!.value = "./new.md";
        input!.dispatchEvent(new InputEvent("input", { bubbles: true }));
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="OK"]')!);

        await vi.waitFor(() => {
            expect(root?.querySelector('.ProseMirror a[href="./new.md"]')).not.toBeNull();
        });
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Remove link"]')!);
        await vi.waitFor(() => {
            expect(root?.querySelector('.ProseMirror a[href="./new.md"]')).toBeNull();
            expect(root?.querySelector('.ProseMirror a[href="./other.md"]')).not.toBeNull();
            expect(root?.querySelector(".ProseMirror")?.textContent).toContain("Open");
        });
    });

    it("locks the active link while editing and cancels when clicking outside", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const firstLink = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLAnchorElement>('.ProseMirror a[href="./old.md"]');
            expect(element).not.toBeNull();
            return element!;
        });
        const secondLink = root.querySelector<HTMLAnchorElement>(
            '.ProseMirror a[href="./other.md"]'
        )!;

        firstLink.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        const actions = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLFormElement>(
                'form[aria-label="Link actions"]'
            );
            expect(element?.closest("[hidden]")).toBeNull();
            return element!;
        });
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Edit link"]')!);
        const input = actions.querySelector<HTMLInputElement>('input[aria-label="Link address"]')!;
        expect(input.value).toBe("./old.md");

        secondLink.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        expect(actions.querySelector<HTMLInputElement>('input[aria-label="Link address"]')?.value).toBe(
            "./old.md"
        );

        document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        expect(actions.querySelector('input[aria-label="Link address"]')).toBeNull();

        secondLink.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        await vi.waitFor(() => {
            const nextActions = root?.querySelector<HTMLFormElement>(
                'form[aria-label="Link actions"]'
            );
            expect(nextActions?.querySelector('button[title="./other.md"]')).not.toBeNull();
            expect(nextActions?.closest("[hidden]")).toBeNull();
        });
    });

    it("keeps the editor attached to its link while scrolling", async () => {
        let anchorTop = 100;
        let layerTop = 300;
        const rangeRect = vi
            .spyOn(Range.prototype, "getBoundingClientRect")
            .mockImplementation(() => new DOMRect(40, anchorTop, 60, 20));
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const link = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLAnchorElement>('.ProseMirror a[href="./old.md"]');
            expect(element).not.toBeNull();
            return element!;
        });
        link.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        const actions = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLFormElement>(
                'form[aria-label="Link actions"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Edit link"]')!);

        const positioner = actions.parentElement as HTMLDivElement;
        const layer = positioner.parentElement as HTMLDivElement;
        Object.defineProperty(layer, "getBoundingClientRect", {
            configurable: true,
            value: () => new DOMRect(10, layerTop, 800, 0),
        });
        root.querySelector<HTMLElement>(".scrollingView")?.dispatchEvent(new Event("scroll"));
        await vi.waitFor(() => {
            expect(positioner.style.left).toBe("30px");
            expect(positioner.style.top).toBe("-174px");
        });

        const callsBeforeScroll = rangeRect.mock.calls.length;
        anchorTop -= 40;
        layerTop -= 40;
        root.querySelector<HTMLElement>(".scrollingView")?.dispatchEvent(new Event("scroll"));
        await vi.waitFor(() => {
            expect(rangeRect.mock.calls.length).toBeGreaterThan(callsBeforeScroll);
            expect(positioner.style.left).toBe("30px");
            expect(positioner.style.top).toBe("-174px");
        });
    });

    it("moves between hovered links and hides when leaving or clicking outside", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const firstLink = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLAnchorElement>('.ProseMirror a[href="./old.md"]');
            expect(element).not.toBeNull();
            return element!;
        });
        const secondLink = root.querySelector<HTMLAnchorElement>(
            '.ProseMirror a[href="./other.md"]'
        )!;

        firstLink.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        await vi.waitFor(() => {
            expect(root?.querySelector('form[aria-label="Link actions"] button[title="./old.md"]')).not.toBeNull();
        });

        firstLink.dispatchEvent(
            new PointerEvent("pointerout", { bubbles: true, relatedTarget: secondLink })
        );
        secondLink.dispatchEvent(
            new PointerEvent("pointerover", { bubbles: true, relatedTarget: firstLink })
        );
        await vi.waitFor(() => {
            expect(
                root?.querySelector('form[aria-label="Link actions"] button[title="./other.md"]')
            ).not.toBeNull();
        });

        document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        expect(root.querySelector('form[aria-label="Link actions"]')).toBeNull();

        secondLink.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        expect(root.querySelector('form[aria-label="Link actions"]')).not.toBeNull();
        secondLink.dispatchEvent(
            new PointerEvent("pointerout", { bubbles: true, relatedTarget: document.body })
        );
        await vi.waitFor(() => {
            expect(root?.querySelector('form[aria-label="Link actions"]')).toBeNull();
        });
    });

    it("copies the active link without locking its hover state", async () => {
        const writeText = vi.fn(() => Promise.resolve());
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText },
        });
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const link = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLAnchorElement>('.ProseMirror a[href="./old.md"]');
            expect(element).not.toBeNull();
            return element!;
        });
        link.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        const copyButton = root.querySelector<HTMLButtonElement>(
            'form[aria-label="Link actions"] button[aria-label="Copy link"]'
        )!;
        activateButton(copyButton);

        await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith("./old.md"));
        document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        expect(root.querySelector('form[aria-label="Link actions"]')).toBeNull();
    });

    it("shows the shared floating actions when hovering an image", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const image = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLImageElement>(
                '.milkdown-image-block img[data-type="image-block"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        image.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));

        await vi.waitFor(() => {
            const actions = root?.querySelector<HTMLFormElement>(
                'form[aria-label="Image actions"]'
            );
            expect(actions).not.toBeNull();
            expect(actions?.closest("[hidden]")).toBeNull();
        });
    });

    it("coordinates one floating rectangle between images and links", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const image = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLImageElement>(
                '.milkdown-image-block img[data-type="image-block"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        const link = root.querySelector<HTMLAnchorElement>('.ProseMirror a[href="./old.md"]')!;

        image.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        await vi.waitFor(() => {
            expect(root?.querySelector('form[aria-label="Image actions"]')).not.toBeNull();
            expect(root?.querySelectorAll("form")).toHaveLength(1);
        });

        image.dispatchEvent(
            new PointerEvent("pointerout", { bubbles: true, relatedTarget: link })
        );
        link.dispatchEvent(
            new PointerEvent("pointerover", { bubbles: true, relatedTarget: image })
        );
        const linkActions = await vi.waitFor(() => {
            const form = root?.querySelector<HTMLFormElement>('form[aria-label="Link actions"]');
            expect(form).not.toBeNull();
            expect(root?.querySelectorAll("form")).toHaveLength(1);
            return form!;
        });

        activateButton(
            linkActions.querySelector<HTMLButtonElement>('button[aria-label="Edit link"]')!
        );
        link.dispatchEvent(
            new PointerEvent("pointerout", { bubbles: true, relatedTarget: image })
        );
        image.dispatchEvent(
            new PointerEvent("pointerover", { bubbles: true, relatedTarget: link })
        );

        expect(root.querySelectorAll("form")).toHaveLength(1);
        expect(root.querySelector('form[aria-label="Image actions"]')).toBeNull();
        expect(
            linkActions.querySelector<HTMLInputElement>('input[aria-label="Link address"]')?.value
        ).toBe("./old.md");

        activateButton(
            linkActions.querySelector<HTMLButtonElement>('button[aria-label="Cancel"]')!
        );
        await vi.waitFor(() => {
            expect(root?.querySelector('form[aria-label="Image actions"]')).not.toBeNull();
            expect(root?.querySelectorAll("form")).toHaveLength(1);
        });
    });

    it("edits, cancels and toggles the caption from the image actions", async () => {
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const hoverImage = async (): Promise<HTMLFormElement> => {
            const image = await vi.waitFor(() => {
                const element = root?.querySelector<HTMLImageElement>(
                    '.milkdown-image-block img[data-type="image-block"]'
                );
                expect(element).not.toBeNull();
                return element!;
            });
            image.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
            return await vi.waitFor(() => {
                const form = root?.querySelector<HTMLFormElement>(
                    'form[aria-label="Image actions"]'
                );
                expect(form?.closest("[hidden]")).toBeNull();
                return form!;
            });
        };

        let actions = await hoverImage();
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Edit link"]')!);
        let input = actions.querySelector<HTMLInputElement>('input[aria-label="Link address"]')!;
        expect(input.value).toBe("./plunibio-logo.png");
        input.value = "./discarded.png";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Cancel"]')!);
        expect(actions.querySelector('input[aria-label="Link address"]')).toBeNull();
        expect(actions.querySelector('button[title="./plunibio-logo.png"]')).not.toBeNull();

        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="Edit link"]')!);
        input = actions.querySelector<HTMLInputElement>('input[aria-label="Link address"]')!;
        input.value = "./updated-logo.png";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        activateButton(actions.querySelector<HTMLButtonElement>('button[aria-label="OK"]')!);

        actions = await hoverImage();
        await vi.waitFor(() => {
            expect(actions.querySelector('button[title="./updated-logo.png"]')).not.toBeNull();
        });
        activateButton(
            actions.querySelector<HTMLButtonElement>(
                'button[aria-label="Show or hide image caption"]'
            )!
        );
        await vi.waitFor(() => {
            expect(root?.querySelector(".milkdown-image-block .caption-input")).not.toBeNull();
        });
    });

    it("creates a link with its URL as text from the shared editor", async () => {
        markdownContent = "";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const linkButton = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLButtonElement>('button[aria-label="Link"]');
            expect(element).not.toBeNull();
            expect(element?.disabled).toBe(false);
            return element!;
        });
        linkButton.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));

        const input = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLInputElement>(
                'form[aria-label="Link actions"] input[aria-label="Link address"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        input.value = "https://example.com";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        activateButton(
            input.closest("form")!.querySelector<HTMLButtonElement>('button[aria-label="OK"]')!
        );

        await vi.waitFor(() => {
            const link = root?.querySelector<HTMLAnchorElement>(
                '.ProseMirror a[href="https://example.com"]'
            );
            expect(link?.textContent).toBe("https://example.com");
        });
    });

    it("does not create a link when the shared editor is cancelled", async () => {
        markdownContent = "Plain text";
        root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <I18NProvider>
                    <StoryAppProvider filename="README.md">
                        <EditorMarkdown />
                    </StoryAppProvider>
                </I18NProvider>
            ),
            root
        );

        const linkButton = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLButtonElement>('button[aria-label="Link"]');
            expect(element?.disabled).toBe(false);
            return element!;
        });
        linkButton.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));

        const cancelButton = await vi.waitFor(() => {
            const element = root?.querySelector<HTMLButtonElement>(
                'form[aria-label="Link actions"] button[aria-label="Cancel"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        activateButton(cancelButton);

        expect(root.querySelector(".ProseMirror a")).toBeNull();
        expect(root.querySelector(".ProseMirror")?.textContent).toContain("Plain text");
    });
});
