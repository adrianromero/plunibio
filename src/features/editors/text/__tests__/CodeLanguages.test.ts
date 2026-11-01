/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from "vitest";
import { LanguageDescription } from "@codemirror/language";
import { classHighlighter, highlightTree } from "@lezer/highlight";
import { Crepe } from "@milkdown/crepe";
import { codeBlockConfig } from "@milkdown/kit/component/code-block";
import {
    CODE_LANGUAGES,
    configureCodeLanguages,
    editorTextExtensionsForFilename,
} from "../CodeLanguages";
import { mermaidLanguageSupport } from "../MermaidLanguage";

describe("CodeLanguages", () => {
    it("limita el catálogo a los lenguajes compatibles con EditorText", () => {
        expect(CODE_LANGUAGES.map(({ name }) => name)).toEqual([
            "Text",
            "JavaScript",
            "JSX",
            "TypeScript",
            "TSX",
            "Java",
            "Rust",
            "Python",
            "HTML",
            "CSS",
            "JSON",
            "Mermaid",
            "Markdown",
            "LaTeX",
            "TOML",
            "YAML",
            "SQL",
            "C",
            "C++",
            "XML",
        ]);
    });

    it.each([
        ["script.js", "JavaScript"],
        ["component.tsx", "TSX"],
        ["main.rs", "Rust"],
        ["Cargo.toml", "TOML"],
        ["config.yml", "YAML"],
        ["vector.svg", "XML"],
        ["diagram.mmd", "Mermaid"],
        ["README.md", "Markdown"],
        ["formula.tex", "LaTeX"],
    ])("selecciona %s como %s", (filename, languageName) => {
        expect(LanguageDescription.matchFilename(CODE_LANGUAGES, filename)?.name).toBe(
            languageName
        );
    });

    it.each(["notes.txt", "server.log", "data.csv", ".env", ".gitignore"])(
        "abre %s sin extensión de resaltado",
        (filename) => {
            expect(editorTextExtensionsForFilename(filename)).toEqual([]);
        }
    );

    it("no considera texto un tipo de archivo desconocido", () => {
        expect(editorTextExtensionsForFilename("archive.bin")).toBeNull();
    });

    it("resalta la sintaxis Mermaid con las clases del tema de CodeMirror", () => {
        const source = [
            "flowchart LR",
            "    %% Service flow",
            '    API["Service"] --> DB[(Database 42)]',
            "    style API fill:#fff,stroke:#333",
        ].join("\n");
        const highlightedTokens: Array<{ text: string; classes: string }> = [];

        highlightTree(
            mermaidLanguageSupport.language.parser.parse(source),
            classHighlighter,
            (from, to, classes) => highlightedTokens.push({
                text: source.slice(from, to),
                classes,
            })
        );

        expect(highlightedTokens).toEqual(
            expect.arrayContaining([
                { text: "flowchart", classes: "tok-typeName" },
                { text: "%% Service flow", classes: "tok-comment" },
                { text: '"Service"', classes: "tok-string" },
                { text: "-->", classes: "tok-operator" },
                { text: "42", classes: "tok-number" },
                { text: "style", classes: "tok-keyword" },
                { text: "fill", classes: "tok-propertyName" },
                { text: "#fff", classes: "tok-atom" },
            ])
        );
    });

    it("reemplaza el catálogo predeterminado del bloque de código", async () => {
        const root = document.createElement("div");
        document.body.append(root);
        const crepe = new Crepe({ root });
        crepe.editor.config(configureCodeLanguages("No se ha podido generar el diagrama"));

        try {
            await crepe.create();
            crepe.editor.action((ctx) => {
                expect(ctx.get(codeBlockConfig.key).languages).toEqual(CODE_LANGUAGES);
            });
        } finally {
            await crepe.destroy();
            root.remove();
        }
    });

    it("conserva los bloques Mermaid como bloques de código cercados", async () => {
        const root = document.createElement("div");
        document.body.append(root);
        const markdown = "```mermaid\ngraph TD;\n    A-->B;\n```";
        const crepe = new Crepe({ root, defaultValue: markdown });
        crepe.editor.config(configureCodeLanguages("No se ha podido generar el diagrama"));

        try {
            await crepe.create();
            expect(crepe.getMarkdown().trim()).toBe(markdown);
        } finally {
            await crepe.destroy();
            root.remove();
        }
    });
});
