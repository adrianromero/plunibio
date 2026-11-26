# Protocolo de revisión integral de Plunibio

Revisa el estado actual del repositorio y entrega, en español, una lista única de hallazgos priorizados que puedan convertirse en tareas de corrección. La auditoría incluye problemas preexistentes y abarca el comportamiento del editor, la integridad de los documentos y la facilidad de mantener y probar el código. Realiza la revisión en modo diagnóstico y reserva las correcciones para tareas posteriores.

## 1. Fijar el alcance y la revisión de partida

- Lee [AGENTS.md](AGENTS.md), el [README](README.md) y las instrucciones locales aplicables. Registra el commit revisado y si el análisis incluye cambios locales.
- Usa el inventario de Git y los puntos de entrada para trazar el mapa de la aplicación. Cubre el frontend, el backend Rust, la configuración de Tauri, dependencias directas, pruebas, Storybook, automatización, scripts, CI y empaquetado. Revisa artefactos generados y dependencias de terceros cuando sean necesarios para evaluar un problema concreto.
- Consulta `website/` y `examples/` en modo de solo lectura. Si una comprobación escribe allí, ejecútala sobre copias temporales. Usa una carpeta de trabajo temporal y documentos de prueba desechables para las operaciones de escritura, renombrado o borrado.
- Anota qué áreas quedan cubiertas por lectura de código, pruebas automatizadas o comprobación en la aplicación. Registra las áreas y plataformas pendientes con el motivo.

## 2. Seguir los flujos de extremo a extremo

| Área | Qué verificar |
| --- | --- |
| Documentos y espacios de trabajo | Sigue abrir, crear, editar, guardar, recargar, renombrar, cambiar de documento y cerrar. Localiza quién controla el documento activo y los cambios pendientes. Comprueba cómo se conserva el contenido y qué ve el usuario ante un error de lectura o escritura, un cambio externo o una operación concurrente. Revisa rutas, diferencias entre plataformas y entradas por CLI. |
| Editores y vistas | Recorre Markdown enriquecido y fuente, texto, tablas CSV/JSON/JSONL y las vistas de imágenes, Mermaid y ECharts. Comprueba la ida y vuelta entre lectura, edición y serialización, incluido el frontmatter y los formatos que el editor solo admite parcialmente. Revisa la sincronización de selección, búsqueda y contenido al cambiar de documento o de modo. |
| SolidJS y Milkdown | Sigue el estado derivado, las props reactivas y los efectos desde sus consumidores. Comprueba quién cancela tareas y limpia listeners, temporizadores, suscripciones e instancias del editor. Revisa si una operación asíncrona puede actualizar el estado de un documento que ya dejó de estar activo. |
| Frontera entre WebView y Rust | Localiza las llamadas a `invoke` en el frontend y sigue cada una hasta la implementación del comando y su registro. Empieza por `src-tauri/src/lib.rs` para los comandos de la aplicación. Contrasta tipos, serialización, validación de argumentos y propagación de errores. Comprueba permisos efectivos por ventana, configuración de producción frente a automatización y tratamiento de documentos, enlaces y recursos externos. |
| Resto de la aplicación | Revisa preferencias y compatibilidad con datos previos, impresión y PDF, navegación, atajos, foco, accesibilidad por teclado e internacionalización. Ante un problema de rendimiento, identifica la operación y el tamaño de entrada que lo hacen relevante. |
| Calidad y entrega | Comprueba si las pruebas verifican contratos observables y escenarios de fallo, y si sus dobles reflejan el comportamiento real. Revisa los flujos de automatización, las comprobaciones de CI y las diferencias de configuración entre plataformas y tipos de build. |

## 3. Evaluar diseño y código limpio

Aplica SOLID a los contratos y dependencias que existen en el proyecto. Para cada hallazgo de diseño, identifica el cambio que hoy resulta difícil, qué consumidores se ven afectados y cómo mejoraría la corrección.

| Principio | Pregunta para la revisión |
| --- | --- |
| Responsabilidad única | ¿Qué reglas cambian juntas? ¿Una regla está repartida entre UI, editor y persistencia de forma que puede divergir? |
| Abierto y cerrado | Cuando se añade un formato o editor siguiendo el diseño actual, ¿hay que actualizar varias decisiones sobre el mismo concepto que pueden quedar desincronizadas? |
| Sustitución | ¿Los editores o adaptadores intercambiables respetan las expectativas de sus consumidores sobre contenido, estado de guardado, errores y ciclo de vida? |
| Segregación de interfaces | ¿Un consumidor debe conocer estados o métodos que pertenecen a otra responsabilidad? |
| Inversión de dependencias | ¿Las reglas que deberían poder probarse directamente dependen del WebView, el sistema de archivos u otros detalles de infraestructura? ¿Hay un límite existente que permita aislarlas? |

