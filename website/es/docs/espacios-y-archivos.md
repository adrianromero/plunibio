---
layout: docs-chapter
lang: es
translation_key: docs-workspaces-files
section: docs
docs_key: workspaces-files
title: Espacios y archivos
permalink: /es/docs/espacios-y-archivos/
description: Crea, ordena, renombra y elimina archivos y carpetas; guarda cambios y recarga desde el disco.
---

Un espacio delimita la carpeta local que Plunibio puede recorrer. Aquí aprenderás a crear y organizar su contenido, renombrar y eliminar elementos, guardar cambios y volver a leer archivos modificados fuera de la aplicación.

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

La raíz y cada carpeta muestran primero las carpetas y después los archivos. Cada elemento incluye un icono que identifica su tipo de editor y datos para reconocerlo:

- Los archivos muestran su tamaño y su fecha de modificación.
- Las carpetas muestran el número de archivos y carpetas visibles que contienen directamente, y su fecha de modificación. El recuento no incluye el contenido de las subcarpetas ni representa su tamaño en bytes.
- Si Plunibio no puede obtener un dato, muestra **Elementos no disponibles** o **Fecha no disponible**, según corresponda.

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

## Ordenar el listado

La ordenación elegida se aplica a los listados de carpetas del espacio y se recuerda entre sesiones. No cambia el orden del selector **Abrir espacio**.

1. Abre una carpeta y, si es necesario, selecciona **Mostrar panel lateral**.
2. En **Acciones**, busca **Ordenar por** y selecciona **Nombre**, **Tamaño** o **Modificación**.
3. Selecciona otra vez el mismo criterio para alternar entre ascendente y descendente. La flecha indica el sentido activo.
{: .docs-steps}

{% include docs-figure.html id="es-workspaces-and-files-folder-sorting" %}

| Criterio | Orden ascendente |
| --- | --- |
| Nombre | Orden alfabético adaptado al idioma, con números en orden natural: `nota2` aparece antes de `nota10`. |
| Tamaño | Archivos de menor a mayor número de bytes; carpetas de menor a mayor número de elementos visibles inmediatos. |
| Modificación | De la fecha más antigua a la más reciente. |

Las carpetas permanecen antes que los archivos en ambos sentidos. Los datos de tamaño o fecha no disponibles quedan al final de su grupo. Mostrar archivos ocultos también cambia el recuento usado para ordenar las carpetas por tamaño.

## Crear carpetas y archivos

Las acciones de creación están disponibles al ver una carpeta. Para crear junto a un archivo abierto, selecciona primero su carpeta en la ruta superior.

1. Abre la carpeta de destino. Si es necesario, selecciona **Mostrar panel lateral**.
2. En **Acciones**, elige una de las opciones de la tabla siguiente.
3. Escribe el **Nombre de la carpeta** o el **Nombre del archivo**. Para Markdown y texto, el campo ya contiene `.md` o `.txt`; escribe el nombre delante de la extensión.
4. Selecciona **OK**. Plunibio crea el elemento inmediatamente en el disco y abre la carpeta o el archivo resultante. **Cancelar** cierra el formulario sin crearlo.
{: .docs-steps}

{% include docs-figure.html id="es-workspaces-and-files-create-folder" %}

| Acción | Resultado |
| --- | --- |
| Nueva carpeta | Crea una carpeta vacía y entra en ella. |
| Nuevo archivo Markdown | Propone `.md` y abre el documento vacío en el editor Markdown si conservas esa extensión. |
| Nuevo archivo de texto | Propone `.txt` y abre el documento vacío en el editor de texto si conservas esa extensión. |
| Otro archivo nuevo | Permite escribir el nombre completo, incluida la extensión, como `datos.json`. La extensión determina cómo se abre. |

Los archivos nuevos están vacíos: **Otro archivo nuevo** no genera una plantilla ni convierte contenido a otro formato. La creación gráfica ya deja el archivo en el disco, aunque todavía no hayas escrito ni utilizado **Guardar**.

