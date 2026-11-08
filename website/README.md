# Mantener el sitio web de Plunibio

Este archivo es el punto de entrada para actualizar **Inicio (landing page), Funcionalidades,
Instalación, Docs y Acerca de**, en español e inglés, después de un cambio funcional o una
nueva versión. Permite crear y ejecutar un plan nuevo sin el antiguo directorio `private/`
ni el historial de un chat. No requiere reconstruir el manual desde cero.

## Inicio de una sesión nueva

1. Lee este README, [el contrato editorial](maintenance/editorial.md),
   [la referencia documental vigente](maintenance/current-baseline.md) y
   [la automatización](../automation/README.md). Lee también las instrucciones del repositorio.
2. Comprueba `git status --short`. Conserva los cambios del usuario. Identifica la versión/tag
   objetivo y su commit, la referencia cubierta por la web y el estado real de publicación.
   No deduzcas la versión pública de `main` ni de `package.json` solamente.
3. Compara ambas referencias: `git diff <base>..<objetivo> -- src src-tauri package.json package-lock.json`.
   Revisa también cambios del sitio, automatización y dependencias visibles. Si falta información
   de una prueba física o de publicación, pregunta únicamente por ese dato y continúa con el
   trabajo independiente.
4. Copia [la plantilla de plan](maintenance/update-plan.template.md) a
   `website/maintenance/updates/<version>-plan.md` (crea `updates/` si no existe). Completa la matriz de impacto y la evidencia
   antes de redactar. Para cambios durante el desarrollo usa
   [la ficha de impacto](maintenance/impact-entry.template.md).
5. Ejecuta el plan por parejas ES/EN: investiga, reproduce tareas afectadas, modifica texto,
   flujos y capturas, valida y registra resultados. No publiques prestaciones de una candidata
   como si ya estuvieran en la versión pública.
6. Al cerrar, actualiza `current-baseline.md` con referencias exactas y límites de evidencia.
   El plan terminado y Git conservan el registro; solo hay **un manual público vigente**.

Petición reutilizable para el agente:

> Lee website/README.md y sus referencias de mantenimiento. Compara la referencia documental
> vigente con <tag o commit objetivo>. Crea un plan usando la plantilla, cubriendo las cinco
> secciones ES/EN y justificando las que no cambian. Ejecuta los cambios y comprobaciones
> pertinentes, conserva las limitaciones no verificadas y registra el resultado y la nueva
> referencia documental. Respeta el estado de publicación y la autorización de esta sesión.

El mantenimiento forma parte del desarrollo, incluso si se trabaja directamente con ramas y
merges: **no exige adoptar pull requests ni añadir una nueva integración CI**. Los planes
son registros de trabajo, no páginas del sitio. `maintenance/` está excluido de Jekyll.

## Mapa de fuentes y responsabilidades

| Área | Archivos fuente | Qué revisar |
| --- | --- | --- |
| Inicio | `website/{es,en}/index.md`, `_layouts/landing.html` | Promesa, capacidades, CTA y captura principal; conservar diseño y espíritu salvo petición de rediseño. |
| Funcionalidades | `website/{es,en}/features.md`, `_includes/feature-shot.html` | Afirmaciones y escenas reales, imágenes ampliadas, textos alternativos. |
| Instalación | `website/{es,en}/install.md`, `_data/releases.yml`, `_data/installation.yml`, `_includes/release-downloads.html` | Paquetes reales, arquitectura, firma, pruebas, actualizar/desinstalar y compilación desde el tag. |
| Docs | `website/{es,en}/docs.md`, `{es,en}/docs/*.md`, `_data/docs.yml` | Procedimientos y límites; portada e índice más un Markdown por capítulo. |
| Acerca de | `website/{es,en}/about.md` | Propósito, tecnología, contribuciones y licencia; justificar «sin impacto» cuando corresponda. |
| Infraestructura | `_config.yml`, `_layouts/`, `_includes/`, `assets/css/main.css`, `assets/js/` | Idiomas, navegación, accesibilidad, responsive, lightbox y `baseurl`. |
| Capturas Docs | `automation/flows/docs-*.json`, `verify-docs-*.json`, `automation/docs-image-alts.json`, `_data/docs_images.json` | Flujos, comprobaciones, alternativas y trazabilidad de cada imagen. |
| Capturas Inicio/Funcionalidades | `automation/flows/website-*.json`, `_data/website_images.json` | Lote de escenas ES/EN; generador `scripts/refresh-website-images.mjs`. |
| Publicación | `.github/workflows/pages.yml`, README raíz | Pages se dispara al subir cambios de `website/**` a `main`; la publicación de la app tiene su propio proceso. |

