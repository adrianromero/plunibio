---
layout: docs-chapter
lang: es
translation_key: docs-view-edit-images
section: docs
docs_key: view-edit-images
title: Ver y editar imágenes
permalink: /es/docs/ver-y-editar-imagenes/
description: Amplía, gira, voltea, ajusta y guarda los formatos de imagen compatibles.
---

Abre una imagen del espacio para inspeccionarla, cambiar su orientación o ajustar su aspecto. El panel lateral reúne **Transformar**, **Ajustar** y **Preajustes**. Para insertar una imagen en un documento, consulta [Enlaces e imágenes]({{ '/es/docs/enlaces-e-imagenes/' | relative_url }}).

{% include docs-callout.html type="warning" content="Trabaja sobre una copia si quieres conservar el original. Guardar sobrescribe el archivo y vuelve a codificar la imagen; puede perder metadatos o animación. El guardado al navegar o cerrar también se aplica a las imágenes modificadas." %}

## Abrir una imagen y comprobar su formato

1. Entra en la carpeta del espacio que contiene la imagen y selecciona su archivo.
2. Si el panel está oculto, selecciona **Mostrar panel lateral**. Abre **Transformar** para ver los controles de vista y orientación.
{: .docs-steps}

{% include docs-figure.html id="es-view-edit-images-image-transform-panel" %}

La información de la esquina inferior muestra las dimensiones del lienzo en píxeles, el porcentaje de zoom y el ángulo de rotación. El zoom describe cómo ves la imagen; no cambia sus dimensiones guardadas.

| Formato | Visualizar | Guardar después de editar |
| --- | --- | --- |
| PNG (`.png`) | Sí | Sí |
| JPEG (`.jpg`, `.jpeg`) | Sí | Sí |
| WebP (`.webp`) | Sí | Sí |
| AVIF, BMP, GIF e ICO | Sí, si el sistema puede decodificar el archivo | No |

Una imagen animada se presenta como una imagen fija. Los archivos `.svg` abren su código XML en [Editar texto y código]({{ '/es/docs/editar-texto-y-codigo/' | relative_url }}). No se abren en este visor, aunque puedes insertar un SVG como imagen en Markdown.

## Ampliar, encajar y desplazar la vista

En **Transformar**, arrastra **Nivel de zoom** entre el 10 % y el 500 %, o utiliza la rueda sobre la imagen. Los botones situados debajo permiten:

| Control | Resultado |
| --- | --- |
| **Alejar** / **Acercar** | Reducir o aumentar el zoom por pasos. |
| **Ajustar a la pantalla** | Encajar la imagen completa y centrarla; no amplía por encima del tamaño real. |
| **Centrar imagen** | Recuperar la posición central conservando el zoom. |
| **Tamaño real** (**1:1**) | Mostrar la imagen al 100 %. |

1. Selecciona **Tamaño real** para inspeccionar los detalles al 100 %.
2. Mantén pulsado el botón principal del ratón sobre la imagen y arrastra para desplazarla.
3. Selecciona **Centrar imagen** para recuperar el centro o **Ajustar a la pantalla** para volver a ver la imagen completa.
{: .docs-steps}

{% include docs-figure.html id="es-view-edit-images-image-panned" %}

Cambiar el zoom o desplazar la vista no modifica el archivo ni activa **Cambios sin guardar**. Estas acciones no son herramientas de recorte ni de cambio de resolución.

## Girar y voltear la imagen

1. En **Transformar**, usa **-90° Izquierda** o **+90° Derecha** para girar por cuartos de vuelta. Para otro ángulo, arrastra **Rotación** entre −180° y 180°.
2. En **Voltear / Espejo**, selecciona **Horizontal** o **Vertical**. Repite el mismo botón para retirar ese volteo.
3. Revisa la orientación y el indicador **Cambios sin guardar** antes de guardar.
{: .docs-steps}

{% include docs-figure.html id="es-view-edit-images-image-rotated-flipped" %}

Girar modifica el lienzo que se guardará. Con un ángulo libre, el lienzo puede crecer para contener toda la imagen. Si necesitas ver el resultado completo después del giro, selecciona **Ajustar a la pantalla**.

## Ajustar brillo, color y contraste

1. Abre **Ajustar** en el panel lateral.
2. Arrastra los controles y observa el resultado. El porcentaje junto al nombre indica el valor actual.
3. Si quieres retirar estos ajustes, selecciona **Restablecer filtros**. El giro y los volteos se conservan.
{: .docs-steps}

{% include docs-figure.html id="es-view-edit-images-image-adjust" %}

| Control | Intervalo | Valor neutro |
| --- | --- | --- |
| **Brillo** | 0–200 % | 100 % |
| **Contraste** | 0–200 % | 100 % |
| **Saturación** | 0–200 % | 100 % |
| **Escala de grises** | 0–100 % | 0 % |
| **Sepia** | 0–100 % | 0 % |
| **Invertir colores** | 0–100 % | 0 % |

