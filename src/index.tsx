/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

/* @refresh reload */
import { invoke } from "@tauri-apps/api/core";
import { render } from "solid-js/web";
import App from "./app/App";
import type { InitialConfig } from "./backend/rusttypes";
import { applyTheme, loadTheme } from "./preferences/ThemePreferences";
import { applyTypography, loadTypography } from "./preferences/TypographyPreferences";
import "./styles/theme.css";

// Import base styles first
import "@milkdown/crepe/theme/common/style.css";
import "./styles/milkdowntheme.css";

if (import.meta.env.VITE_PLUNIBIO_AUTOMATION === "1") {
    void import("@wdio/tauri-plugin");
}

applyTheme(loadTheme());
applyTypography(loadTypography());

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) {
        return false;
    }

    return (
        target.closest('[contenteditable="true"]') !== null ||
        target.closest("input, textarea") !== null
    );
}

if (import.meta.env.DEV) {
    const logFocusIn = (event: FocusEvent): void => {
        console.log("FOCUS →", event.target, {
            activeElement: document.activeElement,
            relatedTarget: event.relatedTarget,
        });
    };

    const logFocusOut = (event: FocusEvent): void => {
        console.log("BLUR ←", event.target, {
            activeElement: document.activeElement,
            relatedTarget: event.relatedTarget,
        });
    };

    const logFocusAfterTab = (event: KeyboardEvent): void => {
        if (event.key !== "Tab") return;

        requestAnimationFrame(() => {
            console.log("AFTER TAB →", document.activeElement);
        });
    };

    document.addEventListener("focusin", logFocusIn, true);
    document.addEventListener("focusout", logFocusOut, true);
    document.addEventListener("keydown", logFocusAfterTab, true);

    import.meta.hot?.dispose(() => {
        document.removeEventListener("focusin", logFocusIn, true);
        document.removeEventListener("focusout", logFocusOut, true);
        document.removeEventListener("keydown", logFocusAfterTab, true);
    });
}

if (import.meta.env.PROD) {
    document.addEventListener("contextmenu", (event: MouseEvent) => {
        if (!isEditableTarget(event.target)) {
            event.preventDefault();
        }
    });
}

async function bootstrap(): Promise<void> {
    const config = await invoke<InitialConfig>("initial_config");
    render(
        () => <App initialBasepath={config.basepath} initialFilename={config.filename} />,
        document.getElementById("root") as HTMLElement
    );
}

void bootstrap();
