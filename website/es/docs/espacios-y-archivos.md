---
layout: docs-chapter
lang: es
translation_key: docs-workspaces-files
section: docs
docs_key: workspaces-files
title: Espacios y archivos
permalink: /es/docs/espacios-y-archivos/
description: Recorre carpetas y archivos locales, guarda cambios y recarga desde el disco.
---

Un espacio delimita la carpeta local que Plunibio puede recorrer. En este capítulo aprenderás a cambiar esa raíz, navegar sin perder cambios, reconocer cómo se abre cada tipo de archivo y volver a leer contenido modificado fuera de la aplicación.

## Abrir o cambiar de espacio

Puedes cambiar de espacio desde cualquier carpeta o archivo abierto:

1. Abre **Más opciones** y selecciona **Abrir espacio**. También puedes pulsar <kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>O</kbd> en Windows y Linux, o <kbd>⌘</kbd> + <kbd>Mayús</kbd> + <kbd>O</kbd> en macOS.
2. Selecciona una carpeta para entrar en ella. Utiliza **Carpeta superior** para subir un nivel o **Ubicaciones del equipo** para volver a las ubicaciones disponibles del sistema.
3. Comprueba la ruta mostrada en la parte superior. Esa carpeta será la nueva raíz del espacio; no es necesario seleccionar un elemento de la lista.
4. Selecciona **Abrir**. Plunibio muestra la raíz del nuevo espacio y reinicia el historial de navegación.
{: .docs-steps}

{% include docs-figure.html id="es-workspaces-and-files-workspace-selector" %}

Si cancelas, continúas en el espacio actual. Plunibio recuerda el espacio seleccionado y el último elemento abierto para la siguiente sesión.

## Recorrer carpetas y archivos

La raíz y cada carpeta muestran primero las carpetas y después los archivos. Dentro de cada grupo, los nombres se ordenan alfabéticamente sin distinguir inicialmente entre mayúsculas y minúsculas.

1. Selecciona una carpeta para mostrar su contenido.
2. Selecciona un archivo para abrir el editor o la acción correspondiente a su formato.
3. Selecciona **Inicio** en la ruta del archivo para volver directamente a la raíz del espacio.
{: .docs-steps}

{% include docs-figure.html id="es-workspaces-and-files-workspace-root" %}

Para incluir elementos ocultos, abre **Más opciones**, abre **Archivos ocultos** y selecciona **Mostrar**. Selecciona **Ocultar** para retirarlos de nuevo del listado. Esta preferencia también se aplica al selector de espacios y se conserva entre sesiones.

{% capture hidden_note %}
**Archivos ocultos** incluye archivos y carpetas cuyo nombre comienza por punto, además de los elementos que el sistema operativo marca como ocultos.
{% endcapture %}
{% include docs-callout.html type="note" content=hidden_note %}

## Utilizar la ruta y el historial

La ruta del archivo muestra **Inicio**, las carpetas intermedias y el elemento actual. Selecciona una carpeta de la ruta para regresar a ella. En ubicaciones profundas solo se muestran los cuatro últimos segmentos; los anteriores se representan con puntos suspensivos.

{% include docs-figure.html id="es-workspaces-and-files-nested-file" %}

**Atrás** y **Adelante** recorren el historial del espacio actual, tanto para carpetas como para archivos. Si vuelves atrás y después abres otro elemento, Plunibio inicia una nueva rama del historial y descarta el recorrido que quedaba por delante.

| Acción | Windows y Linux | macOS |
| --- | --- | --- |
| Atrás | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>,</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>,</kbd> |
| Adelante | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>.</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>.</kbd> |

Los botones se desactivan cuando no existe un destino en esa dirección. Cambiar de espacio borra el historial anterior.

## Reconocer cómo se abre un archivo

Plunibio elige la vista según el tipo del elemento:

| Elemento | Comportamiento |
| --- | --- |
| Carpeta | Muestra su contenido dentro de Plunibio. |
| Archivo Markdown | Abre el editor visual para `.md`, `.markdown`, `.mdown` y `.mkd`. |
| Archivo de texto o código reconocido | Abre el editor de texto y código con las ayudas disponibles para su lenguaje. |
| Imagen compatible | Abre el visor y editor de imágenes. |
| Otro formato de archivo | Muestra **Abrir con la aplicación predeterminada**. |

Al seleccionar **Abrir con la aplicación predeterminada**, Plunibio entrega el archivo al sistema operativo. La aplicación concreta depende de las asociaciones configuradas en tu equipo. Si el archivo se ha movido, no tienes permiso o el sistema no puede abrirlo, Plunibio muestra el error y mantiene el espacio actual.

