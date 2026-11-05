---
layout: docs-chapter
lang: en
translation_key: docs-links-images
section: docs
docs_key: links-images
title: Links and images
permalink: /en/docs/links-and-images/
description: Create links and insert images by address, pasting, or dragging.
---

Plunibio stores links and image references in the Markdown file. This chapter explains how to create them, open their destinations, and keep the files you need when sharing a document.

## Create a link

1. Select the text to use as the link. To use the address itself as the visible text, place the cursor without selecting text.
2. Open the sidebar, select **Format**, and choose **Link** under **Text formatting**.
3. Enter the URL or relative path in **Link address**, such as `https://example.com` or `notes/field-notes.md`.
4. Select **OK**, the checkmark button. **Cancel** or <kbd>Esc</kbd> closes editing without creating the link.
{: .docs-steps}

{% include docs-figure.html id="en-links-and-images-create-link" %}

Confirming preserves the selected text and adds the link to it. Without a selection, Plunibio inserts the address as linked text. Save the document to keep the change.

## Edit, copy, or remove a link

Move the pointer over a link to see its address and actions.

{% include docs-figure.html id="en-links-and-images-link-actions" %}

1. Select **Edit link**.
2. Change **Link address**.
3. Select **OK** to apply the address or **Cancel** to keep the previous one. You can also cancel with <kbd>Esc</kbd>.
{: .docs-steps}

{% include docs-figure.html id="en-links-and-images-link-address-edit" %}

**Copy link** copies the address to the clipboard. **Remove link** keeps the visible text and removes its link; it does not delete the destination file. To change the visible text, edit it in the document.

## Open a destination and understand its path

1. Move the pointer over the link.
2. Select the **address** shown in the floating controls.
3. If the destination is a workspace file, Plunibio opens it in the appropriate editor. Use **Back** to return to the document.
{: .docs-steps}

| Address | Behavior |
| --- | --- |
| `https://example.com` or `http://example.com` | Opens through the system's default application, usually a browser. |
| `mailto:person@example.com` | Is handed to the mail application configured on the system. |
| `notes/ideas.md` | Resolves from the current Markdown document's folder. |
| `../ideas.md` | Moves to the parent folder, provided the destination stays inside the workspace. |
| `#section` | Looks for that identifier in the current document and scrolls to it if found. |
| `file:///...` | Can be kept in the document, but opening it from Plunibio is unsupported. |

To link to another section, use an identifier that exists in the current document. For another document, link to its file first; then use its internal links to navigate within it.

{% capture path_warning %}
Relative links cannot leave the workspace root. A `file:` URI for an external file does not become a workspace path and does not open in the default application from these controls. To work with that file, use its application or place a copy inside the workspace and link to it with a relative path.
{% endcapture %}
{% include docs-callout.html type="warning" content=path_warning %}

## Insert an image by address

1. Place the cursor in an empty paragraph to create a block image, or inside a paragraph containing text to insert an inline image.
2. In **Format**, find **Blocks** and select **Image**.
3. In **Paste the image link...**, enter an existing relative path, such as `assets/atlas-de-lumina.png`, or an image URL.
4. Select **Confirm** or press <kbd>Enter</kbd>. The image appears in the document.
{: .docs-steps}

{% include docs-figure.html id="en-links-and-images-insert-image" %}

A relative address is interpreted from the Markdown file's folder. Entering an address creates a reference; it does not copy a file into that folder. Remote images need their server to remain available; Plunibio keeps their URL.

## Change an image reference or open its file

Move the pointer over an image, or select it, to show **Image actions**.

{% include docs-figure.html id="en-links-and-images-image-actions" %}

1. Select **Edit link**.
2. Change **Link address** to the new path or URL.
3. Select **OK** to apply the change or **Cancel** to keep the previous reference.
{: .docs-steps}

{% include docs-figure.html id="en-links-and-images-image-address-edit" %}

**Copy link** copies the image reference. Select the address in the controls to open its destination: an existing local image opens in Plunibio; a web URL is handed to the system. SVG files open as XML in the text and code editor.

{% include docs-figure.html id="en-links-and-images-linked-image-opened" %}

Opening a local image requires an existing, accessible file. If its path becomes invalid, check the reference before trying to open it.

## Add a caption and adjust the size

Block images provide a caption and a size control.

1. Move the pointer over the image and select **Show or hide image caption**.
2. Type in **Write the image caption** and leave the field to finish editing. Use the same button to hide it again; to delete the text, clear the field.
3. To change the display size, move the pointer over the image and drag the control on its bottom edge. Save the document to preserve the caption and size.
{: .docs-steps}

{% include docs-figure.html id="en-links-and-images-image-caption" %}

The size affects presentation in Markdown. To change the file's pixels, open the image and see [View and edit images]({{ '/en/docs/view-and-edit-images/' | relative_url }}). Inline images do not provide this block caption.

## Paste or drag images and files

1. Place the cursor where you want to paste, or identify the point in the document where you will drop the content.
2. Copy an image, address, or file from another application and paste with <kbd>Ctrl</kbd> + <kbd>V</kbd> on Windows and Linux or <kbd>⌘</kbd> + <kbd>V</kbd> on macOS. You can also drag a file from your file manager and drop it in the editing area.
3. Check the inserted image or link and save the document.
{: .docs-steps}

| Received content | Result |
| --- | --- |
| Local image inside the workspace | Relative reference to the existing file; no duplicate is made. |
| Local image outside the workspace | A copy beside the Markdown file and a relative reference to that copy. |
| Image pixels from the clipboard | A PNG beside the Markdown file, initially named `pasted-image.png`. |
| Web image copied as HTML or a direct image URL | Reference to the remote URL; no local copy is downloaded. |
| Non-image file inside the workspace | Relative link to the file. |
| Non-image file outside the workspace | Absolute `file:` link; no copy is made, and Plunibio cannot open it. |
| Web URL or `mailto:` | A link; selected text can serve as its label. |
| Ordinary text | The editor's usual paste behavior. |

Supported image files for import are AVIF, BMP, GIF, ICO, JPEG, PNG, SVG, and WebP. When copying from a file manager, the result depends on whether it provides a file reference or image data to the clipboard. A URL is automatically recognized as an image when it has a supported extension; for other image addresses, use **Image** and enter the URL.

An image pasted or dropped into a compatible empty paragraph becomes a block image. Inside a paragraph containing text, it becomes an inline image. To import several files, add them one at a time.

## Keep images when sharing a document

Imported images are saved beside the Markdown file. If a name already exists, Plunibio uses suffixes such as `photo-2.png` and `photo-3.png`, without overwriting the previous image. This copy is created during import; saving the Markdown keeps its reference.

{% capture share_warning %}
Share the document with its images and preserve relative paths. Renaming a file or folder in Plunibio does not automatically update links or image references. Review affected documents, including relative paths inside a renamed folder.
{% endcapture %}
{% include docs-callout.html type="warning" content=share_warning %}

If an image does not appear, check the path, file existence, and, for a remote URL, the connection and server. See [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}) for names, folders, and saving. Continue with [Tables, code, and advanced content]({{ '/en/docs/tables-code-and-advanced-content/' | relative_url }}) to insert tables, diagrams, and math.
