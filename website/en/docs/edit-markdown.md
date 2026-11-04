---
layout: docs-chapter
lang: en
translation_key: docs-edit-markdown
section: docs
docs_key: edit-markdown
title: Edit Markdown
permalink: /en/docs/edit-markdown/
description: Format text, work with lists, and edit document properties.
---

Plunibio displays Markdown as a visual document while saving an ordinary Markdown text file. You can format content from the sidebar or type recognized Markdown rules at the start of a line. This chapter covers everyday editing; links, tables, code blocks, math, and search have dedicated chapters.

## Work in the visual editor

Open a `.md`, `.markdown`, `.mdown`, or `.mkd` file to use the Markdown editor. Select text to replace it by typing or to apply formatting. If you only place the cursor, block styles act on the current paragraph and compatible inline formats apply to the text that you type next.

The usual selection, cut, copy, and paste operations use the standard system commands. You can undo and redo using the editing shortcuts listed later in this chapter. To create an empty document from a folder, follow [Getting started]({{ '/en/docs/getting-started/' | relative_url }}).

Plunibio keeps the file as Markdown while presenting headings, lists, quotes, links, and images visually. It does not display a split source view. It also does not include a `/` command menu, a general floating formatting toolbar, or a block drag handle: the main actions are in the **Format** tab.

Text, formatting, and property changes are saved in the same file. See [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}) to save, reload, or leave a document with pending changes.

{% capture source_note %}
If you need to preserve exact spacing, delimiters, or a particular syntax variant, review the file with version control or a text editor. A visual operation may normalize an equivalent construct; for example, dividers are saved as `---`.
{% endcapture %}
{% include docs-callout.html type="note" content=source_note %}

## Open the formatting tools

1. If the sidebar is hidden, select **Show sidebar** in the top toolbar. You can also press <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>B</kbd> on Windows and Linux or <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>B</kbd> on macOS.
2. Select the **Format** tab.
3. Scroll through the panel to see **Document**, **Block style**, **Text formatting**, **Lists**, and **Blocks**.
{: .docs-steps}

{% include docs-figure.html id="en-edit-markdown-format-panel" %}

The **Blocks** actions insert images, tables, code, math, and Mermaid. They are covered in [Links and images]({{ '/en/docs/links-and-images/' | relative_url }}) and [Tables, code, and advanced content]({{ '/en/docs/tables-code-and-advanced-content/' | relative_url }}).

{% include docs-figure.html id="en-edit-markdown-lists-and-blocks" %}

To change the document's presentation, open **More options** and select **Typography**. This preference is available from any view and changes Markdown's appearance without adding formatting to the file. See [Customize Plunibio]({{ '/en/docs/customize-plunibio/' | relative_url }}) to choose typography and a theme.

## Change a block style

Use **Block style** to change complete paragraphs:

1. Place the cursor in a paragraph or select the blocks that you want to change.
2. Select **Heading 1**–**Heading 6**, **Normal text**, or **Quote**.
3. To remove a heading, select **Normal text**. To remove a quote, select **Quote** again from inside it.
{: .docs-steps}

Headings create the document structure: use **Heading 1** for the main title, **Heading 2** for its sections, and subsequent levels for subsections. Do not choose a level only for its visual size.

**Divider** inserts a new horizontal line at the cursor. It does not transform the current paragraph.

## Format text

The **Text formatting** section provides **Bold**, **Italic**, **Strikethrough**, **Link**, **Inline code**, and **Inline math**.

1. Select the text that you want to change.
2. Select **Bold**, **Italic**, **Strikethrough**, or **Inline code**. Its button remains selected when the selection or cursor has that format.
3. Select the same button again to remove the format.
{: .docs-steps}

Without a selection, **Bold**, **Italic**, **Strikethrough**, and **Inline code** toggle the format for what you type next. You can combine bold, italic, and strikethrough. **Inline code** is suitable for filenames, commands, and short fragments, not complete paragraphs.

For example, press <kbd>Ctrl</kbd> + <kbd>B</kbd> on Windows and Linux or <kbd>⌘</kbd> + <kbd>B</kbd> on macOS, type a few words, and press the combination again to continue without bold.

**Link** and **Inline math** have their own editing controls. Inserting a formula with the button opens the **LaTeX expression** field for you to enter and confirm it. Existing formulas offer **Edit expression** and **Copy expression** when you move the pointer over them. [Tables, code, and advanced content]({{ '/en/docs/tables-code-and-advanced-content/' | relative_url }}) explains these steps, canceling, and math blocks. [Links and images]({{ '/en/docs/links-and-images/' | relative_url }}) explains how to create and edit links.

## Create and organize lists

You can convert one or more paragraphs into a list:

