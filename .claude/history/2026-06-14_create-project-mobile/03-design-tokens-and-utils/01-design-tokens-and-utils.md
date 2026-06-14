# Plan 03 — Design tokens, styling config, and pure utils (project-mobile)

**Implementation plan — DO NOT implement yet.**

Port the `project-web` design tokens to NativeWind v4 and copy the platform-agnostic utils. Per `MOBILE-PORT-ANALYSIS.md`, NativeWind v4 does **not** support Tailwind's `@theme` block, so the `global.css` `@theme` tokens (colors + typography) migrate into `tailwind.config.js` `theme.extend`. `global.css` keeps only the `@tailwind` entry points.

## Context (read, do not re-derive)

- Source of truth tokens: `/home/fael/so/repos/ben-prototype/project-web/src/core/global.css` (`@theme` block, lines 3–93).
- `cn` source: `/home/fael/so/repos/ben-prototype/project-web/src/layout/utils/styles.ts`.
- `format-time` source: `/home/fael/so/repos/ben-prototype/project-web/src/layout/utils/format-time.ts`.
- Decision (analysis §4): `@theme` tokens → `tailwind.config.js`; fonts via `expo-font` (`Hanken Grotesk`, `JetBrains Mono`).
- Decision (analysis §"Não precisam de lib"): `format-time.ts` is pure JS + `Intl`, copies direct, **no date lib**.

## Dependency / parallelism

- Depends only on plan 01 (scaffold): the Expo project, the `@/*` → `./src/*` alias (`tsconfig.json` + `babel.config.js` module-resolver), `tailwindcss`/`nativewind` installed, `metro.config.js` NativeWind wrapper, and the `global.css` import wiring in `app/_layout.tsx`. Plan 01 creates a **placeholder** `tailwind.config.js` and `global.css`; this plan **owns their final token content**.
- Parallel-safe: touches only `project-mobile/tailwind.config.js`, `project-mobile/global.css`, `project-mobile/src/layout/utils/`. No other parallel plan (02 storage) touches these.
- Consumers: UI primitives (plan 05) and every screen consume these tokens/utils later. The custom `text-*` class names and color names must match web **exactly** so ported `className` strings resolve unchanged.

## Conventions applied

- File names kebab-case (`styles.ts`, `format-time.ts`) — matches web.
- No comments; self-explanatory code.
- Copy `format-time.ts` byte-for-byte (no behavior drift): pure `Date`/`Intl`.
- Color names + custom text-size names mirror web token names exactly (drop the `--color-` / `--text-` prefix). The web uses Tailwind v4 `@theme`, where `--color-on-surface` → utility `on-surface`; in `theme.extend.colors` the same name is the object key `"on-surface"`.

---

## Steps

### Step 1 — `project-mobile/tailwind.config.js` (final token content)

Replace the plan-01 placeholder with the full theme. Keep `content` globs covering `app/` and `src/`, the NativeWind preset, and `theme.extend` carrying **every** color from the web `@theme` plus the typography scale.

Mapping rules:
- Each `--color-X: #hex;` → `colors["X"]: "#hex"` (verbatim hex, name with `--color-` stripped).
- Each `--text-Y: <size>;` group → `fontSize["Y"]: [<size>, { lineHeight, letterSpacing?, fontWeight? }]` (Tailwind's tuple form; only include the modifiers present in the web token).
- `--font-sans` / `--font-mono` → `fontFamily.sans` / `fontFamily.mono`. On RN the family must be the **loaded** font name; per analysis the families are `"Hanken Grotesk"` and `"JetBrains Mono"` (plan 01 loads them via `expo-font`). Keep web fallbacks in the array; RN ignores unresolved fallbacks harmlessly, and keeping them matches web.

Full file:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Hanken Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        surface: "#f9f9f9",
        "surface-dim": "#dadada",
        "surface-bright": "#f9f9f9",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f3f4",
        "surface-container": "#eeeeee",
        "surface-container-high": "#e8e8e8",
        "surface-container-highest": "#e2e2e2",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#444748",
        "inverse-surface": "#2f3131",
        "inverse-on-surface": "#f0f1f1",
        outline: "#747878",
        "outline-variant": "#c4c7c7",
        "surface-tint": "#5f5e5e",
        primary: "#121213",
        "on-primary": "#ffffff",
        "primary-container": "#272727",
        "on-primary-container": "#8f8e8d",
        "inverse-primary": "#c8c6c5",
        secondary: "#5e5e5e",
        "on-secondary": "#ffffff",
        "secondary-container": "#e1dfdf",
        "on-secondary-container": "#636262",
        tertiary: "#111312",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#252726",
        "on-tertiary-container": "#8d8e8d",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "primary-fixed": "#e4e2e1",
        "primary-fixed-dim": "#c8c6c5",
        "on-primary-fixed": "#1b1c1c",
        "on-primary-fixed-variant": "#474746",
        "secondary-fixed": "#e4e2e2",
        "secondary-fixed-dim": "#c7c6c6",
        "on-secondary-fixed": "#1b1c1c",
        "on-secondary-fixed-variant": "#464747",
        "tertiary-fixed": "#e2e3e1",
        "tertiary-fixed-dim": "#c6c7c5",
        "on-tertiary-fixed": "#1a1c1b",
        "on-tertiary-fixed-variant": "#454746",
        background: "#f9f9f9",
        "on-background": "#1a1c1c",
        "surface-variant": "#e2e2e2",
        "accent-active": "#1a1a1a",
        "surface-error": "#fff5f5",
        "text-error": "#c53030",
        "slate-deep": "#0f172a",
        "soft-gray": "#e2e8f0",
        "diff-added": "#f6efe1",
        "diff-added-fg": "#6b5e3f",
        "diff-added-outline": "#e7d9b8",
        "diff-removed": "#ececed",
        "diff-removed-fg": "#8e8f90",
      },
      fontSize: {
        wordmark: ["32px", { lineHeight: "40px", letterSpacing: "-0.04em", fontWeight: "700" }],
        tagline: ["18px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "headline-lg": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        button: ["15px", { lineHeight: "20px", fontWeight: "600" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" }],
      },
    },
  },
  plugins: [],
};
```

Notes:
- All 56 colors from web `@theme` are present (lines 7–64). `--color-text-error` becomes the color key `"text-error"`; this does not collide with the `fontSize` keys (different theme scales), and as a color it is used as `bg-text-error`/`text-text-error` exactly like web.
- 6 fontSize entries map the 6 web `--text-*` groups (lines 66–92), preserving `line-height`, `letter-spacing`, and `font-weight` exactly where the web token defines them (`body-md` and `button` have no letter-spacing in web, so omitted).
- Units kept as `px`/`em` strings matching web token literals; NativeWind parses these.

### Step 2 — `project-mobile/global.css` (entry points only)

Per analysis, no `@theme` — tokens live in the config. Keep only Tailwind's directive entry points so NativeWind/Metro can generate utilities. Drop the web-only `body`/`button` rules and the `fadeInUp` keyframes/`.fade-in-up` classes (CSS keyframes don't exist in RN; animations are handled later via Reanimated per analysis §"Libs adicionais").

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

(Plan 01 already wires `import "../global.css"` in `app/_layout.tsx` and the `nativewind-env.d.ts` types; this plan only finalizes the file body.)

### Step 3 — `project-mobile/src/layout/utils/styles.ts` (`cn`)

Copy the web `cn` intact. It uses `tailwind-merge` (works in RN; NativeWind keeps `className`) and must register the same custom `font-size` class group so the custom `text-*` sizes merge with last-wins behavior. `tailwind-merge` is added to `package.json` here (plan 01 does not list it).

```ts
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["wordmark", "tagline", "headline-lg", "body-md", "button", "label-caps"],
        },
      ],
    },
  },
});

