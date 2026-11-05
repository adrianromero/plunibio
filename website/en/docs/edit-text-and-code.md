---
layout: docs-chapter
lang: en
translation_key: docs-edit-text-code
section: docs
docs_key: edit-text-code
title: Edit text and code
permalink: /en/docs/edit-text-and-code/
description: Edit plain text and source code with language-aware tools.
---

Use the text and code editor to change configuration files, data, and source code. Plunibio chooses highlighting from the file extension. Editing aids depend on the language; you do not need to configure a project to start.

## Open and recognize the editor

1. Enter the workspace folder containing the file and select it. For example, open a `.js`, `.json`, or `.txt` file.
2. Select the text to change or place the cursor where you want to type.
{: .docs-steps}

{% include docs-figure.html id="en-edit-text-code-javascript-editor" %}

The gutter numbers identify lines, and the active line is highlighted. Long lines wrap to the available width: displaying one line across several screen rows does not add line breaks to the file. Colors distinguish language elements such as keywords, strings, and comments.

In formats with language support, you can also see the matching parenthesis or bracket at the cursor. When you type an opening character, the editor may insert its closing partner. Check the cursor position before you continue typing.

## Edit, undo, and save

Select with the mouse or with <kbd>Shift</kbd> and the arrow keys. On Windows/Linux, use <kbd>Ctrl</kbd> + <kbd>A</kbd> to select all, <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy, <kbd>Ctrl</kbd> + <kbd>X</kbd> to cut, and <kbd>Ctrl</kbd> + <kbd>V</kbd> to paste. On macOS, replace <kbd>Ctrl</kbd> with <kbd>⌘</kbd> for these actions.

1. Type or paste the content. If text is selected, the new text replaces it.
2. To undo, press <kbd>Ctrl</kbd> + <kbd>Z</kbd> or <kbd>⌘</kbd> + <kbd>Z</kbd>. To redo, use <kbd>Ctrl</kbd> + <kbd>Y</kbd> on Windows/Linux or <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> on macOS.
3. Save with <kbd>Ctrl</kbd> + <kbd>S</kbd> or <kbd>⌘</kbd> + <kbd>S</kbd>, or open **More options** → **Save**. The **Unsaved changes** indicator disappears when saving finishes.
{: .docs-steps}

Undo history belongs to the open edit. Review the result before reloading or leaving it. For saving when navigating or closing, and discarding changes with **Reload**, see [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}).

## Apply indentation and comments

Automatic indentation when pressing <kbd>Enter</kbd> depends on the language and context. To increase indentation for a line or selection, use <kbd>Ctrl</kbd> + <kbd>]</kbd> on Windows/Linux or <kbd>⌘</kbd> + <kbd>]</kbd> on macOS. You can also insert or remove spaces at the start of lines. <kbd>Tab</kbd> is not this editor’s indentation shortcut.

1. In a file that supports comments, such as JavaScript, place the cursor on the line or select the lines to comment out.
2. Press <kbd>Ctrl</kbd> + <kbd>/</kbd> on Windows/Linux or <kbd>⌘</kbd> + <kbd>/</kbd> on macOS.
3. Repeat the combination to remove the comment.
{: .docs-steps}

The editor uses the language’s comment syntax. A format such as JSON does not support comments; this action does not add that capability to the format.

## Move and duplicate lines

These actions reorganize text without cutting and pasting it. Place the cursor on a line, or select several lines, and use:

| Action | Windows/Linux | macOS |
| --- | --- | --- |
| Move up or down | <kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> | <kbd>⌥</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> |
| Duplicate up or down | <kbd>Shift</kbd> + <kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> | <kbd>⇧</kbd> + <kbd>⌥</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> |

Moving changes the order of lines; duplicating keeps the original and inserts a copy. Check indentation and code structure after the operation.

## Change several matches at once

1. Place the cursor inside the word to change. You can also select a specific fragment first.
2. Press <kbd>Ctrl</kbd> + <kbd>D</kbd> on Windows/Linux or <kbd>⌘</kbd> + <kbd>D</kbd> on macOS. If nothing was selected, the first press selects the current word.
3. Repeat the combination to add the next match to the selection.
4. Type the new text. It applies to all selections. Press <kbd>Esc</kbd> to return to a single selection before continuing.
{: .docs-steps}

