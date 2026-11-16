/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */

import type { JSX } from "solid-js";
import { json } from "@codemirror/lang-json";
import EditorTextView from "../text/EditorTextView";
import ViewECharts from "./ViewECharts";

const extensions = [json()];

export function EditorECharts(): JSX.Element {
    return <EditorTextView printable view={ViewECharts} extensions={extensions} />;
}

export default EditorECharts;
