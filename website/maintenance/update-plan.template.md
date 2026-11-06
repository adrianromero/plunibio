# Plan de actualización del sitio — <versión>

Copia a `website/maintenance/updates/<version>-plan.md`. Lee primero `website/README.md`,
`maintenance/editorial.md`, `maintenance/current-baseline.md` y `automation/README.md`.
No publiques este registro como contenido del sitio.

## Referencias y alcance

- Estado: preparado / en curso / cerrado / bloqueado por dato concreto.
- Fecha de inicio y última revisión:
- Versión/tag y commit objetivo de aplicación:
- Release: draft / pública; URL:
- Base documental (tag, commit app y commit web):
- Comparación revisada y cambios locales previos preservados:
- Alcance solicitado y autorización de publicación de esta sesión:
- Criterios editoriales: contrato permanente; excepciones aprobadas:

`[ ]` pendiente; `[x]` completado con evidencia; `[n/a]` no aplicable/retirado con motivo.
Un `[n/a]` nunca significa prueba aprobada.

## Matriz de impacto del sitio (cubrir las cinco áreas ES/EN)

| Área | Actualizar / sin impacto y motivo | Páginas ES/EN | Capturas/flujos | Estado |
| --- | --- | --- | --- | --- |
| Inicio | | | | |
| Funcionalidades | | | | |
| Instalación | | | | |
| Docs (portadas y capítulos) | | | | |
| Acerca de | | | | |

## Inventario funcional y evidencia

Incluye tareas visibles nuevas/modificadas/eliminadas, dependencias con cambio de comportamiento,
UI, atajos, formatos, preferencias, errores, acciones destructivas y CLI. Añade filas sin impacto
cuando la conclusión requiera justificación. No copiar funcionalidades de upstream sin cotejarlas.

| ID | Cambio/tarea y resultado esperado | Fuente y referencia | Evidencia: código/automática/física | Límites | Página/escena ES/EN | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| DOC-001 | | | | | | |

## Paquetes, publicación y confianza

| Paquete real de la release | SO/arquitectura/formato | URL/tamaño/digest | Prueba y fuente/fecha/alcance | Firma/notarización | Aviso público |
| --- | --- | --- | --- | --- | --- |
| | | | No probado hasta tener evidencia | | |

Separar disponibilidad, prueba, firma e incidencias. No heredar pruebas de la versión anterior.
No hace falta ampliar las pruebas de 0.1.3 ni obtener revisión independiente para iniciar este plan.

## Tareas

- [ ] Fijar referencias y completar inventario/diff; resolver únicamente dudas que cambien el contenido.
- [ ] Revisar tareas afectadas en la aplicación objetivo y fuentes instaladas; registrar límites.
- [ ] Actualizar por parejas ES/EN las cinco áreas con impacto; contrato terminológico y etiquetas.
- [ ] Ajustar catálogo/front matter/navegación preservando URLs públicas, si procede.
- [ ] Ajustar flujos/ejemplos/alternativas y regenerar solo capturas afectadas de la referencia objetivo.
- [ ] Actualizar datos de release, avisos e instrucciones sin desplegar enlaces a un draft.
- [ ] Preparar notas orientadas al usuario o enlazar las ya publicadas.
- [ ] Ejecutar validación proporcionada al cambio y anotar resultados abajo.
- [ ] Publicar conforme a la autorización; verificar release antes de desplegar descargas.
- [ ] Comprobar Pages y sitio real; cerrar plan y actualizar `current-baseline.md`.

## Validación ejecutada

| Fecha | Referencia/entorno | Comando o recorrido | Resultado/artefacto | Límites/no ejecutado |
| --- | --- | --- | --- | --- |
| | | | | |

Guía: Jekyll con `/plunibio`, `website:check`, navegador a 320/375/768/1280, teclado,
idiomas, enlaces/anclas, figuras/lightbox y descargas. Flujos afectados y ambas regresiones
para una nueva versión funcional. CLI si cambia; pruebas de app si hay cambios de código.
Usar `automation/output/<version>/` para resultados temporales ignorados; si una evidencia debe
sobrevivir, guardar un resumen durable aquí o un artefacto saneado junto al plan, sin datos privados.
No publicar el build instrumentado. No confundir axe/HEAD/hash con una prueba funcional física.

## Decisiones, riesgos y asuntos abiertos

| Tema | Decisión/alternativa | Responsable o dato necesario | Estado |
| --- | --- | --- | --- |
| | | | |

Las limitaciones aceptadas se describen como tales, sin inventar tareas obligatorias nuevas.

## Cierre y verificación pública

- Commit de aplicación/tag:
- Commit web y workflow Pages:
- Fecha y páginas/enlaces comprobados públicamente:
- Cambios completados; secciones sin impacto:
- Pruebas ejecutadas y evidencia conservada:
- Limitaciones aceptadas y decisiones del usuario:
- Trabajo realmente pendiente (si existe), dato/acción requerido:
- `current-baseline.md` actualizado:
