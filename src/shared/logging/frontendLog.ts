/* Copyright (c) 2026 Adrián Romero · SPDX-License-Identifier: MIT */

import { invoke } from "@tauri-apps/api/core";

export type FrontendLogLevel = "trace" | "debug" | "info" | "warn" | "error";
export type FrontendLogFilter = FrontendLogLevel | "off";
export type FrontendLogDetails = Record<string, string | number | boolean | null>;

const verbosity: Record<FrontendLogFilter, number> = {
    off: 0, error: 1, warn: 2, info: 3, debug: 4, trace: 5,
};
let configuredLevel: FrontendLogFilter = "off";

export async function configureFrontendLog(): Promise<void> {
    configuredLevel = await invoke<FrontendLogFilter>("frontend_log_config");
}

export function frontendLog(level: FrontendLogLevel, event: string, details: FrontendLogDetails = {}): void {
    if (verbosity[level] > verbosity[configuredLevel]) return;
    void Promise.resolve()
        .then(() => invoke("frontend_log", { event, level, details }))
        .catch((error: unknown) => console.error("Unable to write frontend event:", error));
}
