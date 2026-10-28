---
layout: features
lang: en
translation_key: features
section: features
title: Features
permalink: /en/features/
description: Explore Plunibio's visual Markdown editing, text editor, image viewer, local file navigation, and customization options.
eyebrow: Your files, your tools
intro: Plunibio brings visual Markdown editing, text and image tools, and local file navigation together in an interface that adapts to the way you work.
overview_label: Feature sections
image_viewer_label: Enlarged feature preview
image_viewer_open: Enlarge screenshot
image_viewer_close: Close enlarged preview
feature_nav:
    - href: "#markdown"
      label: Markdown
    - href: "#text"
      label: Text and code
    - href: "#images"
      label: Images
    - href: "#folders"
      label: Folders
    - href: "#customization"
      label: Customization
---

<section id="markdown" class="feature-chapter">
  <header class="feature-chapter-header">
    <p class="feature-chapter-kicker">At the heart of Plunibio</p>
    <div class="feature-chapter-heading">
      <h2>Visual Markdown, real Markdown files</h2>
      <p class="feature-chapter-lede">Write as naturally as you would in a document editor without giving up a clean, portable text format that works with the rest of your tools.</p>
    </div>
  </header>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Shape the document without memorizing syntax</h3>
      <p>The formatting panel keeps everyday styles close at hand. Turn a block into normal text, a quote, a divider, or any of six heading levels, then apply inline formatting without losing sight of the content.</p>
      <ul class="feature-capability-list">
        <li>Bold, italic, and strikethrough</li>
        <li>Links and inline code</li>
        <li>Heading levels H1 through H6</li>
        <li>Quotes and dividers</li>
        <li>Bulleted and numbered lists</li>
        <li>Task lists and indentation</li>
      </ul>
      <ul class="feature-chip-list" aria-label="Additional formatting">
        <li>Inline math</li>
        <li>Editable links</li>
        <li>Keyboard shortcuts</li>
      </ul>
    </div>
    {% include feature-shot.html image="plunibio-features-markdown-format-en.webp" label="Markdown formatting" alt="Plunibio visual Markdown editor with the formatting tools open." %}
  </div>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Rich blocks that remain portable text</h3>
      <p>Add images, tables, code blocks, and mathematics from the same panel. Code blocks recognize many languages and provide syntax highlighting, language selection, and an action to copy their contents.</p>
      <p>A Mermaid block keeps the textual diagram definition and renders a preview inside the editor. Images can be inserted by link, paste, or drag and drop; Plunibio saves local images beside the document and keeps usable Markdown paths.</p>
      <ul class="feature-chip-list" aria-label="Available blocks">
        <li>Images and captions</li>
        <li>Tables</li>
        <li>Code</li>
        <li>Mermaid</li>
        <li>Mathematics</li>
      </ul>
    </div>
    {% include feature-shot.html image="plunibio-features-markdown-blocks-en.webp" label="Blocks and a Mermaid diagram" alt="Markdown document in Plunibio showing content blocks and a Mermaid diagram preview." %}
  </div>

  <aside class="feature-note">
    <strong>Search when you need it</strong>
    <p>Open search with <code>Ctrl+F</code>, move through matches, and replace one or all of them. Match case, whole-word matching, and regular expressions are available when needed.</p>
  </aside>

  <div class="feature-mini-grid">
    <article class="feature-mini-card">
      <h4>Front matter without leaving the document</h4>
      <p>Open and edit the initial YAML block in a dedicated panel with syntax highlighting, then keep it joined to the Markdown when you save.</p>
    </article>
    <article class="feature-mini-card">
      <h4>Links and images that lead somewhere</h4>
      <p>Links to headings and workspace files open inside Plunibio. You can also jump from an embedded image directly to its local file.</p>
    </article>
  </div>
</section>

<section id="text" class="feature-chapter">
  <header class="feature-chapter-header">
    <p class="feature-chapter-kicker">Text and code</p>
    <div class="feature-chapter-heading">
      <h2>A text editor when you need to see the source</h2>
      <p class="feature-chapter-lede">Plunibio opens text and source files in a dedicated editor with line numbers, line wrapping, and highlighting selected from the file extension.</p>
    </div>
  </header>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Highlighting for the formats you use</h3>
      <p>Work with JavaScript, TypeScript, HTML, CSS, JSON, YAML, TOML, Rust, Python, Java, C, C++, SQL, XML, LaTeX, and other common formats. Plain text, logs, and configuration files open directly as well.</p>
      <p>The same search panel moves forward and backward through results, supports case-sensitive, whole-word, and regular-expression searches, and can replace the current match or every match at once.</p>
    </div>
    {% include feature-shot.html image="plunibio-features-text-search-en.webp" label="Text highlighting and search" alt="Plunibio text editor with syntax highlighting and the search and replace panel open." %}
  </div>
</section>

