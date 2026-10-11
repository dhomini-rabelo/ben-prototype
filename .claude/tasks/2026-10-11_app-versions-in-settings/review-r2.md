APPROVED_WITH_RESALVAS

# Review r2 — app-versions-in-settings (head 12b96ed, diff d2dbfe8..12b96ed -- packages/)

## r1 findings

- Blocker r1 (`app.config.ts:2`, Expo config failed to load): RESOLVED with option (a). The import now uses `./src/core/app-versions.ts` and `allowImportingTsExtensions` is in the tsconfig.
  Evidence: `npx expo config --type public` (in packages/infra/mobile/ben) exits 0 and prints `version: '1.1.0'`. Node is v24.20.0.
- Ressalva r1 (`(v, i)` names): RESOLVED. The callback now uses `(appVersion, index)` (`app-versions-section.tsx:21`).

## tsconfig / bundling check

- `allowImportingTsExtensions` requires `noEmit` or `emitDeclarationOnly`. `expo/tsconfig.base` sets `noEmit: true` and the mobile tsconfig does not override it. Valid.
- Metro/web: `app.config.ts` is evaluated by Node (@expo/config) and is not bundled by Metro. Every app-side import stays extensionless (`@/core/app-versions` in `app-version-item.tsx:4` and `app-versions-section.tsx:2`), so the bundler resolution assumptions are unchanged. `metro.config.js` has no extension-related logic.
- `app-versions.ts` uses only erasable TS syntax (a type alias and `as const satisfies`), so Node's native type stripping can load it.

## Completeness vs decisions

All the decisions are met:
- A single `APP_VERSIONS` constant, where the 1st entry is the current version and app.config reads `CURRENT_APP_VERSION`.
- Each entry has semver and a date. The history holds 1.1.0 and 1.0.0, written in English.
- The inline section sits between "Ben's model" and "Sign out" (`settings-sheet.tsx:134`).
- The header shows `v{CURRENT_APP_VERSION}`.
- Each item shows number + title (+ date), and its description toggles on press. `defaultOpen` is set only for index 0.
- The section is static and lives only in mobile.

## Ressalvas (non-blocking)

1. `app.config.ts:2` — loading the config now depends on Node's native TS type stripping (Node >= 22.18 / 23.6). Locally this is covered by the root `engines.node >=24`. However, `eas.json` does not pin `node` for its build profiles. If the EAS build image uses an older Node (unverified; the default depends on the SDK image), config evaluation on EAS would fail as it did in r1. Suggest adding `"node": "24.x"` (or matching) to the `eas.json` build profiles, or confirming the EAS image's Node version before the first cloud build.
2. Design sandbox settings previews (`packages/infra/mobile/design`) do not show the new section. This is out of scope by decision and is noted only as known drift.
