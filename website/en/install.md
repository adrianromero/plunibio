---
layout: content
lang: en
translation_key: installation
section: installation
title: Installation
permalink: /en/install/
eyebrow: Get Plunibio
intro: Install a build prepared for your system or build Plunibio directly from source.
---

## Installers

Official installers for Windows, Linux, and macOS will be published soon through [GitHub Releases](https://github.com/adrianromero/plunibio/releases).

- **Windows x86_64:** NSIS installer (`.exe`) and Windows Installer package (`.msi`). Coming soon.
- **Linux x86_64:** Debian package (`.deb`) and AppImage (`.AppImage`). Coming soon.
- **macOS:** disk image (`.dmg`) and application bundle for Apple Silicon and Intel. Coming soon.

## Build from source

Building Plunibio requires [Git](https://git-scm.com/), a current [Node.js](https://nodejs.org/) LTS release with npm, and the stable [Rust](https://rustup.rs/) toolchain. You must also install the Tauri dependencies for your operating system.

### Windows

Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the **Desktop development with C++** workload. Tauri also uses [Microsoft Edge WebView2](https://developer.microsoft.com/microsoft-edge/webview2/), which is included with modern Windows versions.

If you want to generate the `.msi` package, make sure the optional Windows **VBSCRIPT** feature is enabled.

Then open PowerShell and run:

```powershell
git clone https://github.com/adrianromero/plunibio.git
cd plunibio
npm ci
npm run tauri build
```

### Linux

On Debian and Ubuntu, install the desktop dependencies with:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev \
  patchelf xdg-utils
```

Then build Plunibio:

```bash
git clone https://github.com/adrianromero/plunibio.git
cd plunibio
npm ci
npm run tauri build
```

See the [official Tauri prerequisites](https://v2.tauri.app/start/prerequisites/#linux) if you use another distribution.

### macOS

Install the Xcode command-line tools to build the desktop application:

```bash
xcode-select --install
```

Then build Plunibio from Terminal:

```bash
git clone https://github.com/adrianromero/plunibio.git
cd plunibio
npm ci
npm run tauri build
```

Generated packages are written to `src-tauri/target/release/bundle/`. Tauri builds packages for the operating system on which the command is run.
