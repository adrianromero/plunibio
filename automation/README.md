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

Documentation flows use `temporary-copy` and declare a fixed UTC fixture timestamp:

```json
"workspaceMode": "temporary-copy",
"fixtureTimestamp": "2026-10-01T12:00:00Z"
```

The runner applies this timestamp to files and folders in the disposable copy only, after copying.
It does not follow symlinks or modify their targets. `fixtureTimestamp` is rejected for `read-only`
flows. Subsequent user edits and newly created entries retain their real modification dates; capture
folder metadata before mutations or prepare a dedicated fixture for that scene. Never normalize the
original examples to get a repeatable screenshot.

Documentation flows may set deterministic application preferences before their first step. The runner
writes these values to the WebView storage and refreshes the frontend once:

```json
"preferences": {
  "locale": "es",
  "theme": "light",
  "typography": "sans-serif",
  "sidebarVisible": true,
  "showHiddenFiles": false,
  "folderSort": { "attribute": "name", "direction": "asc" }
}
```

Only include preferences that matter to the capture. Supported values match the application settings.
`folderSort` supports `name`, `size`, or `modified` and `asc` or `desc`; the runner serializes the
object as JSON to match the application preference. Every documentation flow explicitly resets it.

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
| Application | `app-main`, `main-toolbar`, `spinner-overlay`, `message-view` | `data-message-kind` |
| Navigation | `navigate-back`, `navigate-forward`, `file-breadcrumb`, `breadcrumb-segment` | `data-path` |
| Sidebar | `sidebar-toggle`, `app-sidebar`, `sidebar-tabs`, `sidebar-tab`, `sidebar-panel` | `data-tab-key` |
| Editors | `markdown-view`, `markdown-editor`, `frontmatter-panel`, `frontmatter-editor`, `text-view`, `text-editor` | — |
| Image editor | `image-view`, `image-viewport`, `image-canvas`, `image-action`, `image-preset`, `control` | `data-action`, `data-preset`, `data-control-id` |
| Folders | `folder-view`, `folder-entry` | `data-path`, `data-entry-kind`, `data-create-kind`, `data-sort-attribute`, `data-sort-direction` |
| Search | `search-panel`, `search-input`, `replace-input`, `search-match-case`, `search-whole-word`, `search-regexp` | — |
| Dialogs | `workspace-dialog`, `workspace-directory`, `about-dialog`, `message-dialog`, `create-entry-dialog`, `create-entry-name`, `rename-entry-dialog`, `rename-entry-name` | `data-path`, `data-message-kind` |
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

The reusable menu exposes `toolbar-menu-trigger` and `toolbar-menu` for both the general menu and
current-file actions. Use **More options / Más opciones** for the general trigger, and scope the
current-file trigger to `[data-testid='file-breadcrumb']`. Scope menu panels by `aria-label`. Closed
dialogs remain in the DOM: scope **OK**, **Cancel**, and form controls to the specific visible dialog
instead of choosing a global label. The link/image address button no longer has a `title` containing
the URL; use its displayed address or the first button in the relevant actions form.
If the flow itself switches locale, select the general trigger with
`[data-testid='main-toolbar'] > div:last-child [data-testid='toolbar-menu-trigger']`
instead of keeping the accessible name from the initial language.

## Actions

