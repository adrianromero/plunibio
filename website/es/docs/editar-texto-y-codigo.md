---
layout: docs-chapter
lang: es
translation_key: docs-edit-text-code
section: docs
docs_key: edit-text-code
title: Editar texto y código
permalink: /es/docs/editar-texto-y-codigo/
description: Edita texto sin formato y código fuente con herramientas adaptadas al lenguaje.
---

Utiliza el editor de texto y código para modificar archivos de configuración, datos y código fuente. Plunibio elige el resaltado a partir de la extensión del archivo. Las ayudas de edición dependen del lenguaje; no hace falta configurar un proyecto para empezar.

## Abrir y reconocer el editor

1. Entra en la carpeta del espacio que contiene el archivo y selecciónalo. Por ejemplo, abre un archivo `.js`, `.json` o `.txt`.
2. Selecciona el texto que quieras cambiar o coloca el cursor donde vayas a escribir.
{: .docs-steps}

{% include docs-figure.html id="es-edit-text-code-javascript-editor" %}

Los números del margen identifican las líneas y la línea activa aparece resaltada. Las líneas largas se ajustan al ancho disponible: ver una línea en varios renglones no añade saltos al archivo. Los colores distinguen elementos del lenguaje, como palabras clave, cadenas y comentarios.

En formatos con soporte de lenguaje también puedes ver el par de paréntesis o corchetes correspondiente al cursor. Al escribir un carácter de apertura, el editor puede insertar su cierre. Revisa la posición del cursor antes de seguir escribiendo.

## Editar, deshacer y guardar

Puedes seleccionar con el ratón o con <kbd>Mayús</kbd> y las flechas. En Windows/Linux, usa <kbd>Ctrl</kbd> + <kbd>A</kbd> para seleccionar todo, <kbd>Ctrl</kbd> + <kbd>C</kbd> para copiar, <kbd>Ctrl</kbd> + <kbd>X</kbd> para cortar y <kbd>Ctrl</kbd> + <kbd>V</kbd> para pegar. En macOS, sustituye <kbd>Ctrl</kbd> por <kbd>⌘</kbd> en estas acciones.

1. Escribe o pega el contenido. Si hay una selección, el texto nuevo la sustituye.
2. Para deshacer, pulsa <kbd>Ctrl</kbd> + <kbd>Z</kbd> o <kbd>⌘</kbd> + <kbd>Z</kbd>. Para rehacer, usa <kbd>Ctrl</kbd> + <kbd>Y</kbd> en Windows/Linux o <kbd>⌘</kbd> + <kbd>Mayús</kbd> + <kbd>Z</kbd> en macOS.
3. Guarda con <kbd>Ctrl</kbd> + <kbd>S</kbd> o <kbd>⌘</kbd> + <kbd>S</kbd>, o abre **Más opciones** → **Guardar**. El indicador **Cambios sin guardar** desaparece cuando termina el guardado.
{: .docs-steps}

El historial de deshacer pertenece a la edición abierta. Antes de recargar o salir de ella, revisa el resultado. Para entender el guardado al navegar o cerrar y el descarte mediante **Recargar**, consulta [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}).

## Aplicar sangría y comentarios

La sangría automática al pulsar <kbd>Intro</kbd> depende del lenguaje y del contexto. Para aumentar la sangría de una línea o selección, usa <kbd>Ctrl</kbd> + <kbd>]</kbd> en Windows/Linux o <kbd>⌘</kbd> + <kbd>]</kbd> en macOS. También puedes insertar o borrar espacios al principio de las líneas. <kbd>Tab</kbd> no es el atajo de sangría de este editor.

1. En un archivo que admita comentarios, como JavaScript, coloca el cursor en la línea o selecciona las líneas que quieras comentar.
2. Pulsa <kbd>Ctrl</kbd> + <kbd>/</kbd> en Windows/Linux o <kbd>⌘</kbd> + <kbd>/</kbd> en macOS.
3. Repite la combinación para retirar el comentario.
{: .docs-steps}

El editor utiliza la sintaxis de comentarios del lenguaje. Un formato como JSON no admite comentarios; esta acción no añade esa capacidad al formato.

## Mover y duplicar líneas

Estas acciones sirven para reorganizar texto sin cortarlo y pegarlo. Coloca el cursor en una línea, o selecciona varias, y utiliza:

| Acción | Windows/Linux | macOS |
| --- | --- | --- |
| Mover arriba o abajo | <kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> | <kbd>⌥</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> |
| Duplicar arriba o abajo | <kbd>Mayús</kbd> + <kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> | <kbd>⇧</kbd> + <kbd>⌥</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> |

Mover cambia el orden de las líneas; duplicar conserva el original e inserta una copia. Revisa la sangría y la estructura del código después de la operación.

## Cambiar varias coincidencias a la vez

