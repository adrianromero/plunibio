/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import ChevronRight from "lucide-solid/icons/chevron-right";
import EllipsisVertical from "lucide-solid/icons/ellipsis-vertical";
import type { LucideIcon } from "lucide-solid";
import {
    createMemo,
    createUniqueId,
    For,
    onCleanup,
    Show,
    type Accessor,
    type JSX,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import styles from "./Menu.module.css";

export type MenuActionItem = {
    kind: "action";
    id: string;
    label: string;
    icon?: LucideIcon;
    shortcut?: string;
    onSelect: () => void;
    disabled?: boolean | Accessor<boolean>;
};

export type MenuChoiceOption<Value extends string = string> = {
    value: Value;
    label: string;
    description?: string;
    icon?: LucideIcon;
};

export type MenuChoiceItem<Value extends string = string> = {
    kind: "choice";
    id: string;
    label: string;
    currentIcon?: LucideIcon;
    value: Accessor<Value>;
    options: readonly MenuChoiceOption<Value>[];
    onChange(value: Value): void;
    disabled?: boolean | Accessor<boolean>;
};

export type MenuItem = MenuActionItem | MenuChoiceItem;

export type MenuSection = {
    kind: "section";
    id: string;
    label?: string;
    items: readonly MenuItem[];
};

export type MenuBlock = MenuItem | MenuSection;

export type MenuProps = {
    label: string;
    blocks: readonly MenuBlock[];
    triggerIcon?: LucideIcon;
    triggerText?: string;
    triggerClass?: string;
    align?: "start" | "end";
};

type MenuChoiceProps = {
    item: MenuChoiceItem;
    closeParent: () => void;
};

function supportsAnchorPositioning(): boolean {
    return typeof CSS !== "undefined" && CSS.supports("top", "anchor(bottom)");
}

function focusAt(items: readonly HTMLButtonElement[], index: number): void {
    if (items.length === 0) return;
    items[(index + items.length) % items.length]?.focus();
}

function hidePopover(popover: HTMLElement | undefined): void {
    if (popover && typeof popover.hidePopover === "function") {
        popover.hidePopover();
    }
}

function isDisabled(disabled: boolean | Accessor<boolean> | undefined): boolean {
    return typeof disabled === "function" ? disabled() : Boolean(disabled);
}

function MenuChoice(props: MenuChoiceProps): JSX.Element {
    const id = `toolbar-choice-${createUniqueId()}`;
    const anchorName = `--${id}-anchor`;
    let trigger: HTMLButtonElement | undefined;
    let menu: HTMLDivElement | undefined;
    let focusSelectionOnOpen = false;

    const selectedOption = createMemo(
        () =>
            props.item.options.find((option) => option.value === props.item.value()) ??
            props.item.options[0]
    );

    const optionElements = (): HTMLButtonElement[] =>
        menu ? Array.from(menu.querySelectorAll<HTMLButtonElement>("[data-choice-option]")) : [];

    const focusSelectedOption = (): void => {
        const options = optionElements();
        const selectedIndex = props.item.options.findIndex(
            (option) => option.value === props.item.value()
        );
        focusAt(options, Math.max(0, selectedIndex));
    };

    const positionFallback = (): void => {
        if (!menu || !trigger || supportsAnchorPositioning()) return;

        const triggerRect = trigger.getBoundingClientRect();
        menu.style.setProperty("--toolbar-submenu-top", `${triggerRect.bottom}px`);
        menu.style.setProperty(
            "--toolbar-submenu-right",
            `${Math.max(0, window.innerWidth - triggerRect.right)}px`
        );
    };

    const openFromKeyboard = (): void => {
        focusSelectionOnOpen = true;
        if (menu && typeof menu.showPopover === "function") {
            menu.showPopover();
        }
    };

    const handleToggle = (event: ToggleEvent): void => {
        if (event.newState !== "open") return;
        positionFallback();
        if (focusSelectionOnOpen) {
            focusSelectedOption();
        }
        focusSelectionOnOpen = false;
    };

    const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
        const options = optionElements();
        const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                event.stopPropagation();
                focusAt(options, currentIndex + 1);
                break;
            case "ArrowUp":
                event.preventDefault();
                event.stopPropagation();
                focusAt(options, currentIndex - 1);
                break;
            case "Home":
                event.preventDefault();
                event.stopPropagation();
                focusAt(options, 0);
                break;
            case "End":
                event.preventDefault();
                event.stopPropagation();
                focusAt(options, options.length - 1);
                break;
            case "ArrowLeft":
            case "Escape":
                event.preventDefault();
                event.stopPropagation();
                hidePopover(menu);
                trigger?.focus();
                break;
            case "Tab":
                hidePopover(menu);
                props.closeParent();
                break;
        }
    };

    return (
        <div class={styles.choiceEntry}>
            <button
                ref={trigger}
                class={styles.menuItem}
                style={{ "anchor-name": anchorName }}
                type="button"
                role="menuitem"
                data-toolbar-menu-entry={props.item.id}
                aria-haspopup="menu"
                popovertarget={id}
                tabIndex={-1}
                disabled={isDisabled(props.item.disabled)}
                onPointerDown={() => {
                    focusSelectionOnOpen = false;
                }}
                onClick={(event) => {
                    if (event.detail === 0) {
                        focusSelectionOnOpen = true;
                    }
                }}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        focusSelectionOnOpen = true;
                    } else if (event.key === "ArrowRight") {
                        event.preventDefault();
                        event.stopPropagation();
                        openFromKeyboard();
                    }
                }}
            >
                <span class={styles.choiceLabel}>{props.item.label}</span>
                <span class={styles.currentChoice}>
                    <Show when={props.item.currentIcon ?? selectedOption()?.icon}>
                        {(icon) => (
                            <Dynamic
                                component={icon()}
                                class={styles.itemIcon}
                                aria-hidden="true"
                            />
                        )}
                    </Show>
                    <span>{selectedOption()?.label}</span>
                </span>
                <ChevronRight class={styles.chevron} aria-hidden="true" />
            </button>
            <div
                ref={menu}
                id={id}
                class={`${styles.menu} ${styles.submenu}`}
                style={{ "position-anchor": anchorName }}
                popover="auto"
                role="menu"
                aria-label={props.item.label}
                onToggle={handleToggle}
                onKeyDown={handleKeyDown}
            >
                <For each={props.item.options}>
                    {(option) => {
                        const selected = (): boolean => option.value === props.item.value();
                        return (
                            <button
                                class={`${styles.menuItem} ${styles.choiceOption}`}
                                type="button"
                                role="menuitemradio"
                                data-choice-option={option.value}
                                aria-checked={selected()}
                                tabIndex={-1}
                                onClick={() => {
                                    props.item.onChange(option.value);
                                    hidePopover(menu);
                                    props.closeParent();
                                }}
                            >
                                <Show when={option.icon}>
                                    {(icon) => (
                                        <Dynamic
                                            component={icon()}
                                            class={styles.itemIcon}
                                            aria-hidden="true"
                                        />
                                    )}
                                </Show>
                                <span class={styles.optionText}>
                                    <span>{option.label}</span>
                                    <Show when={option.description}>
                                        {(description) => (
                                            <span class={styles.optionDescription}>
                                                {description()}
                                            </span>
                                        )}
                                    </Show>
                                </span>
                            </button>
                        );
                    }}
                </For>
            </div>
        </div>
    );
}

