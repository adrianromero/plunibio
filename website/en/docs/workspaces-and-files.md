---
layout: docs-chapter
lang: en
translation_key: docs-workspaces-files
section: docs
docs_key: workspaces-files
title: Workspaces and files
permalink: /en/docs/workspaces-and-files/
description: Navigate local folders and files, save changes, and reload from disk.
---

A workspace limits the local folder tree that Plunibio can browse. This chapter explains how to change that root, navigate without losing changes, recognize how each file type opens, and reread content changed outside the application.

## Open or switch workspaces

You can switch workspaces from any open folder or file:

1. Open **More options** and select **Open workspace**. You can also press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> on Windows and Linux or <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> on macOS.
2. Select a folder to enter it. Use **Parent folder** to move up one level or **Computer locations** to return to the locations provided by the operating system.
3. Check the path at the top. That folder will become the new workspace root; you do not need to select an item in the list.
4. Select **Open**. Plunibio displays the new workspace root and resets the navigation history.
{: .docs-steps}

{% include docs-figure.html id="en-workspaces-and-files-workspace-selector" %}

If you cancel, you remain in the current workspace. Plunibio remembers the selected workspace and the last open item for the next session.

## Browse folders and files

The workspace root and each folder list folders first and files second. Within each group, names are sorted alphabetically, initially ignoring letter case.

1. Select a folder to display its contents.
2. Select a file to open the editor or action for its format.
3. Select **Home** in the file path to return directly to the workspace root.
{: .docs-steps}

{% include docs-figure.html id="en-workspaces-and-files-workspace-root" %}

To include hidden items, open **More options**, open **Hidden files**, and select **Show**. Select **Hide** to remove them from the listing again. This preference also applies to the workspace picker and persists between sessions.

{% capture hidden_note %}
**Hidden files** includes both files and folders whose names begin with a dot, as well as items that the operating system marks as hidden.
{% endcapture %}
{% include docs-callout.html type="note" content=hidden_note %}

## Use the file path and history

The file path shows **Home**, intermediate folders, and the current item. Select a folder in the path to return to it. In deep locations, only the last four segments appear; an ellipsis represents the earlier segments.

{% include docs-figure.html id="en-workspaces-and-files-nested-file" %}

**Back** and **Forward** move through the current workspace's history, including both folders and files. If you move back and then open another item, Plunibio starts a new history branch and discards the route that was ahead.

| Action | Windows and Linux | macOS |
| --- | --- | --- |
| Back | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>,</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>,</kbd> |
| Forward | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>.</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>.</kbd> |

The buttons are disabled when there is no destination in that direction. Switching workspaces clears the previous history.

## Recognize how a file opens

Plunibio chooses a view according to the item type:

| Item | Behavior |
| --- | --- |
| Folder | Displays its contents inside Plunibio. |
| Markdown file | Opens the visual editor for `.md`, `.markdown`, `.mdown`, and `.mkd`. |
| Recognized text or code file | Opens the text and code editor with the available language support. |
| Supported image | Opens the image viewer and editor. |
| Other file format | Displays **Open with the default application**. |

When you select **Open with the default application**, Plunibio hands the file to the operating system. The application that opens depends on your computer's file associations. If the file was moved, you lack permission, or the system cannot open it, Plunibio displays the error and keeps the current workspace open.

[Edit Markdown]({{ '/en/docs/edit-markdown/' | relative_url }}), [Edit text and code]({{ '/en/docs/edit-text-and-code/' | relative_url }}), and [View and edit images]({{ '/en/docs/view-and-edit-images/' | relative_url }}) describe the tools in each editor.

## Save changes explicitly

A dot beside the filename indicates unsaved changes. To write them to disk:

1. Press <kbd>Ctrl</kbd> + <kbd>S</kbd> on Windows and Linux or <kbd>⌘</kbd> + <kbd>S</kbd> on macOS. You can also open **More options** and select **Save**.
2. Wait for the save operation to finish.
3. Check that the dot disappears. If Plunibio cannot write the file, it displays an error and keeps the change indicator visible.
{: .docs-steps}

{% include docs-figure.html id="en-workspaces-and-files-unsaved-indicator" %}

**Save** is available only in an editor and is disabled when there are no pending changes. Use it before modifying the same file in another application.

## Understand saving when navigating or closing

When you leave a modified file—by opening another item, switching workspaces, or closing Plunibio—the application first attempts to save the content. This behavior is called **saving when navigating or closing**; it does not replace **Save** when you want immediate confirmation that changes are on disk.

If the attempt fails, Plunibio displays the error and lets you decide:

- Select **Cancel** to stay in the file and resolve the problem without leaving your changes.
- Select **Continue** while navigating, or **Quit anyway** while closing, only if you accept the risk of losing the pending content.

{% capture save_warning %}
Continuing after a save error can result in data loss. Check permissions, available disk space, and whether the file is still accessible; then use **Save** again.
{% endcapture %}
{% include docs-callout.html type="warning" content=save_warning %}

## Reload content from disk

Use **Reload** when another program has modified the file or when you want to discard the editor state and reread the disk.

1. Open **More options** and select **Reload**, or press <kbd>Ctrl</kbd> + <kbd>R</kbd> on Windows and Linux or <kbd>⌘</kbd> + <kbd>R</kbd> on macOS.
2. Review the message. Plunibio always asks for confirmation while you are editing a file, even if no changes are pending.
3. Select **OK** to reread the file or **Cancel** to keep the editor unchanged.
{: .docs-steps}

{% include docs-figure.html id="en-workspaces-and-files-reload-confirmation" %}

If unsaved changes exist, the message explicitly states that they will be discarded.

{% include docs-figure.html id="en-workspaces-and-files-reload-discard-changes" %}

{% capture reload_warning %}
After you confirm, Plunibio cannot recover the unsaved changes. **Reload** does not show this confirmation for a folder: it immediately rereads the listing to reflect files added, removed, or renamed outside the application.
{% endcapture %}
{% include docs-callout.html type="warning" content=reload_warning %}

If the file no longer exists, reloading opens an empty document marked as new. You can save it to create the file again or navigate to another item.

## Create a file named on the command line

Plunibio does not provide a graphical action for creating files or folders. However, you can start it with the relative name of a text or Markdown file that does not yet exist; the editor opens it empty and displays the change indicator.

- **Save** creates the file, even if it is still empty.
- If you close or navigate without typing anything and without using **Save**, the file is not created.
- If you type content, saving when navigating or closing attempts to preserve it.

See [Command line]({{ '/en/docs/command-line/' | relative_url }}) for the parameters and path rules.

## Keep paths inside the workspace

The file list, file path, and relative links opened by Plunibio resolve inside the workspace root. A path that attempts to escape it with `..` is rejected. Web links, `mailto:` links, and external files inserted as URIs are handed to the system's default application instead of becoming internal paths.

This boundary prevents relative navigation from silently switching to another folder tree. [Links and images]({{ '/en/docs/links-and-images/' | relative_url }}) explains how links behave inside and outside the workspace.
