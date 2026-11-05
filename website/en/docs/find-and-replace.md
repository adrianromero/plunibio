---
layout: docs-chapter
lang: en
translation_key: docs-find-replace
section: docs
docs_key: find-replace
title: Find and replace
permalink: /en/docs/find-and-replace/
description: Find text and replace individual matches or every result.
---

The **Search** panel lets you find and replace text in the open file. Replacement changes stay in the editor until you save them; the panel does not search across all files in the workspace.

## Understand the search scope

| View | Scope |
| --- | --- |
| Markdown | Text in the document body, including its code blocks. It does not search Markdown syntax as though the document were a plain text file. |
| Text and code | The full text of the open file, including keys, values, and punctuation. |

In Markdown, YAML properties are edited in a separate field and are outside this search. Link addresses, image paths, and inline formula expressions are not searched as body text either. To change them, use the controls described in [Links and images]({{ '/en/docs/links-and-images/' | relative_url }}) and [Tables, code, and advanced content]({{ '/en/docs/tables-code-and-advanced-content/' | relative_url }}).

## Open the panel and enter a search

1. Open the Markdown document or text file that you want to review.
2. Press <kbd>Ctrl</kbd> + <kbd>F</kbd> on Windows and Linux or <kbd>⌘</kbd> + <kbd>F</kbd> on macOS. Plunibio shows the sidebar, opens **Search**, and selects the contents of **Find text**.
3. Enter the text to find. In Markdown, you can also choose **Show sidebar** and select the **Search** tab.
{: .docs-steps}

{% include docs-figure.html id="en-search-replace-markdown-search" %}

The search updates as you type. Entering a query does not change the document. An empty field means that no search is active.

## Move through matches

1. Select **Next** to choose a match.
2. Use **Previous** and **Next** to move through results. At either end, the search continues from the opposite end of the document.
3. With focus in **Find text**, press <kbd>Enter</kbd> to move forward or <kbd>Shift</kbd> + <kbd>Enter</kbd> to move backward.
{: .docs-steps}

The counter shows the selected match and the total:

| Counter | Meaning |
| --- | --- |
| `0 / 4` | There are four matches, but none is selected as the current result. |
| `2 / 4` | The second of four matches is selected. |
| `0 / 0` | There are no results for the query, or the field is empty. Also check whether an expression error appears. |

**Previous** and **Next** are disabled when the query has no valid results. Selecting a match lets you review its context before replacing it.

## Adjust the options

You can combine the three options:

| Option | Effect |
| --- | --- |
| Match case | Searching for `lumen` does not find `Lumen`. |
| Match whole word | Searching for `lumen` does not find the beginning of `lumens`. |
| Use regular expression | Interprets the field as a pattern instead of only searching for that character sequence. |

{% include docs-figure.html id="en-search-replace-markdown-search-options" %}

Options change the number of results. Check them if a word you can see in the document does not appear in the search.

## Search with a regular expression

1. Enable **Use regular expression**.
2. Enter a pattern in **Find text**. For example, `lumen(s)?` finds `lumen` and `lumens`; the case option still applies.
3. If **Invalid expression** appears, correct the pattern or disable **Use regular expression** to return to a text search.
{: .docs-steps}

{% include docs-figure.html id="en-search-replace-invalid-regexp" %}

An unclosed opening parenthesis, such as `(`, is an incomplete pattern. Navigation and replacement actions are disabled while the expression is invalid. To find a character such as `.` or `(` as ordinary text, disable the regular expression option.

## Replace one match

1. Enter the search and select **Next** or **Previous** to choose the result to change.
2. Enter the new content in **Replace with**.
3. Select **Replace**, or press <kbd>Enter</kbd> with focus in **Replace with**.
4. Review the result and the next selected match before repeating the operation.
{: .docs-steps}

**Replace** is only available when a current match is selected. The count may decrease if the new text no longer matches the query. To delete a match, leave **Replace with** empty before using **Replace**.

In the search field, <kbd>Enter</kbd> moves through results; in the replacement field, it applies an individual replacement.

## Replace all matches

1. Enter the search and adjust its options. Check the total and review several matches.
2. Enter the new content in **Replace with**.
3. Select **Replace all**. Plunibio changes every match for the query in the open file.
{: .docs-steps}

{% include docs-figure.html id="en-search-replace-markdown-replace-all" %}

{% capture replace_warning %}
**Replace all** acts immediately, without asking for confirmation. Check the pattern, options, and replacement content before using it. An empty replacement field deletes the matches. Review the document before saving.
{% endcapture %}
{% include docs-callout.html type="warning" content=replace_warning %}

Text and code use the same panel. For example, searching for `active` with **Match whole word** lets you replace that value without changing `inactive`.

{% include docs-figure.html id="en-search-replace-text-search" %}

{% include docs-figure.html id="en-search-replace-text-replace-all" %}

A replacement in code can also change keys or syntax. Plunibio replaces the matching text; check that the file remains valid for the tool that will use it.

## Clear or hide the search

To remove the query and its highlights, clear **Find text**. To continue editing, select the document. In Markdown, you can return to **Format**; you can also select **Hide sidebar**.

Hiding the panel keeps the current file's query. <kbd>Ctrl</kbd> + <kbd>F</kbd> or <kbd>⌘</kbd> + <kbd>F</kbd> opens it again so you can change it. Reloading the file or switching documents resets the search. The query is not preserved between sessions.

## Save or correct replacements

Save with <kbd>Ctrl</kbd> + <kbd>S</kbd> on Windows and Linux or <kbd>⌘</kbd> + <kbd>S</kbd> on macOS. You can also use **More options** → **Save**.

To undo a replacement, select the document area and use <kbd>Ctrl</kbd> + <kbd>Z</kbd> or <kbd>⌘</kbd> + <kbd>Z</kbd> before reloading or leaving the edit. **Reload** rereads the disk and can discard pending changes; see [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}) before using it to recover content.

Continue with [Edit text and code]({{ '/en/docs/edit-text-and-code/' | relative_url }}) to learn about that editor's tools.
