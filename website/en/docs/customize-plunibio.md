---
layout: docs-chapter
lang: en
translation_key: docs-customize
section: docs
docs_key: customize
title: Customize Plunibio
permalink: /en/docs/customize-plunibio/
description: Choose the theme, language, Markdown typography, and file visibility.
---

Adapt presentation and navigation to the way you work. Preferences apply throughout Plunibio: they remain in effect when you change files or workspaces and are stored locally for future launches. They are not saved as part of your documents’ content.

## Find the preferences

Open **More options** in the upper-right corner. Under **General**, you will find **Theme**, **Language**, and **Hidden files**. The **Markdown** section contains **Typography**, which is also available when you are viewing a folder, code, or an image.

{% include docs-figure.html id="en-customize-preferences-menu" %}

Options show their current value. Selecting another value applies it immediately; you do not need to select **Save** to keep a preference. Sidebar visibility has its own button, and sorting is selected in folder listings.

## Choose a theme

1. Open **More options** → **Theme**.
2. Select **Light** or **Dark**.
3. Check the window’s appearance. Return to the same menu to choose the other theme whenever you want.
{: .docs-steps}

{% include docs-figure.html id="en-customize-dark-theme" %}

The theme changes interface colors and editor presentation. It does not change document text or the saved colors of images. The selected theme remains in effect when you reopen Plunibio.

## Change the application language

1. Open **More options** → **Language**.
2. Select **English**, **Español**, **Català**, **Galego**, or **Euskara**. Names appear in their own language so you can recognize them.
3. Continue working with menus and messages in the selected language. You do not need to restart the application.
{: .docs-steps}

{% include docs-figure.html id="en-customize-language-menu" %}

Without a saved choice, Plunibio uses the system’s primary language if it is supported; otherwise, it uses English. A manual choice is remembered for future launches.

Changing the application language does not translate your files or change this manual’s language. To read the documentation in Spanish, use **ES** in the website header.

## Choose Markdown typography

1. Open **More options** → **Typography**, under **Markdown**.
2. Select **Sans Serif**, **Serif**, **Modern**, or **Reading**.
3. Open or return to a Markdown document to check how its headings and text appear.
{: .docs-steps}

{% include docs-figure.html id="en-customize-typography-menu" %}

| Option | Menu description |
| --- | --- |
| **Sans Serif** | Clean and familiar. |
| **Serif** | Classic and formal. |
| **Modern** | Contemporary and minimal. |
| **Reading** | Comfortable for long texts. |

This is how a document appears with **Reading**:

{% include docs-figure.html id="en-customize-reading-typography" %}

The choice applies throughout the application and affects Markdown content presentation. It does not change the saved format, headings, or marks in the document. It does not change the text and code editor’s font either. To apply bold, headings, or other formatting, see [Edit Markdown]({{ '/en/docs/edit-markdown/' | relative_url }}).

## Show or hide the sidebar

1. Select **Hide sidebar** in the top toolbar to give the content more space.
2. Select **Show sidebar** to restore the current view’s controls.
{: .docs-steps}

You can also toggle it with <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>B</kbd> on Windows/Linux or <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>B</kbd> on macOS. Plunibio remembers its visibility; available tools depend on the open file or folder.

Opening [Find and replace]({{ '/en/docs/find-and-replace/' | relative_url }}) shows the sidebar even if you had hidden it. You can hide it again when you finish.

## Include hidden files and folders

1. Open **More options** → **Hidden files**.
2. Select **Show** to include them in listings.
3. Select **Hide** when you want to remove them from the view.
{: .docs-steps}

Hidden items are not yet shown in this listing:

{% include docs-figure.html id="en-customize-hidden-files-before" %}

After selecting **Show**, the file and folder whose names begin with a dot also appear:

{% include docs-figure.html id="en-customize-hidden-files-after" %}

The option includes both names beginning with a dot and items marked as hidden by the operating system. It affects workspace folders and the workspace picker. It does not change file names, permissions, or attributes; it only determines whether items appear in the listing.

## Keep your folder sort order

1. Open a folder and, if needed, select **Show sidebar**. Under **Actions**, find **Sort by**.
2. Select **Name**, **Size**, or **Modified**.
3. Select the same criterion again to switch between ascending and descending. The arrow shows the current direction.
{: .docs-steps}

The criterion and direction are remembered when you navigate to other folders and reopen Plunibio. Folders remain before files in both directions. **Size** compares bytes for files and the number of visible items for folders; showing hidden files can change that count.

For sorting rules, metadata, and unavailable values, see [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}).

## Check what is remembered

| Preference | Without a saved choice | Scope |
| --- | --- | --- |
| Theme | **Light** | Interface and editor presentation. |
| Language | Supported system primary language; otherwise English. | Application menus and messages. |
| Typography | **Sans Serif** | Markdown content presentation. |
| Sidebar | Visible | General visibility; tools depend on the view. |
| Hidden files | **Hide** | Folder listings and workspace picker. |
| Sorting | **Name**, ascending | Workspace folder listings. |

To return to a known configuration, choose the values you need using their controls. Changing these preferences does not require saving open files. Restoring the last workspace, file, and window size is explained in [Command line]({{ '/en/docs/command-line/' | relative_url }}).
