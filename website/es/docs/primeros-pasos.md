---
layout: docs-chapter
lang: es
translation_key: docs-getting-started
section: docs
docs_key: getting-started
title: Primeros pasos
permalink: /es/docs/primeros-pasos/
description: Abre un espacio, crea un documento Markdown y guarda tu primer cambio.
---

Plunibio edita archivos locales dentro de una carpeta que eliges como espacio. En este recorrido abrirás un espacio, crearás un documento Markdown, escribirás una nota y la guardarás. Puedes seguir los pasos con una carpeta propia; no necesitas descargar el contenido de ejemplo que aparece en las imágenes.

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
- La **ruta del archivo** empieza en **Inicio** y muestra la ubicación del elemento actual. Selecciona una carpeta de la ruta para volver a ella.
- El **nombre del elemento actual**, con una flecha a su lado, abre el menú **Renombrar** y **Eliminar**. Este menú no aparece en la raíz del espacio.
- **Mostrar panel lateral** u **Ocultar panel lateral** cambia la visibilidad de las herramientas del editor actual.
- **Más opciones** reúne la apertura de espacios, **Recargar**, **Guardar**, las preferencias y la información de la aplicación.
- El **área de contenido** muestra una carpeta, un editor o la acción disponible para un formato externo.
- El **panel lateral** cambia según el contenido. En una carpeta contiene **Acciones**, con creación y ordenación; en Markdown contiene **Formato** y **Buscar**.

## Utilizar el menú general

Abre **Más opciones** para consultar las acciones generales. **Recargar** y **Guardar** se desactivan cuando no se pueden aplicar. **Tipografía** está disponible desde cualquier vista y cambia la presentación de los documentos Markdown.

{% include docs-figure.html id="es-getting-started-general-menu" %}

Desde este menú también puedes cambiar el tema, el idioma y la visibilidad de los archivos ocultos. El capítulo [Personalizar Plunibio]({{ '/es/docs/personalizar-plunibio/' | relative_url }}) explica qué opciones se recuerdan.

## Crear tu primer documento Markdown

1. Selecciona **Inicio** para volver a la raíz del espacio o abre la carpeta donde quieres crear el archivo.
2. Si el panel lateral está oculto, selecciona **Mostrar panel lateral**. En la pestaña **Acciones**, selecciona **Nuevo archivo Markdown**.
3. En **Crear archivo**, el campo **Nombre del archivo** ya contiene `.md`. Escribe `mi-primera-nota` delante de la extensión para obtener `mi-primera-nota.md`.
4. Selecciona **OK**. Plunibio crea el archivo vacío en esa carpeta y lo abre en el editor Markdown.
{: .docs-steps}

{% include docs-figure.html id="es-getting-started-folder-actions" %}

{% include docs-figure.html id="es-getting-started-create-document" %}

El archivo ya existe en el disco, aunque todavía esté vacío. Si prefieres editar un documento existente, selecciónalo en el listado de la carpeta. Las extensiones `.md`, `.markdown`, `.mdown` y `.mkd` se abren en el editor Markdown.

## Escribir y guardar el primer cambio

1. Selecciona el área de edición y escribe una frase, por ejemplo: `Esta es mi primera nota en Plunibio.`
2. Comprueba el **icono cuadrado con lápiz** junto al nombre del archivo. Su descripción es **Cambios sin guardar** e indica que lo escrito todavía no está guardado en el disco.
3. Pulsa <kbd>Ctrl</kbd> + <kbd>S</kbd> en Windows y Linux o <kbd>⌘</kbd> + <kbd>S</kbd> en macOS. También puedes abrir **Más opciones** y seleccionar **Guardar**.
4. Espera a que el indicador desaparezca. El archivo del disco ya contiene tu nota.
{: .docs-steps}

{% include docs-figure.html id="es-getting-started-first-document-unsaved" %}

Plunibio también intenta guardar los cambios al navegar a otro elemento o cerrar la aplicación. Este **guardado al navegar o cerrar** se explica en [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}), junto con las decisiones disponibles si no se puede guardar.

{% capture reload_warning %}
**Recargar** vuelve a leer el archivo desde el disco. Si existen cambios sin guardar, Plunibio pide confirmación antes de descartarlos. Consulta [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}) antes de utilizar esta acción como método de recuperación.
{% endcapture %}
{% include docs-callout.html type="warning" content=reload_warning %}

## Continuar aprendiendo

Ya puedes abrir un espacio, reconocer la interfaz, crear un documento y guardar tu primera nota. Continúa con [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}) para ordenar el contenido, utilizar el historial, renombrar o eliminar elementos y gestionar cambios externos. [Editar Markdown]({{ '/es/docs/editar-markdown/' | relative_url }}) explica cómo dar formato al documento.
