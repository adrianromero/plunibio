---
layout: docs-chapter
lang: en
translation_key: docs-shortcuts-troubleshooting
section: docs
docs_key: shortcuts-troubleshooting
title: Shortcuts and troubleshooting
permalink: /en/docs/shortcuts-and-troubleshooting/
description: Look up verified keyboard shortcuts and solve common problems.
---

This reference brings together application shortcuts and ways to resolve problems while keeping pending changes. Use the links in each section to return to the full procedure.

## Use shortcuts in context

First select the document, cell, or field where you want to act. A Markdown formatting shortcut does not have the same effect inside the YAML properties editor, a code block, or the search field. When a dialog is open, complete or cancel it before using general actions.

<kbd>Ctrl</kbd> refers to Windows/Linux; <kbd>⌘</kbd>, <kbd>⌥</kbd>, and <kbd>⇧</kbd> are Command, Option, and Shift on macOS. **+** means pressing the keys together.

For basic editing, use <kbd>Ctrl</kbd> + <kbd>A</kbd>/<kbd>C</kbd>/<kbd>X</kbd>/<kbd>V</kbd> to select all, copy, cut, and paste. On macOS, use <kbd>⌘</kbd> instead of <kbd>Ctrl</kbd>.

## Navigation and files

| Action | Windows/Linux | macOS | Context |
| --- | --- | --- | --- |
| Open workspace | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>O</kbd> | Opens the workspace picker. |
| Save | <kbd>Ctrl</kbd> + <kbd>S</kbd> | <kbd>⌘</kbd> + <kbd>S</kbd> | Saves changes in the open file. |
| Reload | <kbd>Ctrl</kbd> + <kbd>R</kbd> | <kbd>⌘</kbd> + <kbd>R</kbd> | File: asks for confirmation. Folder: refreshes the listing. |
| Find | <kbd>Ctrl</kbd> + <kbd>F</kbd> | <kbd>⌘</kbd> + <kbd>F</kbd> | Markdown or text/code; shows Search. |
| Show/hide sidebar | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>B</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>B</kbd> | When the view has a sidebar. |
| Back | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>,</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>,</kbd> | Available navigation history. |
| Forward | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>.</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>.</kbd> | Available navigation history. |
| New folder | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>N</kbd> | From a folder. |
| New Markdown file | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>M</kbd> | From a folder. |
| New text file | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>T</kbd> | From a folder. |
| Rename | <kbd>F2</kbd> | <kbd>F2</kbd> | Current file or folder; not the workspace root. |

Creation shortcuts require a **folder view**; they do not create files while you are typing in a document. <kbd>F2</kbd> acts on the item shown in the path, rather than an item only pointed at with the mouse. To delete, use the current item’s menu; the application does not register a Delete shortcut.

See [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}) for creation, renaming, navigation, and extension confirmations.

## Markdown formatting, lists, and tables

Use these shortcuts with focus in the document’s visual body:

| Action | Windows/Linux | macOS | Context |
| --- | --- | --- | --- |
| Bold | <kbd>Ctrl</kbd> + <kbd>B</kbd> | <kbd>⌘</kbd> + <kbd>B</kbd> | Apply or remove formatting. |
| Italic | <kbd>Ctrl</kbd> + <kbd>I</kbd> | <kbd>⌘</kbd> + <kbd>I</kbd> | Apply or remove formatting. |
| Inline code | <kbd>Ctrl</kbd> + <kbd>E</kbd> | <kbd>⌘</kbd> + <kbd>E</kbd> | On a text selection. |
| Strikethrough | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>X</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>X</kbd> | Apply or remove formatting. |
| Heading 1–6 | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>1…6</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>1…6</kbd> | Current block. |
| Normal text | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>0</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>0</kbd> | Turn the block into a paragraph. |
| Blockquote | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>B</kbd> | Current block. |
| Ordered list | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>7</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>7</kbd> | Current block. |
| Bullet list | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>8</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>8</kbd> | Current block. |
| Indent list item | <kbd>Tab</kbd> | <kbd>Tab</kbd> | Cursor inside a list item. |
| Outdent list item | <kbd>Shift</kbd> + <kbd>Tab</kbd> | <kbd>⇧</kbd> + <kbd>Tab</kbd> | Cursor inside a list item. |
| Next cell | <kbd>Tab</kbd> | <kbd>Tab</kbd> | Inside a Markdown table. |
| Previous cell | <kbd>Shift</kbd> + <kbd>Tab</kbd> | <kbd>⇧</kbd> + <kbd>Tab</kbd> | Inside a Markdown table. |
| Leave the table | <kbd>Enter</kbd> | <kbd>Enter</kbd> | From a cell. |
| Code block | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>C</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>C</kbd> | Insert or transform the block. |
| Undo | <kbd>Ctrl</kbd> + <kbd>Z</kbd> | <kbd>⌘</kbd> + <kbd>Z</kbd> | Open Markdown edit. |
| Redo | <kbd>Ctrl</kbd> + <kbd>Y</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>Z</kbd> | Open Markdown edit. |

