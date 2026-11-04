/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vitest";
import Menu from "@/shared/ui/menu/Menu";

describe("ToolbarMenu", () => {
    let dispose: (() => void) | undefined;

    afterEach(() => {
        dispose?.();
        dispose = undefined;
        document.body.replaceChildren();
    });

    it("supports a labelled trigger aligned to its start edge", () => {
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => (
                <Menu
                    label="New"
                    triggerText="New"
                    triggerClass="custom-trigger"
                    align="start"
                    blocks={[]}
                />
            ),
            root
        );

        expect(root.querySelector(".custom-trigger")?.textContent).toBe("New");
        expect(root.querySelector('[role="menu"]')?.className).toContain("alignStart");
    });

    it("keeps an open menu positioned from the trigger while scrolling", () => {
        const root = document.createElement("div");
        document.body.append(root);
        dispose = render(
            () => <Menu label="New" align="start" blocks={[]} />,
            root
        );
        const trigger = root.querySelector<HTMLButtonElement>('[data-testid="toolbar-menu-trigger"]')!;
        const menu = root.querySelector<HTMLDivElement>('[role="menu"]')!;
        let triggerTop = 20;
        trigger.getBoundingClientRect = () =>
            ({
                top: triggerTop,
                bottom: triggerTop + 30,
                left: 24,
                right: 80,
                width: 56,
                height: 30,
                x: 24,
                y: triggerTop,
                toJSON: () => ({}),
            }) as DOMRect;
        Object.defineProperties(menu, {
            offsetWidth: { configurable: true, value: 160 },
            offsetHeight: { configurable: true, value: 100 },
        });
        const toggle = new Event("toggle");
        Object.defineProperty(toggle, "newState", { value: "open" });
        menu.dispatchEvent(toggle);
        expect(menu.style.getPropertyValue("--toolbar-menu-top")).toBe("56px");

        triggerTop = 0;
        window.dispatchEvent(new Event("scroll"));
        expect(menu.style.getPropertyValue("--toolbar-menu-top")).toBe("36px");
        expect(menu.style.getPropertyValue("--toolbar-menu-left")).toBe("24px");
    });

    it("runs an item action and closes the popover", () => {
        const root = document.createElement("div");
        document.body.append(root);
        const onSelect = vi.fn();
        const hidePopover = vi.fn();

        dispose = render(
            () => (
                <Menu
                    label="More options"
                    blocks={[
                        { kind: "action", id: "one", label: "One", onSelect },
                        { kind: "action", id: "two", label: "Two", onSelect: vi.fn() },
                    ]}
                />
            ),
            root
        );

        const menu = root.querySelector<HTMLDivElement>('[role="menu"]');
        Object.defineProperty(menu, "hidePopover", { value: hidePopover });
        menu?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.click();

        expect(onSelect).toHaveBeenCalledOnce();
        expect(hidePopover).toHaveBeenCalledOnce();
        expect(menu?.querySelector('[role="group"]')).toBeNull();
    });

    it("moves focus through sections and standalone items in block order", () => {
        const root = document.createElement("div");
        document.body.append(root);

        dispose = render(
            () => (
                <Menu
                    label="More options"
                    blocks={[
                        {
                            kind: "section",
                            id: "first",
                            label: "First section",
                            items: [
                                { kind: "action", id: "one", label: "One", onSelect: vi.fn() },
                                {
                                    kind: "action",
                                    id: "disabled",
                                    label: "Disabled",
                                    onSelect: vi.fn(),
                                    disabled: true,
                                },
                            ],
                        },
                        {
                            kind: "action",
                            id: "standalone",
                            label: "Standalone",
                            onSelect: vi.fn(),
                        },
                        {
                            kind: "section",
                            id: "second",
                            label: "Second section",
                            items: [
                                {
                                    kind: "action",
                                    id: "three",
                                    label: "Three",
                                    onSelect: vi.fn(),
                                },
                            ],
                        },
                    ]}
                />
            ),
            root
        );

        const menu = root.querySelector<HTMLDivElement>('[role="menu"]');
        const enabledItems = menu?.querySelectorAll<HTMLButtonElement>(
            '[role="menuitem"]:not(:disabled)'
        );
        const groups = menu?.querySelectorAll<HTMLElement>('[role="group"]');

        expect(groups).toHaveLength(2);
        expect(groups?.[0]?.getAttribute("aria-labelledby")).toBe(
            groups?.[0]?.firstElementChild?.id
        );
        expect(groups?.[0]?.firstElementChild?.textContent).toBe("First section");
        expect(groups?.[1]?.firstElementChild?.textContent).toBe("Second section");
        expect(groups?.[0]?.firstElementChild?.getAttribute("tabindex")).toBeNull();
        expect(enabledItems?.[1]?.dataset.toolbarMenuEntry).toBe("standalone");

        enabledItems?.[0]?.focus();
        menu?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));

        expect(document.activeElement).toBe(enabledItems?.[1]);

        menu?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
        expect(document.activeElement).toBe(enabledItems?.[2]);

        menu?.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
        expect(document.activeElement).toBe(enabledItems?.[0]);
    });

    it("renders a section without a label", () => {
        const root = document.createElement("div");
        document.body.append(root);

        dispose = render(
            () => (
                <Menu
                    label="More options"
                    blocks={[
                        {
                            kind: "section",
                            id: "unlabelled",
                            items: [
                                { kind: "action", id: "one", label: "One", onSelect: vi.fn() },
                            ],
                        },
                    ]}
                />
            ),
            root
        );

        const section = root.querySelector<HTMLElement>(
            '[data-toolbar-menu-section="unlabelled"]'
        );

        expect(section?.getAttribute("aria-labelledby")).toBeNull();
        expect(section?.children).toHaveLength(1);
        expect(section?.firstElementChild?.getAttribute("data-toolbar-menu-entry")).toBe("one");
    });

    it("renders and changes a single-choice entry", () => {
        const root = document.createElement("div");
        document.body.append(root);
        const [value, setValue] = createSignal<"first" | "second">("first");

        dispose = render(
            () => (
                <Menu
                    label="More options"
                    blocks={[
                        {
                            kind: "section",
                            id: "main",
                            label: "Main",
                            items: [
                                {
                                    kind: "choice",
                                    id: "choice",
                                    label: "Choice",
                                    value,
                                    options: [
                                        {
                                            value: "first",
                                            label: "First",
                                            description: "First description",
                                        },
                                        { value: "second", label: "Second" },
                                    ],
                                    onChange: setValue,
                                },
                            ],
                        },
                    ]}
                />
            ),
            root
        );

        const entry = root.querySelector<HTMLButtonElement>(
            '[data-toolbar-menu-entry="choice"]'
        );
        const first = root.querySelector<HTMLButtonElement>('[data-choice-option="first"]');
        const second = root.querySelector<HTMLButtonElement>('[data-choice-option="second"]');

        expect(entry?.textContent).toContain("First");
        expect(first?.textContent).toBe("FirstFirst description");
        expect(first?.getAttribute("aria-checked")).toBe("true");
        expect(second?.getAttribute("aria-checked")).toBe("false");
        expect(root.querySelector(".lucide-check")).toBeNull();

        second?.click();

        expect(value()).toBe("second");
        expect(entry?.textContent).toContain("Second");
        expect(first?.getAttribute("aria-checked")).toBe("false");
        expect(second?.getAttribute("aria-checked")).toBe("true");
    });
});