Las rutas de esta tabla son relativas a la raíz del repositorio, salvo las abreviadas dentro
de `website/`. Comprueba los archivos actuales: no asumas que una ruta histórica sigue existiendo.

### Investigar el producto antes de escribir

Prioridad: código de la referencia objetivo, traducciones ES/EN, pruebas, aplicación real y
código instalado de las dependencias fijado por `package-lock.json`. Instala con `npm ci`
cuando sea necesario; evita cambiar versiones al investigar.

- `src/app/AppContext.tsx`: navegación, menús, guardado, cierre y atajos generales.
- `src/features/editors/ContentForPath.ts`: tipo de editor por formato.
- `src/features/editors/markdown/`: configuración/adaptaciones de Crepe/Milkdown,
  propiedades, búsqueda, enlaces, transferencias, serialización, tablas y diagramas.
- `src/features/editors/text/{CodeLanguages.ts,EditorText.tsx}`: formatos y CodeMirror.
- `src/features/search/`, `src/features/editors/image/`, `src/features/editors/folder/`:
  buscar/reemplazar, imágenes, creación/renombrado/borrado y ordenación.
- `src/preferences/`, `src/i18n/translations/{es,en}.json`: persistencia y etiquetas exactas.
- `src-tauri/src/`: CLI, límites de rutas, operaciones y persistencia; consultar sus pruebas.
- `examples/atlas-de-lumina/`: espacio reproducible para demostraciones.

