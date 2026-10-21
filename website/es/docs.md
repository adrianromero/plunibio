---
layout: content
lang: es
translation_key: docs
section: docs
title: Documentación
permalink: /es/docs/
eyebrow: Empieza con Plunibio
intro: Lo esencial para ejecutar el proyecto localmente y entender cómo elige Plunibio un espacio de trabajo y un documento.
---

## Ejecutar desde el código fuente

Necesitas una versión LTS actual de Node.js, npm, la cadena de herramientas estable de Rust y las dependencias de plataforma requeridas por Tauri.

```bash
git clone https://github.com/adrianromero/plunibio.git
cd plunibio
npm ci
npm run tauri dev
```

## Abrir un espacio de trabajo

Por defecto, Plunibio recupera el último espacio utilizado. Puedes elegir uno al iniciar el entorno de desarrollo:

```bash
npm run tauri -- dev -- -- --base-path /ruta/absoluta/a/notas
```

La aplicación empaquetada también acepta la ruta de un documento relativa a su espacio de trabajo:

```text
plunibio [FILENAME] [--base-path BASEPATH]
```

Las rutas absolutas de documentos y las que contienen `..` se rechazan para mantener la navegación dentro del espacio seleccionado.

## Construir la aplicación

Crea un paquete optimizado con:

```bash
npm run tauri build
```

Los paquetes para cada plataforma se guardan bajo `src-tauri/target/release/bundle/`.

## Estado del proyecto

Plunibio está en desarrollo activo. Para consultar detalles de desarrollo, colaborar o informar de un problema, visita el [proyecto en GitHub](https://github.com/adrianromero/plunibio).
