---
layout: docs-chapter
lang: es
translation_key: docs-links-images
section: docs
docs_key: links-images
title: Enlaces e imágenes
permalink: /es/docs/enlaces-e-imagenes/
description: Crea enlaces e inserta imágenes por dirección, pegado o arrastre.
---

Plunibio guarda enlaces y referencias a imágenes dentro del archivo Markdown. Este capítulo explica cómo crearlos, abrir sus destinos y conservar los archivos necesarios al compartir el documento.

## Crear un enlace

1. Selecciona el texto que servirá de enlace. Si prefieres que la dirección sea también el texto visible, coloca el cursor sin seleccionar texto.
2. Abre el panel lateral, selecciona **Formato** y pulsa **Enlace** en **Formato de texto**.
3. Escribe la URL o la ruta relativa en **Dirección del enlace**, por ejemplo `https://example.com` o `notes/notas-de-campo.md`.
4. Selecciona **OK**, el botón con la marca de confirmación. **Cancelar** o <kbd>Esc</kbd> cierran la edición sin crear el enlace.
{: .docs-steps}

{% include docs-figure.html id="es-links-and-images-create-link" %}

Al confirmar, el texto seleccionado conserva su contenido y recibe el enlace. Sin selección, Plunibio inserta la dirección como texto enlazado. Guarda el documento para conservar el cambio.

## Editar, copiar o quitar un enlace

Pasa el puntero sobre un enlace para ver su dirección y sus acciones.

{% include docs-figure.html id="es-links-and-images-link-actions" %}

1. Selecciona **Editar enlace**.
2. Modifica **Dirección del enlace**.
3. Selecciona **OK** para aplicar la dirección o **Cancelar** para conservar la anterior. También puedes cancelar con <kbd>Esc</kbd>.
{: .docs-steps}

{% include docs-figure.html id="es-links-and-images-link-address-edit" %}

**Copiar enlace** copia la dirección al portapapeles. **Eliminar enlace** conserva el texto visible y retira su enlace; no elimina el archivo de destino. Para cambiar el texto visible, edítalo en el documento.

## Abrir un destino y entender sus rutas

1. Pasa el puntero sobre el enlace.
2. Selecciona la **dirección** que aparece en los controles flotantes.
3. Si el destino es un archivo del espacio, Plunibio lo abre con el editor correspondiente. Utiliza **Atrás** para regresar al documento.
{: .docs-steps}

| Dirección | Comportamiento |
| --- | --- |
| `https://example.com` o `http://example.com` | Se abre mediante la aplicación predeterminada del sistema, normalmente el navegador. |
| `mailto:persona@example.com` | Se entrega a la aplicación de correo configurada en el sistema. |
| `notes/ideas.md` | Se resuelve desde la carpeta del documento Markdown actual. |
| `../ideas.md` | Sube a la carpeta superior, siempre que el destino permanezca dentro del espacio. |
| `#seccion` | Busca ese identificador en el documento actual y se desplaza hasta él si existe. |
| `file:///...` | Puede conservarse en el documento, pero su apertura desde Plunibio no está admitida. |

Para enlazar otra sección, utiliza un identificador que exista en el documento actual. Para otro documento, enlaza primero su archivo; después utiliza sus enlaces internos para recorrerlo.

{% capture path_warning %}
Los enlaces relativos no pueden salir de la raíz del espacio. Una URI `file:` de un archivo externo no se convierte en una ruta del espacio ni se abre con la aplicación predeterminada desde estos controles. Para trabajar con ese archivo, utiliza su aplicación o coloca una copia dentro del espacio y enlázala mediante una ruta relativa.
{% endcapture %}
{% include docs-callout.html type="warning" content=path_warning %}

## Insertar una imagen por su dirección

1. Coloca el cursor en un párrafo vacío para crear una imagen en bloque, o dentro de un párrafo con texto para insertarla en línea.
2. En **Formato**, busca **Bloques** y selecciona **Imagen**.
3. En **Pega el enlace de la imagen...**, escribe una ruta relativa existente, como `assets/atlas-de-lumina.png`, o una URL de imagen.
4. Selecciona **Confirmar** o pulsa <kbd>Intro</kbd>. La imagen aparece en el documento.
{: .docs-steps}

{% include docs-figure.html id="es-links-and-images-insert-image" %}

Una dirección relativa se interpreta desde la carpeta del Markdown. Introducir una dirección solo crea la referencia: no copia un archivo a esa carpeta. Las imágenes remotas necesitan que su servidor esté disponible; Plunibio conserva su URL.

## Cambiar la referencia o abrir una imagen

Pasa el puntero sobre una imagen, o selecciónala, para mostrar **Acciones de la imagen**.

{% include docs-figure.html id="es-links-and-images-image-actions" %}