function MenuEntry(props: { item: MenuItem; closeParent: () => void }): JSX.Element {
    const item = props.item;
    if (item.kind === "choice") {
        return <MenuChoice item={item} closeParent={props.closeParent} />;
    }

    return (
        <button
            class={styles.menuItem}
            type="button"
            role="menuitem"
            data-toolbar-menu-entry={item.id}
            tabIndex={-1}
            disabled={isDisabled(item.disabled)}
            onClick={() => {
                item.onSelect();
                props.closeParent();
            }}
        >
            <Show when={item.icon}>
                {(icon) => (
                    <Dynamic component={icon()} class={styles.itemIcon} aria-hidden="true" />
                )}
            </Show>
            <span>{item.label}</span>
            <Show when={item.shortcut}>
                {(shortcut) => <span class={styles.shortcut}>{shortcut()}</span>}
            </Show>
        </button>
    );
}

export function Menu(props: MenuProps): JSX.Element {
    const id = `toolbar-menu-${createUniqueId()}`;
    let trigger: HTMLButtonElement | undefined;
    let menu: HTMLDivElement | undefined;
    let focusFirstItemOnOpen = false;

    const enabledItems = (): HTMLButtonElement[] =>
        menu
            ? Array.from(
                  menu.querySelectorAll<HTMLButtonElement>(
                      "[data-toolbar-menu-entry]:not(:disabled)"
                  )
              )
            : [];

    const closeMenu = (): void => hidePopover(menu);

    const positionMenu = (): void => {
        if (!menu || !trigger) return;
        const triggerRect = trigger.getBoundingClientRect();
        const edgeGap = 8;
        const desiredLeft =
            props.align === "start" ? triggerRect.left : triggerRect.right - menu.offsetWidth;
        const left = Math.min(
            Math.max(edgeGap, desiredLeft),
            Math.max(edgeGap, window.innerWidth - menu.offsetWidth - edgeGap)
        );
        const desiredTop = triggerRect.bottom + 6;
        const top =
            desiredTop + menu.offsetHeight <= window.innerHeight - edgeGap
                ? desiredTop
                : Math.max(edgeGap, triggerRect.top - menu.offsetHeight - 6);
        menu.style.setProperty("--toolbar-menu-top", `${top}px`);
        menu.style.setProperty("--toolbar-menu-left", `${left}px`);
    };

    const removePositionListeners = (): void => {
        window.removeEventListener("scroll", positionMenu, true);
        window.removeEventListener("resize", positionMenu);
    };

    const handleToggle = (event: ToggleEvent): void => {
        if (event.newState !== "open") {
            removePositionListeners();
            return;
        }
        positionMenu();
        window.addEventListener("scroll", positionMenu, { capture: true, passive: true });
        window.addEventListener("resize", positionMenu);
        if (focusFirstItemOnOpen) {
            focusAt(enabledItems(), 0);
        }
        focusFirstItemOnOpen = false;
    };

    onCleanup(removePositionListeners);

    const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
        const items = enabledItems();
        const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                focusAt(items, currentIndex + 1);
                break;
            case "ArrowUp":
                event.preventDefault();
                focusAt(items, currentIndex - 1);
                break;
            case "Home":
                event.preventDefault();
                focusAt(items, 0);
                break;
            case "End":
                event.preventDefault();
                focusAt(items, items.length - 1);
                break;
            case "Tab":
                closeMenu();
                break;
        }
    };

    return (
        <>
            <button
                ref={trigger}
                class={props.triggerClass ?? "stdButton mainbar"}
                data-testid="toolbar-menu-trigger"
                type="button"
                aria-label={props.label}
                aria-haspopup="menu"
                title={props.label}
                popovertarget={id}
                onPointerDown={() => {
                    focusFirstItemOnOpen = false;
                }}
                onClick={(event) => {
                    if (event.detail === 0) {
                        focusFirstItemOnOpen = true;
                    }
                }}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        focusFirstItemOnOpen = true;
                    }
                }}
            >
                <Dynamic component={props.triggerIcon ?? EllipsisVertical} aria-hidden="true" />
                <Show when={props.triggerText}>{(text) => <span>{text()}</span>}</Show>
            </button>
            <div
                ref={menu}
                id={id}
                class={`${styles.menu} ${props.align === "start" ? styles.alignStart : ""}`}
                popover="auto"
                role="menu"
                data-testid="toolbar-menu"
                aria-label={props.label}
                onToggle={handleToggle}
                onKeyDown={handleKeyDown}
            >
                <For each={props.blocks}>
                    {(block) => {
                        if (block.kind !== "section") {
                            return <MenuEntry item={block} closeParent={closeMenu} />;
                        }

                        const labelId = `${id}-section-${block.id}`;
                        return (
                            <div
                                class={styles.menuSection}
                                role="group"
                                aria-labelledby={block.label ? labelId : undefined}
                                data-toolbar-menu-section={block.id}
                            >
                                <Show when={block.label}>
                                    {(label) => (
                                        <div id={labelId} class={styles.sectionTitle}>
                                            {label()}
                                        </div>
                                    )}
                                </Show>
                                <For each={block.items}>
                                    {(item) => (
                                        <MenuEntry item={item} closeParent={closeMenu} />
                                    )}
                                </For>
                            </div>
                        );
                    }}
                </For>
            </div>
        </>
    );
}

export default Menu;