Supported actions are `click`, `domClick`, `doubleClick`, `contextClick`, `type`, `keys`, `focus`, `hover`,
`pointerOver`, `pointerMove`, `clear`, `caret`, `scroll`, `scrollIntoView`, `select`, `drag`,
`pointerDrag`, `setRange`, `pause`, `wait`, `waitSelection`, `observeClipboardWrite`, `waitClipboard`, `refresh`, and `capture`. `pointerOver` dispatches the standard pointer event
used by hover-only application controls when WebKitGTK's WebDriver `moveTo` does not emit it.
`pointerMove` accepts `xRatio` and `yRatio` within a target, which is useful for table boundaries;
`waitSelection` confirms that the browser selection has moved inside a semantic target. `waitClipboard`
compares clipboard text after a user-visible copy action without printing its contents.
Its default `source: "native"` reads through Tauri's clipboard plugin. `source: "browser"` checks
the WebView API directly and reports only API availability, never clipboard contents. The browser
option is intended for diagnosis when a browser write and native read disagree; do not silently
change a failing native assertion to a different provider and call it verified.
For a write-side probe, run `observeClipboardWrite` with the known fixture text before clicking Copy,
then `waitClipboard` with `source: "write"`. It delegates to the original browser method and records
only whether the supplied text matches and the promise succeeds or rejects. No clipboard value is
logged or retained. This diagnostic wrapper exists only during that automated application session;
it does not change application code. A successful write-side probe alone does not prove a native read.
`domClick` is reserved for existing hover-only controls that WebKitGTK reports as hidden or dismisses
while moving the pointer to click. Its WebDriver implementation does not apply CSS `:hover` after
`moveTo`. This covers Crepe code-block controls and the floating inline-math Copy action. It calls the
existing handler; native clipboard assertions must still verify copy effects.
`pointerDrag` performs a real mouse gesture from the centre of one target by an `x`/`y` offset;
`setRange` changes a range input and dispatches its normal `input` event. `refresh` reloads the
complete frontend and is intended for verifying persisted preferences.

Normal click actions wait until the control is both displayed and enabled. A sidebar tab can become
visible before its editor finishes loading; waiting for readiness prevents a click from being ignored.

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

The runner copies fixtures automatically when `workspaceMode` is `temporary-copy`. Documentation
flows use copies even for read-only tasks so that visible metadata has a deterministic date. Do not implement ad hoc
copy or cleanup steps inside a flow.

The `docs-{es,en}-file-management.json` flows capture folder sorting, creation, the current-item
menu, renaming, extension confirmation, and recursive deletion. They create their own disposable
folder inside the temporary workspace, verify that renaming saves pending edits, and check both
canceling and confirming deletion. The matching workspace-navigation and save-reload flows
provide the rest of the Workspaces and files chapter captures.

The `verify-docs-{es,en}-markdown-basics.json` flows check the Bold shortcut as a typing toggle
and insertion of inline math from the formatting sidebar, then save and reload to verify both.
They wait for the expression input to close and focus the editor before sending Save. They generate
no images; math action captures belong to the advanced-content chapter.

Check runner types and fixture safety with:

```bash
npm run automation:check
npm run automation:test
```

## Landing and Features captures

The four `website-{es,en}-{markdown,files}.json` flows reproduce all sixteen landing and Features
screenshots from Atlas of Lúmina, using disposable copies, fixed fixture dates, and localized UI.
They capture the WebView viewport, excluding the native title bar and its absolute workspace path.
The relative in-app breadcrumb remains visible, as in Docs. Image scenes use Fit and 0° rotation, with the transformation controls visible.

After `npm run automation:build`, regenerate the complete batch with:

```bash
npm run website:images:refresh
```

This command stages captures outside the repository, converts all sixteen to lossless WebP, checks
pixel equality against the source PNG, and only then replaces the existing published filenames.
It generates `website/_data/website_images.json` with dimensions, bytes, locale, source flow and capture
step. Landing and Features use these dimensions rather than the old native-window aspect ratio.
Keep scene selection and existing localized alternative text aligned; update both if the subject changes.

To replay the four flows without replacing any published asset:

```bash
npm run website:images:regression
```

Both commands protect the source examples and Docs images with SHA-256 and modification-time checks.
The regression additionally checks that these sixteen images and their manifest remain unchanged.
These flows are separate from `docs:images:regression`; run both when validating the whole website.

## Chapter-specific documentation flows

