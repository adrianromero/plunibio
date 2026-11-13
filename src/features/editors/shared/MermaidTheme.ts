/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { MermaidConfig } from "mermaid";

// Mermaid derives further colors from these values, so resolve CSS colors to hex
// before handing them to its theme engine.
export function mermaidThemeConfig(): MermaidConfig {
    const root = document.documentElement;
    const dark = root.dataset.theme === "dark";
    const properties = getComputedStyle(root);
    const probe = document.createElement("span");
    probe.hidden = true;
    root.append(probe);
    const color = (name: string, fallback: string): string => {
        probe.style.color = "";
        probe.style.color = properties.getPropertyValue(name).trim() || fallback;
        const resolved = getComputedStyle(probe).color;
        const channels = resolved.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
        if (!channels) return fallback;
        return `#${channels.slice(1, 4).map((channel) =>
            Math.round(Number(channel)).toString(16).padStart(2, "0")
        ).join("")}`;
    };
    try {
        const background = color("--color-surface", dark ? "#1f2933" : "#ffffff");
        const primary = color("--color-secondary", dark ? "#2c3844" : "#ebedef");
        const secondary = color("--color-surface-subtle", dark ? "#263340" : "#fafafa");
        const text = color("--color-text", dark ? "#dfe5eb" : "#2b3e50");
        const border = color("--color-border-secondary", dark ? "#536476" : "#99a6b3");
        const line = color("--color-text-muted", dark ? "#a4b0bc" : "#606f80");
        const accent = color("--color-primary", dark ? "#5fa7f7" : "#155fbf");
        return {
            startOnLoad: false,
            securityLevel: "strict",
            suppressErrorRendering: true,
            theme: "base",
            themeVariables: {
                darkMode: dark,
                background,
                primaryColor: primary,
                secondaryColor: secondary,
                tertiaryColor: background,
                primaryTextColor: text,
                secondaryTextColor: text,
                tertiaryTextColor: text,
                primaryBorderColor: border,
                secondaryBorderColor: border,
                tertiaryBorderColor: border,
                textColor: text,
                lineColor: line,
                defaultLinkColor: line,
                edgeLabelBackground: background,
                noteBkgColor: secondary,
                noteTextColor: text,
                noteBorderColor: border,
                actorBkg: primary,
                actorTextColor: text,
                actorBorder: border,
                actorLineColor: line,
                signalColor: line,
                signalTextColor: text,
                activationBkgColor: secondary,
                activationBorderColor: border,
                labelBoxBkgColor: secondary,
                labelBoxBorderColor: border,
                labelTextColor: text,
                loopTextColor: text,
                titleColor: text,
                sectionBkgColor: secondary,
                altSectionBkgColor: background,
                sectionBkgColor2: primary,
                excludeBkgColor: secondary,
                vertLineColor: line,
                taskBkgColor: primary,
                taskBorderColor: border,
                taskTextColor: text,
                taskTextDarkColor: text,
                taskTextOutsideColor: text,
                activeTaskBkgColor: secondary,
                activeTaskBorderColor: accent,
                doneTaskBkgColor: secondary,
                doneTaskBorderColor: border,
                gridColor: border,
                todayLineColor: accent,
            },
        };
    } finally {
        probe.remove();
    }
}

type ThemeSubscription = {
    element: () => Element | null;
    refresh: () => void;
    connected: boolean;
    theme: string | undefined;
};
const subscriptions = new Set<ThemeSubscription>();
let observer: MutationObserver | null = null;

// Milkdown sanitizes and clones preview elements. Locate its live copy rather
// than observing the detached element returned by renderPreview.
export function observeMermaidTheme(element: () => Element | null, refresh: () => void): () => void {
    const subscription = { element, refresh, connected: false, theme: document.documentElement.dataset.theme };
    subscriptions.add(subscription);
    if (!observer) {
        observer = new MutationObserver(() => {
            const theme = document.documentElement.dataset.theme;
            for (const entry of subscriptions) {
                if (entry.element()?.isConnected) {
                    entry.connected = true;
                    if (entry.theme !== theme) {
                        entry.theme = theme;
                        entry.refresh();
                    }
                } else if (entry.connected) {
                    subscriptions.delete(entry);
                }
            }
            disconnectIfUnused();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
            childList: true,
            subtree: true,
        });
    }
    return () => {
        subscriptions.delete(subscription);
        disconnectIfUnused();
    };
}

function disconnectIfUnused(): void {
    if (subscriptions.size > 0) return;
    observer?.disconnect();
    observer = null;
}
