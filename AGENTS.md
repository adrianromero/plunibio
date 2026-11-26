# Working on Plunibio

Plunibio is a local-file desktop editor built with Tauri 2, Rust, SolidJS and TypeScript. Use npm for project scripts. Start the desktop app with `npm run tauri dev` and build a production bundle with `npm run tauri build`.

## Where to make a change

Find entry points and worked examples in the [application architecture guide](README.md#application-architecture).

- **Application actions.** Use the typed `useAppContext()` groups for navigation, editor actions and feedback. Keep state used by a single feature in that feature. Wire a global shortcut to the same action as its toolbar control through the shortcut definitions in `AppContext.tsx` and the dispatcher in `AppShortcuts.tsx`. Clear handlers when their owner unmounts.
- **File formats.** Start with the [editor extension guide](README.md#extending-an-editor). Reuse the file controller for loading, saving, reloading and unload. Keep format conversion and view-specific behavior beside the editor. Preserve pending edits across mode switches.
- **Text and presentation.** Get `t` from `useI18N()`. Add UI keys and matching placeholders to all five dictionaries in `src/i18n/translations/`. Reuse shared UI, error and path helpers. Use component CSS modules and the light/dark variables in `src/styles/theme.css`.
- **Native operations.** Keep TypeScript strongly typed and avoid `any` unless necessary. Define new custom Tauri commands in `src-tauri/src/lib.rs` and register them in its invoke handler. Consult existing file operations in `commands.rs` and path checks in `paths.rs`. Match serialized payloads to `src/backend/rusttypes.ts` and declare required frontend permissions in `src-tauri/capabilities/`.

## Checks for the affected surface

- Run `npm run check` and `npm test` for frontend changes. See the [validation commands](README.md#local-validation) for build and Rust checks.
- Keep affected stories in `__stories__/` current when a component's props, states or interactions change. Use `npm run storybook` to exercise them. Update `StoryAppProvider` when its context contract changes.
- For desktop interactions or screenshot flows, use the [automation runner](automation/README.md). Check the flow's workspace mode and output directory before running it.
- For whole-project audits, follow the [review protocol](REVIEW.md).

## Documentation and examples scope

During feature development, bug fixes, refactoring, and other coding tasks, do not create, modify, delete, or regenerate files under `website/` or `examples/` unless the user explicitly requests changes to those directories. A change in application behavior does not authorize documentation, example, fixture, or screenshot updates there. Read-only consultation is allowed; run any checks that would write to these directories against temporary copies instead.

Website and example updates are deferred to a dedicated documentation task when preparing a new release, after features are frozen. Starting release preparation alone does not authorize these updates: the user must explicitly request them. Preserve any existing changes in both directories. See the root [README.md](README.md#documentation-and-examples-policy).

For an authorized documentation task, start with the [website maintenance guide](website/README.md), its [editorial guide](website/maintenance/editorial.md) and the [example workspace policy](examples/README.md).