`docs-{es,en}-help-recovery.json` modifies a disposable BMP, attempts to navigate away, and
captures the save-failure dialog. It verifies Continue/Cancel labels, cancels to keep the edit,
then discards through Reload and navigates successfully. Closing uses the same Continue label
in the current AppContext source; the flow does not close the application window.

`verify-docs-{es,en}-cli-new-file.json` starts with a missing Markdown filename passed through
the real application arguments. Leaving it empty does not create a folder entry; returning and
using Save creates it, and Reload reads it back without an unsaved indicator. These flows use
temporary copies and create no captures. CLI syntax/error checks are recorded separately in
`scripts/verify-documentation-cli.mjs` (`npm run docs:cli:check`); every case exits before GUI startup.

`docs-{es,en}-preferences.json` captures the general menu, all four typography choices, language
choices, Reading typography, the dark theme, and hidden files before/after. It checks persisted
theme, language, typography, and hidden-file visibility through frontend refreshes.
`verify-docs-{es,en}-preferences.json` additionally selects typography from text and folder views,
checks sidebar visibility after refresh, switches through all five languages, and checks that
descending Modified sorting survives refresh and navigation to another folder. It creates no captures.
These checks exercise local preference restoration; they are not a full process-restart test on
each desktop platform.

`verify-docs-{es,en}-image-behavior.json` checks view-only zoom, free rotation, reset scopes,
all preset settings across the capture and verification flows, discarding changes, and PNG persistence.
It writes two temporary canvas captures under `/tmp/plunibio-doc-images-{es,en}-check`.
Compare `before-save.png` with `after-reload.png` using ImageMagick's `compare -metric AE`;
the expected result is zero different pixels even though inversion returns to 0% after reloading.
These are verification artifacts, not published figures. With `--verify-only`, capture checkpoints
only validate visible positive dimensions as in the rest of the regression suite.
The unsupported-image-save capture flows also discard the failed BMP edit through Reload.

`docs-{es,en}-text-code.json` checks JavaScript folding through the gutter and ellipsis,
completion acceptance, editing three selected occurrences, undo/redo, save/reload, line movement,
duplication, comments, and indentation. Exact DOM line assertions compare both content and order;
copy shortcuts in the flow do not constitute native clipboard verification. Completion captures
leave blank space below the insertion point so the suggestion list is not clipped by its container.
`docs-{es,en}-text-code-mermaid.json` captures saved and reloaded standalone Mermaid source.
`verify-docs-{es,en}-text-code-input.json` checks bracket pairs, Tab leaving text unchanged, YAML without
completion proposals, and the default-application option for unrecognized extensions without launching it.

`verify-docs-{es,en}-search-behavior.json` checks individual replacement, an empty replacement,
clearing the query, metadata/link-address exclusion, code-block inclusion, and hiding/reopening
Search. Clear an input with Ctrl+A followed by Backspace; passing an empty string to `type` does
not reliably delete the previous value. These flows create no captures.

The advanced-content chapter uses `docs-*-markdown-table`, `docs-*-markdown-code-mermaid-math`,
and `docs-*-markdown-inline-math` capture flows. `verify-docs-*-advanced-table` checks creation
of a 3×3 table and persistent row/column deletion. The code flow also checks Mermaid error
recovery and math-block edits after saving and reloading; inline math copying is checked against
the native clipboard. Table drag reordering remains outside the documented contract.

`docs-{es,en}-markdown-links-create.json` verifies link creation, native clipboard copying, editing,
removal, image insertion by relative path, caption persistence, resize persistence, and rejection of
external `file:` links. `domPointerDrag` dispatches pointerdown/move/up to the existing resize
handler when WebKitGTK cannot expose the hover-only handle through native pointer movement.
It requires a target with nonzero dimensions and does not alter the document directly; record this
as handler-level verification rather than a physical desktop drag.

Documentation flows always produce PNG source captures. After regenerating the complete selected
batch, convert them to the single publishable WebP copy with:

```bash
npm run docs:images:optimize
```