Por ejemplo, esta imagen combina **Brillo** al 75 %, **Contraste** al 130 % y **Saturación** al 140 %:

{% include docs-figure.html id="es-view-edit-images-image-adjusted" %}

## Aplicar un preajuste

1. Abre **Preajustes**.
2. Selecciona **Normal**, **B/N**, **Vintage**, **Vívido**, **Dramático** o **Negativo** para aplicar su combinación de filtros.
3. Si quieres afinar el resultado, vuelve a **Ajustar** y modifica los controles.
{: .docs-steps}

{% include docs-figure.html id="es-view-edit-images-image-presets" %}

**Normal** utiliza los valores neutros; **B/N** aplica escala de grises y más contraste; **Vintage** utiliza sepia; **Vívido** aumenta saturación y contraste; **Dramático** refuerza el contraste y reduce brillo y saturación; **Negativo** invierte los colores.

Un preajuste sustituye todos los ajustes anteriores y también retira el giro y los volteos, incluido al elegir **Normal**. Si necesitas combinarlo con una orientación distinta, aplica primero el preajuste y después gira o voltea la imagen.

## Elegir cómo restablecer

| Acción | Qué restablece | Qué conserva |
| --- | --- | --- |
| **Reestablecer transformaciones**, en **Transformar** | Giro y volteos; encaja y centra la vista. | Los filtros actuales. |
| **Restablecer filtros**, en **Ajustar** | Brillo, contraste, saturación, escala de grises, sepia e inversión a sus valores neutros. | Giro, volteos y vista. |
| **Normal**, en **Preajustes** | Filtros, giro y volteos. | Zoom y desplazamiento de la vista. |

Los restablecimientos trabajan sobre la imagen cargada en esta edición. No recuperan un original anterior a un guardado y una recarga. Incluso después de restablecer, puede seguir apareciendo **Cambios sin guardar**; esto no confirma que el resultado sea diferente del archivo en disco.

## Guardar el resultado

1. Comprueba que el archivo sea PNG, JPEG o WebP y revisa el resultado.
2. Pulsa <kbd>Ctrl</kbd> + <kbd>S</kbd> en Windows/Linux o <kbd>⌘</kbd> + <kbd>S</kbd> en macOS. También puedes abrir **Más opciones** → **Guardar**.
3. Espera a que desaparezca **Cambios sin guardar**. Si aparece un error, resuélvelo antes de dar la edición por guardada.
{: .docs-steps}

Guardar escribe la imagen transformada en el mismo archivo. No guarda el zoom ni el desplazamiento como cambios en sus píxeles. JPEG y WebP se vuelven a comprimir con pérdida; evita guardados repetidos si necesitas conservar la máxima calidad. JPEG no conserva transparencia. Conserva una copia externa del original para poder recuperarlo después.

El **guardado al navegar o cerrar** intenta guardar una imagen modificada cuando abandonas la edición. Para descartar cambios, utiliza **Recargar** antes de navegar; consulta [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}) para las decisiones ante errores de guardado.

## Descartar cambios o volver a leer el archivo

1. Antes de guardar o navegar, abre **Más opciones** → **Recargar**, o pulsa <kbd>Ctrl</kbd> + <kbd>R</kbd> / <kbd>⌘</kbd> + <kbd>R</kbd>.
2. Revisa el mensaje. Si quieres volver al archivo en disco y perder los cambios pendientes, selecciona **OK**. Para continuar editando, selecciona **Cancelar**.
3. Tras la recarga, la vista vuelve a encajarse y los controles recuperan sus valores iniciales. Si habías guardado los cambios, su efecto permanece en la imagen aunque los filtros vuelvan a valores neutros.
{: .docs-steps}

**Recargar** no recupera una versión anterior ya sobrescrita. El editor de imágenes no ofrece el historial de deshacer del editor de texto; utiliza los restablecimientos para retirar ajustes de la edición actual o recarga para descartar lo que aún no hayas guardado.

## Resolver un formato que no se puede guardar

AVIF, BMP, GIF e ICO permiten inspeccionar la imagen y probar los controles, pero Plunibio no puede guardar el resultado editado en esos formatos.

{% include docs-figure.html id="es-view-edit-images-unsupported-image-save" %}

1. Cierra el aviso de formato no compatible. Los cambios pendientes siguen en la edición; el intento fallido no los guarda.
2. Si no vas a conservar esos cambios, utiliza **Recargar** y confirma el descarte antes de navegar o cerrar.
3. Para editar y guardar la imagen, crea una copia PNG, JPEG o WebP con una herramienta que convierta imágenes y abre esa copia en Plunibio.
{: .docs-steps}

Cambiar únicamente el nombre o la extensión no convierte el contenido del archivo. Si el problema es un permiso de escritura o una imagen dañada, revisa también [Atajos y solución de problemas]({{ '/es/docs/atajos-y-solucion-de-problemas/' | relative_url }}).
