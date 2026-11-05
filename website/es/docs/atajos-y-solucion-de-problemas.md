---
layout: docs-chapter
lang: es
translation_key: docs-shortcuts-troubleshooting
section: docs
docs_key: shortcuts-troubleshooting
title: Atajos y solución de problemas
permalink: /es/docs/atajos-y-solucion-de-problemas/
description: Consulta atajos de teclado verificados y resuelve problemas habituales.
---

Esta referencia reúne los atajos de la aplicación y las acciones para resolver problemas sin perder cambios pendientes. Utiliza los enlaces de cada sección para volver al procedimiento completo.

## Aplicar el atajo en su contexto

Selecciona primero el documento, la celda o el campo donde quieras actuar. Un atajo de formato Markdown no tiene el mismo efecto dentro del editor de propiedades YAML, un bloque de código o el campo de búsqueda. Mientras hay un diálogo abierto, resuelve o cancela ese diálogo antes de utilizar las acciones generales.

<kbd>Ctrl</kbd> corresponde a Windows/Linux; <kbd>⌘</kbd>, <kbd>⌥</kbd> y <kbd>⇧</kbd> son Comando, Opción y Mayúsculas en macOS. El signo **+** indica teclas pulsadas juntas.

Para edición básica, utiliza <kbd>Ctrl</kbd> + <kbd>A</kbd>/<kbd>C</kbd>/<kbd>X</kbd>/<kbd>V</kbd> para seleccionar todo, copiar, cortar y pegar. En macOS, utiliza <kbd>⌘</kbd> en lugar de <kbd>Ctrl</kbd>.

## Navegación y archivos

| Acción | Windows/Linux | macOS | Contexto |
| --- | --- | --- | --- |
| Abrir espacio | <kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>O</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>O</kbd> | Abre el selector de espacios. |
| Guardar | <kbd>Ctrl</kbd> + <kbd>S</kbd> | <kbd>⌘</kbd> + <kbd>S</kbd> | Guarda los cambios del archivo abierto. |
| Recargar | <kbd>Ctrl</kbd> + <kbd>R</kbd> | <kbd>⌘</kbd> + <kbd>R</kbd> | Archivo: pide confirmación. Carpeta: actualiza el listado. |
| Buscar | <kbd>Ctrl</kbd> + <kbd>F</kbd> | <kbd>⌘</kbd> + <kbd>F</kbd> | Markdown o texto/código; muestra el panel Buscar. |
| Mostrar/ocultar panel lateral | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>B</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>B</kbd> | Cuando la vista ofrece panel lateral. |
| Atrás | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>,</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>,</kbd> | Historial de navegación disponible. |
| Adelante | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>.</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>.</kbd> | Historial de navegación disponible. |
| Nueva carpeta | <kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>N</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>N</kbd> | Desde una carpeta. |
| Nuevo archivo Markdown | <kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>M</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>M</kbd> | Desde una carpeta. |
| Nuevo archivo de texto | <kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>T</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>T</kbd> | Desde una carpeta. |
| Renombrar | <kbd>F2</kbd> | <kbd>F2</kbd> | Archivo o carpeta actual; no la raíz del espacio. |

Los atajos de creación necesitan una **vista de carpeta**; no crean archivos mientras estás escribiendo en un documento. <kbd>F2</kbd> actúa sobre el elemento que aparece en la ruta, no sobre un elemento señalado solo con el puntero. Para eliminar, utiliza el menú del elemento actual; no hay un atajo de Eliminar registrado en la aplicación.

Consulta [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}) para crear, renombrar, navegar y confirmar cambios de extensión.

## Formato, listas y tablas Markdown

Utiliza estos atajos con el foco en el cuerpo visual del documento:

