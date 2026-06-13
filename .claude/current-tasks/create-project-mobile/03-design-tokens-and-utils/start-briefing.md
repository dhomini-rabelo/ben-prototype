# Plan 03 — Design tokens, styling config, and pure utils

**Plan 2 [Frontend] (parallel)**: NativeWind theme tokens + `cn` util + `format-time` util.

- Depends only on the scaffold (plan 01). Owns `tailwind.config.js`, `global.css` token content, and `src/layout/utils/`. No other parallel plan touches these files, so it runs alongside plan 02 (storage). UI primitives (plan 05) and every screen consume these tokens/utils later.

## Goal

Port the `project-web` design tokens to NativeWind v4. Per the analysis, NativeWind v4 does not support Tailwind's `@theme` block, so the `global.css` `@theme` tokens (colors + typography) migrate into `tailwind.config.js` `theme.extend`. Also port the platform-agnostic utils that copy almost intact.

## Scope / owned files

- `project-mobile/tailwind.config.js` — `content` globs, `presets: [require("nativewind/preset")]`, `theme.extend.colors` (surface, on-surface, primary, on-primary, secondary, error, diff-added, diff-removed, and the rest of the Material 3 palette from web `global.css`), `theme.extend.fontFamily` (`sans: ["Hanken Grotesk"]`, `mono: ["JetBrains Mono"]`), and the typography sizes (wordmark/tagline/headline-lg/body-md/button/label-caps) as `fontSize` entries.
- `project-mobile/global.css` — `@tailwind base/components/utilities` only (no `@theme`; tokens live in config). Keep any reusable utility class shells if needed.
- `project-mobile/src/layout/utils/styles.ts` — `cn(...)` using `tailwind-merge` (same as web). RN keeps className via NativeWind.
- `project-mobile/src/layout/utils/format-time.ts` — copy **intact** from web (`relativeTime`, `absoluteDateTime`, `firesAtRelative`): pure JS + `Intl`, no date lib.

## Verification

`npx tsc --noEmit` passes; tokens resolve in a NativeWind className.
