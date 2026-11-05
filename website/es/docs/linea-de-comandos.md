---
layout: docs-chapter
lang: es
translation_key: docs-command-line
section: docs
docs_key: command-line
title: Línea de comandos
permalink: /es/docs/linea-de-comandos/
description: Inicia Plunibio con un espacio, un archivo o un tamaño de ventana personalizado.
---

Inicia Plunibio desde una terminal para elegir el espacio, abrir un archivo o carpeta y definir el tamaño inicial de la ventana. Los argumentos indican qué abrir en ese inicio; los valores que omitas pueden recuperarse de la sesión anterior.

## Ejecutar la aplicación instalada

Los ejemplos utilizan `plunibio` como nombre del ejecutable. Si no está disponible en tu `PATH`, utiliza su ruta real. Para un AppImage, utiliza la ruta del archivo AppImage que hayas instalado. Consulta [Instalación]({{ '/es/install/' | relative_url }}) para preparar la aplicación.

En una terminal de Linux o macOS, una ruta con espacios debe ir entre comillas:

```bash
"/ruta/a/plunibio" --help
```

En PowerShell, utiliza `&` delante de una ruta de ejecutable entre comillas:

```powershell
& "C:\ruta\plunibio.exe" --help
```

Sustituye las rutas de ejemplo por las de tu equipo. Estos comandos corresponden al ejecutable de escritorio; no requieren ejecutar npm ni iniciar el servidor de desarrollo.

## Consultar la sintaxis y las opciones

```text
plunibio [OPTIONS] [FILENAME]
```

| Argumento u opción | Uso |
| --- | --- |
| `FILENAME` | Archivo o carpeta que abrir, con ruta relativa al espacio. Es opcional. |
| `--base-path BASEPATH` | Carpeta raíz del espacio. Puede ser absoluta o relativa al directorio de la terminal y debe existir. |
| `--width WIDTH` | Ancho inicial de ventana, como entero mayor que cero. |
| `--height HEIGHT` | Alto inicial de ventana, como entero mayor que cero. |
| `-h`, `--help` | Mostrar ayuda y terminar sin abrir la ventana. |
| `-V`, `--version` | Mostrar la versión instalada y terminar sin abrir la ventana. |

Solo se admite un `FILENAME`. Puedes combinarlo con las opciones, por ejemplo:

```bash
plunibio --base-path "/home/usuario/Documentos" --width 1200 --height 800 "notas/idea.md"
```

## Elegir un espacio o abrir su raíz

Para seleccionar un espacio, pasa su carpeta con `--base-path`:

```bash
plunibio --base-path "/home/usuario/Documentos"
```

Si ya has utilizado ese espacio, Plunibio puede restaurar su último archivo o carpeta. Para abrir explícitamente la raíz, añade `.` como argumento:

```bash
plunibio --base-path "/home/usuario/Documentos" .
```

Una ruta base relativa se resuelve desde el directorio de la terminal. Si estás en la carpeta que contiene `mi-espacio`, puedes usar:

```bash
plunibio --base-path "./mi-espacio" .
```

Para utilizar explícitamente la carpeta actual de la terminal como espacio, escribe `plunibio --base-path . .`. Ejecutar solo `plunibio` permite restaurar el espacio anterior.

## Abrir un archivo o una carpeta del espacio

El argumento `FILENAME` se interpreta dentro del espacio elegido, no desde el directorio de la terminal. Por ejemplo:

```bash
plunibio --base-path "/home/usuario/Documentos" "notas/idea.md"
plunibio --base-path "/home/usuario/Documentos" "notas"
```

En PowerShell, el mismo patrón puede escribirse con rutas de Windows:

```powershell
& "C:\ruta\plunibio.exe" --base-path "C:\Users\Usuario\Documents" "notas\idea.md"
```

Si omites `--base-path`, el archivo se busca en el espacio restaurado; solo se usa la carpeta actual de la terminal cuando no hay un espacio guardado válido. Para que un comando abra siempre el mismo lugar, indica tanto la base como la ruta relativa.

No utilices una ruta absoluta como `FILENAME`. Tampoco se admiten segmentos `..`, incluso en una ruta como `notas/../idea.md`. El destino debe permanecer dentro del espacio; los enlaces del sistema de archivos no permiten abrir destinos externos a esa raíz. Las comillas permiten nombres con espacios, pero no cambian estas reglas.

## Solicitar un archivo que aún no existe