Los capítulos [Editar Markdown]({{ '/es/docs/editar-markdown/' | relative_url }}), [Editar texto y código]({{ '/es/docs/editar-texto-y-codigo/' | relative_url }}) y [Ver y editar imágenes]({{ '/es/docs/ver-y-editar-imagenes/' | relative_url }}) describen las herramientas de cada editor.

## Guardar cambios de forma explícita

Un punto junto al nombre del archivo indica que hay cambios sin guardar. Para escribirlos en el disco:

1. Pulsa <kbd>Ctrl</kbd> + <kbd>S</kbd> en Windows y Linux o <kbd>⌘</kbd> + <kbd>S</kbd> en macOS. También puedes abrir **Más opciones** y seleccionar **Guardar**.
2. Espera a que termine el guardado.
3. Comprueba que el punto desaparece. Si Plunibio no puede escribir el archivo, muestra un error y conserva el indicador de cambios.
{: .docs-steps}

{% include docs-figure.html id="es-workspaces-and-files-unsaved-indicator" %}

**Guardar** solo está disponible en un editor y se desactiva cuando no hay cambios pendientes. Utilízalo antes de modificar el mismo archivo desde otra aplicación.

## Entender el guardado al navegar o cerrar

Cuando sales de un archivo modificado —al abrir otro elemento, cambiar de espacio o cerrar Plunibio— la aplicación intenta guardar primero el contenido. Este comportamiento se denomina **guardado al navegar o cerrar**; no sustituye a **Guardar** cuando quieres confirmar inmediatamente que los cambios están en el disco.

Si el intento falla, Plunibio muestra el error y te permite decidir:

- Selecciona **Cancelar** para permanecer en el archivo y resolver el problema sin abandonar los cambios.
- Selecciona **Continuar** al navegar, o **Salir de todos modos** al cerrar, únicamente si aceptas el riesgo de perder el contenido pendiente.

{% capture save_warning %}
Continuar después de un error de guardado puede perder datos. Comprueba permisos, espacio disponible y que el archivo siga accesible; después utiliza **Guardar** de nuevo.
{% endcapture %}
{% include docs-callout.html type="warning" content=save_warning %}

## Recargar contenido desde el disco

Utiliza **Recargar** cuando otro programa haya modificado el archivo o quieras descartar el estado del editor y volver a leer el disco.

1. Abre **Más opciones** y selecciona **Recargar**, o pulsa <kbd>Ctrl</kbd> + <kbd>R</kbd> en Windows y Linux o <kbd>⌘</kbd> + <kbd>R</kbd> en macOS.
2. Revisa el mensaje. Plunibio pide confirmación siempre que estás editando un archivo, aunque no haya cambios pendientes.
3. Selecciona **OK** para volver a leer el archivo o **Cancelar** para conservar el editor como está.
{: .docs-steps}

{% include docs-figure.html id="es-workspaces-and-files-reload-confirmation" %}

Si existen cambios sin guardar, el mensaje indica expresamente que se descartarán.

{% include docs-figure.html id="es-workspaces-and-files-reload-discard-changes" %}

{% capture reload_warning %}
Después de confirmar, los cambios sin guardar no se pueden recuperar desde Plunibio. **Recargar** una carpeta no muestra esta confirmación: vuelve a leer inmediatamente su listado para reflejar archivos añadidos, eliminados o renombrados fuera de la aplicación.
{% endcapture %}
{% include docs-callout.html type="warning" content=reload_warning %}

Si el archivo ya no existe, la recarga abre un documento vacío marcado como nuevo. Puedes guardarlo para volver a crearlo o navegar a otro elemento.

## Crear un archivo indicado en la línea de comandos

Plunibio no incluye una acción gráfica para crear archivos o carpetas. Sin embargo, puedes iniciarlo con el nombre relativo de un archivo de texto o Markdown que todavía no exista; el editor lo abre vacío y muestra el indicador de cambios.

- **Guardar** crea el archivo, incluso si continúa vacío.
- Si cierras o navegas sin haber escrito nada y sin utilizar **Guardar**, el archivo no se crea.
- Si escribes contenido, el guardado al navegar o cerrar intenta conservarlo.

Consulta [Línea de comandos]({{ '/es/docs/linea-de-comandos/' | relative_url }}) para conocer los parámetros y las reglas de las rutas.

## Mantener las rutas dentro del espacio

La lista de archivos, la ruta y los enlaces relativos que abre Plunibio se resuelven dentro de la raíz del espacio. Una ruta que intente escapar mediante `..` se rechaza. Los enlaces web, `mailto:` y los archivos externos insertados como URI se entregan a la aplicación predeterminada del sistema en lugar de convertirse en rutas internas.

Este límite evita que una navegación relativa cambie silenciosamente a otro árbol de carpetas. [Enlaces e imágenes]({{ '/es/docs/enlaces-e-imagenes/' | relative_url }}) explica cómo se comportan los enlaces dentro y fuera del espacio.
