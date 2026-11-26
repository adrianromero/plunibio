# Plunibio

![1.00](./plunibio-readme.png)

A lightweight desktop Markdown editor built with Tauri, SolidJS, and Milkdown Crepe.

> 🔵 Plunibio is under active development. Features and interfaces may change before the first stable release.

## Features

- Visual Markdown editing powered by [Milkdown Crepe](https://milkdown.dev/).

- Browse files and folders without leaving the application.

- Breadcrumb navigation relative to a configurable base directory.

- Unsaved-change indicator and in-place file saving.

- Open a missing file as a new empty document and create it on first save.

- Reload a file from disk after confirming that current content changes can be discarded.

- Global loading feedback for asynchronous operations.

- English, Spanish, Catalan, Galician and Basque interfaces, with a saved language preference and system-locale fallback.

- Base-directory boundary checks in the Rust backend.

## Technology

| Area            | Technology                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| Desktop runtime | [Tauri 2](https://v2.tauri.app/)                                                                              |
| Frontend        | [SolidJS](https://www.solidjs.com/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/) |
| Editor          | [Milkdown Crepe](https://milkdown.dev/)                                                                       |
| Backend         | [Rust](https://www.rust-lang.org/), [Tokio](https://tokio.rs/)                                                |

## Prerequisites

Install the following before building Plunibio:

- A current [Node.js](https://nodejs.org/) LTS release and npm.

- The stable Rust toolchain through [rustup](https://rustup.rs/).

- The platform dependencies listed in the [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/).

## Getting started

Clone or fork the repository, then install the locked npm dependencies from its root directory:

```bash
npm ci
```

Start the application in development mode using the last saved base directory, or the process working directory when no base directory has been saved yet:

```bash
npm run tauri dev
```

To select a base directory explicitly, pass it with `--base-path`:

```bash
npm run tauri -- dev -- -- --base-path /absolute/path/to/markdown/files
```

The extra separators are required because npm and the Tauri CLI each process their own arguments.

## Command-line usage

The packaged executable accepts an optional relative filename and an optional base path:

```text
plunibio [FILENAME] [--base-path BASEPATH] [--width WIDTH] [--height HEIGHT]
```

- `FILENAME` is a file or folder path relative to the base path. Absolute paths and paths containing `..` are rejected.

- A selected `FILENAME` that does not exist opens as an empty, unsaved document. An explicit save creates the file even while it is empty; navigating away from an untouched empty document does not create it.

- Reloading discards current content changes. If the file does not exist, it reloads as an empty document and remains marked unsaved because it has not yet been created.

- `BASEPATH` must identify an existing directory. It may be absolute or relative; a relative base path is resolved against the process working directory.

- `WIDTH` and `HEIGHT` set the initial window dimensions and must be greater than zero. Each supplied value takes precedence over its corresponding value in `~/.plunibio/properties.toml`; omitted dimensions continue to use their saved values.

- When `FILENAME` is omitted, Plunibio restores the last filename opened for that base path. If the base path has no saved filename, it opens with no selected filename.

- When `BASEPATH` is omitted, Plunibio uses the base path saved in `~/.plunibio/properties.toml`. If the property is missing, unavailable, or no longer identifies a directory, it falls back to the process working directory.

- When both are omitted, Plunibio selects the saved base path (falling back to the process working directory) and restores that base path's saved filename when available.

- The selected base path is canonicalized before the application starts.

The arguments resolve as follows:

| Arguments provided                | Filename                                                 | Base path                                                     |
| --------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| Neither                           | Last saved filename for the selected base path, or empty | Saved base path, or the process working directory as fallback |
| `FILENAME` only                   | Relative file or folder path                             | Saved base path, or the process working directory as fallback |
| `--base-path BASEPATH` only       | Last saved filename for `BASEPATH`, or empty             | `BASEPATH`                                                    |
| Both, with an absolute `BASEPATH` | Relative file or folder path                             | Absolute `BASEPATH`                                           |
| Both, with a relative `BASEPATH`  | Relative file or folder path                             | `BASEPATH` resolved from the process working directory        |

On a normal shutdown, Plunibio stores the current canonical base path and its last filename in `~/.plunibio/properties.toml`, alongside the window dimensions. Changing the workspace from the application also updates the base path held in memory for the next configuration save. An explicitly supplied `--base-path`, `FILENAME`, `--width`, or `--height` always takes precedence over its corresponding saved value. Configuration read, path restoration, window sizing, and configuration write failures are logged without displaying an error to the user.

Examples:

```bash
plunibio
plunibio README.md
plunibio guides
plunibio --base-path /home/user/Documents/notes
plunibio daily/today.md --base-path ./notes
plunibio --width 1280 --height 720
```

Run `plunibio --help` to display the built-in command-line help.

## Building

Create an optimized application bundle with:

```bash
npm run tauri build
```

Platform-specific bundles are written under:

```text
src-tauri/target/release/bundle/
```

To build only the frontend assets:

```bash
npm run build
```

## Development

### Documentation and examples policy

During feature development, bug fixes, refactoring, and other coding tasks, **do not change `website/` or `examples/` unless the user explicitly requests it**. This applies to agents such as Codex and includes creating, editing, deleting, or regenerating documentation, examples, fixtures, and screenshots. Application behavior changes do not automatically authorize updates to these directories.

These updates are reserved for a dedicated documentation task when preparing a new release, once features are frozen, and still require an explicit request. Reading the directories is allowed; checks that would write to them must use temporary copies. Preserve any changes already present in the working tree.

### Application architecture

At startup, the frontend applies the saved theme and typography, requests the initial workspace and filename from Rust, and mounts the Solid application. `App` provides localization and application context, asks Rust for the selected path's kind, and passes the selection to `RootContent`. Directories open the folder browser. Files go through the filename dispatcher. [Startup](src/index.tsx) · [App](src/app/App.tsx) · [Content selection](src/features/editors/ContentForPath.ts) · [RootContent](src/app/RootContent.tsx)

| When changing | Where the behavior belongs |
| --- | --- |
| Navigation, editor commands or global feedback | `useAppContext()` exposes three groups. `main` owns the workspace, filename transitions and dialogs. `editor` exposes editor actions, modified state and display preferences. `spinner` provides loading feedback. Use `main.loadFilename` for ordinary navigation so the current editor's unload handler runs. [AppContext](src/app/AppContext.tsx) |
| A keyboard shortcut | The application provider defines the key, modifiers and accessor for the currently available handler. The dispatcher matches events, checks blocked interactions and handles capture or bubble phase. Connect the shortcut and the toolbar to the same action so availability follows the active editor. [AppShortcuts](src/app/AppShortcuts.tsx) · [Toolbar](src/features/toolbar/Toolbar.tsx) |
| Translated UI or errors | In a component, call `const { t } = useI18N()` and use `t("errors.unsupportedPathType", { filename })` for a parameterized message. Pass the typed `Translator` to helpers that need it. English defines the key shape. Keep the same keys and placeholder names across the five dictionaries. Rust error codes are translated at the UI boundary. [Localization](src/i18n/Localization.tsx) · [Dictionaries](src/i18n/translations/) · [Error translation](src/shared/errors/AppError.ts) |
| Controls, styling or persisted UI preferences | Reuse the shared controls, menus, sidebar and dialogs. Keep component layout in adjacent `*.module.css`, use theme variables for colors, and put library-wide overrides in the Milkdown or AG Grid stylesheet. Preference modules own loading, saving and applying settings such as theme and typography. [Shared UI](src/shared/ui/) · [Styles](src/styles/) · [Preferences](src/preferences/) |
| Cross-feature behavior | Look for path display, error presentation and logging in `src/shared/`. Search and printing have their own feature modules. For search, implement the existing controller contract when a new view needs a different search engine. [Shared helpers](src/shared/) · [SearchController](src/features/search/SearchController.ts) · [Printing](src/features/printing/) |
| Native file access | Tauri registers commands in `lib.rs`. Existing file operations live in `commands.rs`, with workspace path handling in `paths.rs`. Follow the request and response through the Rust implementation and its TypeScript consumer when changing an IPC contract. [Registration](src-tauri/src/lib.rs) · [Commands](src-tauri/src/commands.rs) · [Paths](src-tauri/src/paths.rs) · [Frontend types](src/backend/rusttypes.ts) · [Capabilities](src-tauri/capabilities/) |

### Extending an editor

1. **Choose the entry point.** Put format-specific code beside the closest editor under `src/features/editors/`. The dispatcher checks compound filenames such as `.echarts.json`, table formats and known extensions before falling back to an external opener. For another text language, start with the language mapping. [Filename dispatch](src/features/editors/EditorForFilename.ts) · [CodeLanguages](src/features/editors/text/CodeLanguages.ts)
2. **Choose the view.** `EditorText` passes filename-specific CodeMirror extensions to `EditorTextView` with `view={null}`. `EditorMarkdown` uses the same shell with Markdown extensions and a rich `ViewMarkdown` powered by Crepe. An alternate view uses `useEditorTextView()` to register its adapter and report readiness-related errors or empty states. [EditorText](src/features/editors/text/EditorText.tsx) · [EditorMarkdown](src/features/editors/markdown/EditorMarkdown.tsx) · [View contract](src/features/editors/text/EditorTextViewContext.tsx)
3. **Use the shared file lifecycle.** The shell connects its adapter to `createFileEditorController`. The controller loads, saves and reloads through text or binary storage. The adapter supplies `getContent`, `replaceContent` and `destroy`, with optional hooks for buffered edits, focus and printing. Keep format parsing and serialization in the feature. Exercise opening, editing, switching modes where supported, saving and reopening the result. [EditorTextView](src/features/editors/text/EditorTextView.tsx) · [File controller and adapter](src/app/FileEditorController.ts)

### Storybook and desktop automation

Run `npm run storybook` to interact with component states, or `npm run build-storybook` to build the catalog. Stories live beside their feature in `__stories__/`. The preview provides localization, light and dark themes, and accessibility tooling. Wrap stories that consume application context in `StoryAppProvider` and keep them aligned with changes to props, handlers and visible states. [Preview configuration](.storybook/preview.tsx) · [StoryAppProvider](src/app/__stories__/support/StoryAppProvider.tsx)

For end-to-end behavior, build the instrumented desktop app with `npm run automation:build`. For example, `npm run automation:run -- automation/flows/smoke-markdown-source.json` exercises Markdown editing on a temporary copy of the sample workspace. JSON flows also drive PDF checks and capture real desktop screenshots for the manual and website. Prefer accessible targets and check each flow's inputs and output directory. [Runner, selectors and capture workflows](automation/README.md) · [Markdown smoke flow](automation/flows/smoke-markdown-source.json)

### Local validation

```bash
npm run check
npm test
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --manifest-path src-tauri/Cargo.toml --locked
```

Regenerate all application icons from `plunibio-logo.png` with:

```bash
npm run tauri icon plunibio-logo.png
```

## Continuous integration

The validation workflow does not run automatically on pushes or pull requests. Run it on demand from the repository's **Actions** tab:

1. Select **CI manual**.
2. Choose **Run workflow**.
3. Select the branch to validate and confirm the run.

The workflow installs the locked dependencies, checks TypeScript, runs the test suite, builds the frontend, checks Rust formatting, and checks the Rust backend. Its definition is available in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

## Releasing

Desktop releases are built only when a tag whose name starts with `v` is pushed. The version after the `v` must match the version declared in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`.

To prepare a release:

1. Update the version in all three files.
2. Run the local checks, including the release-version check:

   ```bash
   npm run release:check -- v0.2.0
   npm run check
   npm test
   npm run build
   cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
   cargo check --manifest-path src-tauri/Cargo.toml --locked
   ```

3. Optionally run **CI manual** against the release branch from the Actions tab.
4. Commit the version changes, create the matching tag, and push it:

   ```bash
   git tag -a v0.2.0 -m "Plunibio v0.2.0"
   git push origin v0.2.0
   ```

The release workflow builds the following packages:

| Platform | Architecture | Packages |
| --- | --- | --- |
| Linux | x86_64 | Debian package (`.deb`) and AppImage (`.AppImage`) |
| macOS | Apple Silicon | Application bundle (`.app`) and disk image (`.dmg`) |
| macOS | Intel | Application bundle (`.app`) and disk image (`.dmg`) |
| Windows | x86_64 | NSIS installer (`-setup.exe`) and Windows Installer (`.msi`) |

GitHub creates the release as a draft with generated release notes. Tags containing a prerelease suffix, such as `v0.2.0-alpha.1`, create a prerelease. Download and test the generated packages before publishing the draft release. Since a macOS `.app` is a directory, it is archived when uploaded as a release asset.

The macOS packages currently use an ad-hoc signature and the Windows packages are unsigned. Operating-system security warnings may therefore appear until production code signing and macOS notarization are configured. The release workflow is defined in [`.github/workflows/release.yml`](./.github/workflows/release.yml).

## Website maintenance

For an authorized release documentation update, start from the recorded baseline, compare it with the target version and plan the affected Spanish and English pages together. The editorial guide defines terminology, chapter structure, warnings, evidence and completion criteria. The maintenance guide ties each chapter to its screenshot flows, image descriptions and publication checks. [Website maintenance](website/README.md) · [Editorial guide](website/maintenance/editorial.md) · [Documentation baseline](website/maintenance/current-baseline.md)

The Atlas de Lumina and documentation lab workspaces provide examples for walkthroughs, QA and screenshots. Use temporary copies for checks that edit their contents. Updates to these workspaces and the site follow the [documentation and examples policy](#documentation-and-examples-policy). [Example workspace guidelines](examples/README.md)

## Contributing

Contributions and bug reports are welcome. Before submitting a pull request:

1. Open an issue for substantial changes so the approach can be discussed first.
2. Keep changes focused and follow the existing TypeScript and Rust style.
3. Update documentation as appropriate, respecting the [documentation and examples policy](#documentation-and-examples-policy): changes to `website/` and `examples/` require an explicit request and are deferred until release preparation with frozen features.
4. Run the validation commands listed above.
5. Describe what changed and how it was tested in the pull request.

Use GitHub Issues to report bugs, request features, or ask project-related questions. Include the operating system, Plunibio version, reproduction steps, and relevant logs when reporting a bug.

## License

Plunibio is released under the [MIT License](./LICENSE).

Copyright (c) 2026 Adrián Romero.

Third-party dependencies and assets remain subject to their respective licenses.
