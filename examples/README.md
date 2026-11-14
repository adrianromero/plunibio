# Mantenimiento de ejemplos

Durante sesiones de nuevas funcionalidades, correcciones, refactorizaciones u otras tareas de
codificación, **no crees, modifiques, elimines ni regeneres archivos de `examples/` o `website/`
salvo petición expresa del usuario**. La regla incluye ejemplos, fixtures de pruebas o
automatización, documentación y capturas. Añadir soporte a una funcionalidad no autoriza por
sí solo a añadir aquí un ejemplo o un fixture.

Estas actualizaciones se reservan para una tarea específica de documentación al preparar una
nueva versión, con las funcionalidades congeladas, y requieren una petición expresa incluso
en esa fase. Consulta la [política del repositorio](../README.md#documentation-and-examples-policy)
y, para el mantenimiento documental autorizado, [website/README.md](../website/README.md).

Puedes leer los ejemplos durante el desarrollo. Las pruebas o automatizaciones que necesiten
modificarlos deben trabajar sobre copias temporales, sin guardar cambios en este directorio.
Conserva cualquier cambio que ya exista en el árbol de trabajo y respeta los contratos de
seguridad de cada ejemplo.
