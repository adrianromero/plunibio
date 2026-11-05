---
layout: docs-chapter
lang: es
translation_key: docs-tables-code-advanced
section: docs
docs_key: tables-code-advanced
title: Tablas, código y contenido avanzado
permalink: /es/docs/tablas-codigo-y-contenido-avanzado/
description: Añade tablas, bloques de código, diagramas Mermaid y fórmulas matemáticas.
---

Las tablas, el código, los diagramas y las fórmulas forman parte del archivo Markdown. Abre **Formato** en el panel lateral para insertarlos. Guarda los cambios como se explica en [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}).

## Crear y rellenar una tabla

1. Coloca el cursor donde quieres la tabla.
2. En **Formato**, busca **Bloques** y selecciona **Tabla**.
3. Rellena las celdas. La tabla inicial tiene tres columnas y tres filas, incluida la cabecera.
{: .docs-steps}

{% include docs-figure.html id="es-tables-code-advanced-table-overview" %}

La primera fila contiene los encabezados de las columnas. Selecciona el texto de una celda para editarlo o darle formato. Al pasar el puntero por una celda, aparecen un asa sobre su columna y otra a la izquierda de su fila.

{% include docs-figure.html id="es-tables-code-advanced-table-handles" %}

## Añadir filas y columnas

1. Pasa el puntero cerca del borde vertical de una celda para añadir una columna, o del borde horizontal de una fila de datos para añadir una fila.
2. Busca la línea de inserción y su botón **+**. Comprueba su posición antes de seleccionarlo.
3. Selecciona **+** y rellena las celdas nuevas.
{: .docs-steps}

{% include docs-figure.html id="es-tables-code-advanced-table-add-column" %}

{% include docs-figure.html id="es-tables-code-advanced-table-add-row" %}

La nueva columna o fila se inserta en el límite señalado. Si no aparece el botón, acerca más el puntero al borde de la celda.

## Alinear una columna

1. Pasa el puntero por una celda de la columna.
2. Selecciona el asa situada sobre la columna para abrir sus acciones.
3. Selecciona el icono de alineación **izquierda**, **centrada** o **derecha**, en ese orden de izquierda a derecha.
{: .docs-steps}

{% include docs-figure.html id="es-tables-code-advanced-table-column-actions" %}

La alineación se aplica a toda la columna y se conserva en la tabla Markdown al guardar.

## Eliminar una fila o una columna

1. Pasa el puntero por una celda del elemento que quieres eliminar.
2. Selecciona el asa izquierda para una fila de datos o el asa superior para una columna.
3. Selecciona el icono de **papelera** de sus acciones. La fila o columna desaparece junto con su contenido.
{: .docs-steps}

{% include docs-figure.html id="es-tables-code-advanced-table-row-actions" %}

La cabecera no ofrece la acción de eliminar fila. Para corregir una eliminación accidental, utiliza <kbd>Ctrl</kbd> + <kbd>Z</kbd> en Windows y Linux o <kbd>⌘</kbd> + <kbd>Z</kbd> en macOS antes de recargar o abandonar la edición.

{% capture table_warning %}
Eliminar una fila o columna elimina también sus celdas. Comprueba la selección antes de pulsar la papelera, especialmente cuando queden pocas filas o columnas.
{% endcapture %}
{% include docs-callout.html type="warning" content=table_warning %}

## Moverte por una tabla con el teclado

| Tecla | Acción dentro de la tabla |
| --- | --- |
| <kbd>Tab</kbd> | Pasa a la celda siguiente. |
| <kbd>Mayús</kbd> + <kbd>Tab</kbd> | Pasa a la celda anterior. |
| <kbd>Intro</kbd> | Crea un párrafo después de la tabla para continuar escribiendo fuera de ella. |

Estos comportamientos se aplican con el cursor dentro de una celda.

## Crear un bloque de código

1. Coloca el cursor en un párrafo.
2. En **Formato** → **Bloques**, selecciona **Bloque de código**.
3. Escribe o pega el código en el editor del bloque.
{: .docs-steps}

También puedes escribir tres acentos graves seguidos de un espacio al principio de una línea vacía, como se explica en [Editar Markdown]({{ '/es/docs/editar-markdown/' | relative_url }}).

Por ejemplo, introduce:

    print("Hola")

Plunibio muestra y guarda el código; no lo ejecuta.

## Elegir el lenguaje y copiar el código

1. Pasa el puntero sobre el bloque y selecciona el nombre de su lenguaje en la parte superior.
2. Escribe en **Buscar lenguaje** y selecciona un resultado, por ejemplo **Python**. Si no hay coincidencias, aparece **Sin resultados**.
3. Para copiar el contenido del bloque, selecciona **Copiar** en sus controles superiores.
{: .docs-steps}

