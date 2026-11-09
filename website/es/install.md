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

{% assign release = site.data.releases %}
{% assign appimage = release.assets | where: 'format', 'appimage' | first %}
{% assign deb = release.assets | where: 'format', 'deb' | first %}

## Última versión publicada

Plunibio **{{ release.version }}**, publicado el **{{ release.published_on }}**. Consulta las [notas de versión y todos los archivos]({{ release.url }}).

<nav class="release-platform-nav" aria-label="Descargas por sistema"><a href="#descargas-windows">Windows</a><a href="#descargas-linux">Linux</a><a href="#descargas-macos">macOS</a></nav>

<aside class="release-notice" aria-label="Estado y limitaciones" markdown="1">
**Antes de descargar**

Plunibio está en desarrollo y puede contener errores. Conserva copias de seguridad de tus documentos antes de editarlos o actualizar la aplicación. Se distribuye bajo la [licencia MIT]({{ site.license_url }}), que describe sus condiciones.

Los paquetes no cuentan con **firma de editor verificada**, por lo que el sistema puede mostrar advertencias de seguridad. Se han probado los ocho paquetes de Windows, Linux y macOS indicados abajo con un flujo básico de uso que incluye la edición de documentos y la selección de opciones de la aplicación. Esto no constituye una validación de todas las funciones ni de todas las versiones de cada sistema.
</aside>

