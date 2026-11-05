---
layout: docs-chapter
lang: en
translation_key: docs-command-line
section: docs
docs_key: command-line
title: Command line
permalink: /en/docs/command-line/
description: Start Plunibio with a workspace, file, or custom window size.
---

Start Plunibio from a terminal to choose a workspace, open a file or folder, and set the initial window size. Arguments specify what to open for that launch; omitted values may be restored from the previous session.

## Run the installed application

Examples use `plunibio` as the executable name. If it is not available in your `PATH`, use its actual path. For an AppImage, use the path of the AppImage file you installed. See [Installation]({{ '/en/install/' | relative_url }}) to prepare the application.

In a Linux or macOS terminal, quote an executable path containing spaces:

```bash
"/path/to/plunibio" --help
```

In PowerShell, use `&` before a quoted executable path:

```powershell
& "C:\path\plunibio.exe" --help
```

Replace example paths with paths on your computer. These commands run the desktop executable; they do not require npm or a development server.

## Check syntax and options

```text
plunibio [OPTIONS] [FILENAME]
```

| Argument or option | Purpose |
| --- | --- |
| `FILENAME` | File or folder to open, relative to the workspace. Optional. |
| `--base-path BASEPATH` | Workspace root folder. May be absolute or relative to the terminal’s working directory and must exist. |
| `--width WIDTH` | Initial window width, as an integer greater than zero. |
| `--height HEIGHT` | Initial window height, as an integer greater than zero. |
| `-h`, `--help` | Show help and exit without opening the window. |
| `-V`, `--version` | Show the installed version and exit without opening the window. |

Only one `FILENAME` is accepted. Combine it with options, for example:

```bash
plunibio --base-path "/home/user/Documents" --width 1200 --height 800 "notes/idea.md"
```

## Choose a workspace or open its root

To select a workspace, pass its folder with `--base-path`:

```bash
plunibio --base-path "/home/user/Documents"
```

If you have used that workspace before, Plunibio may restore its last file or folder. To open the root explicitly, add `.` as the argument:

```bash
plunibio --base-path "/home/user/Documents" .
```

A relative base path is resolved from the terminal’s working directory. If you are in the folder containing `my-workspace`, use:

```bash
plunibio --base-path "./my-workspace" .
```

To explicitly use the terminal’s current folder as the workspace, run `plunibio --base-path . .`. Running only `plunibio` allows the previous workspace to be restored.

## Open a workspace file or folder

`FILENAME` is interpreted inside the chosen workspace, rather than from the terminal’s working directory. For example:

```bash
plunibio --base-path "/home/user/Documents" "notes/idea.md"
plunibio --base-path "/home/user/Documents" "notes"
```

In PowerShell, the same pattern can use Windows paths:

```powershell
& "C:\path\plunibio.exe" --base-path "C:\Users\User\Documents" "notes\idea.md"
```

If you omit `--base-path`, the file is looked up in the restored workspace; the terminal’s current folder is used only when there is no valid saved workspace. To make a command always open the same location, provide both the base and the relative path.

Do not use an absolute path as `FILENAME`. Parent segments `..` are also rejected, even in a path such as `notes/../idea.md`. The target must remain inside the workspace; filesystem links cannot open targets outside that root. Quotes allow names containing spaces, but do not change these rules.

## Request a file that does not exist yet

A missing name with an editable extension can open as an empty document. For example, if the `notes` folder already exists:

```bash
plunibio --base-path "/home/user/Documents" "notes/new-idea.md"
```

1. Check the name in the window’s path. **Unsaved changes** appears even before you type anything.
2. To create the empty file, press <kbd>Ctrl</kbd> + <kbd>S</kbd> on Windows/Linux or <kbd>⌘</kbd> + <kbd>S</kbd> on macOS.
3. If you enter content, save explicitly or use saving when navigating or closing, as described in [Workspaces and files]({{ '/en/docs/workspaces-and-files/' | relative_url }}).
{: .docs-steps}

If you leave the empty document without explicitly saving or entering content, the file is not created. Creating a file from a folder’s **Actions** panel creates it immediately. Prepare the destination folder first; the argument does not create intermediate folders.

## Choose the initial window size

```bash
plunibio --width 1200 --height 800
```

You can provide just one dimension. For example, `plunibio --width 1200` changes the initial width and keeps the saved height, or its initial value if none was saved. Values must be integers greater than zero; do not use percentages, decimals, or a suffix such as `px`.

Dimensions apply to the application window. Closing normally saves its current size, which may differ from the requested size if you resized the window.

## Understand precedence

| Value | When provided in the command | When omitted |
| --- | --- | --- |
| Workspace | Uses `--base-path`. | Last valid saved workspace; otherwise the terminal’s current directory. |
| File or folder | Uses `FILENAME` within the chosen workspace. | Last saved target for that workspace; otherwise its root. |
| Width | Uses `--width`. | Saved width; otherwise 800. |
| Height | Uses `--height`. | Saved height; otherwise 600. |

Explicit arguments take precedence independently. Changing only the workspace does not force its root to open; changing only the width does not replace the height. Use `.` as the target to avoid restoring the last file.

## Recognize what is restored

When closing normally, Plunibio saves the current workspace, the last file or folder for each workspace used, and the window dimensions. The next launch without arguments attempts to restore those values.

This information is stored in `.plunibio/properties.toml` inside your home folder (`~/.plunibio/properties.toml` on Linux and macOS). You do not need to edit that file to use arguments. If the saved workspace is no longer available, the terminal’s current directory is used.

Theme, language, typography, sidebar visibility, hidden files, and sorting are preferences separate from this restoration; see [Customize Plunibio]({{ '/en/docs/customize-plunibio/' | relative_url }}).

## Resolve argument errors

| Problem | What to check |
| --- | --- |
| Executable cannot be found | Use its actual path or check that it is available in `PATH`. |
| Base path is missing or is a file | Choose an existing folder for `--base-path`. |
| Filename must be relative | Pass the root folder with `--base-path` and the file or subfolder separately, without an absolute path or `..`. |
| Invalid dimension | Use an integer greater than zero after `--width` or `--height`. |
| Missing value or unknown option | Check the option name and value with `--help`; only one positional target is accepted. |
| Window opens a previous target | Provide `--base-path` and an explicit target; use `.` to open the root. |

Argument errors are reported before the window opens and exit with status 2. Help and version queries exit with status 0. Problems reading or saving a document are handled inside the application; see [Shortcuts and troubleshooting]({{ '/en/docs/shortcuts-and-troubleshooting/' | relative_url }}).
