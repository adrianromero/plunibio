---
layout: content
lang: en
translation_key: docs
section: docs
title: Docs
permalink: /en/docs/
eyebrow: Start building with Plunibio
intro: The essentials for running the project locally and understanding how Plunibio chooses a workspace and document.
---

## Run from source

You will need a current Node.js LTS release, npm, the stable Rust toolchain, and the platform dependencies required by Tauri.

```bash
git clone https://github.com/adrianromero/plunibio.git
cd plunibio
npm ci
npm run tauri dev
```

## Open a workspace

By default, Plunibio restores the last workspace you used. You can choose one explicitly when starting the development build:

```bash
npm run tauri -- dev -- -- --base-path /absolute/path/to/notes
```

The packaged application also accepts a document path relative to its workspace:

```text
plunibio [FILENAME] [--base-path BASEPATH]
```

Absolute document paths and paths containing `..` are rejected so navigation remains inside the selected workspace.

## Build the application

Create an optimized application bundle with:

```bash
npm run tauri build
```

Platform-specific packages are written below `src-tauri/target/release/bundle/`.

## Project status

Plunibio is under active development. For detailed development notes, contribution guidance, or to report a problem, visit the [project on GitHub](https://github.com/adrianromero/plunibio).