<section id="images" class="feature-chapter">
  <header class="feature-chapter-header">
    <p class="feature-chapter-kicker">Image viewer</p>
    <div class="feature-chapter-heading">
      <h2>View, inspect, and adjust images</h2>
      <p class="feature-chapter-lede">Open project images without switching applications and make quick corrections with controls designed to help you work rather than get in the way.</p>
    </div>
  </header>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Precise control over view and orientation</h3>
      <p>Zoom from 10% to 500%, fit the image to the available space, return to 1:1 size, or recenter it after panning. Rotate freely between −180° and 180°, turn it 90° in one click, and flip it horizontally or vertically.</p>
      <ul class="feature-chip-list" aria-label="Image controls">
        <li>Zoom and pan</li>
        <li>Fit and center</li>
        <li>Rotation</li>
        <li>Flip</li>
      </ul>
    </div>
    {% include feature-shot.html image="plunibio-features-image-transform-en.webp" label="Transform and zoom" alt="Plunibio image viewer with zoom, rotation, and flip controls." %}
  </div>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Color adjustments with immediate results</h3>
      <p>Change brightness, contrast, saturation, grayscale, sepia, and inversion with sliders. For a faster starting point, apply Normal, Monochrome, Vintage, Vivid, Dramatic, or Negative presets and continue refining from there.</p>
      <p>Changes can be saved directly to JPEG, PNG, and WebP files, with controls to reset transformations or filters whenever you want to return to the starting point.</p>
    </div>
    {% include feature-shot.html image="plunibio-features-image-adjust-en.webp" label="Adjustments and presets" alt="Plunibio image viewer showing color controls and adjustment presets." %}
  </div>
</section>

<section id="folders" class="feature-chapter">
  <header class="feature-chapter-header">
    <p class="feature-chapter-kicker">Local navigation</p>
    <div class="feature-chapter-heading">
      <h2>Your project remains an ordinary folder</h2>
      <p class="feature-chapter-lede">Select a folder as your workspace and browse its contents directly. There is nothing to import, no proprietary library, and no parallel structure to maintain.</p>
    </div>
  </header>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Move around without losing your bearings</h3>
      <p>The folder view clearly distinguishes files from directories. Breadcrumb navigation takes you back to any level, while Back and Forward keep a history of the files you have visited inside the workspace.</p>
      <p>Hidden files can be shown or hidden from the menu. Plunibio marks unsaved changes, provides save and reload shortcuts, and asks before discarding modifications.</p>
      <ul class="feature-chip-list" aria-label="Navigation features">
        <li>Breadcrumbs</li>
        <li>Back/Forward history</li>
        <li>Hidden files</li>
        <li>Direct saving</li>
      </ul>
    </div>
    {% include feature-shot.html image="plunibio-features-folders-en.webp" label="Folders and breadcrumbs" alt="Plunibio folder browser with files, subdirectories, and breadcrumb navigation." %}
  </div>
</section>

<section id="customization" class="feature-chapter">
  <header class="feature-chapter-header">
    <p class="feature-chapter-kicker">Menu and preferences</p>
    <div class="feature-chapter-heading">
      <h2>Make the workspace fit you</h2>
      <p class="feature-chapter-lede">Preferences are remembered for your next session and gathered into a compact menu that stays out of the way while you write.</p>
    </div>
  </header>

  <div class="feature-story">
    <div class="feature-story-copy">
      <h3>Theme, language, and typography your way</h3>
      <p>Switch between light and dark themes, choose the interface language, and decide whether hidden files should be visible. For Markdown documents, choose from four typography profiles: Sans serif, Serif, Modern, and Reading.</p>
      <p>The menu also brings together Open workspace, Reload, Save, and About. The sidebar can be shown or hidden and remembers its state between sessions.</p>
      <ul class="feature-chip-list" aria-label="Available preferences">
        <li>Light or dark theme</li>
        <li>Four typography profiles</li>
        <li>Five languages</li>
        <li>Persistent sidebar</li>
      </ul>
    </div>
    <div class="feature-mini-grid">
      <article class="feature-mini-card">
        <h4>Primary shortcuts</h4>
        <p><code>Ctrl+S</code> saves, <code>Ctrl+R</code> reloads, <code>Ctrl+F</code> searches, and <code>Ctrl+Shift+O</code> opens another workspace.</p>
      </article>
      <article class="feature-mini-card">
        <h4>Persistent preferences</h4>
        <p>Your theme, typography, sidebar visibility, and hidden-file setting remain selected for the next session.</p>
      </article>
    </div>
  </div>

  <div class="feature-shot-grid">
    {% include feature-shot.html image="plunibio-features-menu-theme-en.webp" label="General menu and theme" alt="Plunibio options menu showing the light and dark theme selection." %}
    {% include feature-shot.html image="plunibio-features-menu-typography-en.webp" label="Markdown typography" alt="Plunibio menu showing the typography options available for Markdown documents." %}
  </div>

  <aside class="features-alpha-note">
    <strong>Plunibio is currently in alpha</strong>
    <p>Features and interfaces may change before the first stable release. The goal remains the same: work with local files and formats that continue to belong to you.</p>
  </aside>
</section>
