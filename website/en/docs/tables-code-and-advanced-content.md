---
layout: docs-chapter
lang: en
translation_key: docs-tables-code-advanced
section: docs
docs_key: tables-code-advanced
title: Tables, code, and advanced content
permalink: /en/docs/tables-code-and-advanced-content/
description: Add tables, code blocks, Mermaid diagrams, and mathematical formulas.
---

Tables, code, diagrams, and formulas are part of the Markdown file. Open **Format** in the sidebar to insert them. Save changes as described in [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}).

## Create and fill a table

1. Place the cursor where you want the table.
2. In **Format**, find **Blocks** and select **Table**.
3. Fill the cells. The initial table has three columns and three rows, including the header.
{: .docs-steps}

{% include docs-figure.html id="en-tables-code-advanced-table-overview" %}

The first row contains the column headings. Select text in a cell to edit or format it. Moving the pointer over a cell reveals a handle above its column and another to the left of its row.

{% include docs-figure.html id="en-tables-code-advanced-table-handles" %}

## Add rows and columns

1. Move the pointer near a cell's vertical edge to add a column, or near a data row's horizontal edge to add a row.
2. Look for the insertion line and its **+** button. Check the position before selecting it.
3. Select **+** and fill the new cells.
{: .docs-steps}

{% include docs-figure.html id="en-tables-code-advanced-table-add-column" %}

{% include docs-figure.html id="en-tables-code-advanced-table-add-row" %}

The new column or row is inserted at the indicated boundary. If the button does not appear, move the pointer closer to the cell edge.

## Align a column

1. Move the pointer over a cell in the column.
2. Select the handle above the column to open its actions.
3. Select the **left**, **center**, or **right** alignment icon, in that order from left to right.
{: .docs-steps}

{% include docs-figure.html id="en-tables-code-advanced-table-column-actions" %}

Alignment applies to the whole column and is preserved in the Markdown table when you save.

## Delete a row or column

1. Move the pointer over a cell in the item you want to delete.
2. Select the left handle for a data row or the top handle for a column.
3. Select the **trash** icon in its actions. The row or column disappears with its contents.
{: .docs-steps}

{% include docs-figure.html id="en-tables-code-advanced-table-row-actions" %}

The header does not offer a delete-row action. To correct an accidental deletion, use <kbd>Ctrl</kbd> + <kbd>Z</kbd> on Windows and Linux or <kbd>⌘</kbd> + <kbd>Z</kbd> on macOS before reloading or leaving the edit.

{% capture table_warning %}
Deleting a row or column also deletes its cells. Check the selection before pressing the trash icon, especially when few rows or columns remain.
{% endcapture %}
{% include docs-callout.html type="warning" content=table_warning %}

## Navigate a table with the keyboard

| Key | Action inside the table |
| --- | --- |
| <kbd>Tab</kbd> | Moves to the next cell. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves to the previous cell. |
| <kbd>Enter</kbd> | Creates a paragraph after the table so you can continue writing outside it. |

These behaviors apply when the cursor is inside a cell.

## Create a code block

1. Place the cursor in a paragraph.
2. In **Format** → **Blocks**, select **Code block**.
3. Type or paste code in the block's editor.
{: .docs-steps}

You can also type three backticks followed by a space at the start of an empty line, as described in [Edit Markdown]({{ '/en/docs/edit-markdown/' | relative_url }}).

For example, enter:

    print("Hello")

Plunibio displays and saves the code; it does not execute it.

## Choose the language and copy code

1. Move the pointer over the block and select its language name at the top.
2. Type in **Search language** and select a result, such as **Python**. If nothing matches, **No results** appears.
3. To copy the block's content, select **Copy** in its top controls.
{: .docs-steps}

{% include docs-figure.html id="en-tables-code-advanced-code-language-picker" %}

{% include docs-figure.html id="en-tables-code-advanced-code-block-edited" %}

The language adapts syntax highlighting. Changing it does not convert code into another language. **Copy** copies the content without the Markdown fences delimiting the block. The language and text are preserved when you save.

## Create a Mermaid diagram

1. Place the cursor where you want the diagram and select **Format** → **Blocks** → **Mermaid diagram**.
2. Enter the diagram source. If you only see an existing block's preview, move the pointer over it and select **Edit**.
3. Check the result in **Preview**. The source has syntax highlighting, and the diagram updates as you edit it.
4. Select **Hide** to hide the source editor and keep the diagram visible. Save the document.
{: .docs-steps}

A minimal example to enter inside the block:

    flowchart LR
      A[Write] --> B[Save]

{% include docs-figure.html id="en-tables-code-advanced-mermaid-preview" %}

{% include docs-figure.html id="en-tables-code-advanced-mermaid-edit-preview" %}

**Edit** and **Hide** control source visibility. You do not need to create another block to change an existing diagram.

If the syntax is invalid, the preview displays **The diagram could not be rendered**, with available details. Review and correct the code; the source remains editable.

{% include docs-figure.html id="en-tables-code-advanced-mermaid-error" %}

For other diagram types and more syntax, see the [official Mermaid documentation](https://mermaid.js.org/syntax/flowchart.html). Some interaction or HTML-content features may be restricted in Plunibio's preview.

## Insert and edit an inline formula

1. Place the cursor inside a paragraph, or select the text to convert, and choose **Inline math** under **Text formatting**.
2. In **LaTeX expression**, enter an expression such as `b^2+c^2`. Enter the expression without `$` delimiters.
3. Select **OK** to confirm. To leave editing without applying the new value, select **Cancel** or press <kbd>Esc</kbd>.
{: .docs-steps}

Canceling the editing of a newly inserted formula cancels the expression change; it does not automatically undo the initial insertion.

Move the pointer over an existing formula to see its expression and the **Edit expression** and **Copy expression** actions. Copying gives you the LaTeX text, without an image or Markdown delimiters.

{% include docs-figure.html id="en-tables-code-advanced-inline-math-actions" %}

{% include docs-figure.html id="en-tables-code-advanced-inline-math-edit" %}

To change an existing formula, select **Edit expression**, change the field, and confirm with **OK**. **Cancel** preserves its previous value. Save the document to keep your changes.

## Create a math block

1. Place the cursor where you want a formula separate from the paragraph and select **Format** → **Blocks** → **Math block**.
2. Enter the expression in the block editor, without `$$` delimiters. In an existing block, select **Edit** to show the source.
3. Review **Preview** and select **Hide** when you want to keep only the formula visible. Save the document.
{: .docs-steps}

A minimal example:

    E = mc^2

{% include docs-figure.html id="en-tables-code-advanced-inline-block-math" %}

{% include docs-figure.html id="en-tables-code-advanced-math-block-edit" %}

Plunibio uses KaTeX to display expressions. See [KaTeX supported functions](https://katex.org/docs/supported.html) for LaTeX-style mathematical syntax. The editor does not compile complete LaTeX documents. If an expression does not render correctly, check its commands, braces, and syntax before saving.

Continue with [Find and replace]({{ '/en/docs/find-and-replace/' | relative_url }}) to locate and replace text in your documents.