Revisa también duplicación de reglas, dependencias circulares, invariantes que el tipado no expresa y abstracciones que obligan a seguir demasiados saltos. Usa el tamaño, la complejidad y los avisos del linter para localizar candidatos. Conserva únicamente los hallazgos con una consecuencia concreta. Antes de proponer una extracción, identifica dónde quedaría la regla y cuántos sitios habría que cambiar para mantenerla.

## 4. Obtener y contrastar evidencia

1. **Establece una línea base.** Ejecuta las comprobaciones de [CI](.github/workflows/ci.yml) cuando el entorno lo permita. Anota el comando y su resultado. Distingue fallos del producto de requisitos del entorno, como dependencias nativas ausentes.

   ```sh
   npm run check
   npm test
   npm run build
   cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
   cargo check --manifest-path src-tauri/Cargo.toml --locked
   ```

2. **Amplía según el flujo.** Usa `npm run automation:check`, `npm run automation:test`, `cargo test --manifest-path src-tauri/Cargo.toml --locked` o `cargo clippy --manifest-path src-tauri/Cargo.toml --locked` si aportan evidencia. Para comportamiento de escritorio, consulta las instrucciones y los flujos existentes de [automatización](automation/README.md). Verifica sus efectos antes de ejecutarlos y registra la plataforma realmente comprobada.
3. **Confirma cada candidato.** Traza el camino desde el punto de entrada hasta la consecuencia. Contrasta el comportamiento esperado con los consumidores, las pruebas, los formatos admitidos y la documentación pertinente a las versiones del lockfile. Para un defecto funcional, aporta una comprobación segura con datos de prueba o un recorrido estático que demuestre el fallo. Para deuda técnica, muestra la regla duplicada, el acoplamiento o la dificultad de prueba y el coste que introduce.
4. **Revisa falsos positivos y duplicados.** Busca validación previa, recuperación posterior y cobertura de regresión antes de concluir. Agrupa los síntomas con una causa común. Si falta evidencia para confirmar un candidato, deja una comprobación pendiente con la pregunta exacta que permitiría resolverla.

## 5. Ordenar y entregar los hallazgos

| Prioridad | Criterio |
| --- | --- |
| **P0 · Crítica** | Hay pérdida o corrupción irreversible de datos, exposición grave de información o indisponibilidad generalizada en condiciones plausibles. |
| **P1 · Alta** | Un flujo principal falla para un conjunto relevante de usuarios. También corresponde a permisos o validaciones con un impacto importante y demostrado. |
| **P2 · Media** | Hay un fallo acotado o recuperable, o un problema de diseño que encarece cambios concretos o deja sin protección un comportamiento importante. |
| **P3 · Baja** | Hay una mejora localizada de claridad o mantenibilidad con beneficio demostrable y poco alcance. |

Ordena por prioridad y, dentro de ella, por alcance y probabilidad. Si dos hallazgos tienen impacto comparable, adelanta el que desbloquea al otro. La confianza describe la evidencia disponible y la prioridad describe la consecuencia.

Usa esta estructura para cada entrada de la lista numerada.

> **[P1] Título que describe el problema**
>
> **Ubicación.** Archivo y línea del origen, con referencias adicionales si cruzan módulos.  
> **Evidencia.** Flujo y condiciones que lo activan, comportamiento esperado y observado o deducido, y método de comprobación.  
> **Impacto.** A quién afecta, en qué circunstancias y por qué merece esa prioridad.  
> **Corrección.** Cambio concreto y acotado que aborda la causa.  
> **Verificación.** Prueba de regresión o comprobación de aceptación y resultado esperado.

Cierra el informe con la revisión de partida, las áreas y plataformas cubiertas, los resultados de las comprobaciones y los límites de la auditoría. Si la lista está vacía, indica qué cobertura sustenta el resultado.

## Referencias

- [Google Engineering Practices sobre qué revisar](https://google.github.io/eng-practices/review/reviewer/looking-for.html)
- [Skill Improve Codebase Architecture de Matt Pocock](https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md)
- [Principios SOLID de Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)
- [Modelo de seguridad de Tauri 2](https://v2.tauri.app/security/) y [capabilities](https://v2.tauri.app/security/capabilities/)
- [Props reactivas en SolidJS](https://docs.solidjs.com/concepts/components/props) y [ciclo de vida de Crepe](https://milkdown.dev/docs/guide/using-crepe)
- [Documentación de Clippy](https://doc.rust-lang.org/stable/clippy/)
