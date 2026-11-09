# Borrador de Acerca de — origen, autor e idiomas

- Estado: incorporado a las fuentes de Acerca de ES/EN el 2026-11-09, con la redacción de idiomas revisada y la autorización «adelante». Pendiente de publicación.
- Fuente: presentación y motivaciones aportadas por Adrián Romero Corchado el 2026-11-09.
- Destino propuesto: `website/es/about.md` y `website/en/about.md`, conservando sus URLs y su pareja de traducción.
- Estructura propuesta: Por qué Plunibio → Quién está detrás → Un proyecto personal y un laboratorio de IA → Los idiomas de Plunibio → Creado en abierto → Licencia.
- Voz: primera persona para contar la historia y las decisiones del autor.
- Alcance: Acerca de ES/EN. Inicio, Funcionalidades, Instalación y Docs no necesitan cambios para esta propuesta, porque explica el origen del proyecto sin modificar prestaciones ni procedimientos.
- Comprobación: los cinco idiomas mencionados cuentan con archivos de traducción en `src/i18n/translations/`. La elección de idiomas se refiere a la aplicación; la web sigue en español e inglés.
- Se han conservado «Creado en abierto» y «Licencia»; las tecnologías mencionadas se han contrastado con `package.json`. Se han mantenido los permalinks, layouts y claves de traducción.
- Validación: revisión editorial y de paridad ES/EN; build Jekyll con `plunibio-jekyll` correcto; `npm run website:check -- automation/output/about-preview` correcto (34 HTML); `git diff --check` correcto. No se ha realizado revisión visual en navegador ni publicación. Este registro está excluido del sitio mediante `maintenance` en `_config.yml`.

## Propuesta en español

**Entradilla**

Plunibio es un editor de documentación en Markdown para escritorio, de código abierto. Nace de una necesidad personal y de mi interés por explorar cómo la inteligencia artificial puede ayudar a desarrollar software con calidad y una experiencia de uso cuidada.

### Por qué Plunibio

Quería un editor de Markdown y documentación adaptado a mi forma de trabajar. Había probado otras herramientas, pero ninguna terminaba de satisfacer mis necesidades. Plunibio nace de esa búsqueda: construir el editor que me gustaría utilizar cada día.

Markdown es una buena base para ello: es sencillo, legible y permite conservar los documentos en un formato que muchas herramientas pueden abrir. Mi objetivo es ofrecer una experiencia de edición cómoda y una interfaz clara, trabajando directamente con carpetas y archivos normales.

### Quién está detrás

Soy **Adrián Romero Corchado**, ingeniero de software con más de 30 años de experiencia. Me apasiona la tecnología y sigo aprendiendo, investigando y probando nuevas formas de crear software.

Me interesan especialmente la calidad, la excelencia técnica, la experiencia de usuario y el diseño de interfaces gráficas. En Plunibio, esos intereses se encuentran en decisiones muy concretas: cómo se organiza la información, cómo responde el editor y cómo hacer que las tareas habituales resulten cómodas.

### Un proyecto personal y un laboratorio de IA

Plunibio es un proyecto personal al que doy forma desde mi laboratorio personal de inteligencia artificial. Es uno de los resultados de mis investigaciones sobre IA aplicada al desarrollo de software.

Con él exploro cómo construir una factoría de software gestionada con inteligencia artificial: cómo organizar el trabajo y utilizar la IA a lo largo del proceso, desde la idea y el diseño hasta la implementación, las pruebas y la documentación.

El proyecto reúne así dos motivaciones: crear una herramienta que necesito y aprender, a través de un producto real, cómo llevar estas formas de desarrollo a la práctica.

### Los idiomas de Plunibio

La aplicación está disponible en inglés, español, catalán, euskera y gallego. La elección combina alcance y cercanía:

- **Inglés**, por su alcance internacional y porque muchas personas lo utilizan como primera o segunda lengua.
- **Español**, porque es mi lengua materna.
- **Catalán, euskera y gallego**, porque, junto con el español, son lenguas oficiales de España, mi país, y quería que estuvieran presentes en el proyecto.

## English proposal

**Introduction**

Plunibio is an open-source desktop editor for Markdown documentation. It grew out of a personal need and my interest in exploring how artificial intelligence can help develop quality software with a carefully considered user experience.

### Why Plunibio

I wanted a Markdown and documentation editor suited to the way I work. I had tried other tools, but none fully met my needs. Plunibio grew out of that search: building the editor I would like to use every day.

Markdown provides a good foundation: it is simple, readable, and keeps documents in a format that many tools can open. My goal is to offer a comfortable editing experience and a clear interface, working directly with ordinary folders and files.

### Who is behind it

I am **Adrián Romero Corchado**, a software engineer with more than 30 years of experience. I am passionate about technology and continue to learn, research, and try new ways of building software.

I am particularly interested in quality, technical excellence, user experience, and graphical interface design. In Plunibio, those interests come together in concrete decisions: how information is organized, how the editor responds, and how to make everyday tasks feel comfortable.

### A personal project and an AI laboratory

Plunibio is a personal project I am developing in my personal artificial intelligence laboratory. It is one of the outcomes of my research into AI applied to software development.

Through it, I explore how to build a software factory managed with artificial intelligence: how to organize the work and use AI throughout the process, from the initial idea and design to implementation, testing, and documentation.

The project brings together two motivations: creating a tool I need and learning, through a real product, how to put these approaches to development into practice.

### Plunibio's languages

The application is available in English, Spanish, Catalan, Basque, and Galician. The choice combines international reach and a personal connection:

- **English**, for its international reach and because many people use it as a first or second language.
- **Spanish**, because it is my native language.
- **Catalan, Basque, and Galician**, because, alongside Spanish, they are official languages in Spain, my country, and I wanted them to have a place in the project.
