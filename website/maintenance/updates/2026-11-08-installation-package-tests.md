# Instalación: pruebas de todos los paquetes de v0.1.3

- Estado: incorporado localmente el 2026-11-08; sin publicación.
- Evidencia: confirmación del usuario en esta sesión de pruebas de los ocho
  paquetes publicados mediante un flujo básico de edición de documentos y selección
  de opciones de la aplicación. Ese flujo es el alcance de las pruebas de humo,
  no una prueba adicional. Incluye los
  paquetes macOS Apple Silicon e Intel, DMG y aplicación comprimida. No se atribuye
  una ejecución nueva de estas pruebas al agente ni cobertura funcional exhaustiva.
- Instalación ES/EN: se retiran los avisos de macOS sin pruebas y de procedimiento
  pendiente. El resumen explica el alcance de las pruebas con redacción impersonal;
  las tarjetas utilizan «Probado» / “Tested”. Se conserva la información de
  firma y seguridad, que no cambia por las pruebas funcionales.
- Datos: los cuatro paquetes macOS pasan a `tested: true` en `releases.yml`;
  nombres, enlaces, tamaños, hashes y fechas de publicación permanecen iguales.
  La fecha de revisión del manual Docs no cambia por esta edición de Instalación.
- Referencia de mantenimiento: `current-baseline.md` incorpora la nueva evidencia
  fechada y sustituye el estado anterior de macOS; no se atribuyen estas pruebas
  a la revisión del 2026-11-05.
- Sin impacto en Inicio, Funcionalidades, Docs y Acerca de, en ambos idiomas:
  no cambia el producto, sus tareas, formatos ni tecnología. Sin capturas afectadas.
- Validación: build Jekyll con `--disable-disk-cache` y `npm run website:check --
  /tmp/plunibio-image-viewer-qa` correctos: 34 HTML, ocho paquetes marcados como
  probados, etiquetas ES/EN coherentes y enlaces internos válidos. `git diff --check`
  correcto. No se repiten pruebas físicas ni regresiones de aplicación por este
  cambio de texto y metadatos; no se ejecuta una nueva batería de navegador/axe.
