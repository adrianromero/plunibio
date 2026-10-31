# Plunibio automation runner

The runner drives the real Tauri application through an embedded WebDriver server. It is intended
for repeatable documentation captures and normal-user UI flows on the Ubuntu/Wayland development
machine.

## Build and run

```bash
npm run automation:build
npm run automation:run -- automation/flows/smoke-atlas.json
```

The WebDriver plugins are registered only when Cargo's `automation` feature is enabled, and the
frontend bridge is included only when `VITE_PLUNIBIO_AUTOMATION=1`. Normal production release builds
do not contain or start the WebDriver server.

## Targets

Every action locates UI by a semantic target. Prefer `aria`, then `text`, then `testId`; use raw CSS
or XPath only when the interface has no stable accessible name.

Every flow must also declare how it treats its workspace:

- `"workspaceMode": "read-only"` opens `basePath` directly and is allowed only when the flow never
  saves, imports, transforms, or otherwise changes a file.
- `"workspaceMode": "temporary-copy"` copies the complete `basePath` to a unique directory under
  the operating system temporary directory before Tauri starts. The copy is removed after WebdriverIO
  exits, including after a failed flow.

Use `temporary-copy` for every mutable documentation flow. The original example path is never passed
to Plunibio in that mode.

Documentation flows may set deterministic application preferences before their first step. The runner
writes these values to the WebView storage and refreshes the frontend once:

```json
"preferences": {
  "locale": "es",
  "theme": "light",
  "typography": "sans-serif",
  "sidebarVisible": true,
  "showHiddenFiles": false
}
```

Only include preferences that matter to the capture. Supported values match the application settings.

```json
{ "using": "aria", "value": "Formato" }
{ "using": "text", "value": "Atlas de Lúmina" }
{ "using": "testId", "value": "markdown-editor" }
{ "using": "css", "value": ".ProseMirror" }
```

Use `index` when several elements intentionally have the same name.

## Stable selector contract

The application exposes language-independent identifiers for automation. These identifiers are part
of the automation contract and should not be renamed without updating the flows.

| Area | Test id | Instance attributes |
| --- | --- | --- |
| Application | `app-main`, `main-toolbar`, `spinner-overlay`, `error-view` | `data-message-kind` |
| Navigation | `navigate-back`, `navigate-forward`, `file-breadcrumb`, `breadcrumb-segment` | `data-path` |
| Sidebar | `sidebar-toggle`, `app-sidebar`, `sidebar-tabs`, `sidebar-tab`, `sidebar-panel` | `data-tab-key` |
| Editors | `markdown-view`, `markdown-editor`, `frontmatter-panel`, `frontmatter-editor`, `text-view`, `text-editor` | — |
| Image editor | `image-view`, `image-viewport`, `image-canvas`, `image-action`, `image-preset`, `control` | `data-action`, `data-preset`, `data-control-id` |
| Folders | `folder-view`, `folder-entry` | `data-path`, `data-entry-kind` |
| Search | `search-panel`, `search-input`, `replace-input`, `search-match-case`, `search-whole-word`, `search-regexp` | — |
| Dialogs | `workspace-dialog`, `workspace-directory`, `about-dialog`, `message-dialog` | `data-path`, `data-message-kind` |
| Menus | `toolbar-menu-trigger`, `toolbar-menu` | `data-toolbar-menu-entry`, `data-toolbar-menu-section`, `data-choice-option` |

For repeated elements, combine the test id and its instance attribute:

```json
{
  "using": "css",
  "value": "[data-testid='folder-entry'][data-path='data/distritos.json']"
}
```

ARIA selectors remain useful for accessibility assertions and user-visible wording. Prefer test ids
for flows that must run in several interface languages.

## Actions

Supported actions are `click`, `domClick`, `doubleClick`, `contextClick`, `type`, `keys`, `focus`, `hover`,
`pointerOver`, `pointerMove`, `clear`, `caret`, `scroll`, `scrollIntoView`, `select`, `drag`,
`pointerDrag`, `setRange`, `pause`, `wait`, `waitSelection`, `waitClipboard`, `refresh`, and `capture`. `pointerOver` dispatches the standard pointer event
used by hover-only application controls when WebKitGTK's WebDriver `moveTo` does not emit it.
`pointerMove` accepts `xRatio` and `yRatio` within a target, which is useful for table boundaries;
`waitSelection` confirms that the browser selection has moved inside a semantic target. `waitClipboard`
compares clipboard text after a user-visible copy action without printing its contents.
`domClick` is reserved for existing hover-only controls that WebKitGTK locates but reports as hidden
because its WebDriver implementation does not apply CSS `:hover` after `moveTo`.
`pointerDrag` performs a real mouse gesture from the centre of one target by an `x`/`y` offset;
`setRange` changes a range input and dispatches its normal `input` event. `refresh` reloads the
complete frontend and is intended for verifying persisted preferences.

`capture` supports:

- `viewport`: all application content rendered by the WebView.
- `element`: the exact bounding box of a target element.
- `native-window`: the complete XWayland window, including its client-side GNOME frame. The runner
  launches only the automated Plunibio process with `GDK_BACKEND=x11`, finds it by title with
  `xwininfo`, and captures it with ImageMagick. The normal application remains Wayland-native.

Text editing is performed with real WebDriver keyboard events. A step can focus a ProseMirror or
CodeMirror editor and subsequent `keys` steps can use shortcuts such as `Control+a`, arrow keys,
Backspace, Enter, and Tab. For deterministic contenteditable insertion, `caret` places the cursor
at the `start` or `end` of a semantic target before a `keys` step. Use the WebDriver key name
`Decimal` when a flow must type a full stop: WebKitGTK drops a literal `.` from synthesized keyboard
input on the documentation machine.

## Flow example

```json
{
  "name": "Search in a JSON file",
  "app": {
    "basePath": "examples/atlas-de-lumina",
    "workspaceMode": "read-only",
    "file": "data/distritos.json",
    "width": 1024,
    "height": 768
  },
  "outputDir": "website/assets/images/manual/es",
  "steps": [
    { "action": "keys", "keys": ["Control", "f"] },
    {
      "action": "type",
      "target": { "using": "aria", "value": "Buscar texto" },
      "text": "light"
    },
    { "action": "capture", "scope": "viewport", "name": "buscar-json" }
  ]
}
```

The runner copies editable fixtures automatically when `workspaceMode` is `temporary-copy`. A
read-only documentation flow may use `examples/atlas-de-lumina` directly. Do not implement ad hoc
copy or cleanup steps inside a flow.
