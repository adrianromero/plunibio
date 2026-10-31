---
layout: docs-index
lang: en
translation_key: docs
section: docs
title: Docs
permalink: /en/docs/
eyebrow: User manual
intro: Learn how to organize local files, edit Markdown, work with text and code, and adjust images with Plunibio.
description: Plunibio 0.1.2 user manual for working with local workspaces, Markdown, text, code, and images.
---

## Start here

Plunibio is a desktop application that works directly with files on your computer. A **workspace** is the local folder that Plunibio uses as its root. Its folders and files remain on disk and can still be used with other applications.

If this is your first time using it, begin with [Getting started]({{ '/en/docs/getting-started/' | relative_url }}). You will open a workspace, identify the main window, change a Markdown document, and save your work. To prepare the application before following the manual, see [Installation]({{ '/en/install/' | relative_url }}).

You can also choose a specific task from the chapter index.

## What you can do

| Content | Plunibio behavior |
| --- | --- |
| Markdown (`.md`, `.markdown`, `.mdown`, `.mkd`) | Edit documents visually, including properties, tables, code, diagrams, and mathematics. |
| Recognized text and code | Edit plain text or source code with language-aware tools. SVG files open as XML. |
| AVIF, BMP, GIF, ICO, JPEG, PNG, and WebP | View images. Edits can only be saved as PNG, JPEG, or WebP. |
| Other files | Ask the operating system to open them with the default application. |

The relevant chapters explain these formats and their limits in more detail.

## Manual conventions

- Names in **bold** match interface text, such as **More options** or **Save**.
- Keys appear as <kbd>Ctrl</kbd> + <kbd>S</kbd>. The primary modifier is <kbd>Ctrl</kbd> on Windows and Linux and <kbd>⌘</kbd> on macOS. The manual shows both only when the equivalent shortcut has been verified.
- Notes provide context. Warnings identify possible data loss or an operation that needs special attention.
- Paths and extensions appear as `notes/ideas.md` or `.png`.

The manual describes Plunibio as it behaves in the stated version. Differences between Windows, Linux, and macOS are explained beside the relevant step when they affect a procedure.

{% capture alpha_notice %}
This manual covers **Plunibio 0.1.2** and was last reviewed on **October 31, 2026**. Plunibio is currently in alpha: features and interfaces may change before the first stable release. You can report a problem through [GitHub Issues]({{ site.github_url }}/issues).
{% endcapture %}
{% include docs-callout.html type="warning" title="Version and product status" content=alpha_notice %}
