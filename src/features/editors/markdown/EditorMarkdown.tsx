/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { markdown } from "@codemirror/lang-markdown";
import type { JSX } from "solid-js";
import EditorTextView from "../text/EditorTextView";
import ViewMarkdown from "./ViewMarkdown";

const extensions = [markdown()];

export function EditorMarkdown(): JSX.Element {
    return <EditorTextView view={ViewMarkdown} extensions={extensions} />;
}

export default EditorMarkdown;