### Windows · Intel / AMD de 64 bits
{: #descargas-windows }

Elige uno de los dos formatos: EXE ofrece un asistente de instalación; MSI es un paquete Windows Installer. No necesitas instalar ambos. El segmento `en-US` del nombre MSI no limita los idiomas disponibles dentro de Plunibio.

{% include release-downloads.html platform="windows" %}

### Linux · Intel / AMD de 64 bits
{: #descargas-linux }

Elige DEB para una distribución que utilice paquetes Debian, o AppImage para ejecutar la aplicación desde un archivo. `amd64`, `x64` y `x86_64` se refieren aquí a la arquitectura Intel/AMD de 64 bits. No hay paquetes Linux ARM en esta release.

{% include release-downloads.html platform="linux" %}

### macOS · Apple Silicon e Intel
{: #descargas-macos }

Elige Apple Silicon para chips de la serie M o Intel para un Mac con procesador Intel. DMG contiene la aplicación; `.app.tar.gz` es la alternativa comprimida.

{% include release-downloads.html platform="macos" %}

Cada descarga incluye un valor **SHA-256** publicado por GitHub. Permite comparar la integridad del archivo con ese valor; no sustituye una firma de editor ni una prueba funcional. Descarga los paquetes desde los enlaces de esta página o la release oficial.

## Problemas conocidos

Se han reportado los siguientes problemas en Ubuntu. Consulta cada issue para ver los detalles y seguir su evolución.

- **[#1 — [Ubuntu] Markdown editor scrollbar intermittently becomes invisible while scrolling remains functional](https://github.com/adrianromero/plunibio/issues/1)**

  La barra de desplazamiento del editor Markdown puede desaparecer de forma intermitente, aunque el desplazamiento sigue funcionando.
- **[#2 — [Ubuntu] Blurry or excessively heavy text rendering persists despite font-smoothing mitigation](https://github.com/adrianromero/plunibio/issues/2)**

  El texto puede verse borroso o con un grosor excesivo, especialmente las negritas.

## Instalar un paquete descargado

Los instaladores contienen la aplicación: no necesitas Node.js, Rust ni herramientas de compilación para utilizarlos. No se han establecido requisitos mínimos verificados de versión del sistema operativo; las pruebas de paquetes indicadas no garantizan todas las distribuciones o versiones.

### Windows

Abre el EXE o MSI descargado y sigue su asistente. Después, inicia **Plunibio** desde el menú Inicio. Si Windows muestra un aviso de editor desconocido, consulta la [información de Microsoft sobre SmartScreen](https://learn.microsoft.com/windows/apps/package-and-deploy/smartscreen-reputation) y comprueba la procedencia del archivo antes de decidir si continúas.

### Linux: AppImage

En la carpeta donde descargaste el archivo, permite su ejecución y ábrelo:

```bash
chmod +x "{{ appimage.name }}"
./{{ appimage.name }}
```

También puedes utilizar la opción de permitir ejecución de tu gestor de archivos. Consulta la [guía oficial de AppImage](https://docs.appimage.org/introduction/quickstart.html) si necesitas ayuda.

### Linux: DEB

En Debian o Ubuntu, desde la carpeta de descarga:

```bash
sudo apt install ./{{ deb.name }}
```

Revisa las dependencias y cambios que proponga el gestor de paquetes. Después, inicia Plunibio desde el menú de aplicaciones de tu escritorio.

### macOS

Abre el DMG y copia **Plunibio.app** a **Aplicaciones**; la alternativa `.app.tar.gz` requiere extraer primero la aplicación. macOS puede impedir la apertura por no poder verificar el desarrollador; consulta la [guía de Apple sobre apertura segura de aplicaciones](https://support.apple.com/en-us/102445). Si aparece un error, incluye el mensaje literal en tu informe.

Tras abrir Plunibio, sigue [Primeros pasos]({{ '/es/docs/primeros-pasos/' | relative_url }}) para elegir un espacio, crear un documento y guardar un cambio. El espacio es una carpeta de tu equipo, no una cuenta ni una biblioteca que debas importar.

## Actualizar o desinstalar

Antes de actualizar, guarda los documentos, cierra Plunibio y conserva una copia de seguridad. Descarga el paquete nuevo para tu sistema; para AppImage, utiliza el archivo nuevo en lugar del anterior. Para paquetes instalados, sigue el método de su instalador o gestor de paquetes. El cambio entre formatos de instalación no se ha verificado: no se garantiza conservar la configuración al alternarlos.

Para retirar la aplicación, utiliza el desinstalador o gestor de paquetes de tu sistema; en AppImage, elimina el archivo de la aplicación cuando esté cerrada. Conserva las carpetas de tus espacios: contienen tus documentos. Borrar documentos o preferencias es una operación distinta, que no es necesaria para consultar o descargar otra versión.

Si no puedes instalar o abrir un paquete, informa del sistema, arquitectura, nombre del archivo y mensaje de error en [GitHub Issues]({{ site.github_url }}/issues). Para problemas al editar o guardar, consulta [Atajos y solución de problemas]({{ '/es/docs/atajos-y-solucion-de-problemas/' | relative_url }}).

## Construir desde el código fuente

Estas instrucciones construyen la versión publicada **{{ release.version }}**, desde el tag **{{ release.tag }}**, en lugar de la rama de desarrollo.

Para construir Plunibio necesitas [Git](https://git-scm.com/), una versión LTS actual de [Node.js](https://nodejs.org/) con npm y la cadena estable de [Rust](https://rustup.rs/). También debes instalar las dependencias de Tauri correspondientes a tu sistema.

### Windows

Instala [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) con la opción **Desarrollo para el escritorio con C++**. Tauri también utiliza [Microsoft Edge WebView2](https://developer.microsoft.com/microsoft-edge/webview2/), incluido en las versiones modernas de Windows.

Si quieres generar el paquete `.msi`, comprueba que la característica opcional **VBSCRIPT** de Windows está activada.

Después, abre PowerShell y ejecuta:

```powershell
git clone https://github.com/adrianromero/plunibio.git
cd plunibio
git checkout {{ release.tag }}
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
git checkout {{ release.tag }}
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
git checkout {{ release.tag }}
npm ci
npm run tauri build
```

Los paquetes generados se guardan en `src-tauri/target/release/bundle/`. Tauri construye los paquetes para el sistema operativo en el que se ejecuta el comando.