<kbd>Tab</kbd> changes function with context: it indents a list item or advances to the next table cell. In the text and code editor, it is not the indentation shortcut. See [Edit Markdown]({{ '/en/docs/edit-markdown/' | relative_url }}) and [Tables, code, and advanced content]({{ '/en/docs/tables-code-and-advanced-content/' | relative_url }}).

## Text and code editing

| Action | Windows/Linux | macOS | Context |
| --- | --- | --- | --- |
| Undo | <kbd>Ctrl</kbd> + <kbd>Z</kbd> | <kbd>⌘</kbd> + <kbd>Z</kbd> | Open text edit. |
| Redo | <kbd>Ctrl</kbd> + <kbd>Y</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>Z</kbd> | Open text edit. |
| Move line up/down | <kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>Alt</kbd> + <kbd>↓</kbd> | <kbd>⌥</kbd> + <kbd>↑</kbd> / <kbd>⌥</kbd> + <kbd>↓</kbd> | Current line or selected lines. |
| Duplicate line up/down | <kbd>Shift</kbd> + <kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>Shift</kbd> + <kbd>Alt</kbd> + <kbd>↓</kbd> | <kbd>⇧</kbd> + <kbd>⌥</kbd> + <kbd>↑</kbd> / <kbd>⇧</kbd> + <kbd>⌥</kbd> + <kbd>↓</kbd> | Current line or selected lines. |
| Toggle comment | <kbd>Ctrl</kbd> + <kbd>/</kbd> | <kbd>⌘</kbd> + <kbd>/</kbd> | Only when the language supports comments. |
| Increase indentation | <kbd>Ctrl</kbd> + <kbd>]</kbd> | <kbd>⌘</kbd> + <kbd>]</kbd> | Line or selection. |
| Add next occurrence | <kbd>Ctrl</kbd> + <kbd>D</kbd> | <kbd>⌘</kbd> + <kbd>D</kbd> | Selects the current word first if nothing was selected. |
| Request completions | <kbd>Ctrl</kbd> + <kbd>Space</kbd> | <kbd>Ctrl</kbd> + <kbd>Space</kbd> / <kbd>⌥</kbd> + <kbd>I</kbd> | Depends on language and context. |

In a completion list, use <kbd>↑</kbd>/<kbd>↓</kbd> to choose, <kbd>Enter</kbd> to accept, and <kbd>Esc</kbd> to close. Availability depends on the language: not every format offers suggestions. To fold blocks, use the gutter arrow and ellipsis, as described in [Edit text and code]({{ '/en/docs/edit-text-and-code/' | relative_url }}).

## Find and replace

Open **Search** with <kbd>Ctrl</kbd> + <kbd>F</kbd> or <kbd>⌘</kbd> + <kbd>F</kbd>. Within its fields:

| Action | Windows/Linux | macOS | Context |
| --- | --- | --- | --- |
| Next result | <kbd>Enter</kbd> | <kbd>Enter</kbd> | Focus in Find text. |
| Previous result | <kbd>Shift</kbd> + <kbd>Enter</kbd> | <kbd>⇧</kbd> + <kbd>Enter</kbd> | Focus in Find text. |
| Replace current match | <kbd>Enter</kbd> | <kbd>Enter</kbd> | Focus in Replace with and a current match selected. |

**Replace all** acts immediately on the open file. An empty replacement field deletes the matches. Review the query and results before saving; see [Find and replace]({{ '/en/docs/find-and-replace/' | relative_url }}).

## Keep changes when an error occurs

### Recognize unsaved changes

The square-pencil icon beside the path means **Unsaved changes**. Use **Save** and check that it disappears. An error message does not confirm that the content was saved.

### Cancel a failed attempt to leave

If saving fails when navigating, changing workspaces, or closing, Plunibio offers **Continue** and **Cancel**. The message warns that data might be lost.

{% include docs-figure.html id="en-shortcuts-troubleshooting-navigation-save-failed" %}

1. Select **Cancel** to keep the edit and resolve the problem before leaving.
2. Check the file format, write permissions, and folder or drive availability. Try **Save** again once you have corrected the cause.
3. If you need to preserve pending text another way, copy it to another application before leaving the edit. In Markdown, also keep the YAML properties if you changed them.
{: .docs-steps}

{% include docs-callout.html type="warning" content="Continuing after a save error may lose pending changes. The application uses Continue both when navigating and when closing. Select it only if you accept leaving those changes behind." %}

### Read external changes or discard an edit

