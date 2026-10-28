# Plunibio

![1.00](./plunibio-readme.png)

A lightweight desktop Markdown editor built with Tauri, SolidJS, and Mikldown Crepe.

> 🔵 Plunibio is under active development. Features and interfaces may change before the first stable release.

## Features

- Visual Markdown editing powered by [Milkdown Crepe](https://milkdown.dev/).

- Browse files and folders without leaving the application.

- Breadcrumb navigation relative to a configurable base directory.

- Unsaved-change indicator and in-place file saving.

- Open a missing file as a new empty document and create it on first save.

- Reload a file from disk after confirming that current content changes can be discarded.

- Global loading feedback for asynchronous operations.

- English and Spanish user interfaces selected from the system locale.

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

The main source directories are:

```text
src/                    SolidJS application and styles
src/i18n/               English and Spanish translations
src-tauri/src/          Rust application and Tauri commands
src-tauri/capabilities/ Tauri security capabilities
```

Useful validation commands:

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

## Contributing

Contributions and bug reports are welcome. Before submitting a pull request:

1. Open an issue for substantial changes so the approach can be discussed first.
2. Keep changes focused and follow the existing TypeScript and Rust style.
3. Add or update documentation when behavior changes.
4. Run the validation commands listed above.
5. Describe what changed and how it was tested in the pull request.

Use GitHub Issues to report bugs, request features, or ask project-related questions. Include the operating system, Plunibio version, reproduction steps, and relevant logs when reporting a bug.

## License

Plunibio is released under the [MIT License](./LICENSE).

Copyright (c) 2026 Adrián Romero.

Third-party dependencies and assets remain subject to their respective licenses.
