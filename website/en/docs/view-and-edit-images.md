---
layout: docs-chapter
lang: en
translation_key: docs-view-edit-images
section: docs
docs_key: view-edit-images
title: View and edit images
permalink: /en/docs/view-and-edit-images/
description: Zoom, rotate, flip, adjust, and save supported image formats.
---

Open a workspace image to inspect it, change its orientation, or adjust its appearance. The sidebar contains **Transform**, **Adjust**, and **Presets**. To insert an image in a document, see [Links and images]({{ '/en/docs/links-and-images/' | relative_url }}).

{% include docs-callout.html type="warning" content="Work on a copy if you want to keep the original. Saving overwrites the file and re-encodes the image; metadata or animation may be lost. Saving when navigating or closing also applies to modified images." %}

## Open an image and check its format

1. Enter the workspace folder containing the image and select its file.
2. If the sidebar is hidden, select **Show sidebar**. Open **Transform** to see the view and orientation controls.
{: .docs-steps}

{% include docs-figure.html id="en-view-edit-images-image-transform-panel" %}

The information in the lower corner shows the canvas dimensions in pixels, the zoom percentage, and the rotation angle. Zoom describes how you view the image; it does not change its saved dimensions.

| Format | View | Save after editing |
| --- | --- | --- |
| PNG (`.png`) | Yes | Yes |
| JPEG (`.jpg`, `.jpeg`) | Yes | Yes |
| WebP (`.webp`) | Yes | Yes |
| AVIF, BMP, GIF, and ICO | Yes, if the system can decode the file | No |

An animated image is displayed as a still image. Files ending in `.svg` open their XML source in [Edit text and code]({{ '/en/docs/edit-text-and-code/' | relative_url }}). They do not open in this viewer, although you can insert an SVG as an image in Markdown.

## Zoom, fit, and pan the view

In **Transform**, drag **Zoom level** between 10% and 500%, or use the wheel over the image. The buttons below it let you:

| Control | Result |
| --- | --- |
| **Zoom out** / **Zoom in** | Decrease or increase zoom in steps. |
| **Fit to screen** | Fit the whole image and center it; does not enlarge beyond actual size. |
| **Center image** | Restore the central position while keeping the current zoom. |
| **Actual size** (**1:1**) | Display the image at 100%. |

1. Select **Actual size** to inspect details at 100%.
2. Hold the primary mouse button over the image and drag to pan it.
3. Select **Center image** to restore the center or **Fit to screen** to see the whole image again.
{: .docs-steps}

{% include docs-figure.html id="en-view-edit-images-image-panned" %}

Changing zoom or panning does not modify the file or activate **Unsaved changes**. These actions are not tools for cropping or changing image resolution.

## Rotate and flip the image

1. In **Transform**, use **-90° Left** or **+90° Right** to rotate by a quarter turn. For another angle, drag **Rotation** between −180° and 180°.
2. Under **Flip / Mirror**, select **Horizontal** or **Vertical**. Repeat the same button to remove that flip.
3. Review the orientation and the **Unsaved changes** indicator before saving.
{: .docs-steps}

{% include docs-figure.html id="en-view-edit-images-image-rotated-flipped" %}

Rotation changes the canvas that will be saved. With a free angle, the canvas may grow to contain the whole image. If you need to see the full result after rotating, select **Fit to screen**.

## Adjust brightness, color, and contrast

1. Open **Adjust** in the sidebar.
2. Drag the controls and watch the result. The percentage beside each name shows its current value.
3. To remove these adjustments, select **Reset filters**. Rotation and flips are kept.
{: .docs-steps}

{% include docs-figure.html id="en-view-edit-images-image-adjust" %}

| Control | Range | Neutral value |
| --- | --- | --- |
| **Brightness** | 0–200% | 100% |
| **Contrast** | 0–200% | 100% |
| **Saturation** | 0–200% | 100% |
| **Grayscale** | 0–100% | 0% |
| **Sepia** | 0–100% | 0% |
| **Invert colors** | 0–100% | 0% |