| Acción | Windows/Linux | macOS | Contexto |
| --- | --- | --- | --- |
| Negrita | <kbd>Ctrl</kbd> + <kbd>B</kbd> | <kbd>⌘</kbd> + <kbd>B</kbd> | Aplicar o retirar el formato. |
| Cursiva | <kbd>Ctrl</kbd> + <kbd>I</kbd> | <kbd>⌘</kbd> + <kbd>I</kbd> | Aplicar o retirar el formato. |
| Código en línea | <kbd>Ctrl</kbd> + <kbd>E</kbd> | <kbd>⌘</kbd> + <kbd>E</kbd> | Sobre una selección de texto. |
| Tachado | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>X</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>X</kbd> | Aplicar o retirar el formato. |
| Encabezado 1–6 | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>1…6</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>1…6</kbd> | Bloque actual. |
| Texto normal | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>0</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>0</kbd> | Convertir el bloque en párrafo. |
| Cita | <kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>B</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>B</kbd> | Bloque actual. |
| Lista numerada | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>7</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>7</kbd> | Bloque actual. |
| Lista con viñetas | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>8</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>8</kbd> | Bloque actual. |
| Aumentar nivel de lista | <kbd>Tab</kbd> | <kbd>Tab</kbd> | Cursor dentro de un elemento de lista. |
| Reducir nivel de lista | <kbd>Mayús</kbd> + <kbd>Tab</kbd> | <kbd>⇧</kbd> + <kbd>Tab</kbd> | Cursor dentro de un elemento de lista. |
| Siguiente celda | <kbd>Tab</kbd> | <kbd>Tab</kbd> | Dentro de una tabla Markdown. |
| Celda anterior | <kbd>Mayús</kbd> + <kbd>Tab</kbd> | <kbd>⇧</kbd> + <kbd>Tab</kbd> | Dentro de una tabla Markdown. |
| Salir de la tabla | <kbd>Intro</kbd> | <kbd>Enter</kbd> | Desde una celda. |
| Bloque de código | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>C</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>C</kbd> | Insertar o transformar el bloque. |
| Deshacer | <kbd>Ctrl</kbd> + <kbd>Z</kbd> | <kbd>⌘</kbd> + <kbd>Z</kbd> | Edición Markdown abierta. |
| Rehacer | <kbd>Ctrl</kbd> + <kbd>Y</kbd> / <kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>Z</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>Z</kbd> | Edición Markdown abierta. |

<kbd>Tab</kbd> cambia de función según el contexto: en una lista aumenta su nivel y en una tabla avanza a la siguiente celda. En el editor de texto y código no es el atajo de sangría. Consulta [Editar Markdown]({{ '/es/docs/editar-markdown/' | relative_url }}) y [Tablas, código y contenido avanzado]({{ '/es/docs/tablas-codigo-y-contenido-avanzado/' | relative_url }}).

## Edición de texto y código

| Acción | Windows/Linux | macOS | Contexto |
| --- | --- | --- | --- |
| Deshacer | <kbd>Ctrl</kbd> + <kbd>Z</kbd> | <kbd>⌘</kbd> + <kbd>Z</kbd> | Edición de texto abierta. |
| Rehacer | <kbd>Ctrl</kbd> + <kbd>Y</kbd> | <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>Z</kbd> | Edición de texto abierta. |
| Mover línea arriba/abajo | <kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>Alt</kbd> + <kbd>↓</kbd> | <kbd>⌥</kbd> + <kbd>↑</kbd> / <kbd>⌥</kbd> + <kbd>↓</kbd> | Línea actual o líneas seleccionadas. |
| Duplicar línea arriba/abajo | <kbd>Mayús</kbd> + <kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>Mayús</kbd> + <kbd>Alt</kbd> + <kbd>↓</kbd> | <kbd>⇧</kbd> + <kbd>⌥</kbd> + <kbd>↑</kbd> / <kbd>⇧</kbd> + <kbd>⌥</kbd> + <kbd>↓</kbd> | Línea actual o líneas seleccionadas. |
| Comentar o retirar comentario | <kbd>Ctrl</kbd> + <kbd>/</kbd> | <kbd>⌘</kbd> + <kbd>/</kbd> | Solo si el lenguaje admite comentarios. |
| Aumentar sangría | <kbd>Ctrl</kbd> + <kbd>]</kbd> | <kbd>⌘</kbd> + <kbd>]</kbd> | Línea o selección. |
| Añadir siguiente coincidencia | <kbd>Ctrl</kbd> + <kbd>D</kbd> | <kbd>⌘</kbd> + <kbd>D</kbd> | Primero selecciona la palabra si no había selección. |
| Solicitar sugerencias | <kbd>Ctrl</kbd> + <kbd>Espacio</kbd> | <kbd>Ctrl</kbd> + <kbd>Space</kbd> / <kbd>⌥</kbd> + <kbd>I</kbd> | Depende del lenguaje y del contexto. |

En una lista de sugerencias, usa <kbd>↑</kbd>/<kbd>↓</kbd> para elegir, <kbd>Intro</kbd> para aceptar y <kbd>Esc</kbd> para cerrar. La disponibilidad depende del lenguaje: no todos ofrecen propuestas. Para plegar bloques, utiliza la flecha del margen y los puntos suspensivos, como se explica en [Editar texto y código]({{ '/es/docs/editar-texto-y-codigo/' | relative_url }}).

## Búsqueda y reemplazo

Abre **Buscar** con <kbd>Ctrl</kbd> + <kbd>F</kbd> o <kbd>⌘</kbd> + <kbd>F</kbd>. Dentro de sus campos:

