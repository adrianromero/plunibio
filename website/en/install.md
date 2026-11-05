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

{% assign release = site.data.releases %}
{% assign appimage = release.assets | where: 'format', 'appimage' | first %}
{% assign deb = release.assets | where: 'format', 'deb' | first %}

## Latest published version

Plunibio **{{ release.version }}**, published on **{{ release.published_on }}**. See the [release notes and all files]({{ release.url }}).

<nav class="release-platform-nav" aria-label="Downloads by system"><a href="#windows-downloads">Windows</a><a href="#linux-downloads">Linux</a><a href="#macos-downloads">macOS</a></nav>

<aside class="release-notice" aria-label="Status and limitations" markdown="1">
**Before downloading**

Plunibio is under development and may contain errors. Keep backups of your documents before editing them or updating the application. It is distributed under the [MIT License]({{ site.license_url }}), which describes its terms.

The packages do not have a **verified publisher signature**, so your system may show security warnings. The maintainer has tested the four Windows and Linux packages identified below; **the macOS packages have not yet been tested**. This does not validate every feature or every version of each operating system.
</aside>

### Windows · 64-bit Intel / AMD
{: #windows-downloads }

Choose one format: EXE provides an installation wizard; MSI is a Windows Installer package. You do not need both. The `en-US` segment in the MSI filename does not limit the languages available inside Plunibio.

{% include release-downloads.html platform="windows" %}

### Linux · 64-bit Intel / AMD
{: #linux-downloads }

Choose DEB for a distribution that uses Debian packages, or AppImage to run the application from a file. Here, `amd64`, `x64`, and `x86_64` refer to the 64-bit Intel/AMD architecture. This release has no Linux ARM packages.

{% include release-downloads.html platform="linux" %}

### macOS · Apple Silicon and Intel
{: #macos-downloads }

**Not tested:** we do not have a Mac available to check these packages. Choose Apple Silicon for M-series chips or Intel for an Intel-based Mac. The DMG contains the application; `.app.tar.gz` is the compressed alternative.

If you try a package, please share the result through [GitHub Issues]({{ site.github_url }}/issues): macOS version, processor, package filename, steps, and outcome. Avoid including personal paths or other private information.

{% include release-downloads.html platform="macos" %}

Each download includes a **SHA-256** value published by GitHub. It lets you compare the file's integrity against that value; it does not replace a publisher signature or functional testing. Download packages through this page or the official release.

## Install a downloaded package

The installers contain the application: you do not need Node.js, Rust, or build tools to use them. Verified minimum operating-system versions have not been established; the reported package tests do not guarantee every distribution or version.

### Windows

Open the downloaded EXE or MSI and follow its wizard. Then launch **Plunibio** from the Start menu. If Windows shows an unknown-publisher warning, see [Microsoft's information about SmartScreen](https://learn.microsoft.com/windows/apps/package-and-deploy/smartscreen-reputation) and check the file's source before deciding whether to proceed.

### Linux: AppImage

In the folder containing the download, make the file executable and run it:

```bash
chmod +x "{{ appimage.name }}"
./{{ appimage.name }}
```

You can also allow execution through your file manager. See the [official AppImage guide](https://docs.appimage.org/introduction/quickstart.html) for help.

### Linux: DEB

On Debian or Ubuntu, from the download folder:

```bash
sudo apt install ./{{ deb.name }}
```

Review the dependencies and changes proposed by the package manager. Then launch Plunibio from your desktop's application menu.

### macOS: procedure awaiting testing

If you choose to try the DMG, open it and copy **Plunibio.app** to **Applications**; the `.app.tar.gz` alternative requires extracting the application first. These steps have not been reproduced on a Mac for this version. macOS may prevent opening because it cannot verify the developer; see [Apple's guide to opening apps safely](https://support.apple.com/en-us/102445). Include the exact message in your report if an error occurs.

After opening Plunibio, follow [Getting started]({{ '/en/docs/getting-started/' | relative_url }}) to choose a workspace, create a document, and save a change. A workspace is a folder on your computer, rather than an account or a library you need to import.

## Update or uninstall

Before updating, save your documents, close Plunibio, and keep a backup. Download the new package for your system; for AppImage, use the new file in place of the previous one. For installed packages, follow the installer's or package manager's method. Switching between installation formats has not been verified: retaining configuration when switching is not guaranteed.

To remove the application, use your system's uninstaller or package manager; for AppImage, delete the application file while it is closed. Keep your workspace folders: they contain your documents. Deleting documents or preferences is a separate operation and is not necessary to browse or download another version.

If you cannot install or open a package, report the system, architecture, filename, and error message through [GitHub Issues]({{ site.github_url }}/issues). For editing or saving problems, see [Shortcuts and troubleshooting]({{ '/en/docs/shortcuts-and-troubleshooting/' | relative_url }}).

## Build from source

These instructions build the published version **{{ release.version }}** from tag **{{ release.tag }}**, rather than the development branch.

Building Plunibio requires [Git](https://git-scm.com/), a current [Node.js](https://nodejs.org/) LTS release with npm, and the stable [Rust](https://rustup.rs/) toolchain. You must also install the Tauri dependencies for your operating system.

### Windows

Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the **Desktop development with C++** workload. Tauri also uses [Microsoft Edge WebView2](https://developer.microsoft.com/microsoft-edge/webview2/), which is included with modern Windows versions.

If you want to generate the `.msi` package, make sure the optional Windows **VBSCRIPT** feature is enabled.

Then open PowerShell and run:

```powershell
git clone https://github.com/adrianromero/plunibio.git
cd plunibio
git checkout {{ release.tag }}
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
git checkout {{ release.tag }}
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
git checkout {{ release.tag }}
npm ci
npm run tauri build
```

Generated packages are written to `src-tauri/target/release/bundle/`. Tauri builds packages for the operating system on which the command is run.