Fuentes externas primarias para cambios en editores:
[Crepe](https://milkdown.dev/docs/guide/using-crepe),
[CodeMirror guía](https://codemirror.net/docs/guide/) y [referencia](https://codemirror.net/docs/ref/),
[CommonMark](https://spec.commonmark.org/), [GFM](https://github.github.com/gfm/),
[Mermaid](https://mermaid.js.org/intro/) y [KaTeX](https://katex.org/docs/supported).
Coteja su versión con el lockfile y el código instalado: una web puede describir versiones
posteriores. Una capacidad de la biblioteca solo se publica si está habilitada en Plunibio.
El usuario debe poder completar las tareas sin consultar la documentación de Crepe/CodeMirror.
Para Mermaid y matemáticas basta un ejemplo válido y el enlace oficial correspondiente.

## Contratos de contenido y estructura

[editorial.md](maintenance/editorial.md) contiene los principios de calidad, el **contrato
terminológico bilingüe completo**, las reglas de redacción, las convenciones de advertencias,
fuentes y criterios de terminado. Es una norma de mantenimiento, no contenido público.

- Mantener un capítulo por tarea/área e índice común en `_data/docs.yml`. Actualmente hay
  once parejas; se pueden añadir capítulos si el alcance lo justifica.
- Mantener `permalink` públicos. Una reorganización requiere conservar enlaces antiguos
  mediante una solución explícita y comprobada; no romperlos silenciosamente.
- Las parejas comparten `translation_key` y `docs_key`; `lang`, título, descripción y URL
  son localizados. Actualiza ambas entradas de `_data/docs.yml` al cambiar esos metadatos.
- El layout ya genera H1: el cuerpo comienza con una introducción y encabezados H2.
- Usa `relative_url` para enlaces y recursos internos, con el prefijo público `/plunibio`.
- Versión y fecha de revisión se muestran **solo en las portadas Docs**, desde
  `_data/releases.yml`; no repetirlas al pie de cada capítulo. Una diferencia funcional
  concreta puede necesitar una explicación de versión dentro del contenido.

Front matter de un capítulo real (la pareja EN usa el mismo `translation_key` y `docs_key`):

```yaml
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
```

[La plantilla de capítulo](maintenance/chapter.template.md) contiene ejemplos de pasos,
figura, advertencia y enlace. Las páginas generales conservan sus propios layouts y campos:
usa como referencia su pareja actual, no el front matter de un capítulo.

## Capturas de la aplicación

Lee [automation/README.md](../automation/README.md) antes de modificar o ejecutar flujos.
Las capturas se obtienen **controlando la aplicación real**, sin recrear la interfaz ni
retocar su contenido. Los flujos mutables usan una copia temporal del espacio; nunca deben
alterar `examples/` para obtener una captura.

1. Construye el binario de automatización **de la referencia objetivo**:
   `npm run automation:build`. Reconstruye si cambia aplicación o dependencias.
2. Revisa/ajusta los flujos ES/EN afectados. Preferencias explícitas, `fixtureTimestamp`
   fijo, ventana base 1024×768, estado/scroll y esperas deterministas. Tema claro excepto
   escenas que expliquen el oscuro. Usa `viewport` o `element`: **no publicar `native-window`**,
   título del sistema ni rutas absolutas personales. Una ruta relativa dentro de la app sí
   forma parte de la interfaz. Comprueba dimensiones reales; no asumas tamaño físico por HiDPI.
3. Docs: ejecuta cada flujo afectado. Ejemplo:

   ```bash
   npm run automation:run -- automation/flows/docs-es-getting-started.json
   npm run automation:run -- automation/flows/docs-en-getting-started.json
   npm run docs:images:optimize
   npm run docs:images:manifest
   ```

   El runner escribe PNG en el `outputDir` del flujo; estos comandos **modifican imágenes
   publicadas**. El optimizador recorre todos los PNG bajo `assets/images/docs/`, comprueba
   igualdad de píxeles con ImageMagick, publica WebP sin pérdida y retira el PNG.
   Revisa el diff; actualiza antes `automation/docs-image-alts.json` si cambia la escena.
   El manifiesto se genera, no se edita manualmente. Una captura se incluye mediante su ID:

   ```liquid
   {% include docs-figure.html id="es-getting-started-main-interface" %}
   ```

4. Inicio/Funcionalidades: `npm run website:images:refresh` ejecuta las cuatro escenas
   localizadas, prepara fuera del repositorio, convierte/verifica y reemplaza las 16 imágenes
   y su manifiesto. Conserva filenames y selección de escenas cuando siga siendo apropiado.
   Las imágenes de fotografía usan **Ajustar y giro 0°**; evita el antiguo giro de 45°.
   Si cambia el número de escenas, adapta también las comprobaciones explícitas del generador
   y sus consumidores; no reduzcas controles solo para hacer pasar el script.
5. Revisa visualmente cada imagen modificada en ambas páginas e idiomas, incluidos ampliación,
   legibilidad, dimensiones, recorte, texto alternativo y datos personales.

Dependencias de captura: herramientas Tauri/Rust y sesión gráfica soportada por el runner;
ImageMagick con `convert`, `compare`, `identify` y soporte WebP. La automatización actual se
ha utilizado en Linux; no presupone que se haya ensayado físicamente Windows/macOS.
El servidor WebDriver solo se incluye en builds de automatización, nunca en releases normales.

### Catálogo de comandos (desde la raíz)

| Comando | Uso y efectos |
| --- | --- |
| `npm run automation:check` | Tipos del runner. |
| `npm run automation:test` | Seguridad de las copias de fixtures. |
| `npm run automation:run -- <flujo.json> --verify-only` | Reproduce el flujo sin escribir capturas; las acciones se siguen ejecutando en la copia temporal. |
| `npm run docs:images:regression` | Reproduce flujos Docs y verificaciones; protege hashes de ejemplos e imágenes publicadas. No es una comparación visual píxel a píxel. |
| `npm run website:images:regression` | Reproduce las cuatro escenas sin reemplazar assets; protege ejemplos, Docs y las imágenes web. |
| `npm run docs:images:optimize` | PNG → WebP sin pérdida, con igualdad de píxeles; modifica los assets Docs. |
| `npm run docs:images:manifest` | Genera propiedad, dimensiones y alternativas de imágenes Docs. |
| `npm run website:images:refresh` | Regenera el lote de Inicio/Funcionalidades y su manifiesto. |
| `npm run website:check -- <raíz-preview>` | Valida el HTML Jekyll local, enlaces/IDs, metadatos, paridad, capturas, descargas, versión, extensiones y atajos generales frente al código. No consulta red. |
| `npm run website:qa:prepare -- <raíz-preview> --all-pages` | Crea copia temporal instrumentada con axe y selector de páginas a 320/375/768/1280 px. No ejecuta un navegador por sí solo ni altera el build publicable. |
| `npm run docs:cli:check -- <binario>` | Casos de ayuda/errores que salen antes de arrancar GUI; no acredita todos los recorridos CLI. |
| `npm run release:check -- <tag>` | Coherencia de versiones del producto; seguir además el README raíz. |

La QA de navegador sin flag cubre Docs; `--release-pages` cubre Instalación y portadas Docs;
`--all-pages` añade Inicio, Funcionalidades y Acerca de además de todos los capítulos.
`yaml` y `axe-core` son dependencias de desarrollo explícitas para los validadores.

## Previsualizar y validar con Jekyll

Se necesita Docker. Desde la raíz, construye la imagen al principio o cuando cambie el Dockerfile:

```bash
docker build --tag plunibio-jekyll --file website/Dockerfile .
```

Preview interactiva (no hace falta Ruby/Bundler en el host):

```bash
docker run --rm -it \
  -p 4000:4000 \
  -v "$PWD:/srv/jekyll" -w /srv/jekyll \
  plunibio-jekyll jekyll serve \
  --source website --destination /tmp/plunibio-site \
  --host 0.0.0.0 --force_polling --disable-disk-cache
```

Abre <http://localhost:4000/plunibio/>. Detén con Ctrl+C.
Para conservar un build accesible desde el host y pasarlo a los validadores:

```bash
mkdir -p automation/output/website-preview
# El directorio de salida debe permitir escritura al usuario del contenedor.
docker run --rm \
  -v "$PWD:/srv/jekyll" -w /srv/jekyll \
  plunibio-jekyll jekyll build --source website \
  --destination /srv/jekyll/automation/output/website-preview/plunibio
npm run website:check -- automation/output/website-preview
npm run website:qa:prepare -- automation/output/website-preview --all-pages
```

La raíz entregada a los validadores **contiene `plunibio/`**, no es ese directorio en sí.
El helper de QA imprime otra ruta temporal. Sirve esa copia con
`python3 -m http.server 4185 --directory <ruta-impresa>` y abre
`http://localhost:4185/qa/`. Pulsa **Run all** y guarda los resultados con **Download results**.
Comprueba errores, desbordamiento, infracciones e incompletos de axe. Complementa con revisión
visual y teclado (menús, selector de idioma, navegación, tablas/código desplazables, descargas,
lightbox y Escape). Axe sin errores no certifica accesibilidad completa.
No publiques ni reutilices la copia instrumentada como salida de Pages.

Ejecuta comprobaciones proporcionadas al cambio: un ajuste de texto no exige repetir todas
las pruebas de aplicación; cambios funcionales/capturas necesitan los flujos afectados.
Al cerrar una nueva versión funcional, ejecuta ambas regresiones de automatización, además del build
Jekyll y la revisión de páginas afectadas. Si una comprobación no puede ejecutarse, registra
la limitación y su impacto; no la marques aprobada ni rebajes el test sin investigar.
El validador está ligado a la estructura real del producto: si esta evoluciona, adapta sus
lecturas/expectativas con el mismo rigor que el manual. La igualdad de versión con el checkout
se exige en la candidata revisada; durante desarrollo el sitio puede seguir cubriendo el tag anterior.

## Preparación y publicación de una nueva versión

1. Durante el desarrollo, registra cambios de tareas, UI, atajos, formatos, preferencias,
   dependencias, CLI e imágenes. Cada una de las cinco secciones recibe «actualizar» o
   «sin impacto» con justificación. Acerca de también se revisa si cambia tecnología/licencia.
2. Al congelar funcionalidad, fija tag/commit y alcance. Comprueba versiones según el README
   raíz; concilia el diff con el plan y las tareas realmente reproducidas.
3. Obtén los assets reales del draft/release mediante GitHub (API o herramienta disponible).
   Por ejemplo, `https://api.github.com/repos/adrianromero/plunibio/releases/tags/<tag>`.
   Confirma publicación, tag/commit, nombres, tamaños, plataforma, arquitectura, formato y
   digest. No derives nombres por sustitución de la versión. No confundas archivos fuente
   automáticos con instaladores ni un workflow correcto con una prueba física del paquete.
4. Actualiza `_data/releases.yml` como fuente única de versión, fechas, URL y assets de
   Instalación/portadas Docs; `_data/installation.yml` contiene etiquetas ES/EN.
   `docs_reviewed_on` es la fecha de revisión efectiva, no cada fecha de build.
   `tested` necesita evidencia **del paquete/arquitectura de esa release**: los resultados
   anteriores no se heredan. Conserva una nota de procedencia y alcance en el plan.
   SHA-256 publicado por GitHub no equivale a verificación independiente ni firma.
5. Revisa Instalación ES/EN: elegir paquete, pasos y requisitos de ejecución separados de
   compilación; actualización/desinstalación respaldadas, copias de seguridad, firma/notarización
   y paquetes sin ensayo físico. No infieras SO mínimo del runner CI ni prometas actualizador
   automático. No indiques desactivar globalmente protecciones del sistema.
   Mantén el aviso informativo de estado del producto y enlace MIT. No añadas una nueva
   exención legal ni un diálogo de aceptación por rutina.
6. Actualiza páginas/capturas afectadas. La página web Acerca de y el diálogo **Acerca de**
   de la app son cosas distintas: si una captura del diálogo muestra versión antigua, renuévala;
   no hace falta añadirla al manual. No regeneres capturas sin diferencias visibles por rutina.
7. Prepara notas orientadas al usuario: novedades, correcciones, cambios incompatibles y
   límites conocidos; enlaza desde el sitio a GitHub Releases para evitar duplicar el changelog.
   La publicación de notas/releases sigue la autorización de la sesión; no presupongas que
   preparar documentación autoriza a publicar externamente. Usa
   [la plantilla](maintenance/release-notes.template.md) cuando sea útil.
8. Valida el conjunto y registra resultados. Evita subir a `main` páginas con descargas
   hacia un draft privado: Pages se activa automáticamente. Publica la release antes de
   desplegar las descargas definitivas (o actualiza enseguida si ya está publicada).
9. Tras el despliegue, comprueba el workflow Pages del commit esperado y el sitio público:
   las cinco secciones ES/EN, capítulos afectados, selector de idioma, recursos/caché,
   notas y todos los enlaces de paquetes. HEAD/HTTP 200 no demuestra instalación.
10. Cierra el plan con commit de app, commit web, fecha, pruebas y limitaciones aceptadas.
    Actualiza `current-baseline.md`. No reescribas registros anteriores para atribuirles
    pruebas nuevas. No marques estable una versión solo por `prerelease: false`.

## Referencia y límites heredados

La construcción/publicación de **0.1.3 quedó cerrada**; no hay trabajo obligatorio pendiente
para esa versión. [current-baseline.md](maintenance/current-baseline.md) conserva las decisiones
que deben sobrevivir al antiguo registro privado. No solicita pruebas adicionales ni revisión
independiente: el usuario aceptó la evidencia disponible y descartó dedicar recursos a ambas.
Una nueva versión debe identificar sus propios impactos, pruebas realizadas y límites aceptados;
solo se retiran advertencias cuando existe evidencia nueva o un cambio de producto verificado.