type ClassValue = string | number | null | undefined | false;

export function cn(...inputs: ClassValue[]): string {
  return twMerge(inputs.filter(Boolean).join(" "));
}
```

### Step 4 — `project-mobile/src/layout/utils/format-time.ts` (copy intact)

Byte-for-byte copy of the web file. Pure `Date` + `Intl`, no platform API, no date lib. `Intl.DateTimeFormat` (via `toLocaleString`) is available in the Hermes/RN runtime.

```ts
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < MINUTE) {
    return "just now";
  }
  if (diff < HOUR) {
    return `${Math.floor(diff / MINUTE)}m ago`;
  }
  if (diff < DAY) {
    return `${Math.floor(diff / HOUR)}h ago`;
  }
  const days = Math.floor(diff / DAY);
  if (days === 1) {
    return "yesterday";
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  if (days < 14) {
    return "1w ago";
  }
  return `${Math.floor(days / 7)}w ago`;
}

export function absoluteDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function firesAtRelative(iso: string | null): string {
  if (!iso) {
    return "no time set";
  }
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) {
    return relativeTime(iso);
  }
  if (diff < HOUR) {
    return `in ${Math.max(1, Math.floor(diff / MINUTE))}m`;
  }
  if (diff < DAY) {
    return `in ${Math.floor(diff / HOUR)}h`;
  }
  return absoluteDateTime(iso);
}
```

### Step 5 — Dependency note for `tailwind-merge`

`styles.ts` imports `tailwind-merge`. Plan 01's `package.json` scope does **not** list it. To avoid a cross-plan ownership conflict on `package.json`, this plan adds the dependency by running an install in `project-mobile/` (creates/updates `package.json` + lockfile), rather than hand-editing the plan-01-owned `package.json` body:

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npm install tailwind-merge
```

If plan 01 has already added `tailwind-merge`, this is a no-op. (NativeWind itself only ships `clsx`/`tailwind-merge` transitively in some setups; do not assume — install explicitly so `tsc` resolves the import.)

---

## Owned files (final)

- `project-mobile/tailwind.config.js` — full `theme.extend` (colors + fontFamily + fontSize), content globs, NativeWind preset.
- `project-mobile/global.css` — `@tailwind base/components/utilities` only.
- `project-mobile/src/layout/utils/styles.ts` — `cn`.
- `project-mobile/src/layout/utils/format-time.ts` — `relativeTime`, `absoluteDateTime`, `firesAtRelative`.
- `project-mobile/package.json` + lockfile — `tailwind-merge` added via `npm install` (not hand-edited).

## Out of scope

- No UI primitives, no `<Typography>` mapping of these sizes (plan 05).
- No animations / Reanimated port of `fadeInUp` (later plans).
- No font loading wiring (plan 01 owns `expo-font` in `_layout.tsx`).
- No `app.config.ts`, `babel.config.js`, `metro.config.js`, `tsconfig.json` edits (plan 01).

## Verification

- No formatting/lint step required by this task.
- Type check (only owned files matter, but run project-wide):

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

  Must pass. `styles.ts` resolves `tailwind-merge`; `format-time.ts` is self-contained.

- Token resolution sanity (manual, once a screen/primitive exists): a `className` such as `bg-surface-container-high text-on-surface text-headline-lg font-sans` resolves to the mapped hex/size, and `cn("text-body-md", "text-headline-lg")` keeps only `text-headline-lg` (last-wins via the custom `font-size` group).
