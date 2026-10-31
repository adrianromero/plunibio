---
layout: docs-chapter
lang: es
translation_key: docs-getting-started
section: docs
docs_key: getting-started
title: Primeros pasos
permalink: /es/docs/primeros-pasos/
description: Abre un espacio, reconoce la interfaz y realiza tu primer cambio.
---

Plunibio edita archivos locales dentro de una carpeta que eliges como espacio. En este recorrido abrirás un espacio, localizarás un documento Markdown, harás un cambio y lo guardarás. No necesitas usar el contenido de ejemplo que aparece en las imágenes; puedes seguir los mismos pasos con una carpeta propia.

## Entender espacios, carpetas y archivos

- **Espacio.** Es la carpeta que Plunibio utiliza como raíz. La aplicación no permite navegar fuera de ella desde la lista de archivos.
- **Carpeta.** Agrupa otros elementos dentro del espacio. Selecciónala para ver su contenido.
- **Archivo.** Es un elemento guardado en el disco, como `ideas.md`, `datos.json` o `foto.png`.
- **Documento Markdown.** Es un archivo Markdown que Plunibio muestra en el editor visual. Sigue siendo un archivo de texto compatible con otras aplicaciones.

## Abrir Plunibio y elegir un espacio

Al iniciarse, Plunibio intenta restaurar el último espacio utilizado y el último archivo abierto dentro de ese espacio. Si la carpeta guardada ya no está disponible, utiliza la carpeta desde la que se inició la aplicación.

Para trabajar en otra carpeta:

1. Abre **Más opciones** en la esquina superior derecha.
2. Selecciona **Abrir espacio**. También puedes pulsar <kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>O</kbd> en Windows y Linux, o <kbd>⌘</kbd> + <kbd>Mayús</kbd> + <kbd>O</kbd> en macOS.
3. Busca la carpeta que quieres utilizar.
4. Selecciona **Abrir**. La raíz del espacio aparece en el área de contenido.
{: .docs-steps}

Plunibio recuerda el espacio y el último archivo cuando cierras la aplicación normalmente.

## Reconocer la ventana principal

La barra superior y el panel lateral rodean el área donde se muestra la carpeta o se edita el archivo.

{% include docs-figure.html id="es-getting-started-main-interface" %}

- **Atrás** y **Adelante** recorren el historial de archivos y carpetas visitados.
- La **ruta del archivo** empieza en **Inicio** y muestra la ubicación del elemento actual. Selecciona un segmento para volver a esa carpeta.
- **Mostrar panel lateral** u **Ocultar panel lateral** cambia la visibilidad de las herramientas del editor actual.
- **Más opciones** reúne la apertura de espacios, **Recargar**, **Guardar**, las preferencias y la información de la aplicación.
- El **área de contenido** muestra una carpeta, un editor o la acción disponible para un formato externo.
- El **panel lateral** cambia según el tipo de archivo. En Markdown contiene **Formato** y **Buscar**.

## Utilizar el menú general

Abre **Más opciones** para consultar las acciones generales. **Recargar** y **Guardar** se desactivan cuando no se pueden aplicar. Las opciones de **Tipografía** solo aparecen al editar Markdown.

{% include docs-figure.html id="es-getting-started-general-menu" %}

Desde este menú también puedes cambiar el tema, el idioma y la visibilidad de los archivos ocultos. El capítulo [Personalizar Plunibio]({{ '/es/docs/personalizar-plunibio/' | relative_url }}) explica qué opciones se recuerdan.

## Abrir y guardar tu primer documento Markdown

1. Desde la raíz del espacio, abre las carpetas necesarias y selecciona un archivo con extensión `.md`, `.markdown`, `.mdown` o `.mkd`.
2. Selecciona un párrafo en el área de contenido y escribe un cambio. El punto junto al nombre del archivo indica que hay cambios sin guardar.
3. Pulsa <kbd>Ctrl</kbd> + <kbd>S</kbd> en Windows y Linux o <kbd>⌘</kbd> + <kbd>S</kbd> en macOS. También puedes abrir **Más opciones** y seleccionar **Guardar**.
4. Comprueba que el indicador de cambios desaparece. El archivo actualizado ya está guardado en el disco.
{: .docs-steps}

{% include docs-figure.html id="es-workspaces-and-files-unsaved-indicator" %}

{% capture reload_warning %}
**Recargar** vuelve a leer el archivo desde el disco. Si existen cambios sin guardar, Plunibio pide confirmación antes de descartarlos. Consulta [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}) antes de utilizar esta acción como método de recuperación.
{% endcapture %}
{% include docs-callout.html type="warning" content=reload_warning %}

## Continuar aprendiendo

Ya puedes abrir un espacio, reconocer la interfaz y guardar un cambio. Continúa con [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}) para aprender a recorrer carpetas, utilizar el historial, crear archivos y gestionar cambios externos.
