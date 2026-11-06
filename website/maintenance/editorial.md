# Criterios editoriales de Plunibio

Contrato permanente de autoría del sitio ES/EN. Se aplica junto con `website/README.md`.
Las decisiones de producto actuales y el código de la versión objetivo prevalecen sobre ejemplos históricos.

## Contrato terminológico bilingüe

Este vocabulario queda congelado para los dos manuales. Los nombres visibles de controles proceden de `src/i18n/translations/{es,en}.json`; se escriben en **negrita** cuando el procedimiento pide pulsarlos o seleccionarlos. El resto de la prosa usa los términos preferidos de esta tabla y evita alternarlos con sinónimos.

| Concepto | Español | English | Regla de uso |
| --- | --- | --- | --- |
| Carpeta raíz abierta en Plunibio | **espacio** | **workspace** | Definir en la primera aparición como una carpeta local que actúa como raíz. No usar habitualmente «espacio de trabajo» ni *file workspace*. |
| Acción de seleccionar otra raíz | **Abrir espacio** | **Open workspace** | Reproducir literalmente la etiqueta de la interfaz. «Cambiar de espacio» / “switch workspaces” describe el resultado, no el nombre del control. |
| Límite del espacio | **raíz del espacio** | **workspace root** | Usar al explicar rutas, enlaces y restricciones de la línea de comandos. |
| Contenedores y elementos del disco | **carpeta**, **archivo** | **folder**, **file** | Reservar «directorio» / “directory” para mensajes técnicos o sintaxis donde sea necesario. |
| Contenido que se está editando | **documento** | **document** | Usar para el contenido Markdown y para **Propiedades del documento**. Usar «archivo» / “file” al hablar de la entidad guardada en disco. |
| Control de navegación superior | **ruta del archivo** | **file path** | No llamar «migas de pan» / “breadcrumbs” al control en texto para usuarios; sí se puede usar `breadcrumb` como término interno de código. |
| Área auxiliar de Formato/Buscar | **panel lateral** | **sidebar** | No alternar con «barra lateral». Las pestañas se llaman **Formato** / **Format** y **Buscar** / **Search**. |
| Cabecera YAML del Markdown | **propiedades** | **properties** | Es el nombre principal y coincide con la interfaz. En la primera explicación técnica: «propiedades del documento (bloque de *front matter* YAML)» / “document properties (a YAML front matter block)”. Después, usar solo «propiedades» / “properties”. |
| Volver a leer desde el disco | **recargar** | **reload** | No usar «refrescar» o «actualizar» / “refresh”. Explicar que solicita confirmación y puede descartar cambios sin guardar. |
| Escribir cambios en disco | **guardar** | **save** | **Guardar** / **Save** nombra la acción explícita. No denominar «autoguardado» / “autosave” al comportamiento de Plunibio. |
| Persistencia al abandonar el archivo | **guardado al navegar o cerrar** | **save when navigating or closing** | Término aprobado para el intento de guardado que ocurre antes de cambiar de ubicación o salir. Distinguirlo siempre de **Guardar** y **Recargar**. |
| Estado aún no persistido | **cambios sin guardar** | **unsaved changes** | Coincide con el indicador y los diálogos de la aplicación. |
| Consulta y sustitución de texto | **buscar y reemplazar** | **find and replace** | El capítulo inglés usa “Find and replace”; al nombrar la pestaña se conserva **Search** y el campo **Find text**. |
| Aplicación asociada por el sistema | **aplicación predeterminada** | **default application** | Usar para formatos no editables y enlaces externos; no prometer una aplicación concreta. |
| Elementos cuyo nombre comienza por punto u ocultos por el sistema | **archivos ocultos** | **hidden files** | Mantener el término aunque el listado también pueda contener carpetas ocultas, para coincidir con la opción de la interfaz. |
| Gesto de transferencia | **arrastrar y soltar** | **drag and drop** | En procedimientos, indicar primero el origen y luego el destino. Usar «pegar» / “paste” únicamente para el portapapeles. |
| Texto asociado a una imagen Markdown | **pie de imagen** | **image caption** | En etiquetas breves puede aparecer **Pie** / **Caption**; no usar «leyenda» / “legend”. |
| Edición de archivos no Markdown | **editor de texto y código** | **text and code editor** | “CodeMirror” aparece solo en una nota técnica si ayuda a diagnosticar una limitación; no es el nombre del editor para usuarios. |
| Modificador de los atajos | **Ctrl en Windows/Linux; ⌘ en macOS** | **Ctrl on Windows/Linux; ⌘ on macOS** | En prosa compacta puede escribirse `Ctrl/⌘`; las tablas publicadas separarán las plataformas cuando el resto de la combinación difiera. |

### Reglas de redacción derivadas

- Español: segunda persona singular («selecciona», «puedes») y tratamiento de «tú», sin mezclar construcciones impersonales dentro de un mismo procedimiento.
- Inglés: imperativo directo en los pasos (“Select”, “Open”, “Save”) y “you” en explicaciones o consecuencias.
- Los nombres de controles respetan exactamente mayúsculas, traducción y forma visible, aunque la frase circundante use otro tiempo verbal.
- Los identificadores técnicos, formatos y sintaxis se conservan: `Markdown`, `YAML`, `Mermaid`, `LaTeX`, `JSON`, `file:`, `--base-path` y extensiones de archivo.
- *Front matter* se escribe como dos palabras en explicaciones técnicas. `frontmatter` solo se usa al citar un identificador de código. El *front matter* de las páginas Jekyll pertenece a la autoría del sitio y no debe confundirse con las propiedades de un documento del usuario.
- Los términos Crepe, Milkdown, CodeMirror, ProseMirror, Tauri y Jekyll no aparecen en procedimientos normales. Se reservan para notas diagnósticas realmente útiles o para este plan interno.
- Si una etiqueta futura cambia en la aplicación, se actualizan primero esta tabla y la pareja de capítulos afectada; no se corrige solo uno de los idiomas.

