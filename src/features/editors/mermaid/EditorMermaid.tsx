/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { JSX } from "solid-js";
import EditorTextView from "../text/EditorTextView";
import { mermaidLanguageSupport } from "../text/MermaidLanguage";
import ViewMermaid from "./ViewMermaid";

const extensions = [mermaidLanguageSupport];

export function EditorMermaid(): JSX.Element {
    return <EditorTextView view={ViewMermaid} extensions={extensions} />;
}

export default EditorMermaid;