1. Coloca el cursor dentro de la palabra que quieras cambiar. También puedes seleccionar primero un fragmento concreto.
2. Pulsa <kbd>Ctrl</kbd> + <kbd>D</kbd> en Windows/Linux o <kbd>⌘</kbd> + <kbd>D</kbd> en macOS. Si no había selección, la primera pulsación selecciona la palabra actual.
3. Repite la combinación para añadir la siguiente coincidencia a la selección.
4. Escribe el nuevo texto. Se aplica a todas las selecciones. Pulsa <kbd>Esc</kbd> para volver a una sola selección antes de continuar.
{: .docs-steps}

{% include docs-figure.html id="es-edit-text-code-multiple-selection" %}

Esta operación cambia los fragmentos seleccionados; no es un renombrado que comprenda las referencias de un programa. Para revisar cada resultado, limitar la búsqueda por palabra completa o utilizar expresiones regulares, usa [Buscar y reemplazar]({{ '/es/docs/buscar-y-reemplazar/' | relative_url }}).

## Utilizar sugerencias de código

1. En un archivo con sugerencias, como JavaScript, empieza a escribir un nombre. Por ejemplo, después de declarar `districtName`, escribe `districtN` en otra línea.
2. Pulsa <kbd>Ctrl</kbd> + <kbd>Espacio</kbd> para solicitar sugerencias. En macOS también puedes usar <kbd>⌥</kbd> + <kbd>I</kbd>.
3. Recorre la lista con <kbd>↑</kbd> y <kbd>↓</kbd>. Pulsa <kbd>Intro</kbd> para insertar la opción seleccionada o <kbd>Esc</kbd> para cerrar la lista.
{: .docs-steps}

{% include docs-figure.html id="es-edit-text-code-javascript-completion" %}

Las sugerencias pueden aparecer mientras escribes. Su disponibilidad depende del lenguaje y del contexto; no todos los formatos ofrecen propuestas. Por ejemplo, no esperes la misma lista en un YAML que en JavaScript. <kbd>Tab</kbd> no acepta una propuesta de esta lista.

## Plegar y desplegar bloques

1. Si aparece una flecha junto al número de línea, selecciónala para ocultar el contenido del bloque.
2. Selecciona los puntos suspensivos del bloque plegado para volver a mostrarlo.
{: .docs-steps}

{% include docs-figure.html id="es-edit-text-code-folded-function" %}

El salto en los números de línea indica el contenido oculto. Plegar solo cambia la vista: el texto sigue en el archivo. Los bloques disponibles dependen del lenguaje y de su estructura.

## Editar archivos Mermaid y LaTeX

Los archivos `.mmd` y `.mermaid` se abren como código con resaltado Mermaid. Puedes editar su fuente y guardarla con las mismas acciones que cualquier otro archivo de texto.

{% include docs-figure.html id="es-edit-text-code-mermaid-file" %}

Un archivo Mermaid independiente muestra su fuente. Para ver un diagrama renderizado dentro de Plunibio, utiliza un bloque Mermaid en un documento Markdown, como se explica en [Tablas, código y contenido avanzado]({{ '/es/docs/tablas-codigo-y-contenido-avanzado/' | relative_url }}).

Los archivos `.tex` y `.latex` también se editan como fuente. Para insertar fórmulas renderizadas en Markdown, consulta ese mismo capítulo.

## Consultar formatos y límites

La extensión determina el lenguaje; no hay un selector para cambiar el modo de un archivo abierto. Si necesitas renombrar su extensión, consulta [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}).

| Lenguaje o modo | Extensiones |
| --- | --- |
| Texto sin resaltado | `.txt`, `.text`, `.log`, `.csv`, `.tsv`, `.ini`, `.cfg`, `.conf`, `.env`, `.properties`, `.gitignore` |
| JavaScript | `.js`, `.mjs`, `.cjs` |
| JSX | `.jsx` |
| TypeScript | `.ts`, `.mts`, `.cts` |
| TSX | `.tsx` |
| Java | `.java` |
| Rust | `.rs` |
| Python | `.py`, `.pyi`, `.pyw` |
| HTML | `.html`, `.htm` |
| CSS | `.css` |
| JSON | `.json` |
| Mermaid | `.mmd`, `.mermaid` |
| LaTeX | `.tex`, `.latex` |
| TOML | `.toml` |
| YAML | `.yaml`, `.yml` |
| SQL | `.sql` |
| C | `.c`, `.h` |
| C++ | `.cc`, `.cpp`, `.cxx`, `.hh`, `.hpp`, `.hxx` |
| XML, incluido código SVG | `.xml`, `.svg`, `.xsd`, `.xsl`, `.xslt` |

Las extensiones Markdown `.md`, `.markdown`, `.mdown` y `.mkd` abren el [editor Markdown]({{ '/es/docs/editar-markdown/' | relative_url }}). Un formato no reconocido muestra la opción **Abrir con la aplicación predeterminada**. Para localizar `.env`, `.gitignore` u otros archivos ocultos, abre **Más opciones** → **Archivos ocultos** → **Mostrar**.

{% include docs-callout.html type="note" content="El resaltado y las sugerencias ayudan a editar, pero no garantizan que el archivo sea válido. Plunibio no ejecuta ni compila el código y no presenta CSV como una hoja de cálculo. Comprueba el resultado con la herramienta que vaya a utilizarlo." %}
