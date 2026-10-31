---
layout: docs-chapter
lang: es
translation_key: docs-edit-markdown
section: docs
docs_key: edit-markdown
title: Editar Markdown
permalink: /es/docs/editar-markdown/
description: Da formato al texto, trabaja con listas y edita las propiedades del documento.
---

Plunibio muestra Markdown como un documento visual, pero guarda un archivo de texto Markdown normal. Puedes dar formato desde el panel lateral o escribir reglas Markdown reconocidas al principio de una línea. Este capítulo cubre la edición habitual; los enlaces, tablas, bloques de código, matemáticas y búsqueda tienen capítulos propios.

## Trabajar en el editor visual

Abre un archivo `.md`, `.markdown`, `.mdown` o `.mkd` para utilizar el editor Markdown. Selecciona texto para reemplazarlo al escribir o para aplicarle formato. Si solo colocas el cursor, los estilos de bloque actúan sobre el párrafo actual y los formatos en línea compatibles se aplican al texto que escribas a continuación.

Las operaciones habituales de selección, cortar, copiar y pegar utilizan los comandos estándar del sistema. Para revertir una edición, utiliza **Deshacer**; para recuperarla, utiliza **Rehacer**. Los atajos comprobados aparecen más adelante en este capítulo.

Plunibio conserva el archivo como Markdown mientras presenta encabezados, listas, citas, enlaces e imágenes de forma visual. No muestra una vista dividida con el código fuente. Tampoco incluye un menú de comandos `/`, una barra flotante general de formato ni un asa para arrastrar bloques: las acciones principales están en la pestaña **Formato**.

{% capture source_note %}
Si necesitas conservar exactamente espacios, delimitadores o una variante concreta de sintaxis, revisa el archivo con control de versiones o con un editor de texto. Una operación visual puede normalizar una construcción equivalente; por ejemplo, los separadores se guardan como `---`.
{% endcapture %}
{% include docs-callout.html type="note" content=source_note %}

## Abrir las herramientas de formato

1. Si el panel lateral está oculto, selecciona **Mostrar panel lateral** en la barra superior. También puedes pulsar <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>B</kbd> en Windows y Linux o <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>B</kbd> en macOS.
2. Selecciona la pestaña **Formato**.
3. Desplázate por el panel para ver **Documento**, **Estilo de bloque**, **Formato de texto**, **Listas** y **Bloques**.
{: .docs-steps}

{% include docs-figure.html id="es-edit-markdown-format-panel" %}

Las acciones de **Bloques** insertan imágenes, tablas, código, matemáticas y Mermaid. Se presentan en [Enlaces e imágenes]({{ '/es/docs/enlaces-e-imagenes/' | relative_url }}) y [Tablas, código y contenido avanzado]({{ '/es/docs/tablas-codigo-y-contenido-avanzado/' | relative_url }}).

{% include docs-figure.html id="es-edit-markdown-lists-and-blocks" %}

## Cambiar el estilo de un bloque

Utiliza **Estilo de bloque** para cambiar párrafos completos:

1. Coloca el cursor en un párrafo o selecciona los bloques que quieras modificar.
2. Selecciona **Encabezado 1**–**Encabezado 6**, **Texto normal** o **Cita**.
3. Para retirar un encabezado, selecciona **Texto normal**. Para retirar una cita, vuelve a seleccionar **Cita** desde su interior.
{: .docs-steps}

Los encabezados crean la estructura del documento: utiliza **Encabezado 1** para el título principal, **Encabezado 2** para sus secciones y los niveles siguientes para subsecciones. No elijas un nivel solo por su tamaño visual.

**Separador** inserta una línea horizontal nueva en la posición del cursor. No transforma el párrafo actual.

## Aplicar formato al texto

La sección **Formato de texto** ofrece **Negrita**, **Cursiva**, **Tachado**, **Enlace**, **Código en línea** y **Fórmula en línea**.

1. Selecciona el texto que quieres modificar.
2. Selecciona una acción. El botón queda marcado cuando la selección o el cursor tienen ese formato.
3. Selecciona la misma acción otra vez para retirarlo.
{: .docs-steps}

Sin una selección, **Negrita**, **Cursiva**, **Tachado** y **Código en línea** activan o desactivan el formato para lo que escribas a continuación. Puedes combinar negrita, cursiva y tachado. **Código en línea** es apropiado para nombres de archivo, comandos y fragmentos cortos, no para párrafos completos.

[Enlaces e imágenes]({{ '/es/docs/enlaces-e-imagenes/' | relative_url }}) explica cómo crear y editar enlaces. [Tablas, código y contenido avanzado]({{ '/es/docs/tablas-codigo-y-contenido-avanzado/' | relative_url }}) incluye fórmulas en línea y bloques matemáticos.

## Crear y organizar listas

Puedes convertir uno o varios párrafos en una lista:

1. Coloca el cursor en un párrafo o selecciona varios párrafos.
2. Selecciona **Lista con viñetas**, **Lista numerada** o **Lista de tareas**.
3. Para cambiar el tipo, selecciona otro de los tres botones. Para volver a párrafos normales, selecciona otra vez el tipo activo.
4. Dentro de una lista, utiliza **Aumentar** para anidar el elemento bajo el anterior y **Reducir** para subirlo un nivel.
{: .docs-steps}

