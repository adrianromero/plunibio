---
layout: docs-index
lang: es
translation_key: docs
section: docs
title: Documentación
permalink: /es/docs/
eyebrow: Manual de usuario
intro: Aprende a organizar archivos locales, editar Markdown, trabajar con texto y código, y ajustar imágenes con Plunibio.
description: Manual de usuario de Plunibio 0.1.2 para trabajar con espacios locales, Markdown, texto, código e imágenes.
---

## Empieza aquí

Plunibio es una aplicación de escritorio para trabajar directamente con archivos de tu equipo. Un **espacio** es la carpeta local que Plunibio toma como raíz. Las carpetas y los archivos que contiene permanecen en el disco y pueden utilizarse con otras aplicaciones.

Si es la primera vez que lo utilizas, comienza por [Primeros pasos]({{ '/es/docs/primeros-pasos/' | relative_url }}). Abrirás un espacio, reconocerás la ventana principal, modificarás un documento Markdown y guardarás el cambio. Para preparar la aplicación antes de seguir el manual, consulta [Instalación]({{ '/es/install/' | relative_url }}).

También puedes elegir una tarea concreta en el índice de capítulos.

## Qué puedes hacer

| Contenido | Comportamiento de Plunibio |
| --- | --- |
| Markdown (`.md`, `.markdown`, `.mdown`, `.mkd`) | Editar documentos con formato visual, propiedades, tablas, código, diagramas y matemáticas. |
| Texto y código reconocidos | Editar texto sin formato o código con herramientas adaptadas al lenguaje. Los SVG se abren como XML. |
| AVIF, BMP, GIF, ICO, JPEG, PNG y WebP | Visualizar imágenes. Los cambios solo se pueden guardar como PNG, JPEG o WebP. |
| Otros archivos | Pedir al sistema operativo que los abra con la aplicación predeterminada. |

Los capítulos correspondientes explican los formatos y sus límites con más detalle.

## Convenciones del manual

- Los nombres en **negrita** coinciden con el texto de la interfaz, como **Más opciones** o **Guardar**.
- Las teclas aparecen como <kbd>Ctrl</kbd> + <kbd>S</kbd>. En Windows y Linux, el modificador principal es <kbd>Ctrl</kbd>; en macOS es <kbd>⌘</kbd>. El manual muestra ambos cuando la equivalencia está comprobada.
- Las notas aportan contexto. Las advertencias señalan una posible pérdida de cambios o una operación que necesita especial atención.
- Las rutas y extensiones aparecen como `notas/ideas.md` o `.png`.

El manual describe Plunibio tal como funciona en la versión indicada. Cuando una diferencia entre Windows, Linux y macOS afecta a un procedimiento, se explica junto al paso correspondiente.

{% capture alpha_notice %}
Este manual cubre **Plunibio 0.1.2** y se revisó por última vez el **31 de octubre de 2026**. Plunibio está en fase alpha: las funciones y la interfaz pueden cambiar antes de la primera versión estable. Puedes comunicar un problema mediante [GitHub Issues]({{ site.github_url }}/issues).
{% endcapture %}
{% include docs-callout.html type="warning" title="Versión y estado del producto" content=alpha_notice %}
