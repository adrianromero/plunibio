/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { JSX } from "solid-js";
import EditorTextView from "../text/EditorTextView";
import ViewTable from "./ViewTable";

export function EditorTable(): JSX.Element {
    return <EditorTextView printable preserveSourceText view={ViewTable} />;
}

export default EditorTable;