Un nombre inexistente con una extensión editable puede abrirse como documento vacío. Por ejemplo, si la carpeta `notas` ya existe:

```bash
plunibio --base-path "/home/usuario/Documentos" "notas/nueva-idea.md"
```

1. Comprueba el nombre en la ruta de la ventana. Aparece **Cambios sin guardar**, aunque todavía no hayas escrito nada.
2. Para crear el archivo vacío, pulsa <kbd>Ctrl</kbd> + <kbd>S</kbd> en Windows/Linux o <kbd>⌘</kbd> + <kbd>S</kbd> en macOS.
3. Si escribes contenido, guárdalo explícitamente o utiliza el guardado al navegar o cerrar, como se explica en [Espacios y archivos]({{ '/es/docs/espacios-y-archivos/' | relative_url }}).
{: .docs-steps}

Si abandonas el documento vacío sin guardarlo explícitamente ni escribir contenido, el archivo no se crea. La creación desde el panel **Acciones** de una carpeta sí crea el archivo inmediatamente. Prepara antes la carpeta de destino; el argumento no crea carpetas intermedias.

## Elegir el tamaño inicial de ventana

```bash
plunibio --width 1200 --height 800
```

Puedes indicar solo una dimensión. Por ejemplo, `plunibio --width 1200` cambia el ancho inicial y conserva el alto guardado, o el valor inicial si no lo había. Los valores deben ser enteros mayores que cero; no utilices porcentajes, decimales ni un sufijo como `px`.

Las dimensiones se aplican a la ventana de la aplicación. Al cerrar normalmente se guarda su tamaño actual, que puede ser distinto del solicitado si has redimensionado la ventana.

## Entender la precedencia

| Valor | Si lo indicas en el comando | Si lo omites |
| --- | --- | --- |
| Espacio | Se utiliza `--base-path`. | Último espacio guardado válido; si no hay ninguno, directorio actual de la terminal. |
| Archivo o carpeta | Se utiliza `FILENAME` dentro del espacio elegido. | Último destino guardado para ese espacio; si no hay ninguno, su raíz. |
| Ancho | Se utiliza `--width`. | Ancho guardado; si no hay ninguno, 800. |
| Alto | Se utiliza `--height`. | Alto guardado; si no hay ninguno, 600. |

Los argumentos explícitos prevalecen por separado. Cambiar solo el espacio no obliga a abrir su raíz; cambiar solo el ancho no sustituye el alto. Usa `.` como destino cuando quieras evitar restaurar el último archivo.

## Reconocer qué se restaura

Al cerrar normalmente, Plunibio guarda el espacio actual, el último archivo o carpeta de cada espacio utilizado y las dimensiones de la ventana. La siguiente apertura sin argumentos intenta recuperar esos valores.

La información se conserva en `.plunibio/properties.toml`, dentro de tu carpeta personal (`~/.plunibio/properties.toml` en Linux y macOS). No necesitas editar ese archivo para utilizar los argumentos. Si el espacio guardado ya no está disponible, se utiliza el directorio actual de la terminal.

Tema, idioma, tipografía, panel lateral, archivos ocultos y ordenación son preferencias independientes de esta restauración; consulta [Personalizar Plunibio]({{ '/es/docs/personalizar-plunibio/' | relative_url }}).

## Resolver errores de argumentos

| Problema | Qué revisar |
| --- | --- |
| No se encuentra el ejecutable | Utiliza su ruta real o comprueba que esté disponible en `PATH`. |
| La ruta base no existe o es un archivo | Elige una carpeta existente para `--base-path`. |
| El nombre debe ser relativo | Pasa la carpeta raíz con `--base-path` y el archivo o subcarpeta por separado, sin ruta absoluta ni `..`. |
| Dimensión no válida | Utiliza un entero mayor que cero después de `--width` o `--height`. |
| Falta un valor o aparece una opción desconocida | Comprueba el nombre y el valor de la opción con `--help`; solo se admite un destino posicional. |
| La ventana abre un destino anterior | Indica `--base-path` y un destino explícito; utiliza `.` para abrir la raíz. |

Los errores de argumentos se notifican antes de abrir la ventana y terminan con código de salida 2. La ayuda y la consulta de versión terminan con código 0. Los problemas al leer o guardar un documento se gestionan dentro de la aplicación; consulta [Atajos y solución de problemas]({{ '/es/docs/atajos-y-solucion-de-problemas/' | relative_url }}).