1. Selecciona **Editar enlace**.
2. Cambia **Dirección del enlace** por la nueva ruta o URL.
3. Selecciona **OK** para aplicar el cambio o **Cancelar** para mantener la referencia anterior.
{: .docs-steps}

{% include docs-figure.html id="es-links-and-images-image-address-edit" %}

**Copiar enlace** copia la referencia de la imagen. Selecciona la dirección de los controles para abrir su destino: una imagen local existente se abre en Plunibio; una URL web se entrega al sistema. Los SVG se abren como XML en el editor de texto y código.

{% include docs-figure.html id="es-links-and-images-linked-image-opened" %}

La apertura de una imagen local requiere que exista y sea accesible. Si la ruta deja de ser válida, revisa la referencia antes de intentar abrirla.

## Añadir un pie y ajustar el tamaño

Las imágenes en bloque ofrecen un pie y un control de tamaño.

1. Pasa el puntero sobre la imagen y selecciona **Mostrar u ocultar pie de imagen**.
2. Escribe en **Escribe el pie de imagen** y sal del campo para terminar la edición. Puedes volver a ocultarlo con el mismo botón; para borrar el texto, vacía el campo.
3. Para cambiar el tamaño de presentación, pasa el puntero sobre la imagen y arrastra el control de su borde inferior. Guarda el documento para conservar el pie y el tamaño.
{: .docs-steps}

{% include docs-figure.html id="es-links-and-images-image-caption" %}

El tamaño afecta a la presentación en el Markdown. Para modificar los píxeles del archivo, abre la imagen y consulta [Ver y editar imágenes]({{ '/es/docs/ver-y-editar-imagenes/' | relative_url }}). Las imágenes en línea no ofrecen este pie de bloque.

## Pegar o arrastrar imágenes y archivos

1. Coloca el cursor donde quieres pegar el contenido o identifica el punto del documento donde lo soltarás.
2. Copia una imagen, una dirección o un archivo desde otra aplicación y pega con <kbd>Ctrl</kbd> + <kbd>V</kbd> en Windows y Linux o <kbd>⌘</kbd> + <kbd>V</kbd> en macOS. También puedes arrastrar un archivo desde el gestor de archivos y soltarlo en el área de edición.
3. Comprueba la imagen o el enlace insertado y guarda el documento.
{: .docs-steps}

| Contenido recibido | Resultado |
| --- | --- |
| Imagen local dentro del espacio | Referencia relativa al archivo existente; no se duplica. |
| Imagen local fuera del espacio | Copia junto al Markdown y referencia relativa a esa copia. |
| Píxeles de imagen del portapapeles | Archivo PNG junto al Markdown, con nombre inicial `pasted-image.png`. |
| Imagen web copiada como HTML o URL directa de imagen | Referencia a la URL remota; no se descarga una copia local. |
| Archivo que no es imagen, dentro del espacio | Enlace relativo al archivo. |
| Archivo que no es imagen, fuera del espacio | Enlace absoluto `file:`; no se copia y no se puede abrir desde Plunibio. |
| URL web o `mailto:` | Enlace; una selección de texto puede servir como etiqueta. |
| Texto ordinario | Pegado habitual del editor. |

Las imágenes de archivo admitidas para importación son AVIF, BMP, GIF, ICO, JPEG, PNG, SVG y WebP. Si copias desde un gestor de archivos, el resultado depende de que entregue una referencia al archivo o datos de imagen al portapapeles. Una URL se reconoce automáticamente como imagen cuando tiene una extensión admitida; para otras direcciones de imagen, utiliza **Imagen** e introduce la URL.

Una imagen pegada o soltada en un párrafo vacío compatible se inserta como bloque. Dentro de un párrafo con texto se inserta en línea. Para importar varios archivos, introdúcelos uno a uno.

## Conservar las imágenes y compartir el documento

Las imágenes importadas se guardan junto al archivo Markdown. Si el nombre ya existe, Plunibio utiliza sufijos como `foto-2.png` y `foto-3.png`, sin sobrescribir la imagen anterior. Esta copia se crea al importar; guardar el Markdown conserva su referencia.

{% capture share_warning %}
Comparte el documento junto con sus imágenes y conserva las rutas relativas. Si renombras un archivo o una carpeta, Plunibio no actualiza automáticamente los enlaces ni las referencias de imágenes. Revisa los documentos afectados, incluidas las rutas relativas dentro de una carpeta renombrada.
{% endcapture %}
{% include docs-callout.html type="warning" content=share_warning %}

Si una imagen no aparece, comprueba la ruta, la existencia del archivo y, para una URL remota, la conexión y el servidor. Para resolver nombres, carpetas y guardado, consulta [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}). Continúa con [Tablas, código y contenido avanzado]({{ '/es/docs/tablas-codigo-y-contenido-avanzado/' | relative_url }}) para insertar tablas, diagramas y matemáticas.
