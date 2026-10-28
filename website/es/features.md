---
layout: features
lang: es
translation_key: features
section: features
title: Funcionalidades
permalink: /es/features/
description: Descubre la edición visual de Markdown, el editor de texto, el visor de imágenes, la navegación local y las opciones de personalización de Plunibio.
eyebrow: Tus archivos, tus herramientas
intro: Plunibio reúne edición visual de Markdown, herramientas para texto e imágenes y navegación local en una interfaz que puedes adaptar a tu forma de trabajar.
overview_label: Secciones de funcionalidades
feature_nav:
    - href: "#markdown"
      label: Markdown
    - href: "#texto"
      label: Texto y código
    - href: "#imagenes"
      label: Imágenes
    - href: "#carpetas"
      label: Carpetas
    - href: "#personalizacion"
      label: Personalización
---

<section id="markdown" class="feature-chapter">
  <header class="feature-chapter-header">
    <p class="feature-chapter-kicker">El centro de Plunibio</p>
    <div class="feature-chapter-heading">
      <h2>Markdown visual, archivos Markdown de verdad</h2>
      <p class="feature-chapter-lede">Escribe como en un editor de documentos sin renunciar a un formato de texto limpio, portable y compatible con el resto de tus herramientas.</p>
    </div>
  </header>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Da forma al documento sin memorizar sintaxis</h3>
      <p>El panel de formato mantiene a mano los estilos que utilizas cada día. Convierte un bloque en texto normal, cita, separador o cualquiera de los seis niveles de encabezado, y aplica formato sin perder de vista el contenido.</p>
      <ul class="feature-capability-list">
        <li>Negrita, cursiva y tachado</li>
        <li>Enlaces y código en línea</li>
        <li>Encabezados del H1 al H6</li>
        <li>Citas y separadores</li>
        <li>Listas con viñetas y numeradas</li>
        <li>Listas de tareas e indentación</li>
      </ul>
      <ul class="feature-chip-list" aria-label="Formatos adicionales">
        <li>Matemáticas en línea</li>
        <li>Enlaces editables</li>
        <li>Atajos de teclado</li>
      </ul>
    </div>
    <figure class="feature-shot-placeholder">
      <div class="feature-shot-placeholder-inner">
        <span class="feature-shot-slot">CAPTURA 01</span>
        <strong>Formato de Markdown</strong>
        <p>Captura un documento con texto seleccionado y la pestaña Formato abierta. Deben verse Estilo de bloque, Formato de texto y Listas.</p>
        <code>plunibio-features-markdown-format-es.webp</code>
      </div>
    </figure>
  </div>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Bloques ricos que siguen siendo texto portable</h3>
      <p>Añade imágenes, tablas, bloques de código y matemáticas desde el mismo panel. Los bloques de código reconocen numerosos lenguajes y ofrecen resaltado de sintaxis, selector de lenguaje y una acción para copiar su contenido.</p>
      <p>Un bloque Mermaid conserva la definición textual del diagrama y genera una previsualización dentro del editor. Las imágenes pueden insertarse mediante enlace, pegado o arrastre; Plunibio guarda las imágenes locales junto al documento y mantiene rutas Markdown utilizables.</p>
      <ul class="feature-chip-list" aria-label="Bloques disponibles">
        <li>Imágenes y pies</li>
        <li>Tablas</li>
        <li>Código</li>
        <li>Mermaid</li>
        <li>Matemáticas</li>
      </ul>
    </div>
    <figure class="feature-shot-placeholder">
      <div class="feature-shot-placeholder-inner">
        <span class="feature-shot-slot">CAPTURA 02</span>
        <strong>Bloques y diagrama Mermaid</strong>
        <p>Muestra la sección Bloques del panel y un documento con una tabla, un bloque de código y la previsualización de un diagrama Mermaid. Prioriza que el diagrama sea legible.</p>
        <code>plunibio-features-markdown-blocks-es.webp</code>
      </div>
    </figure>
  </div>

  <aside class="feature-note">
    <strong>Búsqueda cuando la necesitas</strong>
    <p>Abre la búsqueda con <code>Ctrl+F</code>, recorre las coincidencias y reemplaza una o todas. Puedes distinguir mayúsculas, limitar a palabras completas o utilizar expresiones regulares.</p>
  </aside>

  <div class="feature-mini-grid">
    <article class="feature-mini-card">
      <h4>Front matter sin salir del documento</h4>
      <p>Abre y edita el bloque YAML inicial en un panel dedicado con resaltado de sintaxis, manteniéndolo unido al Markdown al guardar.</p>
    </article>
    <article class="feature-mini-card">
      <h4>Enlaces e imágenes que llevan a su destino</h4>
      <p>Los enlaces a encabezados y archivos del espacio de trabajo se abren dentro de Plunibio. También puedes saltar desde una imagen incrustada hasta su archivo local.</p>
    </article>
  </div>