{% include docs-figure.html id="en-edit-text-code-multiple-selection" %}

This operation changes the selected fragments; it is not a rename that understands program references. To review each result, restrict a search to whole words, or use regular expressions, use [Find and replace]({{ '/en/docs/find-and-replace/' | relative_url }}).

## Use code suggestions

1. In a file with suggestions, such as JavaScript, start typing a name. For example, after declaring `districtName`, type `districtN` on another line.
2. Press <kbd>Ctrl</kbd> + <kbd>Space</kbd> to request suggestions. On macOS, you can also use <kbd>⌥</kbd> + <kbd>I</kbd>.
3. Move through the list with <kbd>↑</kbd> and <kbd>↓</kbd>. Press <kbd>Enter</kbd> to insert the selected option or <kbd>Esc</kbd> to close the list.
{: .docs-steps}

{% include docs-figure.html id="en-edit-text-code-javascript-completion" %}

Suggestions may appear while you type. Availability depends on the language and context; not every format provides suggestions. For example, do not expect the same list in YAML as in JavaScript. <kbd>Tab</kbd> does not accept an option from this list.

## Fold and unfold blocks

1. If an arrow appears beside a line number, select it to hide the block’s content.
2. Select the ellipsis in the folded block to show it again.
{: .docs-steps}

{% include docs-figure.html id="en-edit-text-code-folded-function" %}

The gap in line numbers indicates hidden content. Folding only changes the view: the text remains in the file. Available blocks depend on the language and its structure.

## Edit Mermaid and LaTeX files

Files ending in `.mmd` or `.mermaid` open as code with Mermaid highlighting. Edit and save their source using the same actions as any other text file.

{% include docs-figure.html id="en-edit-text-code-mermaid-file" %}

A standalone Mermaid file shows its source. To see a rendered diagram within Plunibio, use a Mermaid block in a Markdown document, as described in [Tables, code, and advanced content]({{ '/en/docs/tables-code-and-advanced-content/' | relative_url }}).

Files ending in `.tex` or `.latex` are also edited as source. To insert rendered formulas in Markdown, see the same chapter.

## Check formats and limits

The extension determines the language; there is no selector to change the mode of an open file. If you need to rename its extension, see [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}).

| Language or mode | Extensions |
| --- | --- |
| Text without highlighting | `.txt`, `.text`, `.log`, `.csv`, `.tsv`, `.ini`, `.cfg`, `.conf`, `.env`, `.properties`, `.gitignore` |
| JavaScript | `.js`, `.mjs`, `.cjs` |
| JSX | `.jsx` |
| TypeScript | `.ts`, `.mts`, `.cts` |
| TSX | `.tsx` |
| Java | `.java` |
| Rust | `.rs` |
| Python | `.py`, `.pyi`, `.pyw` |
| HTML | `.html`, `.htm` |
| CSS | `.css` |
| JSON | `.json` |
| Mermaid | `.mmd`, `.mermaid` |
| LaTeX | `.tex`, `.latex` |
| TOML | `.toml` |
| YAML | `.yaml`, `.yml` |
| SQL | `.sql` |
| C | `.c`, `.h` |
| C++ | `.cc`, `.cpp`, `.cxx`, `.hh`, `.hpp`, `.hxx` |
| XML, including SVG source | `.xml`, `.svg`, `.xsd`, `.xsl`, `.xslt` |

Markdown extensions `.md`, `.markdown`, `.mdown`, and `.mkd` open the [Markdown editor]({{ '/en/docs/edit-markdown/' | relative_url }}). An unrecognized format shows **Open with the default application**. To find `.env`, `.gitignore`, or other hidden files, open **More options** → **Hidden files** → **Show**.

{% include docs-callout.html type="note" content="Highlighting and suggestions help you edit, but do not guarantee that a file is valid. Plunibio does not run or compile code and does not display CSV as a spreadsheet. Check the result with the tool that will use it." %}