Usa un solo nombre, sin `/` ni `\`; no escribas una ruta ni utilices `.` o `..`. Para crear varios niveles, crea una carpeta, entra en ella y repite la operación. El nombre debe ser válido en tu sistema operativo. Si ya existe un elemento con ese nombre o no tienes permisos, Plunibio muestra un error y no sobrescribe el elemento existente.

Los atajos de creación solo actúan mientras se muestra una carpeta:

| Acción | Windows y Linux | macOS |
| --- | --- | --- |
| Nueva carpeta | <kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>N</kbd> | <kbd>⌘</kbd> + <kbd>Mayús</kbd> + <kbd>N</kbd> |
| Nuevo archivo Markdown | <kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>M</kbd> | <kbd>⌘</kbd> + <kbd>Mayús</kbd> + <kbd>M</kbd> |
| Nuevo archivo de texto | <kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>T</kbd> | <kbd>⌘</kbd> + <kbd>Mayús</kbd> + <kbd>T</kbd> |

## Utilizar la ruta y el historial

La ruta del archivo muestra **Inicio**, las carpetas intermedias y el elemento actual. Selecciona una carpeta de la ruta para regresar a ella. En ubicaciones profundas solo se muestran los cuatro últimos segmentos; los anteriores se representan con puntos suspensivos.

{% include docs-figure.html id="es-workspaces-and-files-nested-file" %}

**Atrás** y **Adelante** recorren el historial del espacio actual, tanto para carpetas como para archivos. Si vuelves atrás y después abres otro elemento, Plunibio inicia una nueva rama del historial y descarta el recorrido que quedaba por delante.

| Acción | Windows y Linux | macOS |
| --- | --- | --- |
| Atrás | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>,</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>,</kbd> |
| Adelante | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>.</kbd> | <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>.</kbd> |

Los botones se desactivan cuando no existe un destino en esa dirección. Cambiar de espacio borra el historial anterior.

## Renombrar el archivo o la carpeta actual

El menú junto al nombre del elemento actual ofrece **Renombrar** y **Eliminar**. Para actuar sobre una carpeta, entra primero en ella. La raíz **Inicio** no ofrece estas acciones.

{% include docs-figure.html id="es-workspaces-and-files-item-menu" %}

1. Abre el archivo o la carpeta que quieres renombrar.
2. Selecciona la flecha junto a su nombre en la ruta y elige **Renombrar**. También puedes pulsar <kbd>F2</kbd>.
3. En **Renombrar archivo** o **Renombrar carpeta**, escribe el nuevo nombre. En un archivo se selecciona inicialmente el nombre sin la extensión para que puedas conservarla.
4. Selecciona **OK**. Si hay cambios pendientes en el editor, Plunibio intenta guardarlos antes de renombrar. Si el guardado falla, la operación se cancela y muestra el error.
{: .docs-steps}

{% include docs-figure.html id="es-workspaces-and-files-rename-entry" %}

Se aplican las mismas reglas de nombres que al crear. El elemento permanece en su carpeta; no puedes moverlo escribiendo una ruta. Si el nombre de destino ya existe, Plunibio muestra un error y conserva los dos elementos.

Si cambias la extensión de un archivo, aparece una confirmación adicional. Selecciona **Continuar** para aceptar o **Cancelar** para conservar el nombre anterior. La nueva extensión determina qué editor se abre; por ejemplo, cambiar `.md` por `.txt` muestra el contenido Markdown como texto.

{% include docs-figure.html id="es-workspaces-and-files-rename-extension" %}

{% capture rename_warning %}
Cambiar la extensión no convierte el formato del contenido. Renombrar tampoco actualiza los enlaces o las rutas de imágenes que utilizaban el nombre anterior. Después de renombrar un archivo o una carpeta, revisa las referencias afectadas en tus documentos.
{% endcapture %}
{% include docs-callout.html type="warning" content=rename_warning %}

## Eliminar un archivo o una carpeta

{% capture delete_warning %}
La eliminación es permanente: no envía el elemento a la papelera y no se puede deshacer desde Plunibio. Al eliminar una carpeta se borra todo su contenido, incluidas subcarpetas y archivos ocultos. Al eliminar un archivo abierto, también se descartan los cambios del editor sin guardarlos antes. Conserva una copia de lo que necesites antes de continuar.
{% endcapture %}
{% include docs-callout.html type="warning" content=delete_warning %}

1. Abre el archivo o entra en la carpeta que quieres eliminar. Comprueba su nombre y su ubicación en la ruta.
2. Selecciona la flecha junto al nombre del elemento actual y elige **Eliminar**.
3. Revisa el nombre en la confirmación. Selecciona **Cancelar** para conservarlo o **Eliminar** para borrarlo permanentemente.
4. Tras eliminarlo, Plunibio muestra la carpeta que lo contenía. Si no puede borrarlo, muestra el error.
{: .docs-steps}

{% include docs-figure.html id="es-workspaces-and-files-delete-folder" %}

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

Un **icono cuadrado con lápiz** junto al nombre del archivo, con la descripción **Cambios sin guardar**, indica que hay cambios pendientes. Para escribirlos en el disco:

1. Pulsa <kbd>Ctrl</kbd> + <kbd>S</kbd> en Windows y Linux o <kbd>⌘</kbd> + <kbd>S</kbd> en macOS. También puedes abrir **Más opciones** y seleccionar **Guardar**.
2. Espera a que termine el guardado.
3. Comprueba que el indicador desaparece. Si Plunibio no puede escribir el archivo, muestra un error y conserva el indicador de cambios.
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

Si un archivo de texto o Markdown ya no existe, la recarga abre un documento vacío marcado como nuevo. Puedes guardarlo para volver a crearlo o navegar a otro elemento.

## Crear un archivo indicado en la línea de comandos

Además de la creación gráfica, puedes iniciar Plunibio con el nombre relativo de un archivo de texto o Markdown que todavía no exista. En este caso, el editor lo abre vacío y muestra el indicador de cambios, pero la creación en el disco se aplaza hasta que lo guardes.

- **Guardar** crea el archivo, incluso si continúa vacío.
- Si cierras o navegas sin haber escrito nada y sin utilizar **Guardar**, el archivo no se crea.
- Si escribes contenido, el guardado al navegar o cerrar intenta conservarlo.

Consulta [Línea de comandos]({{ '/es/docs/linea-de-comandos/' | relative_url }}) para conocer los parámetros y las reglas de las rutas.

## Mantener las rutas dentro del espacio

La lista de archivos, la ruta y los enlaces relativos que abre Plunibio se resuelven dentro de la raíz del espacio. Una ruta que intente escapar mediante `..` se rechaza. Los enlaces web, `mailto:` y los archivos externos insertados como URI se entregan a la aplicación predeterminada del sistema en lugar de convertirse en rutas internas.

Este límite evita que una navegación relativa cambie silenciosamente a otro árbol de carpetas. [Enlaces e imágenes]({{ '/es/docs/enlaces-e-imagenes/' | relative_url }}) explica cómo se comportan los enlaces dentro y fuera del espacio.
