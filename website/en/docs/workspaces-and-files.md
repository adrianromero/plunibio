---
layout: docs-chapter
lang: en
translation_key: docs-workspaces-files
section: docs
docs_key: workspaces-files
title: Workspaces and files
permalink: /en/docs/workspaces-and-files/
description: Create, sort, rename, and delete files and folders; save changes and reload from disk.
---

A workspace limits the local folder tree that Plunibio can browse. This chapter explains how to create and organize its contents, rename and delete items, save changes, and reread files changed outside the application.

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

The workspace root and each folder list folders first and files second. Each item includes an icon identifying its editor type and details to help you recognize it:

- Files show their size and modification date.
- Folders show the number of visible files and folders they contain directly, and their modification date. The count excludes the contents of subfolders and does not represent a size in bytes.
- If Plunibio cannot obtain a value, it displays **Items unavailable** or **Date unavailable**, as appropriate.

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

## Sort the listing

Your chosen sort order applies to workspace folder listings and persists between sessions. It does not change the order in the **Open workspace** picker.

1. Open a folder and select **Show sidebar** if needed.
2. In **Actions**, find **Sort by** and select **Name**, **Size**, or **Modified**.
3. Select the same criterion again to alternate between ascending and descending order. The arrow indicates the active direction.
{: .docs-steps}

{% include docs-figure.html id="en-workspaces-and-files-folder-sorting" %}

| Criterion | Ascending order |
| --- | --- |
| Name | Alphabetical order adapted to the interface language, with numbers in natural order: `note2` comes before `note10`. |
| Size | Files from fewer to more bytes; folders from fewer to more immediate visible items. |
| Modified | Oldest to newest modification date. |

Folders remain before files in both directions. Unavailable size or date values appear at the end of their group. Showing hidden files also changes the count used to sort folders by size.

## Create folders and files

Creation actions are available while viewing a folder. To create beside an open file, first select its folder in the path at the top.

1. Open the destination folder. Select **Show sidebar** if needed.
2. In **Actions**, choose one of the options in the following table.
3. Enter the **Folder name** or **File name**. For Markdown and text, the field already contains `.md` or `.txt`; type the name before the extension.
4. Select **OK**. Plunibio immediately creates the item on disk and opens the resulting folder or file. **Cancel** closes the form without creating it.
{: .docs-steps}

{% include docs-figure.html id="en-workspaces-and-files-create-folder" %}

| Action | Result |
| --- | --- |
| New folder | Creates an empty folder and enters it. |
| New Markdown file | Suggests `.md` and opens the empty document in the Markdown editor if you keep that extension. |
| New text file | Suggests `.txt` and opens the empty document in the text editor if you keep that extension. |
| Other new file | Lets you enter the complete name, including an extension, such as `data.json`. The extension determines how it opens. |

New files are empty: **Other new file** does not generate a template or convert content into another format. Graphical creation places the file on disk even before you type anything or use **Save**.