En una lista de tareas, selecciona la casilla de un elemento para cambiar entre pendiente y completado. El estado se guarda como sintaxis de tarea Markdown.

También puedes pulsar <kbd>Tab</kbd> para aumentar el nivel del elemento actual y <kbd>Mayús</kbd> + <kbd>Tab</kbd> para reducirlo.

## Escribir reglas Markdown directamente

Al principio de una línea vacía, escribe una de estas secuencias. Los encabezados, citas, listas y cercas de código se activan al escribir el espacio final; el separador aparece al completar el tercer guion. Plunibio transforma la línea y retira los caracteres de la regla.

| Escribe al principio | Resultado |
| --- | --- |
| `# ` a `###### ` | Encabezado de nivel 1 a 6. |
| `> ` | Cita. |
| `- `, `+ ` o `* ` | Lista con viñetas. |
| `1. ` | Lista numerada. |
| `[ ] ` dentro de un elemento con viñeta | Convierte el elemento en tarea pendiente. |
| <code>``` </code> | Bloque de código. |
| `---` | Separador horizontal. |

{% include docs-figure.html id="es-edit-markdown-typing-heading" %}

{% include docs-figure.html id="es-edit-markdown-typing-quote" %}

{% include docs-figure.html id="es-edit-markdown-typing-lists" %}

Las marcas en línea también se transforman al completar la sintaxis: `**texto**` crea negrita, `*texto*` crea cursiva y `` `texto` `` crea código en línea.

El capítulo de [Tablas, código y contenido avanzado]({{ '/es/docs/tablas-codigo-y-contenido-avanzado/' | relative_url }}) explica cómo seleccionar el lenguaje de un bloque y utilizar Mermaid o matemáticas.

## Utilizar los atajos de edición comprobados

Estos atajos se han comprobado en Plunibio. Las acciones de formato activan o retiran el estilo de la selección; sin selección, controlan el texto siguiente cuando el formato lo permite.

| Acción | Windows y Linux | macOS |
| --- | --- | --- |
| Negrita | <kbd>Ctrl</kbd> + <kbd>B</kbd> | <kbd>⌘</kbd> + <kbd>B</kbd> |
| Cursiva | <kbd>Ctrl</kbd> + <kbd>I</kbd> | <kbd>⌘</kbd> + <kbd>I</kbd> |
| Código en línea | <kbd>Ctrl</kbd> + <kbd>E</kbd> | <kbd>⌘</kbd> + <kbd>E</kbd> |
| Tachado | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>X</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>X</kbd> |
| Encabezado 1–6 | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>1</kbd>…<kbd>6</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>1</kbd>…<kbd>6</kbd> |
| Texto normal | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>0</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>0</kbd> |
| Cita | <kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>B</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>B</kbd> |
| Lista numerada | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>7</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>7</kbd> |
| Lista con viñetas | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>8</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>8</kbd> |
| Aumentar/reducir nivel de lista | <kbd>Tab</kbd> / <kbd>Mayús</kbd> + <kbd>Tab</kbd> | Igual |
| Bloque de código | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>C</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>C</kbd> |
| Deshacer | <kbd>Ctrl</kbd> + <kbd>Z</kbd> | <kbd>⌘</kbd> + <kbd>Z</kbd> |
| Rehacer | <kbd>Ctrl</kbd> + <kbd>Y</kbd> o <kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>Z</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>Z</kbd> |

El [capítulo de referencia de atajos]({{ '/es/docs/atajos-y-solucion-de-problemas/' | relative_url }}) reunirá estas combinaciones con las acciones generales y las del resto de editores.

## Editar las propiedades del documento

Las propiedades son un bloque de *front matter* YAML situado al principio del archivo. Suelen contener datos como título, idioma, fecha o etiquetas. Plunibio las separa del cuerpo visual para que puedas editarlas como YAML.

1. Abre la pestaña **Formato** y selecciona **Propiedades**. Si el archivo ya contiene propiedades reconocidas, el panel aparece abierto al cargarlo.
2. Edita claves y valores en **Propiedades del documento**. Mantén una sintaxis YAML válida y utiliza espacios para la sangría.
3. Guarda el archivo. Plunibio escribe las propiedades entre delimitadores `---` antes del contenido Markdown.
4. Selecciona **Propiedades** otra vez para ocultar el editor. Si eliminas todo su contenido y guardas, Plunibio retira también los delimitadores del bloque.
{: .docs-steps}

{% include docs-figure.html id="es-edit-markdown-frontmatter-panel" %}

{% capture yaml_warning %}
Plunibio ofrece resaltado de YAML, pero no garantiza que los valores sean válidos para la herramienta que vaya a procesar el documento. Un error de sangría o de sintaxis puede impedir que otra aplicación interprete las propiedades.
{% endcapture %}
{% include docs-callout.html type="warning" content=yaml_warning %}

Solo se trata como propiedades un bloque delimitado al comienzo del archivo. Un bloque YAML situado en otra parte continúa formando parte del contenido Markdown.

## Continuar con contenido especializado

Ya puedes estructurar y dar formato a un documento, crear listas, utilizar reglas de escritura y mantener sus propiedades. Continúa con [Enlaces e imágenes]({{ '/es/docs/enlaces-e-imagenes/' | relative_url }}) para aprender a enlazar archivos, abrir destinos e insertar imágenes desde el equipo, la web o el portapapeles.