1. Place the cursor in a paragraph or select several paragraphs.
2. Select **Bullet list**, **Numbered list**, or **Task list**.
3. To change the type, select another of the three buttons. To return to normal paragraphs, select the active type again.
4. Within a list, use **Increase** to nest the item under the previous one and **Decrease** to move it up one level.
{: .docs-steps}

In a task list, select an item's checkbox to switch between pending and completed. The state is stored as Markdown task syntax.

You can also press <kbd>Tab</kbd> to increase the current item's level and <kbd>Shift</kbd> + <kbd>Tab</kbd> to decrease it.

## Type Markdown rules directly

At the start of an empty line, type one of these sequences. Headings, quotes, lists, and code fences activate when you type the final space; a divider appears when you complete the third hyphen. Plunibio transforms the line and removes the rule characters.

| Type at the start | Result |
| --- | --- |
| `# ` through `###### ` | Heading level 1 through 6. |
| `> ` | Quote. |
| `- `, `+ `, or `* ` | Bullet list. |
| `1. ` | Numbered list. |
| `[ ] ` inside a bullet item | Converts the item into a pending task. |
| <code>``` </code> | Code block. |
| `---` | Horizontal divider. |

{% include docs-figure.html id="en-edit-markdown-typing-heading" %}

{% include docs-figure.html id="en-edit-markdown-typing-quote" %}

{% include docs-figure.html id="en-edit-markdown-typing-lists" %}

Inline marks also transform when you complete their syntax: `**text**` creates bold, `*text*` creates italic, and `` `text` `` creates inline code.

[Tables, code, and advanced content]({{ '/en/docs/tables-code-and-advanced-content/' | relative_url }}) explains how to select a code-block language and use Mermaid or math.

## Use the verified editing shortcuts

These shortcuts have been verified in the visual Markdown body. Formatting actions apply or remove the style from the selection; without a selection, they control subsequent text when the format supports it. The YAML properties editor is a separate field.

| Action | Windows and Linux | macOS |
| --- | --- | --- |
| Bold | <kbd>Ctrl</kbd> + <kbd>B</kbd> | <kbd>⌘</kbd> + <kbd>B</kbd> |
| Italic | <kbd>Ctrl</kbd> + <kbd>I</kbd> | <kbd>⌘</kbd> + <kbd>I</kbd> |
| Inline code | <kbd>Ctrl</kbd> + <kbd>E</kbd> | <kbd>⌘</kbd> + <kbd>E</kbd> |
| Strikethrough | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>X</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>X</kbd> |
| Heading 1–6 | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>1</kbd>…<kbd>6</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>1</kbd>…<kbd>6</kbd> |
| Normal text | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>0</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>0</kbd> |
| Quote | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>B</kbd> |
| Numbered list | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>7</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>7</kbd> |
| Bullet list | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>8</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>8</kbd> |
| Increase/decrease list level | <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | Same |
| Code block | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>C</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>C</kbd> |
| Undo | <kbd>Ctrl</kbd> + <kbd>Z</kbd> | <kbd>⌘</kbd> + <kbd>Z</kbd> |
| Redo | <kbd>Ctrl</kbd> + <kbd>Y</kbd> or <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>Z</kbd> |

Use the **Inline code** shortcut on a text selection. See the [shortcuts reference chapter]({{ '/en/docs/shortcuts-and-troubleshooting/' | relative_url }}) for general actions and those from the other editors.

## Edit document properties

Properties are a YAML front matter block at the start of the file. They commonly contain data such as a title, language, date, or tags. Plunibio separates them from the visual body so that you can edit them as YAML.

1. Open the **Format** tab and select **Properties**. If the file already contains recognized properties, the panel opens when the file loads.
2. Edit keys and values in **Document properties**. Keep valid YAML syntax and use spaces for indentation.
3. Save the file. Plunibio writes the properties between `---` delimiters before the Markdown content.
4. Select **Properties** again to hide the editor. If you remove all of its content and save, Plunibio also removes the block delimiters.
{: .docs-steps}

{% include docs-figure.html id="en-edit-markdown-frontmatter-panel" %}

For example, enter these properties in the YAML editor:

```yaml
title: My notes
lang: en
tags:
  - work
  - ideas
```

Enter only the keys and their values; Plunibio adds the `---` delimiters when saving. Hiding the editor with **Properties** keeps its contents.

{% capture yaml_warning %}
Plunibio provides YAML syntax highlighting, but it does not guarantee that values are valid for the tool that will process the document. An indentation or syntax error may prevent another application from interpreting the properties.
{% endcapture %}
{% include docs-callout.html type="warning" content=yaml_warning %}

Only a delimited block at the start of the file is treated as properties. A YAML block elsewhere remains part of the Markdown content.

## Continue with specialized content

You can now structure and format a document, create lists, use typing rules, and maintain its properties. Continue with [Links and images]({{ '/en/docs/links-and-images/' | relative_url }}) to learn how to link files, open destinations, and insert images from your computer, the web, or the clipboard.
