---
layout: docs-chapter
lang: en
translation_key: docs-getting-started
section: docs
docs_key: getting-started
title: Getting started
permalink: /en/docs/getting-started/
description: Open a workspace, recognize the interface, and make your first change.
---

Plunibio edits local files inside a folder that you choose as a workspace. In this walkthrough, you will open a workspace, locate a Markdown document, make a change, and save it. You do not need the sample content shown in the images; you can follow the same steps with your own folder.

## Understand workspaces, folders, and files

- **Workspace.** The folder that Plunibio uses as its root. The file list does not let you navigate outside it.
- **Folder.** A container for other items inside the workspace. Select it to view its contents.
- **File.** An item stored on disk, such as `ideas.md`, `data.json`, or `photo.png`.
- **Markdown document.** A Markdown file that Plunibio displays in the visual editor. It remains a text file that other applications can use.

## Open Plunibio and choose a workspace

When Plunibio starts, it attempts to restore the last workspace and the last file opened in that workspace. If the saved folder is no longer available, it uses the folder from which the application was started.

To work in another folder:

1. Open **More options** in the upper-right corner.
2. Select **Open workspace**. You can also press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> on Windows and Linux or <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> on macOS.
3. Find the folder that you want to use.
4. Select **Open**. The workspace root appears in the content area.
{: .docs-steps}

Plunibio remembers the workspace and its last file when you close the application normally.

## Recognize the main window

The top toolbar and sidebar surround the area where you browse a folder or edit a file.

{% include docs-figure.html id="en-getting-started-main-interface" %}

- **Back** and **Forward** move through the history of visited files and folders.
- The **file path** starts at **Home** and shows the current item's location. Select a segment to return to that folder.
- **Show sidebar** or **Hide sidebar** changes the visibility of the current editor's tools.
- **More options** contains workspace selection, **Reload**, **Save**, preferences, and application information.
- The **content area** displays a folder, an editor, or the action available for an external format.
- The **sidebar** changes with the file type. For Markdown, it contains **Format** and **Search**.

## Use the general menu

Open **More options** to see the general actions. **Reload** and **Save** are disabled when they cannot be used. **Typography** options only appear while editing Markdown.

{% include docs-figure.html id="en-getting-started-general-menu" %}

You can also change the theme, language, and hidden-file visibility from this menu. [Customize Plunibio]({{ '/en/docs/customize-plunibio/' | relative_url }}) explains which options are remembered.

## Open and save your first Markdown document

1. From the workspace root, open any required folders and select a file with the `.md`, `.markdown`, `.mdown`, or `.mkd` extension.
2. Select a paragraph in the content area and type a change. The dot beside the filename indicates unsaved changes.
3. Press <kbd>Ctrl</kbd> + <kbd>S</kbd> on Windows and Linux or <kbd>⌘</kbd> + <kbd>S</kbd> on macOS. You can also open **More options** and select **Save**.
4. Check that the change indicator disappears. The updated file is now stored on disk.
{: .docs-steps}

{% include docs-figure.html id="en-workspaces-and-files-unsaved-indicator" %}

{% capture reload_warning %}
**Reload** reads the file from disk again. If you have unsaved changes, Plunibio asks for confirmation before discarding them. Read [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}) before using this action as a recovery method.
{% endcapture %}
{% include docs-callout.html type="warning" content=reload_warning %}

## Continue learning

You can now open a workspace, recognize the interface, and save a change. Continue with [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}) to learn how to browse folders, use history, create files, and handle external changes.