## Principios editoriales y de calidad

1. **Documentar Plunibio, no sus dependencias.** Crepe/Milkdown y CodeMirror sirven para
   investigar; el manual explica lo habilitado en la versión objetivo y sus adaptaciones.
2. **Orientación a tareas.** Títulos con verbos para procedimientos: «Abrir un espacio»,
   «Insertar una tabla», «Reemplazar texto». Pasos numerados con resultado esperado.
3. **Divulgación progresiva.** Primero el camino habitual, después alternativas, atajos,
   límites y casos especiales. Evitar un manual enciclopédico.
4. **Exactitud visible.** Los controles coinciden con la UI ES/EN; indicar diferencias de SO.
5. **Teclado multiplataforma.** Ctrl en Windows/Linux y ⌘ en macOS cuando corresponda al
   modificador primario. Publicar solo atajos comprobados en Plunibio; distinguir lectura de
   código, prueba automatizada y prueba física de plataforma. No importar tablas de la biblioteca.
6. **No inventar funciones.** No incluir nube, plantillas, guardar como, impresión, PDF,
   colaboración, corrector o cualquier otra capacidad sin verificar que existe y es accesible.
   La creación de archivos/carpetas sí existe en la referencia 0.1.3: evitar listas históricas
   de ausencias que contradigan el producto actual.
7. **Advertir acciones destructivas.** Explicar antes de la acción la pérdida de cambios por
   recarga, borrado permanente, transformaciones de imagen y decisiones tras fallo de guardado.
   Distinguir abrir con aplicación predeterminada de navegar dentro de Plunibio.
8. **Accesibilidad.** La explicación textual debe bastar. Alt contextual conciso, sin repetir
   todo el procedimiento; una imagen redundante puede tener alt vacío si se justifica y se
   adapta el validador correspondiente. Nunca transmitir información esencial solo por imagen/color.
9. **Bilingüismo por diseño.** Cierre por pareja ES/EN, incluidas capturas, enlaces y advertencias.
   Paridad semántica y de cobertura; traducir con naturalidad sin omitir pasos o límites.
10. **Mantenibilidad.** Registrar fuentes internas, referencia revisada y evidencia en el plan
    o ficha de impacto, fuera del contenido público. No exponer detalles de implementación
    que no ayuden al usuario. Un único manual vigente; historia en Git/notas de versión.

## Procedimientos y recursos de autoría

- Introduce objetivo y prerrequisitos, una acción principal por paso y resultado reconocible.
  Añade recuperación de errores si altera el recorrido; usa listas de referencia para opciones.
- Nombres de controles en **negrita**, rutas/formatos/argumentos en código y teclas con `<kbd>`.
  No atribuir funciones a iconos por su aspecto: verificar acción y etiqueta accesible.
- Guardar, guardado al navegar o cerrar y recargar son comportamientos distintos; no prometer
  guardado periódico ni protección absoluta frente a pérdidas.
- Usa `{: .docs-steps}` después de una lista de pasos; figuras mediante `docs-figure.html`.
  Advertencias mediante `docs-callout.html` con tipo `note`, `tip` o `warning` y texto localizado.
- Imágenes: PNG capturado → WebP sin pérdida y sin metadatos no visuales; no falsear controles.
  Vista base 1024×768, recorte WebView/elemento sin marco/título ni rutas absolutas, escenas ES/EN,
  mismo estado y fixture. Alt y pie cumplen funciones diferentes; el pie no sustituye al alt.
- Mermaid: un ejemplo funcional más enlace oficial. Matemáticas: un ejemplo en línea y otro
  de bloque; explicar el subconjunto compatible de KaTeX con enlace oficial, sin prometer
  compatibilidad con todo LaTeX.
- Las excepciones y límites deliberados se explican con alternativa práctica cuando exista.
  No confundir un problema conocido con una función prometida para la siguiente versión.

## Evidencia y cierre de una pareja de capítulos

- `translation_key`, `docs_key`, títulos, descripciones, catálogo y permalinks coherentes.
- Cobertura de las tareas afectadas y límites; procedimientos reproducidos en la aplicación
  objetivo cuando corresponda. Registrar lo no ejecutado sin presentarlo como aprobado.
- Etiquetas y atajos contrastados con UI/código y plataforma indicada.
- Capturas localizadas, reproducibles, legibles, accesibles y con propietario en manifiesto.
- Operaciones de Plunibio explicadas sin delegar al manual de una biblioteca.
- Enlaces/anclas, anterior/siguiente y cambio de idioma funcionando con `/plunibio`.
- Revisión técnica/editorial y visual, teclado, responsive y accesibilidad apropiados al cambio.
- Fecha, commit, versión y alcance anotados en el plan. La versión visible se mantiene en la
  portada Docs; no añadir pies de versión a cada capítulo.
- Revisión independiente no es una condición obligatoria: se descartó por falta de recursos.
  No atribuirla a una revisión propia ni convertirla en bloqueo futuro por defecto.

Referencias de estilo adoptadas (consultar la fuente primaria si se necesita ampliar el criterio):
[procedimientos de Microsoft](https://learn.microsoft.com/style-guide/checklists/procedures-and-instructions-checklist),
[instrucciones paso a paso](https://learn.microsoft.com/en-us/style-guide/procedures-instructions/writing-step-by-step-instructions)
y [alternativas textuales W3C WAI](https://www.w3.org/WAI/tutorials/images/).