Use a single name, without `/` or `\`; do not enter a path or use `.` or `..`. To create several levels, create a folder, enter it, and repeat. The name must be valid on your operating system. If an item with that name already exists or you lack permission, Plunibio displays an error and does not overwrite the existing item.

Creation shortcuts only act while a folder is displayed:

| Action | Windows and Linux | macOS |
| --- | --- | --- |
| New folder | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd> | <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd> |
| New Markdown file | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd> | <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd> |
| New text file | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd> | <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd> |

## Use the file path and history

The file path shows **Home**, intermediate folders, and the current item. Select a folder in the path to return to it. In deep locations, only the last four segments appear; an ellipsis represents the earlier segments.

{% include docs-figure.html id="en-workspaces-and-files-nested-file" %}

**Back** and **Forward** move through the current workspace's history, including both folders and files. If you move back and then open another item, Plunibio starts a new history branch and discards the route that was ahead.

| Action | Windows and Linux | macOS |
| --- | --- | --- |
| Back | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>,</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>,</kbd> |
| Forward | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>.</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>.</kbd> |

The buttons are disabled when there is no destination in that direction. Switching workspaces clears the previous history.

## Rename the current file or folder

The menu beside the current item's name offers **Rename** and **Delete**. To act on a folder, enter it first. The **Home** root does not offer these actions.

{% include docs-figure.html id="en-workspaces-and-files-item-menu" %}

1. Open the file or folder that you want to rename.
2. Select the arrow beside its name in the path and choose **Rename**. You can also press <kbd>F2</kbd>.
3. In **Rename file** or **Rename folder**, enter the new name. For a file, the name without the extension is initially selected so you can keep the extension.
4. Select **OK**. If the editor has pending changes, Plunibio attempts to save them before renaming. If saving fails, the operation is canceled and an error appears.
{: .docs-steps}

{% include docs-figure.html id="en-workspaces-and-files-rename-entry" %}

The same naming rules apply as when creating an item. The item stays in its folder; you cannot move it by entering a path. If the destination name already exists, Plunibio displays an error and keeps both items.

Changing a file's extension displays an additional confirmation. Select **Continue** to accept or **Cancel** to keep the previous name. The new extension determines which editor opens; for example, changing `.md` to `.txt` displays the Markdown content as text.

{% include docs-figure.html id="en-workspaces-and-files-rename-extension" %}

{% capture rename_warning %}
Changing the extension does not convert the content's format. Renaming does not update links or image paths that used the previous name. After renaming a file or folder, review affected references in your documents.
{% endcapture %}
{% include docs-callout.html type="warning" content=rename_warning %}

## Delete a file or folder

{% capture delete_warning %}
Deletion is permanent: it does not move the item to the trash and cannot be undone in Plunibio. Deleting a folder removes all its contents, including subfolders and hidden files. Deleting an open file also discards the editor's changes without saving them first. Keep a copy of anything you need before continuing.
{% endcapture %}
{% include docs-callout.html type="warning" content=delete_warning %}

1. Open the file or enter the folder that you want to delete. Check its name and location in the path.
2. Select the arrow beside the current item's name and choose **Delete**.
3. Review the name in the confirmation. Select **Cancel** to keep it or **Delete** to remove it permanently.
4. After deleting it, Plunibio displays its parent folder. If deletion fails, an error appears.
{: .docs-steps}

{% include docs-figure.html id="en-workspaces-and-files-delete-folder" %}

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

A **square icon with a pencil** beside the filename, described as **Unsaved changes**, indicates pending changes. To write them to disk:

1. Press <kbd>Ctrl</kbd> + <kbd>S</kbd> on Windows and Linux or <kbd>⌘</kbd> + <kbd>S</kbd> on macOS. You can also open **More options** and select **Save**.
2. Wait for the save operation to finish.
3. Check that the indicator disappears. If Plunibio cannot write the file, it displays an error and keeps the change indicator visible.
{: .docs-steps}

{% include docs-figure.html id="en-workspaces-and-files-unsaved-indicator" %}

**Save** is available only in an editor and is disabled when there are no pending changes. Use it before modifying the same file in another application.

## Understand saving when navigating or closing

When you leave a modified file—by opening another item, switching workspaces, or closing Plunibio—the application first attempts to save the content. This behavior is called **saving when navigating or closing**; it does not replace **Save** when you want immediate confirmation that changes are on disk.

If the attempt fails, Plunibio displays the error and lets you decide:

- Select **Cancel** to stay in the file and resolve the problem without leaving your changes.
- Select **Continue**, both when navigating and when closing, only if you accept the risk of losing the pending content.

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

If a text or Markdown file no longer exists, reloading opens an empty document marked as new. You can save it to create the file again or navigate to another item.

## Create a file named on the command line

Alongside graphical creation, you can start Plunibio with the relative name of a text or Markdown file that does not yet exist. In this case, the editor opens it empty and displays the change indicator, but creation on disk is deferred until you save it.

- **Save** creates the file, even if it is still empty.
- If you close or navigate without typing anything and without using **Save**, the file is not created.
- If you type content, saving when navigating or closing attempts to preserve it.

See [Command line]({{ '/en/docs/command-line/' | relative_url }}) for the parameters and path rules.

## Keep paths inside the workspace

The file list, file path, and relative links opened by Plunibio resolve inside the workspace root. A path that attempts to escape it with `..` is rejected. Web and `mailto:` links are handed to the system's default application. A `file:` URI for an external file can be kept in the document, but Plunibio rejects opening it from the editor.

This boundary prevents relative navigation from silently switching to another folder tree. [Links and images]({{ '/en/docs/links-and-images/' | relative_url }}) explains how links behave inside and outside the workspace.