| Acción | Windows/Linux | macOS | Contexto |
| --- | --- | --- | --- |
| Siguiente resultado | <kbd>Intro</kbd> | <kbd>Enter</kbd> | Foco en Buscar texto. |
| Resultado anterior | <kbd>Mayús</kbd> + <kbd>Intro</kbd> | <kbd>⇧</kbd> + <kbd>Enter</kbd> | Foco en Buscar texto. |
| Reemplazar coincidencia actual | <kbd>Intro</kbd> | <kbd>Enter</kbd> | Foco en Reemplazar por y coincidencia seleccionada. |

**Reemplazar todo** actúa inmediatamente sobre el archivo abierto. Un campo de reemplazo vacío elimina las coincidencias. Revisa la consulta y los resultados antes de guardar; consulta [Buscar y reemplazar]({{ '/es/docs/buscar-y-reemplazar/' | relative_url }}).

## Conservar cambios ante un error

### Reconocer cambios sin guardar

El icono de un lápiz dentro de un cuadrado, junto a la ruta, indica **Cambios sin guardar**. Utiliza **Guardar** y comprueba que desaparezca. Un aviso de error no confirma que se haya guardado el contenido.

### Cancelar una salida que no pudo guardar

Si falla el guardado al navegar, cambiar de espacio o cerrar, Plunibio presenta **Continuar** y **Cancelar**. El mensaje advierte que podrías perder datos.

{% include docs-figure.html id="es-shortcuts-troubleshooting-navigation-save-failed" %}

1. Selecciona **Cancelar** para mantener la edición y resolver el problema antes de salir.
2. Comprueba el formato del archivo, sus permisos de escritura y la disponibilidad de la carpeta o unidad. Vuelve a intentar **Guardar** cuando hayas corregido la causa.
3. Si necesitas conservar el texto pendiente por otro medio, cópialo a otra aplicación antes de abandonar la edición. En Markdown, conserva también las propiedades YAML si las has modificado.
{: .docs-steps}

{% include docs-callout.html type="warning" content="Continuar después de un error de guardado puede perder los cambios pendientes. La aplicación utiliza Continuar tanto al navegar como al cerrar. Selecciónalo solo si aceptas abandonar esos cambios." %}

### Recuperar cambios externos o descartar una edición

**Recargar** vuelve a leer el archivo en disco y pide confirmación. Si tienes cambios pendientes, **OK** los descarta; **Cancelar** conserva la edición. Antes de recargar un archivo modificado por otra aplicación, conserva por separado lo que quieras recuperar de tu edición actual.

Guardar escribe el contenido abierto y puede sobrescribir los cambios de otra aplicación. Recargar no recupera versiones que ya hayas sobrescrito. Consulta [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}) para los pasos de guardado y recarga.

## Resolver problemas de archivos y espacios

### Localizar un archivo que no aparece

Comprueba que estás en el espacio y carpeta correctos. Si el nombre comienza por punto o el sistema lo marca como oculto, utiliza **Más opciones** → **Archivos ocultos** → **Mostrar**. Si el archivo o carpeta se movió fuera de Plunibio, vuelve a su carpeta y utiliza **Recargar** para actualizar el listado.

Si el espacio ya no está disponible, abre **Más opciones** → **Abrir espacio** y elige una carpeta existente. Revisa también la conexión de la unidad si trabajas con almacenamiento extraíble o de red.

### Distinguir creación inmediata y creación desde terminal

Los controles **Nueva carpeta**, **Nuevo archivo Markdown**, **Nuevo archivo de texto** y **Otro archivo nuevo** crean el elemento inmediatamente. Si aparece **Ya existe un archivo o una carpeta llamado…**, elige otro nombre; Plunibio no sobrescribe el existente.

Un archivo vacío solicitado por [Línea de comandos]({{ '/es/docs/linea-de-comandos/' | relative_url }}) no se crea solo por abrirlo: utiliza **Guardar** explícitamente. Abandonarlo sin texto ni guardado deja el archivo sin crear.

### Resolver un renombrado o una eliminación

No se puede renombrar ni eliminar la raíz del espacio desde el menú del elemento. Si un nombre ya existe, elige uno diferente. Cambiar la extensión requiere confirmar y puede abrir otro editor.

Al renombrar, las referencias de otros documentos no se reescriben: revisa enlaces y rutas de imágenes. La eliminación es permanente, sin papelera ni recuperación mediante Deshacer, y no guarda antes el contenido pendiente del elemento eliminado. Para recuperar un archivo borrado, utiliza una copia de seguridad si dispones de ella.

### Abrir un formato no reconocido

