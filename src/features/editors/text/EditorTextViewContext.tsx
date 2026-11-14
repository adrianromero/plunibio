/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */
import { createContext, useContext, type Accessor } from "solid-js";
import type { FileEditorAdapter } from "@/app/FileEditorController";

export type EditorTextViewContextValue = {
    active: Accessor<boolean>;
    ready: Accessor<boolean>;
    reportEmpty: (message: string | null) => void;
    reportError: (message: string | null) => void;
    register: (adapter: FileEditorAdapter) => void;
};

export const EditorTextViewContext = createContext<EditorTextViewContextValue>();

export function useEditorTextView(): EditorTextViewContextValue {
    const context = useContext(EditorTextViewContext);
    if (!context) throw new Error("Missing EditorTextView provider");
    return context;
}
