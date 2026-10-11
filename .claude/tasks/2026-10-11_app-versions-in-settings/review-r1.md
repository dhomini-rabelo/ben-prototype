CHANGES_REQUIRED

# Review r1 — app-versions-in-settings (commit da5f59a)

## Blocker

1. `packages/infra/mobile/ben/app.config.ts:2` — the Expo config can no longer be evaluated.
   - Evidence: `npx expo config --type public` (run in `packages/infra/mobile/ben`) exits 1 with
     `Error reading Expo config ... Cannot find module './src/core/app-versions'` (require stack: `@expo/config/build/evalConfig.js`).
     Expo SDK 54 transpiles only `app.config.ts` itself. The nested extensionless `.ts` require is not resolvable, so `expo start`, `expo export` and EAS builds fail. Typecheck and lint cannot catch this.
   - Correct looks like: `app.config.ts` loads the constant in a way Node can resolve at config time. Verified option: Node v24.20.0 resolves `require('./src/core/app-versions.ts')` (with explicit `.ts`) and returns `1.1.0` through native type stripping. Two ways to use that:
     (a) import with the explicit `.ts` extension. This needs `allowImportingTsExtensions` in the mobile tsconfig (`expo/tsconfig.base` does not set it; `noEmit: true` is already set).
     (b) keep the data in a file Node loads natively (for example `app-versions.json`). `src/core/app-versions.ts` would re-export it with the `AppVersion` type.
     Whichever is chosen, re-run `npx expo config --type public` and confirm `"version": "1.1.0"`. This is the acceptance check that was missed.

## Completeness vs acceptance (otherwise OK)

- `APP_VERSIONS` = [1.1.0, 1.0.0] with semver, date, title and description in English. `CURRENT_APP_VERSION` is derived from `APP_VERSIONS[0]`, and the non-empty tuple `satisfies` keeps `[0]` safe. OK.
- Position: `settings-sheet.tsx:134` renders `{versionsSection}` after the "Ben's model" block and before the Sign out block. OK.
- The header shows "App versions" plus `v{CURRENT_APP_VERSION}`. Each item shows number + title (+ date). The description toggles on press. `defaultOpen={i === 0}` opens only 1.1.0. It has `accessibilityState.expanded` and a 48px touch target (`min-h-12`). OK.
- The section is static and lives only in mobile. It mirrors the existing "Ben's model" section styling (`gap-3 border-t border-outline-variant/40 px-5 pt-4 pb-5`, label-caps header). OK.
- The 1.0.0 description is backed by code: Google sign-in (`src/services/google-auth-service.ts`), voice (`src/layout/components/recording-bar.tsx`) plus typed chat, task workspaces (`src/pages/task-workspace`), and the model/effort picker (`agent-settings-controls`). The date 2026-05-23 matches the repo's initial commit. OK.

## Ressalvas (non-blocking)

- `app-versions-section.tsx:21` — `(v, i)` uses single-letter names. The code-write-code lint guide forbids abbreviated names (`i` is on the denylist). ESLint enforces `id-length` only for `backendFiles`, so lint passed. Suggest `(appVersion, index)`.
- The design sandbox (`packages/infra/mobile/design`) has settings preview pages (`settings-sheet-preview`, `menu-settings-*`). They do not show the new section. This matches the binding decision "só mobile"; it is noted here only so the gallery drift is known.
