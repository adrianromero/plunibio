---
layout: docs-chapter
lang: es
translation_key: docs-find-replace
section: docs
docs_key: find-replace
title: Buscar y reemplazar
permalink: /es/docs/buscar-y-reemplazar/
description: Busca texto y reemplaza coincidencias individuales o todos los resultados.
---

El panel **Buscar** permite localizar y reemplazar texto en el archivo abierto. Los cambios de reemplazo quedan en el editor hasta que los guardas; no se realiza una búsqueda entre todos los archivos del espacio.

## Entender dónde se busca

| Vista | Alcance |
| --- | --- |
| Markdown | Texto del cuerpo del documento, incluidos sus bloques de código. No busca la sintaxis Markdown como si fuera un archivo de texto plano. |
| Texto y código | Texto completo del archivo abierto, incluidas sus claves, valores y signos de puntuación. |

En Markdown, las propiedades YAML se editan en un campo separado y no forman parte de esta búsqueda. Las direcciones de enlaces, las rutas de imágenes y las expresiones de las fórmulas en línea tampoco se buscan como texto del cuerpo. Para cambiarlas, utiliza los controles descritos en [Enlaces e imágenes]({{ '/es/docs/enlaces-e-imagenes/' | relative_url }}) y [Tablas, código y contenido avanzado]({{ '/es/docs/tablas-codigo-y-contenido-avanzado/' | relative_url }}).

## Abrir el panel y escribir una búsqueda

1. Abre el documento Markdown o archivo de texto que quieres revisar.
2. Pulsa <kbd>Ctrl</kbd> + <kbd>F</kbd> en Windows y Linux o <kbd>⌘</kbd> + <kbd>F</kbd> en macOS. Plunibio muestra el panel lateral, abre **Buscar** y selecciona el contenido de **Buscar texto**.
3. Escribe el texto que quieres encontrar. En Markdown también puedes abrir **Mostrar panel lateral** y seleccionar la pestaña **Buscar**.
{: .docs-steps}

{% include docs-figure.html id="es-search-replace-markdown-search" %}

La búsqueda se actualiza al escribir. Introducir una consulta no modifica el documento. Si el campo queda vacío, no hay una búsqueda activa.

## Recorrer las coincidencias

1. Selecciona **Siguiente** para elegir una coincidencia.
2. Utiliza **Anterior** y **Siguiente** para recorrer los resultados. Al llegar al extremo, la búsqueda continúa desde el otro extremo del documento.
3. Con el foco en **Buscar texto**, pulsa <kbd>Intro</kbd> para avanzar o <kbd>Mayús</kbd> + <kbd>Intro</kbd> para retroceder.
{: .docs-steps}

El contador muestra la coincidencia seleccionada y el total:

| Contador | Significado |
| --- | --- |
| `0 / 4` | Hay cuatro coincidencias, pero ninguna está seleccionada como resultado actual. |
| `2 / 4` | Está seleccionada la segunda de cuatro coincidencias. |
| `0 / 0` | No hay resultados para la consulta, o el campo está vacío. Comprueba también si aparece un error de expresión. |

**Anterior** y **Siguiente** se desactivan cuando la consulta no tiene resultados válidos. Seleccionar una coincidencia permite revisar su contexto antes de reemplazarla.

## Ajustar las opciones

Las tres opciones se pueden combinar:

| Opción | Efecto |
| --- | --- |
| Distinguir mayúsculas y minúsculas | Una búsqueda de `lumen` no encuentra `Lumen`. |
| Solo palabras completas | Una búsqueda de `lumen` no encuentra la parte inicial de `lumens`. |
| Usar expresión regular | Interpreta el campo como un patrón, en lugar de buscar únicamente esa secuencia de caracteres. |

{% include docs-figure.html id="es-search-replace-markdown-search-options" %}

Las opciones cambian el total de resultados. Revísalas si una palabra que ves en el documento no aparece en la búsqueda.

## Buscar con una expresión regular

1. Activa **Usar expresión regular**.
2. Escribe un patrón en **Buscar texto**. Por ejemplo, `lumen(s)?` encuentra `lumen` y `lumens`; la opción de mayúsculas sigue aplicándose.
3. Si aparece **Expresión no válida**, corrige el patrón o desactiva **Usar expresión regular** para volver a una búsqueda de texto.
{: .docs-steps}