{% include docs-figure.html id="es-tables-code-advanced-code-language-picker" %}

{% include docs-figure.html id="es-tables-code-advanced-code-block-edited" %}

El lenguaje adapta el resaltado de sintaxis. Cambiarlo no convierte el código a otro lenguaje. **Copiar** copia el contenido, sin las cercas Markdown que delimitan el bloque. El lenguaje y el texto se conservan al guardar.

## Crear un diagrama Mermaid

1. Coloca el cursor donde quieres el diagrama y selecciona **Formato** → **Bloques** → **Diagrama Mermaid**.
2. Escribe la fuente del diagrama. Si solo ves la vista previa de un bloque existente, pasa el puntero sobre él y selecciona **Editar**.
3. Comprueba el resultado en **Vista previa**. La fuente tiene resaltado de sintaxis y el diagrama se actualiza al editarla.
4. Selecciona **Ocultar** para esconder el editor de fuente y mantener el diagrama visible. Guarda el documento.
{: .docs-steps}

Ejemplo mínimo para escribir dentro del bloque:

    flowchart LR
      A[Escribir] --> B[Guardar]

{% include docs-figure.html id="es-tables-code-advanced-mermaid-preview" %}

{% include docs-figure.html id="es-tables-code-advanced-mermaid-edit-preview" %}

**Editar** y **Ocultar** controlan la visibilidad de la fuente. Para un diagrama existente, no necesitas crear otro bloque para modificarlo.

Si la sintaxis no es válida, la vista previa muestra **No se ha podido generar el diagrama**, con el detalle disponible. Revisa el código y corrígelo; la fuente permanece editable.

{% include docs-figure.html id="es-tables-code-advanced-mermaid-error" %}

Para otros tipos de diagramas y más sintaxis, consulta la [documentación oficial de Mermaid](https://mermaid.js.org/syntax/flowchart.html). Algunas funciones de interacción o contenido HTML pueden estar restringidas en la vista previa de Plunibio.

## Insertar y editar una fórmula en línea

1. Coloca el cursor dentro de un párrafo, o selecciona el texto que quieres convertir, y elige **Fórmula en línea** en **Formato de texto**.
2. En **Expresión LaTeX**, escribe una expresión, por ejemplo `b^2+c^2`. Introduce la expresión sin delimitadores `$`.
3. Selecciona **OK** para confirmar. Para abandonar la edición sin aplicar el nuevo valor, selecciona **Cancelar** o pulsa <kbd>Esc</kbd>.
{: .docs-steps}

Al cancelar la edición de una fórmula recién insertada, se cancela el cambio de expresión; no se deshace automáticamente la inserción inicial.

Pasa el puntero sobre una fórmula existente para ver su expresión y las acciones **Editar expresión** y **Copiar expresión**. La copia contiene el texto LaTeX, no una imagen ni los delimitadores Markdown.

{% include docs-figure.html id="es-tables-code-advanced-inline-math-actions" %}

{% include docs-figure.html id="es-tables-code-advanced-inline-math-edit" %}

Para cambiar una fórmula existente, selecciona **Editar expresión**, modifica el campo y confirma con **OK**. **Cancelar** conserva su valor anterior. Guarda el documento para conservar las modificaciones.

## Crear un bloque matemático

1. Coloca el cursor donde quieres una fórmula separada del párrafo y selecciona **Formato** → **Bloques** → **Bloque matemático**.
2. Escribe la expresión en el editor del bloque, sin delimitadores `$$`. En un bloque existente, selecciona **Editar** para mostrar la fuente.
3. Revisa **Vista previa** y selecciona **Ocultar** cuando quieras mantener solo la fórmula visible. Guarda el documento.
{: .docs-steps}

Ejemplo mínimo:

    E = mc^2

{% include docs-figure.html id="es-tables-code-advanced-inline-block-math" %}

{% include docs-figure.html id="es-tables-code-advanced-math-block-edit" %}

Plunibio utiliza KaTeX para presentar las expresiones. Consulta las [funciones admitidas por KaTeX](https://katex.org/docs/supported.html) para la sintaxis matemática de estilo LaTeX. El editor no es un compilador de documentos LaTeX completos. Si una expresión no se representa correctamente, comprueba los comandos, las llaves y la sintaxis antes de guardar.

Continúa con [Buscar y reemplazar]({{ '/es/docs/buscar-y-reemplazar/' | relative_url }}) para localizar y sustituir texto en tus documentos.