</section>

<section id="texto" class="feature-chapter">
  <header class="feature-chapter-header">
    <p class="feature-chapter-kicker">Texto y código</p>
    <div class="feature-chapter-heading">
      <h2>Un editor de texto cuando necesitas ver el código</h2>
      <p class="feature-chapter-lede">Plunibio abre archivos de texto y código con un editor específico, números de línea, ajuste de líneas y resaltado según la extensión del archivo.</p>
    </div>
  </header>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Resaltado para los formatos habituales</h3>
      <p>Trabaja con JavaScript, TypeScript, HTML, CSS, JSON, YAML, TOML, Rust, Python, Java, C, C++, SQL, XML, LaTeX y otros formatos comunes. Los archivos de texto simple, registros y configuraciones también se abren directamente.</p>
      <p>El mismo panel de búsqueda permite avanzar y retroceder por los resultados, usar mayúsculas, palabras completas o expresiones regulares, y reemplazar la coincidencia actual o todas a la vez.</p>
    </div>
    <figure class="feature-shot-placeholder">
      <div class="feature-shot-placeholder-inner">
        <span class="feature-shot-slot">CAPTURA 03</span>
        <strong>Resaltado y búsqueda en texto</strong>
        <p>Abre un archivo con resaltado visible, preferiblemente HTML, TypeScript o Rust, y deja abierto el panel Buscar con varias coincidencias y el campo Reemplazar.</p>
        <code>plunibio-features-text-search-es.webp</code>
      </div>
    </figure>
  </div>
</section>

<section id="imagenes" class="feature-chapter">
  <header class="feature-chapter-header">
    <p class="feature-chapter-kicker">Visor de imágenes</p>
    <div class="feature-chapter-heading">
      <h2>Visualiza, inspecciona y ajusta imágenes</h2>
      <p class="feature-chapter-lede">Abre las imágenes del proyecto sin cambiar de aplicación y realiza correcciones rápidas desde controles pensados para trabajar, no para distraer.</p>
    </div>
  </header>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Control preciso de la vista y la orientación</h3>
      <p>Amplía entre el 10 % y el 500 %, ajusta la imagen al espacio disponible, vuelve al tamaño 1:1 o céntrala después de desplazarla. Gira libremente entre −180° y 180°, rota 90° en un clic y voltea horizontal o verticalmente.</p>
      <ul class="feature-chip-list" aria-label="Controles de imagen">
        <li>Zoom y desplazamiento</li>
        <li>Ajustar y centrar</li>
        <li>Rotación</li>
        <li>Volteo</li>
      </ul>
    </div>
    <figure class="feature-shot-placeholder">
      <div class="feature-shot-placeholder-inner">
        <span class="feature-shot-slot">CAPTURA 04</span>
        <strong>Transformación y zoom</strong>
        <p>Muestra una imagen grande y la pestaña Transformar completa: nivel de zoom, botones de vista, rotación y controles de volteo.</p>
        <code>plunibio-features-image-transform-es.webp</code>
      </div>
    </figure>
  </div>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Ajustes de color y resultados inmediatos</h3>
      <p>Modifica brillo, contraste, saturación, escala de grises, sepia e inversión con controles deslizantes. Si quieres empezar más rápido, aplica los ajustes predefinidos Normal, Monocromo, Vintage, Vívido, Dramático o Negativo y continúa afinando desde ahí.</p>
      <p>Los cambios pueden guardarse directamente en archivos JPEG, PNG y WebP, con una opción para restablecer transformaciones o filtros cuando quieras volver al punto de partida.</p>
    </div>
    <figure class="feature-shot-placeholder">
      <div class="feature-shot-placeholder-inner">
        <span class="feature-shot-slot">CAPTURA 05</span>
        <strong>Ajustes y predefinidos</strong>
        <p>Usa una imagen donde los cambios de color sean evidentes. Captura la pestaña Ajustar o Predefinidos abierta; elige la que mejor muestre los controles y el resultado.</p>
        <code>plunibio-features-image-adjust-es.webp</code>
      </div>
    </figure>
  </div>
</section>

