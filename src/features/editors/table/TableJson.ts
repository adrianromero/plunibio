/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

export type JsonObject = Record<string, unknown>;

export function isJsonObject(value: unknown): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseJson(source: string): unknown {
    try {
        return JSON.parse(source) as unknown;
    } catch {
        return undefined;
    }
}
