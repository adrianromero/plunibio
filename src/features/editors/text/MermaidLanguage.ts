/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import {
    LanguageSupport,
    StreamLanguage,
    type StreamParser,
    type StringStream,
} from "@codemirror/language";

interface MermaidState {
    inDirective: boolean;
}

const DIAGRAM_TYPES = new Set([
    "agentflow-beta",
    "architecture",
    "architecture-beta",
    "block",
    "block-beta",
    "c4component",
    "c4container",
    "c4context",
    "c4deployment",
    "c4dynamic",
    "classdiagram",
    "classdiagram-v2",
    "cynefin-beta",
    "erdiagram",
    "eventmodeling",
    "flowchart",
    "gantt",
    "gitgraph",
    "graph",
    "info",
    "ishikawa",
    "ishikawa-beta",
    "journey",
    "kanban",
    "mindmap",
    "packet",
    "packet-beta",
    "pie",
    "quadrantchart",
    "radar-beta",
    "railroad-abnf-beta",
    "railroad-beta",
    "railroad-ebnf-beta",
    "railroad-peg-beta",
    "requirementdiagram",
    "sankey-beta",
    "sequencediagram",
    "statediagram",
    "statediagram-v2",
    "swimlane-beta",
    "timeline",
    "treemap",
    "treemap-beta",
    "treeview-beta",
    "usecase-beta",
    "venn-beta",
    "wardley-beta",
    "xychart-beta",
    "zenuml",
]);

const KEYWORDS = new Set([
    "accdescr",
    "acctitle",
    "activate",
    "actor",
    "alt",
    "and",
    "as",
    "autonumber",
    "axisformat",
    "bar",
    "box",
    "branch",
    "break",
    "callback",
    "call",
    "checkout",
    "cherry-pick",
    "class",
    "classdef",
    "click",
    "commit",
    "contains",
    "copies",
    "create",
    "critical",
    "dateformat",
    "deactivate",
    "derives",
    "destroy",
    "direction",
    "else",
    "element",
    "end",
    "exclude",
    "functionalrequirement",
    "group",
    "include",
    "interface",
    "interfacerequirement",
    "junction",
    "left",
    "line",
    "link",
    "linkstyle",
    "loop",
    "merge",
    "namespace",
    "note",
    "of",
    "opt",
    "over",
    "par",
    "participant",
    "performancerequirement",
    "physicalrequirement",
    "rect",
    "refines",
    "relationship",
    "requirement",
    "reset",
    "right",
    "satisfies",
    "section",
    "service",
    "state",
    "style",
    "subgraph",
    "tickinterval",
    "timeline",
    "title",
    "todaymarker",
    "traces",
    "verifies",
]);

const ATOMS = new Set(["false", "no", "null", "off", "on", "true", "yes"]);

const STYLE_PROPERTIES = new Set([
    "background",
    "color",
    "fill",
    "font-family",
    "font-size",
    "font-weight",
    "opacity",
    "stroke",
    "stroke-dasharray",
    "stroke-width",
]);

function consumeDirective(stream: StringStream, state: MermaidState): void {
    const end = stream.string.indexOf("}%%", stream.pos);
    if (end < 0) {
        stream.skipToEnd();
        return;
    }

    stream.pos = end + 3;
    state.inDirective = false;
}

function consumeQuoted(stream: StringStream, quote: string): void {
    stream.next();
    let escaped = false;

    while (!stream.eol()) {
        const character = stream.next();
        if (character === quote && !escaped) {
            return;
        }
        escaped = character === "\\" && !escaped;
        if (character !== "\\") {
            escaped = false;
        }
    }
}

export const mermaidStreamParser: StreamParser<MermaidState> = {
    name: "mermaid",
    startState: () => ({ inDirective: false }),
    token: (stream, state) => {
        if (state.inDirective) {
            consumeDirective(stream, state);
            return "meta";
        }

        if (stream.eatSpace()) {
            return null;
        }

        if (stream.match("%%{")) {
            state.inDirective = true;
            consumeDirective(stream, state);
            return "meta";
        }

        if (stream.match("%%")) {
            stream.skipToEnd();
            return "comment";
        }

        const quote = stream.peek();
        if (quote === '"' || quote === "'" || quote === "`") {
            consumeQuoted(stream, quote);
            return "string";
        }

        if (stream.match(/^https?:\/\/[^\s)\]}]+/i)) {
            return "url";
        }

        if (stream.match(/^#[0-9a-f]{3,8}\b/i)) {
            return "atom";
        }

        if (stream.match(/^(?:\d+(?:\.\d+)?|\.\d+)\b/)) {
            return "number";
        }

        if (stream.match(/^<\/?[A-Za-z][^>]*>/)) {
            return "tag";
        }

        if (stream.match(/^&(?:#\d+|#x[0-9a-f]+|[a-z][\w-]*);/i)) {
            return "atom";
        }

        const word = stream.match(/^[A-Za-z_][\w-]*/);
        if (Array.isArray(word)) {
            const normalizedWord = word[0].toLowerCase();
            if (DIAGRAM_TYPES.has(normalizedWord)) {
                return "type";
            }
            if (KEYWORDS.has(normalizedWord)) {
                return "keyword";
            }
            if (ATOMS.has(normalizedWord)) {
                return "atom";
            }
            if (
                STYLE_PROPERTIES.has(normalizedWord) &&
                /^\s*:/.test(stream.string.slice(stream.pos))
            ) {
                return "property";
            }
            return "variable";
        }

        if (stream.match(/^[<>=~|.+*/!?&-]+/)) {
            return "operator";
        }

        if (stream.match(/^[()[\]{},;:@]/)) {
            return "punctuation";
        }

        stream.next();
        return null;
    },
};

export const mermaidLanguageSupport = new LanguageSupport(
    StreamLanguage.define(mermaidStreamParser)
);