**Reload** rereads the file on disk and asks for confirmation. If you have pending changes, **OK** discards them; **Cancel** keeps the edit. Before reloading a file changed by another application, keep a separate copy of anything you want to recover from your current edit.

Saving writes the open content and may overwrite another application’s changes. Reload does not recover versions you already overwrote. See [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}) for saving and reloading steps.

## Resolve file and workspace problems

### Find a file that does not appear

Check that you are in the correct workspace and folder. If the name starts with a dot or the system marks it as hidden, use **More options** → **Hidden files** → **Show**. If the file or folder moved outside Plunibio, return to its folder and use **Reload** to update the listing.

If the workspace is no longer available, open **More options** → **Open workspace** and choose an existing folder. Also check the drive connection when using removable or network storage.

### Distinguish immediate creation from terminal creation

**New folder**, **New Markdown file**, **New text file**, and **Other new file** create the item immediately. If **A file or folder named … already exists** appears, choose another name; Plunibio does not overwrite the existing item.

An empty file requested through [Command line]({{ '/en/docs/command-line/' | relative_url }}) is not created just by opening it: use **Save** explicitly. Leaving without text or saving leaves the file uncreated.

### Resolve a rename or deletion problem

You cannot rename or delete the workspace root from the item menu. If a name already exists, choose a different one. Changing the extension requires confirmation and may open a different editor.

Renaming does not rewrite references in other documents: check links and image paths. Deletion is permanent, without Trash or Undo recovery, and does not first save the deleted item’s pending content. To recover a deleted file, use a backup if you have one.

### Open an unrecognized format

Plunibio displays **Open with the default application**. You need a system application that can open that format. If it fails, check that the file exists and has an associated application. Internal formats are listed in [Edit text and code]({{ '/en/docs/edit-text-and-code/' | relative_url }}) and [View and edit images]({{ '/en/docs/view-and-edit-images/' | relative_url }}).

## Resolve link and image problems

### Correct a link that does not open

In Markdown, use the address in the link actions to open it. Check that its relative path is calculated from the containing document and that the target has not been renamed or deleted.

An absolute `file:` URI may be kept in Markdown when linking an external file, but opening it is not supported in Plunibio. Copy or move the resource into the workspace and use a path relative to the document. Paths resolving outside the workspace are rejected too. See [Links and images]({{ '/en/docs/links-and-images/' | relative_url }}).

### Restore an image that does not appear

Check the image file, its location, and the address stored in the document. If you moved or renamed the resource, update the reference. An image inserted using a web address depends on that address being available; a local copy inside the workspace avoids that dependency.

### Save an edited image

Only PNG, JPEG, and WebP support saving after editing. AVIF, BMP, GIF, and ICO can be viewed, but report an error when saving modifications. To leave those changes behind, use **Reload** and confirm discarding them before navigating or closing.

The image editor does not use the text editor’s Undo history. Use its resets to remove adjustments from the current edit; after saving and reloading, you need an earlier copy to recover the original. See [View and edit images]({{ '/en/docs/view-and-edit-images/' | relative_url }}).

## Resolve editing and search problems

### Review a search without results

Check **Match case**, **Match whole word**, and **Use regular expression**. If **Invalid expression** appears, correct the pattern or disable regular expressions. `0 / 4` means four results without a selected current match; select **Next** to choose one.

Search is limited to the open file. In Markdown it searches body text, rather than YAML properties, link addresses, or image paths. Use the specific controls to edit that data.

### Restore missing controls

Use **Show sidebar** to restore Format, Search, Actions, or image controls, depending on the view. Preferences and their persistence are explained in [Customize Plunibio]({{ '/en/docs/customize-plunibio/' | relative_url }}).

If a shortcut does not act, check focus and close dialogs first. In code, suggestions, comments, and folding depend on the language; formats do not all have the same editing aids.

### Correct Mermaid, formulas, or YAML properties

A Mermaid preview error does not remove the block’s code: review its source. For formulas, use an expression supported by the math renderer. Examples and reference links are in [Tables, code, and advanced content]({{ '/en/docs/tables-code-and-advanced-content/' | relative_url }}).

Properties need valid YAML. Check indentation and values in **Document properties**; highlighting does not guarantee that another tool can interpret them. See [Edit Markdown]({{ '/en/docs/edit-markdown/' | relative_url }}).

## Prepare a problem report

You can find the project’s code and contribution options on [GitHub]({{ site.github_url }}). To describe a reproducible problem:

1. Note the installed version from **More options** → **About Plunibio**, your operating system, and the editor or format you were using.
2. Describe the steps, expected result, and what happened. Include the exact error message and whether it also occurs with a new file.
3. Prepare a minimal example without personal or private data. If you attach a screenshot, also review the paths and content visible in it.
{: .docs-steps}

State whether the file is on a local, removable, or network drive and which recovery attempts you made. You do not need to share your entire workspace to explain the problem.