The command uses ImageMagick lossless WebP at method 6, strips non-visual metadata, and compares each
decoded result with its PNG source using the absolute error metric. It replaces the PNG only when the
number of different pixels is zero. A failed conversion leaves the source in place and exits with an
error. Run this command before creating or validating the capture manifest:

```bash
npm run docs:images:manifest
```

The manifest command matches every WebP to its flow and one-based capture step, reads its dimensions
and byte size, and adds the reviewed bilingual alternative text from `automation/docs-image-alts.json`.
It fails on PNG sources, missing or unowned WebP files, duplicate destinations, missing translations,
or a capture without its English/Spanish counterpart. The generated Jekyll data lives at
`website/_data/docs_images.json`; edit the alternative-text source and regenerate instead of changing
the manifest by hand.

To replay every documentation flow while checking its capture checkpoints without writing image
files, run:

```bash
npm run docs:images:regression
```

The suite launches each flow with `--verify-only`. Viewport checkpoints must have positive dimensions;
element checkpoints must still resolve to a displayed element with a positive bounding box. The suite
hashes the complete published WebP tree before and after execution and fails if any image is added,
removed, or changed. It requires the automation binary produced by `npm run automation:build`.
It also hashes every source fixture tree referenced by the flows. Both protections run even if a
flow fails, so a failed regression cannot hide a change to the originals.

The command includes `docs-*.json` capture flows and `verify-docs-*.json` behavior-only flows. The
latter cover new file management, inline math editing, and Mermaid file highlighting in ES/EN.
They do not own image destinations or require new WebP files in the manifest. Integrate a scene into
a capture flow only when the chapter has selected that scene and its bilingual alternative text.

## Maintaining the website in a new session

Start with [website/README.md](../website/README.md), the editorial contract and templates in
`website/maintenance/`. They cover all five website sections, release metadata, bilingual writing,
preview, validation and publication. No private planning directory is required.

For an affected Docs chapter, rebuild the automation binary from the target application reference,
run both localized flows, review the generated PNGs, then run:

```bash
npm run docs:images:optimize
npm run docs:images:manifest
```

The optimizer replaces PNGs under the Docs asset tree with verified pixel-identical lossless WebP;
these commands modify published assets. The manifest reads `automation/docs-image-alts.json` and
capture ownership from the flows. Update the alternatives if a scene changes and retain existing IDs
and filenames where possible. Use `docs-figure.html` IDs in chapters. Do not hand-edit generated
manifests. `--verify-only` still performs flow actions, so use disposable workspaces for mutable flows.

Before closing a functional release, run the affected flows and both regressions:

```bash
npm run automation:check
npm run automation:test
npm run docs:images:regression
npm run website:images:regression
```

Docs regression replays capture and verification flows with captures disabled and checks fixture and
published-image hashes. It checks capture target readiness/dimensions; it does not compare newly
rendered screenshots pixel by pixel with the published images. Landing/Features refresh does verify
lossless conversion against its staged source PNG. Neither result is a physical platform test.

Use `viewport` or `element` for public images; exclude native decorations and absolute personal paths.
Keep base window 1024×768, deterministic locale/preferences/timestamp, localized example content,
explicit readiness waits and original examples unchanged. Image showcase scenes should use Fit and
0° rotation. Inspect the generated dimensions rather than assuming a HiDPI scale.

Keep browser/site QA separate from app WebDriver flows. `npm run website:check -- <preview-root>`
validates a Jekyll build. `npm run website:qa:prepare -- <preview-root> --all-pages` creates a disposable
axe-instrumented site covering Home, Features, Installation, Docs and About in both languages.
It prints the temporary path to serve; open its `/qa/` page in a browser to run and export results.
Never publish that instrumented copy. See the website README for build paths and exact procedure.
CLI read-only checks now live in `scripts/verify-documentation-cli.mjs`; run
`npm run docs:cli:check -- <binary>` when relevant.
