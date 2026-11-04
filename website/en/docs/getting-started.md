---
layout: docs-chapter
lang: en
translation_key: docs-getting-started
section: docs
docs_key: getting-started
title: Getting started
permalink: /en/docs/getting-started/
description: Open a workspace, create a Markdown document, and save your first change.
---

Plunibio edits local files inside a folder that you choose as a workspace. In this walkthrough, you will open a workspace, create a Markdown document, write a note, and save it. You can follow the steps with your own folder; you do not need to download the sample content shown in the images.

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
- The **file path** starts at **Home** and shows the current item's location. Select a folder in the path to return to it.
- The **current item's name**, with an arrow beside it, opens the **Rename** and **Delete** menu. This menu does not appear at the workspace root.
- **Show sidebar** or **Hide sidebar** changes the visibility of the current editor's tools.
- **More options** contains workspace selection, **Reload**, **Save**, preferences, and application information.
- The **content area** displays a folder, an editor, or the action available for an external format.
- The **sidebar** changes with the content. In a folder, it contains **Actions** for creation and sorting; in Markdown, it contains **Format** and **Search**.

## Use the general menu

Open **More options** to see the general actions. **Reload** and **Save** are disabled when they cannot be used. **Typography** is available from any view and changes the presentation of Markdown documents.

{% include docs-figure.html id="en-getting-started-general-menu" %}

You can also change the theme, language, and hidden-file visibility from this menu. [Customize Plunibio]({{ '/en/docs/customize-plunibio/' | relative_url }}) explains which options are remembered.

## Create your first Markdown document

1. Select **Home** to return to the workspace root or open the folder where you want to create the file.
2. If the sidebar is hidden, select **Show sidebar**. In the **Actions** tab, select **New Markdown file**.
3. In **Create file**, the **File name** field already contains `.md`. Type `my-first-note` before the extension to produce `my-first-note.md`.
4. Select **OK**. Plunibio creates the empty file in that folder and opens it in the Markdown editor.
{: .docs-steps}

{% include docs-figure.html id="en-getting-started-folder-actions" %}

{% include docs-figure.html id="en-getting-started-create-document" %}

The file already exists on disk, even though it is still empty. If you prefer to edit an existing document, select it in the folder listing. Files ending in `.md`, `.markdown`, `.mdown`, and `.mkd` open in the Markdown editor.

## Write and save your first change

1. Select the editing area and type a sentence, such as `This is my first note in Plunibio.`
2. Look for the **square icon with a pencil** beside the filename. Its description is **Unsaved changes**, indicating that your text has not yet been saved to disk.
3. Press <kbd>Ctrl</kbd> + <kbd>S</kbd> on Windows and Linux or <kbd>⌘</kbd> + <kbd>S</kbd> on macOS. You can also open **More options** and select **Save**.
4. Wait for the indicator to disappear. The file on disk now contains your note.
{: .docs-steps}

{% include docs-figure.html id="en-getting-started-first-document-unsaved" %}

Plunibio also attempts to save changes when you navigate to another item or close the application. [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}) explains this **saving when navigating or closing**, including the choices available if saving fails.

{% capture reload_warning %}
**Reload** reads the file from disk again. If you have unsaved changes, Plunibio asks for confirmation before discarding them. Read [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}) before using this action as a recovery method.
{% endcapture %}
{% include docs-callout.html type="warning" content=reload_warning %}

## Continue learning

You can now open a workspace, recognize the interface, create a document, and save your first note. Continue with [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}) to sort contents, use history, rename or delete items, and handle external changes. [Edit Markdown]({{ '/en/docs/edit-markdown/' | relative_url }}) explains how to format the document.