<section id="carpetas" class="feature-chapter">
  <header class="feature-chapter-header">
    <p class="feature-chapter-kicker">Navegación local</p>
    <div class="feature-chapter-heading">
      <h2>Tu proyecto sigue siendo una carpeta normal</h2>
      <p class="feature-chapter-lede">Selecciona una carpeta como espacio de trabajo y recorre su contenido directamente. No hay importaciones, bibliotecas propietarias ni una estructura paralela que mantener.</p>
    </div>
  </header>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Muévete sin perder la referencia</h3>
      <p>La vista de carpeta separa visualmente archivos y directorios. La ruta de navegación permite volver a cualquier nivel, mientras los botones Atrás y Adelante conservan el historial de los archivos visitados dentro del espacio de trabajo.</p>
      <p>Puedes mostrar u ocultar archivos ocultos desde el menú. Plunibio marca los cambios sin guardar, permite guardar o recargar mediante atajos y pide confirmación antes de descartar modificaciones.</p>
      <ul class="feature-chip-list" aria-label="Funciones de navegación">
        <li>Ruta de navegación</li>
        <li>Historial Atrás/Adelante</li>
        <li>Archivos ocultos</li>
        <li>Guardado directo</li>
      </ul>
    </div>
    <figure class="feature-shot-placeholder">
      <div class="feature-shot-placeholder-inner">
        <span class="feature-shot-slot">CAPTURA 06</span>
        <strong>Carpetas y ruta de navegación</strong>
        <p>Captura una carpeta de proyecto con varios subdirectorios y archivos. Deben verse la ruta superior y los botones Atrás y Adelante; evita una carpeta casi vacía.</p>
        <code>plunibio-features-folders-es.webp</code>
      </div>
    </figure>
  </div>
</section>

<section id="personalizacion" class="feature-chapter">
  <header class="feature-chapter-header">
    <p class="feature-chapter-kicker">Menú y preferencias</p>
    <div class="feature-chapter-heading">
      <h2>Haz que el espacio de trabajo se adapte a ti</h2>
      <p class="feature-chapter-lede">Las preferencias se guardan para la próxima sesión y están reunidas en un menú compacto que no ocupa espacio mientras escribes.</p>
    </div>
  </header>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Tema, idioma y tipografía a tu manera</h3>
      <p>Cambia entre los temas claro y oscuro, elige el idioma de la interfaz y decide si quieres ver archivos ocultos. En documentos Markdown puedes seleccionar cuatro perfiles tipográficos: Sans serif, Serif, Moderno y Lectura.</p>
      <p>El menú también concentra Abrir espacio de trabajo, Recargar, Guardar y Acerca de. La barra lateral puede mostrarse u ocultarse y recuerda su estado entre sesiones.</p>
      <ul class="feature-chip-list" aria-label="Preferencias disponibles">
        <li>Tema claro u oscuro</li>
        <li>Cuatro tipografías</li>
        <li>Cinco idiomas</li>
        <li>Barra lateral persistente</li>
      </ul>
    </div>
    <div class="feature-mini-grid">
      <article class="feature-mini-card">
        <h4>Atajos principales</h4>
        <p><code>Ctrl+S</code> guarda, <code>Ctrl+R</code> recarga, <code>Ctrl+F</code> busca y <code>Ctrl+Mayús+O</code> abre otro espacio de trabajo.</p>
      </article>
      <article class="feature-mini-card">
        <h4>Preferencias persistentes</h4>
        <p>El tema, la tipografía, la visibilidad de la barra lateral y la opción de archivos ocultos permanecen seleccionados.</p>
      </article>
    </div>
  </div>

  <div class="feature-shot-grid">
    <figure class="feature-shot-placeholder">
      <div class="feature-shot-placeholder-inner">
        <span class="feature-shot-slot">CAPTURA 07</span>
        <strong>Menú general y tema</strong>
        <p>Abre el menú de opciones y despliega Tema para que se vean Claro y Oscuro. Si es posible, toma la captura con la aplicación usando el tema oscuro.</p>
        <code>plunibio-features-menu-theme-es.webp</code>
      </div>
    </figure>
    <figure class="feature-shot-placeholder">
      <div class="feature-shot-placeholder-inner">
        <span class="feature-shot-slot">CAPTURA 08</span>
        <strong>Tipografía de Markdown</strong>
        <p>Con un documento Markdown abierto, despliega Tipografía y muestra las cuatro opciones. Deja visible suficiente texto para apreciar el estilo seleccionado.</p>
        <code>plunibio-features-menu-typography-es.webp</code>
      </div>
    </figure>
  </div>

  <aside class="features-alpha-note">
    <strong>Plunibio está en fase alpha</strong>
    <p>Las funcionalidades y la interfaz pueden cambiar antes de la primera versión estable. El objetivo se mantiene: trabajar con archivos locales y formatos que sigan siendo tuyos.</p>
  </aside>
</section>