Plunibio muestra **Abrir con la aplicación predeterminada**. Necesitas una aplicación del sistema capaz de abrir ese formato. Si falla, comprueba que el archivo exista y que tenga una aplicación asociada. Los formatos internos se enumeran en [Editar texto y código]({{ '/es/docs/editar-texto-y-codigo/' | relative_url }}) y [Ver y editar imágenes]({{ '/es/docs/ver-y-editar-imagenes/' | relative_url }}).

## Resolver problemas de enlaces e imágenes

### Corregir un enlace que no abre

En Markdown, utiliza la dirección de las acciones del enlace para abrirlo. Comprueba que su ruta relativa esté calculada desde el documento que lo contiene y que el destino no se haya renombrado o eliminado.

Una URI absoluta `file:` puede conservarse en el Markdown al enlazar un archivo externo, pero su apertura no está admitida en Plunibio. Copia o mueve el recurso al espacio y utiliza una ruta relativa al documento. Las rutas que resuelven fuera del espacio también se rechazan. Consulta [Enlaces e imágenes]({{ '/es/docs/enlaces-e-imagenes/' | relative_url }}).

### Recuperar una imagen que no se muestra

Comprueba el archivo de imagen, su ubicación y la dirección guardada en el documento. Si moviste o renombraste el recurso, actualiza la referencia. Una imagen insertada mediante una dirección web depende de que esa dirección esté disponible; una copia local dentro del espacio evita depender de ella.

### Guardar una imagen editada

Solo PNG, JPEG y WebP admiten guardado tras editar. AVIF, BMP, GIF e ICO pueden visualizarse, pero muestran un error al intentar guardar modificaciones. Para abandonar esos cambios, usa **Recargar** y confirma el descarte antes de navegar o cerrar.

El editor de imágenes no utiliza el historial de Deshacer del editor de texto. Para retirar ajustes de la edición actual, utiliza sus restablecimientos; después de guardar y recargar, necesitas una copia anterior para recuperar el original. Consulta [Ver y editar imágenes]({{ '/es/docs/ver-y-editar-imagenes/' | relative_url }}).

## Resolver problemas de edición y búsqueda

### Revisar una consulta sin resultados

Comprueba **Distinguir mayúsculas y minúsculas**, **Solo palabras completas** y **Usar expresión regular**. Si aparece **Expresión no válida**, corrige el patrón o desactiva la expresión regular. `0 / 4` significa cuatro resultados sin coincidencia actual seleccionada; pulsa **Siguiente** para seleccionar una.

La búsqueda se limita al archivo abierto. En Markdown busca el texto del cuerpo, no las propiedades YAML ni direcciones de enlaces o rutas de imágenes. Utiliza los controles específicos para editar esos datos.

### Recuperar los controles que faltan

Utiliza **Mostrar panel lateral** para recuperar Formato, Buscar, Acciones o los controles de imagen, según la vista. Las preferencias y su persistencia se explican en [Personalizar Plunibio]({{ '/es/docs/personalizar-plunibio/' | relative_url }}).

Si un atajo no actúa, comprueba el foco y cierra primero los diálogos. Para código, las sugerencias, comentarios y plegado dependen del lenguaje; no todos los formatos tienen las mismas ayudas.

### Corregir Mermaid, fórmulas o propiedades YAML

Un error de vista previa Mermaid no elimina el código del bloque: revisa su fuente. Para fórmulas, utiliza una expresión admitida por el motor matemático. Los ejemplos y enlaces de referencia están en [Tablas, código y contenido avanzado]({{ '/es/docs/tablas-codigo-y-contenido-avanzado/' | relative_url }}).

Las propiedades necesitan YAML válido. Revisa la sangría y los valores en **Propiedades del documento**; el resaltado no garantiza que otra herramienta pueda interpretarlos. Consulta [Editar Markdown]({{ '/es/docs/editar-markdown/' | relative_url }}).

## Preparar un informe de problema

Puedes encontrar el código del proyecto y sus opciones de colaboración en [GitHub]({{ site.github_url }}). Para describir un fallo reproducible:

1. Anota la versión instalada desde **Más opciones** → **Acerca de Plunibio**, tu sistema operativo y qué editor o formato estabas utilizando.
2. Describe los pasos, el resultado esperado y lo que ocurrió. Incluye el mensaje de error literal y si sucede también con un archivo nuevo.
3. Prepara un ejemplo mínimo sin datos personales o privados. Si adjuntas una captura, revisa también las rutas y el contenido que aparecen en ella.
{: .docs-steps}

Indica si el archivo está en una unidad local, extraíble o de red y qué intentos de recuperación has realizado. No necesitas compartir tu espacio completo para explicar el problema.
