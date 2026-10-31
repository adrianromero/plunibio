# Plunibio documentation lab

This directory is a deterministic technical fixture for documentation automation. It complements
`examples/atlas-de-lumina`, which remains the polished example used in user-facing captures.

## Safety contract

- Never save, transform, import, or drag files into this source directory.
- A flow that changes anything must set `"workspaceMode": "temporary-copy"`.
- A flow may set `"workspaceMode": "read-only"` only when every step is observational.
- Files must not depend on the network, current date, user account, or machine-specific paths.
- Add new cases as small, named files instead of changing unrelated cases.

The fixture is maintained by hand and does not require a generation command. The automation runner
creates and removes mutable copies automatically.

## Contents

- `markdown/editor-lab.md` and `markdown/editor-lab.es.md`: bilingual representative Markdown blocks and renderers.
- `markdown/typing-rules.md` and `markdown/typing-rules.es.md`: bilingual stable targets for mutable input-rule flows.
- `markdown/search-lab.md` and `markdown/search-lab.es.md`: bilingual repeated terms for search options, invalid expressions, and replacement.
- `tables/table-lab.md` and `tables/table-lab.es.md`: localized tables large enough to exercise
  row, column, alignment, and keyboard actions.
- `code/`: small language-specific files for CodeMirror behavior.
- `code/search-lab.json`: repeated exact and partial terms for CodeMirror search and replacement.
- `images/source-a` and `images/source-b`: two SVG files with the same basename for collision tests.
- `images/editor/image-lab.png`: writable 1200 × 500 image for transform, pan, filter, preset, and save tests.
- `images/editor/image-lab.bmp`: view-only counterpart for the unsupported-save error path.
- `.hidden-note.md` and `.hidden-folder/`: hidden-content preference cases.
- `unknown/example.plunibio-unknown`: delegation to the default application.
