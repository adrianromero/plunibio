# Visor de imágenes en Funcionalidades — 2026-11-08

- Estado: Incorporado; cambio editorial autorizado por el mantenedor.
- Referencia: checkout `6c014e8`, documentación de v0.1.3. No cambia la referencia
  de producto ni acredita una nueva publicación.
- Resultado: los dos bloques del visor se resumen en uno por idioma, con una sola
  captura existente de transformación/zoom. Se conservan zoom, orientación, color,
  predefinidos, guardado y restablecimiento en el texto, sin listas exhaustivas.
- Alcance ES/EN: `features.md`; se mantienen los IDs `imagenes`/`images`, textos
  alternativos y etiquetas de ampliación. Inicio, Instalación, Docs y Acerca de
  no cambian porque no se modifica ninguna función ni procedimiento del producto.
- Capturas: se retiran `plunibio-features-image-adjust-{es,en}.webp` y sus entradas
  del manifiesto. Se eliminan los seis pasos finales que preparaban y capturaban
  esa escena en cada flujo `website-{es,en}-files.json`. Las capturas anteriores
  conservan sus posiciones y procedencia. No se generan imágenes nuevas.
- Infraestructura: generador y README de web/automatización pasan de 18 a 16
  imágenes. Se conservan los controles de propiedad, pares de idiomas y protección
  de fixtures. Las cifras históricas de `current-baseline.md` no se reescriben.
- Validación: build Jekyll con `--disable-disk-cache` correcto; `npm run
  website:check -- /tmp/plunibio-image-viewer-qa` correcto (34 HTML, 16 imágenes web).
  Revisión visual de ambas secciones en navegador de escritorio y apertura de sus
  capturas ampliadas; cierre con Escape comprobado en español. `git diff --check`
  correcto. Las 16 imágenes conservadas coinciden byte a byte con Git.
- Límite: `npm run website:images:regression` no pudo reproducir los flujos porque
  el WebDriver integrado del binario local no respondió en el puerto 4445 en 60 s.
  Las comprobaciones estáticas iniciales de propiedad, pares y procedencia pasaron;
  esto no acredita una regresión de aplicación completada. No se ha ejecutado una
  nueva batería responsive/axe. No se publican cambios como parte de esta tarea.