{% include docs-figure.html id="es-search-replace-invalid-regexp" %}

Un paréntesis de apertura sin cerrar, como `(`, es un ejemplo de patrón incompleto. Mientras la expresión no sea válida, las acciones de navegación y reemplazo quedan desactivadas. Para buscar un carácter como `.` o `(` como texto ordinario, desactiva la opción de expresión regular.

## Reemplazar una coincidencia

1. Escribe la búsqueda y selecciona **Siguiente** o **Anterior** para elegir el resultado que quieres cambiar.
2. Escribe el nuevo contenido en **Reemplazar por**.
3. Selecciona **Reemplazar**, o pulsa <kbd>Intro</kbd> con el foco en **Reemplazar por**.
4. Revisa el resultado y la siguiente coincidencia seleccionada antes de repetir la operación.
{: .docs-steps}

**Reemplazar** solo está disponible cuando hay una coincidencia actual seleccionada. El contador puede disminuir si el nuevo texto deja de coincidir con la consulta. Para borrar una coincidencia, deja **Reemplazar por** vacío antes de utilizar **Reemplazar**.

En el campo de búsqueda, <kbd>Intro</kbd> recorre resultados; en el campo de reemplazo, aplica el reemplazo individual.

## Reemplazar todas las coincidencias

1. Escribe la búsqueda y ajusta sus opciones. Comprueba el total y revisa varias coincidencias.
2. Escribe el nuevo contenido en **Reemplazar por**.
3. Selecciona **Reemplazar todo**. Plunibio modifica todas las coincidencias de la consulta en el archivo abierto.
{: .docs-steps}

{% include docs-figure.html id="es-search-replace-markdown-replace-all" %}

{% capture replace_warning %}
**Reemplazar todo** actúa inmediatamente, sin pedir confirmación. Comprueba el patrón, las opciones y el contenido de reemplazo antes de utilizarlo. Si el campo de reemplazo está vacío, elimina las coincidencias. Revisa el documento antes de guardar.
{% endcapture %}
{% include docs-callout.html type="warning" content=replace_warning %}

En texto y código se utiliza el mismo panel. Por ejemplo, buscar `active` con **Solo palabras completas** permite reemplazar ese valor sin cambiar `inactive`.

{% include docs-figure.html id="es-search-replace-text-search" %}

{% include docs-figure.html id="es-search-replace-text-replace-all" %}

Un reemplazo en código también puede cambiar claves o sintaxis. Plunibio reemplaza el texto encontrado; comprueba que el archivo sigue siendo válido para la herramienta que lo utilizará.

## Limpiar u ocultar la búsqueda

Para retirar la consulta y sus resaltados, vacía **Buscar texto**. Para seguir editando, selecciona el documento. En Markdown puedes volver a **Formato**; también puedes seleccionar **Ocultar panel lateral**.

Ocultar el panel no borra la consulta del archivo actual. <kbd>Ctrl</kbd> + <kbd>F</kbd> o <kbd>⌘</kbd> + <kbd>F</kbd> lo abre de nuevo y permite modificarla. Al recargar el archivo o cambiar de documento, la búsqueda se reinicia. La consulta no se conserva entre sesiones.

## Guardar o corregir los reemplazos

Guarda con <kbd>Ctrl</kbd> + <kbd>S</kbd> en Windows y Linux o <kbd>⌘</kbd> + <kbd>S</kbd> en macOS. También puedes utilizar **Más opciones** → **Guardar**.

Para deshacer un reemplazo, selecciona el área del documento y utiliza <kbd>Ctrl</kbd> + <kbd>Z</kbd> o <kbd>⌘</kbd> + <kbd>Z</kbd> antes de recargar o abandonar la edición. **Recargar** vuelve a leer el disco y puede descartar cambios pendientes; consulta [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}) antes de usarlo para recuperar contenido.

Continúa con [Editar texto y código]({{ '/es/docs/editar-texto-y-codigo/' | relative_url }}) para conocer las herramientas de ese editor.