For example, this image combines **Brightness** at 75%, **Contrast** at 130%, and **Saturation** at 140%:

{% include docs-figure.html id="en-view-edit-images-image-adjusted" %}

## Apply a preset

1. Open **Presets**.
2. Select **Normal**, **B & W**, **Vintage**, **Vivid**, **Dramatic**, or **Negative** to apply its combination of filters.
3. To fine-tune the result, return to **Adjust** and change the controls.
{: .docs-steps}

{% include docs-figure.html id="en-view-edit-images-image-presets" %}

**Normal** uses neutral values; **B & W** applies grayscale and more contrast; **Vintage** uses sepia; **Vivid** increases saturation and contrast; **Dramatic** boosts contrast and reduces brightness and saturation; **Negative** inverts colors.

A preset replaces all previous adjustments and also removes rotation and flips, including when you choose **Normal**. To combine it with a different orientation, apply the preset first and then rotate or flip the image.

## Choose how to reset

| Action | Resets | Keeps |
| --- | --- | --- |
| **Reset transforms**, in **Transform** | Rotation and flips; fits and centers the view. | Current filters. |
| **Reset filters**, in **Adjust** | Brightness, contrast, saturation, grayscale, sepia, and inversion to neutral values. | Rotation, flips, and view. |
| **Normal**, in **Presets** | Filters, rotation, and flips. | Zoom and pan. |

Resets work from the image loaded for this edit. They do not recover an original from before saving and reloading. **Unsaved changes** may still appear after a reset; this does not confirm that the result differs from the file on disk.

## Save the result

1. Check that the file is PNG, JPEG, or WebP and review the result.
2. Press <kbd>Ctrl</kbd> + <kbd>S</kbd> on Windows/Linux or <kbd>⌘</kbd> + <kbd>S</kbd> on macOS. You can also open **More options** → **Save**.
3. Wait for **Unsaved changes** to disappear. If an error appears, resolve it before considering the edit saved.
{: .docs-steps}

Saving writes the transformed image to the same file. It does not save zoom or pan as changes to its pixels. JPEG and WebP are compressed again with loss; avoid repeated saves if you need to preserve maximum quality. JPEG does not preserve transparency. Keep a separate copy of the original so you can recover it later.

**Saving when navigating or closing** attempts to save a modified image when you leave the edit. To discard changes, use **Reload** before navigating; see [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}) for decisions following save errors.

## Discard changes or reread the file

1. Before saving or navigating, open **More options** → **Reload**, or press <kbd>Ctrl</kbd> + <kbd>R</kbd> / <kbd>⌘</kbd> + <kbd>R</kbd>.
2. Review the message. To return to the file on disk and lose pending changes, select **OK**. To continue editing, select **Cancel**.
3. After reloading, the view fits again and the controls return to their initial values. If you saved the changes, their effect remains in the image even though the filters return to neutral values.
{: .docs-steps}

**Reload** does not recover an earlier version that has already been overwritten. The image editor does not offer the text editor’s undo history; use resets to remove adjustments from the current edit, or reload to discard what you have not saved yet.

## Handle a format that cannot be saved

AVIF, BMP, GIF, and ICO let you inspect the image and try the controls, but Plunibio cannot save the edited result in those formats.

{% include docs-figure.html id="en-view-edit-images-unsupported-image-save" %}

1. Close the unsupported-format message. Pending changes remain in the edit; the failed attempt does not save them.
2. If you do not need those changes, use **Reload** and confirm discarding them before navigating or closing.
3. To edit and save the image, create a PNG, JPEG, or WebP copy with a tool that converts images, and open that copy in Plunibio.
{: .docs-steps}

Changing only the name or extension does not convert the file contents. For a write permission problem or a damaged image, also check [Shortcuts and troubleshooting]({{ '/en/docs/shortcuts-and-troubleshooting/' | relative_url }}).
