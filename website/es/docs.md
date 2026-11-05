---
layout: docs-index
lang: es
translation_key: docs
section: docs
title: Documentación
permalink: /es/docs/
eyebrow: Manual de usuario
intro: Aprende a organizar archivos locales, editar Markdown, trabajar con texto y código, y ajustar imágenes con Plunibio.
description: Manual de usuario de Plunibio para gestionar archivos y carpetas locales, editar Markdown, texto y código, y ajustar imágenes.
---

## Empieza aquí

Plunibio es una aplicación de escritorio para trabajar directamente con archivos de tu equipo. Un **espacio** es la carpeta local que Plunibio toma como raíz. Las carpetas y los archivos que contiene permanecen en el disco y pueden utilizarse con otras aplicaciones.

Si es la primera vez que lo utilizas, comienza por [Primeros pasos]({{ '/es/docs/primeros-pasos/' | relative_url }}). Abrirás un espacio, reconocerás la ventana principal, crearás un documento Markdown y guardarás tu primer cambio. Puedes seguir el recorrido con una carpeta propia, sin descargar los ejemplos que aparecen en las imágenes. Para preparar la aplicación, consulta [Instalación]({{ '/es/install/' | relative_url }}).

También puedes elegir una tarea concreta en el índice de capítulos.

## Qué puedes hacer

| Contenido | Comportamiento de Plunibio |
| --- | --- |
| Carpetas y archivos locales | Crear carpetas y archivos, consultar tamaño y fecha, ordenar el listado, renombrar y eliminar elementos permanentemente. |
| Markdown (`.md`, `.markdown`, `.mdown`, `.mkd`) | Editar documentos con formato visual, propiedades, tablas, código, diagramas y matemáticas. |
| Texto y código reconocidos | Editar texto sin formato o código con herramientas adaptadas al lenguaje. Los SVG se abren como XML. |
| AVIF, BMP, GIF, ICO, JPEG, PNG y WebP | Visualizar imágenes. Las ediciones solo se pueden guardar en archivos PNG, JPEG o WebP. |
| Otros archivos | Pedir al sistema operativo que los abra con la aplicación predeterminada. |

Consulta [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}) para gestionar el contenido del espacio. Los capítulos de cada editor explican sus formatos y límites. En [Personalizar Plunibio]({{ '/es/docs/personalizar-plunibio/' | relative_url }}) encontrarás tema, idioma, tipografía y preferencias de visualización.

## Convenciones del manual

- Los nombres en **negrita** coinciden con el texto de la interfaz, como **Más opciones** o **Guardar**.
- Las teclas aparecen como <kbd>Ctrl</kbd> + <kbd>S</kbd>. En Windows y Linux, el modificador principal es <kbd>Ctrl</kbd>; en macOS es <kbd>⌘</kbd>. El manual muestra ambos cuando la equivalencia está comprobada.
- Las notas aportan contexto. Las advertencias señalan una posible pérdida de cambios o una operación que necesita especial atención.
- Las rutas y extensiones aparecen como `notas/ideas.md` o `.png`.

Cuando una diferencia entre Windows, Linux y macOS afecta a un procedimiento, se explica junto al paso correspondiente.

{% capture alpha_notice %}
Este manual se está actualizando para el próximo lanzamiento de Plunibio. El **número definitivo de versión está pendiente de confirmar**. Última revisión: **5 de noviembre de 2026**. Plunibio está en fase alpha. Puedes comunicar un problema mediante [GitHub Issues]({{ site.github_url }}/issues).
{% endcapture %}
{% include docs-callout.html type="warning" title="Versión y estado del producto" content=alpha_notice %}
