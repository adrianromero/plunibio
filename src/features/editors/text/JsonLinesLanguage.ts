/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { LanguageSupport, StreamLanguage } from "@codemirror/language";

export const jsonLinesLanguage = new LanguageSupport(StreamLanguage.define({
    name: "jsonl",
    token(stream) {
        if (stream.eatSpace()) return null;
        if (stream.match(/^"(?:[^"\\]|\\.)*"/)) {
            return /^\s*:/.test(stream.string.slice(stream.pos)) ? "propertyName" : "string";
        }
        if (stream.match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/)) return "number";
        if (stream.match(/^(?:true|false)\b/)) return "bool";
        if (stream.match(/^null\b/)) return "null";
        if (stream.match(/^[{}\[\],:]/)) return "punctuation";
        stream.next();
        return null;
    },
}));
