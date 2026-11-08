# Referencia documental vigente

Este es el estado de partida para el próximo plan, no una lista de tareas pendientes.
Actualízalo después de verificar una nueva publicación. Las referencias fechadas se conservan
como evidencia histórica: no acreditan automáticamente una versión posterior.

## Producto y publicación cubiertos

- Producto: **v0.1.3**, estado alpha/en desarrollo.
- Release: <https://github.com/adrianromero/plunibio/releases/tag/v0.1.3>.
- Commit de producto declarado por la release: `fbf8126a431bf58d890ce30a8e790dbbf976c727`.
- Commit de publicación web revisado: `338c9ab0ff0b4214107f433b251791334a025060`.
- Pages verificado: <https://github.com/adrianromero/plunibio/actions/runs/42117584555>.
- Revisión y publicación documental: **2026-11-05**. El handoff de mantenimiento se prepara
  después; no es una revisión nueva de los binarios.
- Web: <https://adrianromero.github.io/plunibio/>. Once capítulos por idioma, más portadas;
  Inicio, Funcionalidades, Instalación y Acerca de en ambos idiomas.
- El plan de construcción/publicación 0.1.3 está **cerrado, sin tareas obligatorias pendientes**.
  La conservación de los criterios aquí permite eliminar el antiguo directorio privado sin
  necesitarlo como contexto de una nueva sesión.

## Pruebas de paquetes — actualización comunicada el 2026-11-08

| Plataforma | Paquete de 0.1.3 | Estado |
| --- | --- | --- |
| Windows x86_64 | `Plunibio_0.1.3_x64-setup.exe` | Probado |
| Windows x86_64 | `Plunibio_0.1.3_x64_en-US.msi` | Probado |
| Linux x86_64 | `Plunibio_0.1.3_amd64.AppImage` | Probado |
| Linux x86_64 | `Plunibio_0.1.3_amd64.deb` | Probado |
| macOS Apple Silicon | `Plunibio_0.1.3_aarch64.dmg`, `Plunibio_0.1.3_aarch64.app.tar.gz` | Probados |
| macOS Intel | `Plunibio_0.1.3_x64.dmg`, `Plunibio_0.1.3_x64.app.tar.gz` | Probados |

Se han probado los ocho paquetes de v0.1.3 con un flujo básico de uso que incluye
la edición de documentos y la selección de opciones de la aplicación, según la confirmación recibida el 2026-11-08. Esta evidencia nueva
sustituye el estado anterior de macOS sin pruebas. No se han comunicado versiones exactas
de los sistemas operativos ni pasos o resultados detallados por paquete.
El usuario considera suficiente esta evidencia y **no dedicará más esfuerzos a ampliarla para
0.1.3**. No se requiere revisión independiente, por falta de recursos. Estas decisiones cierran
trabajo, no convierten limitaciones en resultados aprobados. No solicitar de nuevo esos trabajos
como requisito de cierre de 0.1.3.

Los paquetes no tienen firma de editor verificada. En macOS hay firma ad-hoc, que no equivale
a Developer ID ni notarización. Instalación conserva los avisos de firma y seguridad; se retiran los avisos de macOS sin pruebas.
Para versiones futuras confirmar situación de firma y pruebas por paquete; no heredar `tested`
ni retirar avisos sin evidencia aplicable a la versión correspondiente.

## Cobertura y límites que se mantienen

- Guardado al navegar o cerrar: término aprobado; no llamarlo autoguardado.
- Solo atajos comprobados; no publicar por defecto reordenación de tablas mediante arrastre,
  plegado/borrado de línea ni combinaciones descartadas del editor sin nueva verificación.
- Enlaces `file:` a archivos fuera del espacio: pueden crearse, pero su apertura puede quedar
  bloqueada. Advertencia deliberada y alternativa documentadas; no hay cambio de producto
  ni investigación adicional programados por este motivo.
- Transferencias reales entre aplicaciones, cada combinación de portapapeles/arrastre, todos
  los formatos de imagen y variantes físicas de teclado macOS no tienen cobertura física
  exhaustiva. Diferenciar código/pruebas automáticas de ensayo en el equipo real.
- El guardado de imágenes tiene consecuencias sobre el archivo/metadatos; conservar las
  advertencias actuales y volver a cotejarlas si cambia el pipeline.
- Crepe adaptado: no asumir barra flotante, menú `/`, arrastre de bloques o funciones visibles
  solo en demos upstream. El panel lateral y los componentes de Plunibio determinan la UI.
- Las notas ES/EN de 0.1.3 fueron publicadas manualmente por el usuario. La versión pública
  editada por él prevalece sobre borradores; no restaurar contenido descartado.

## Alcance histórico de las comprobaciones documentales

Durante la construcción se verificaron el build Jekyll (34 HTML), 22 capítulos publicados,
las ocho páginas principales Inicio/Funcionalidades/Docs/Instalación y ocho enlaces de paquetes.
Se realizaron 96 casos de navegador Docs y 16 de Instalación/portadas (cuatro anchos), sin
infracciones detectadas ni desbordamiento; algunos controles de contraste requirieron revisión
manual. No equivale a certificación completa de accesibilidad ni a prueba física de instaladores.
Acerca de se incluye explícitamente en el mantenimiento futuro, sin atribuirle estos casos pasados.

Se reprodujeron 62 flujos Docs con 152 checkpoints (148 imágenes publicadas y cuatro capturas
temporales de canvas), además de cuatro flujos web/18 imágenes. Las regresiones protegen
fixtures y assets por hashes; no son comparación visual automática del nuevo render con el antiguo.
Los números describen 0.1.3, no son cuotas para futuras versiones. Los artefactos actuales,
los flujos y Git son la referencia operativa; los informes privados originales no son necesarios
para ejecutar el siguiente plan ni deben citarse como archivos disponibles.

## Cómo sustituir esta referencia

Al terminar otra versión, anota producto/tag/commit, commit y workflow web, fecha real,
plan de actualización cerrado, secciones modificadas, pruebas efectivamente ejecutadas y
limitaciones aceptadas. Conserva la trazabilidad en Git/plan, sin copiar manuales por versión.

## Comprobación del handoff — 2026-11-06

Se trasladaron al repositorio principal los tres helpers de validación y se añadieron sus
comandos npm/dependencias explícitas. Build Jekyll y `website:check` correctos (34 HTML,
11 parejas de capítulos, ocho paquetes, 148 imágenes Docs y 18 web). Se comprobó que
`maintenance/` no aparece en el resultado publicable, que los enlaces internos del handoff
resuelven y que el contrato terminológico/reglas de redacción se conservaron completos.
El preparador de navegador generó correctamente sus tres modalidades (24/4/32 páginas,
96/16/128 casos previstos), sin modificar el build original. **Es preparación de casos, no
una nueva ejecución de axe en navegador**. Los scripts no dependen del antiguo directorio
privado. No se realizaron nuevas pruebas físicas de paquetes ni se publicó una release/web
como parte de este handoff.
