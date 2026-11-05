---
layout: docs-chapter
lang: es
translation_key: docs-customize
section: docs
docs_key: customize
title: Personalizar Plunibio
permalink: /es/docs/personalizar-plunibio/
description: Elige el tema, el idioma, la tipografía Markdown y la visibilidad de archivos.
---

Adapta la presentación y la navegación a tu forma de trabajar. Las preferencias son generales de Plunibio: se aplican al cambiar de archivo o espacio y se conservan localmente para siguientes aperturas. No se guardan como parte del contenido de tus documentos.

## Encontrar las preferencias

Abre **Más opciones**, en la esquina superior derecha. En **General** encontrarás **Tema**, **Idioma** y **Archivos ocultos**. La sección **Markdown** contiene **Tipografía**, disponible también cuando estás viendo una carpeta, código o una imagen.

{% include docs-figure.html id="es-customize-preferences-menu" %}

Las opciones muestran su valor actual. Seleccionar otro valor lo aplica inmediatamente; no hay que pulsar **Guardar** para conservar una preferencia. La visibilidad del panel lateral se controla con su propio botón y la ordenación se elige en el listado de carpetas.

## Elegir un tema

1. Abre **Más opciones** → **Tema**.
2. Selecciona **Claro** u **Oscuro**.
3. Comprueba el aspecto de la ventana. Puedes volver al mismo menú y elegir el otro tema cuando quieras.
{: .docs-steps}

{% include docs-figure.html id="es-customize-dark-theme" %}

El tema cambia los colores de la interfaz y la presentación de los editores. No modifica el texto de tus documentos ni los colores guardados de las imágenes. El tema seleccionado se conserva al volver a abrir Plunibio.

## Cambiar el idioma de la aplicación

1. Abre **Más opciones** → **Idioma**.
2. Selecciona **English**, **Español**, **Català**, **Galego** o **Euskara**. Los nombres aparecen en su propio idioma para que puedas reconocerlos.
3. Continúa trabajando con los menús y mensajes en el idioma elegido. No hace falta reiniciar la aplicación.
{: .docs-steps}

{% include docs-figure.html id="es-customize-language-menu" %}

Sin una selección guardada, Plunibio utiliza el idioma principal del sistema si está entre los admitidos; en caso contrario, utiliza inglés. Una elección manual se recuerda para siguientes aperturas.

Cambiar el idioma de la aplicación no traduce el contenido de tus archivos ni cambia el idioma de este manual. Para leer la documentación en inglés, utiliza **EN** en la cabecera del sitio web.

## Elegir la tipografía de Markdown

1. Abre **Más opciones** → **Tipografía**, dentro de la sección **Markdown**.
2. Selecciona **Sans Serif**, **Serif**, **Moderna** o **Lectura**.
3. Abre o vuelve a un documento Markdown para comprobar cómo se presentan sus títulos y texto.
{: .docs-steps}

{% include docs-figure.html id="es-customize-typography-menu" %}

| Opción | Descripción en el menú |
| --- | --- |
| **Sans Serif** | Limpia y familiar. |
| **Serif** | Clásica y formal. |
| **Moderna** | Actual y minimalista. |
| **Lectura** | Cómoda para textos largos. |

Esta es la presentación de un documento con **Lectura**:

{% include docs-figure.html id="es-customize-reading-typography" %}

La elección es general y afecta a la presentación del contenido Markdown. No cambia el formato guardado, los títulos ni las marcas del documento. Tampoco cambia la fuente del editor de texto y código. Para aplicar negrita, títulos u otros formatos, consulta [Editar Markdown]({{ '/es/docs/editar-markdown/' | relative_url }}).

## Mostrar u ocultar el panel lateral

1. Selecciona **Ocultar panel lateral**, en la barra superior, para dejar más espacio al contenido.
2. Selecciona **Mostrar panel lateral** para recuperar los controles de la vista actual.
{: .docs-steps}

También puedes alternarlo con <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>B</kbd> en Windows/Linux o <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>B</kbd> en macOS. Plunibio recuerda su visibilidad; las herramientas disponibles dependen del archivo o carpeta abierto.

Abrir [Buscar y reemplazar]({{ '/es/docs/buscar-y-reemplazar/' | relative_url }}) muestra el panel aunque lo hubieras ocultado. Puedes volver a ocultarlo cuando termines.

## Incluir archivos y carpetas ocultos

1. Abre **Más opciones** → **Archivos ocultos**.
2. Selecciona **Mostrar** para incluirlos en los listados.
3. Selecciona **Ocultar** cuando quieras retirarlos de la vista.
{: .docs-steps}

En este listado, los elementos ocultos todavía no se muestran:

{% include docs-figure.html id="es-customize-hidden-files-before" %}

Al elegir **Mostrar**, aparecen también el archivo y la carpeta cuyos nombres comienzan por punto:

{% include docs-figure.html id="es-customize-hidden-files-after" %}

La opción incluye tanto nombres que comienzan por punto como elementos que el sistema operativo marca como ocultos. Afecta a las carpetas del espacio y al selector de espacios. No cambia los nombres, los permisos ni los atributos de los archivos; solo decide si aparecen en el listado.

## Conservar el orden de las carpetas

1. Abre una carpeta y, si es necesario, selecciona **Mostrar panel lateral**. En **Acciones**, busca **Ordenar por**.
2. Selecciona **Nombre**, **Tamaño** o **Modificación**.
3. Pulsa de nuevo el mismo criterio para alternar entre ascendente y descendente. La flecha indica el sentido actual.
{: .docs-steps}

El criterio y el sentido se conservan al navegar a otras carpetas y al volver a abrir Plunibio. Las carpetas permanecen antes que los archivos en ambos sentidos. **Tamaño** compara bytes para archivos y el número de elementos visibles para carpetas; mostrar archivos ocultos puede cambiar ese recuento.

Para las reglas de ordenación, los metadatos y los valores no disponibles, consulta [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}).

## Consultar qué se recuerda

| Preferencia | Sin una elección guardada | Alcance |
| --- | --- | --- |
| Tema | **Claro** | Interfaz y presentación de los editores. |
| Idioma | Idioma principal del sistema si está admitido; si no, inglés. | Menús y mensajes de la aplicación. |
| Tipografía | **Sans Serif** | Presentación del contenido Markdown. |
| Panel lateral | Visible | Visibilidad general; herramientas según la vista. |
| Archivos ocultos | **Ocultar** | Listados de carpetas y selector de espacios. |
| Ordenación | **Nombre**, ascendente | Listados de carpetas del espacio. |

Para recuperar una configuración conocida, selecciona los valores que necesites desde sus controles. Cambiar estas preferencias no requiere guardar los archivos abiertos. La restauración del último espacio, archivo y tamaño de ventana se explica en [Línea de comandos]({{ '/es/docs/linea-de-comandos/' | relative_url }}).
