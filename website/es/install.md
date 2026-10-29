---
layout: content
lang: es
translation_key: installation
section: installation
title: Instalación
permalink: /es/install/
eyebrow: Obtén Plunibio
intro: Instala una versión preparada para tu sistema o construye Plunibio directamente desde el código fuente.
---

## Instaladores

Los instaladores oficiales para Windows, Linux y macOS se publicarán próximamente mediante [GitHub Releases](https://github.com/adrianromero/plunibio/releases).

- **Windows x86_64:** instalador NSIS (`.exe`) y paquete Windows Installer (`.msi`). Próximamente.
- **Linux x86_64:** paquete Debian (`.deb`) y AppImage (`.AppImage`). Próximamente.
- **macOS:** imagen de disco (`.dmg`) y aplicación para Apple Silicon e Intel. Próximamente.

## Construir desde el código fuente

Para construir Plunibio necesitas [Git](https://git-scm.com/), una versión LTS actual de [Node.js](https://nodejs.org/) con npm y la cadena estable de [Rust](https://rustup.rs/). También debes instalar las dependencias de Tauri correspondientes a tu sistema.

### Windows

Instala [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) con la opción **Desarrollo para el escritorio con C++**. Tauri también utiliza [Microsoft Edge WebView2](https://developer.microsoft.com/microsoft-edge/webview2/), incluido en las versiones modernas de Windows.

Si quieres generar el paquete `.msi`, comprueba que la característica opcional **VBSCRIPT** de Windows está activada.

Después, abre PowerShell y ejecuta:

```powershell
git clone https://github.com/adrianromero/plunibio.git
cd plunibio
npm ci
npm run tauri build
```

### Linux

En Debian y Ubuntu puedes instalar las dependencias de escritorio con:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev \
  patchelf xdg-utils
```

Después, construye Plunibio:

```bash
git clone https://github.com/adrianromero/plunibio.git
cd plunibio
npm ci
npm run tauri build
```

Consulta los [requisitos oficiales de Tauri](https://v2.tauri.app/start/prerequisites/#linux) si utilizas otra distribución.

### macOS

Para construir la aplicación de escritorio instala las herramientas de línea de comandos de Xcode:

```bash
xcode-select --install
```

Después, construye Plunibio desde Terminal:

```bash
git clone https://github.com/adrianromero/plunibio.git
cd plunibio
npm ci
npm run tauri build
```

Los paquetes generados se guardan en `src-tauri/target/release/bundle/`. Tauri construye los paquetes para el sistema operativo en el que se ejecuta el comando.
