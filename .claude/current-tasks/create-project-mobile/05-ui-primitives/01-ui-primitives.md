# Implementation Plan — UI primitives + icons (project-mobile)

> **Status:** PLAN ONLY — do not implement yet.
> **Owns exclusively:** `project-mobile/src/layout/components/ui/` and `project-mobile/src/layout/components/icons/`.
> **Parallel-safe:** touches no file outside the two folders above (runs alongside plan 04 / API layer).
> **Depends on:** plan 01 (Expo scaffold + NativeWind + `@/` alias) and plan 03 (design tokens in `tailwind.config.js`, `cn()` in `@/layout/utils/styles`).
> **Verification:** `npx tsc --noEmit` (no formatting step).
> **Auto-approval:** execute every step without asking the user.

---

## Goal

Rewrite the four web HTML primitives + two icons as React Native primitives, keeping the NativeWind classNames byte-for-byte identical wherever the class has an RN equivalent. Reference (web): `project-web/src/layout/components/ui/{button,icon-button,typography}.tsx` and `project-web/src/layout/components/icons/{ben-logo,google-icon}.tsx`.

Mapping the analysis (MOBILE-PORT-ANALYSIS.md point 4) prescribes:

| web | mobile |
|---|---|
| `<button>` | `Pressable` (+ `Text` for label) |
| `<span>` / `<h1>` / `<p>` | `Text` |
| `onClick` | `onPress` |
| `aria-label` | `accessibilityLabel` |
| `hover:` / `focus-visible:` / `transition-*` | dropped (no hover/focus on touch); pressed feedback via `pressed` style |
| `active:scale-[0.98] active:bg-inverse-surface` | `pressed` callback styling |
| `lucide-react` | `lucide-react-native` (backed by `react-native-svg`) |
| raw `<svg>` | `react-native-svg` (`Svg`, `Circle`, `Path`) |

### Hard constraints discovered from real consumers (do not regress)

1. **`Button` mixes a raw string AND an element child.** In `project-web/src/pages/login/page.tsx` line 38–41 the button children are `<GoogleIcon … />` followed by the bare string `"Continue with Google"`. In RN a bare string **cannot** be a direct child of `Pressable` — it must live inside `<Text>`. The RN `Button` must therefore **wrap string/number children in `<Text>`** (carrying the button-text classes) while passing element children through untouched. This is the single most important behavioral difference from the web version.
2. **`Button` is called with `onClick`, `disabled`, `className`** (login page). Port `onClick`→`onPress`, keep `disabled`, keep `className` passthrough.
3. **`Typography` is always given `variant` + optional `className` + children** that are either text or nested `Typography`. The `as` prop is **never used by any consumer** (grep of `project-web/src` shows no `as=` on `<Typography>`), so it is safe to drop per the simple plan.
4. **Icons receive `className` only** (e.g. `GoogleIcon className="size-5 …"`, `BenLogo className=… width=… height=…` via `brand-mark.tsx`). Color comes from the surrounding `text-*` class through `currentColor` on web → must be reproduced with NativeWind's `react-native-svg` color forwarding.

---

## Prerequisite assumptions (delivered by plans 01 & 03 — verify, do not create)

- `nativewind` v4 is installed and `className` is enabled on RN core components + `react-native-svg` via the Babel/Metro setup and `nativewind-env.d.ts`. **If `className` typings are missing on `react-native-svg` components**, the icon files must `import "nativewind"` types or use `cssInterop` — see Step 4 note.
- `tailwind.config.js` exposes the same token names as web: colors (`primary`, `on-primary`, `inverse-surface`, `surface-tint`, `surface-container-high`, …) and the named text sizes via `fontSize` (`wordmark`, `tagline`, `headline-lg`, `body-md`, `button`, `label-caps`) so `text-button`, `text-wordmark`, etc. resolve. (Plan 03 step 3.)
- `cn()` lives at `project-mobile/src/layout/utils/styles.ts` and recognizes the custom `text-*` size group (plan 03 step 4). All primitives import `cn` from `@/layout/utils/styles`.
- Dependencies present: `react-native-svg`, `lucide-react-native` (plan 01).

If any prerequisite is absent at implementation time, **do not add it here** (out of scope / would break parallel-safety) — instead note it and proceed; `tsc` will surface missing types.

---

## Step 1 — `src/layout/components/ui/button.tsx`

Render an actionable surface over `Pressable`, wrapping string children in a `Text` so the button label inherits the button typography. Keep the static visual classes; translate `active:` web utilities into a `pressed`-driven style; drop `hover:`/`focus-visible:`/`transition-*` (no equivalent on touch).

Key decisions:
- `PressableProps` is the base type (gives `onPress`, `disabled`, `accessibilityLabel`, etc.) instead of web's `ButtonHTMLAttributes`.
- `pressed` from `Pressable`'s function-as-child / function-as-style replaces `active:scale-[0.98] active:bg-inverse-surface`.
- Use NativeWind's array-className-with-`pressed` form: pass a function to `className` so the pressed variant classes apply. NativeWind v4 supports `Pressable` state via the `active:` prefix at the className level, **but to faithfully reproduce both the scale and the bg-swap** we resolve pressed classes explicitly through `cn()`.
- A string/number child is wrapped in `<Text>`; non-text (icon) children render as-is. Mixed children (login case) are normalized by mapping over `Children`.

```tsx
import type { ReactNode } from "react";
import { Children, isValidElement } from "react";
import type { PressableProps } from "react-native";
import { Pressable, Text } from "react-native";
import { cn } from "@/layout/utils/styles";

type ButtonProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
  className?: string;
};

function renderChild(child: ReactNode, index: number) {
  if (typeof child === "string" || typeof child === "number") {
    return (
      <Text key={index} className="text-on-primary text-button font-semibold">
        {child}
      </Text>
    );
  }
  return child;
}

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <Pressable
      className={({ pressed }) =>
        cn(
          "flex-row items-center justify-center gap-3",
          "bg-primary rounded-lg px-6 py-3.5",
          pressed && "scale-[0.98] bg-inverse-surface",
          props.disabled && "opacity-60",
          className,
        )
      }
      {...props}
    >
      {Children.map(children, renderChild)}
    </Pressable>
  );
}
```

Notes / rationale:
- `inline-flex items-center justify-center gap-3` → `flex-row items-center justify-center gap-3` (RN `View`/`Pressable` is `flex` column by default; the web row layout needs explicit `flex-row`). The web `group` class was only used so the nested `GoogleIcon`'s `group-hover:` worked — there is no hover on touch, so `group` is dropped (and the login icon's `group-hover:`/`transition` classes are dead on mobile; that's the login screen plan's concern, not ours).
- Web set `text-button font-semibold text-on-primary` on the `<button>` so text children inherit it. RN `Text` does **not** inherit className from a `Pressable` ancestor, so those text classes move onto the wrapper `<Text>` in `renderChild`.
- `pressed && "scale-[0.98] bg-inverse-surface"` reproduces `active:scale-[0.98] active:bg-inverse-surface`. `hover:bg-surface-tint`, `transition-all duration-200 ease-in-out`, and all `focus*` classes are intentionally dropped (touch platform).
- `disabled` styling: web relied on browser default; add `opacity-60` when disabled so the login "Signing in…" disabled state reads correctly. (Behavioral parity improvement, still classes-only.)
- `accessibilityLabel`, `onPress`, `disabled` all flow through `...props` because `PressableProps` includes them.

## Step 2 — `src/layout/components/ui/icon-button.tsx`

Circular fixed-size pressable wrapping a single icon child. `aria-label`→`accessibilityLabel`, `onClick`→`onPress`, `hover:bg-surface-container-high`→`pressed` background.

```tsx
import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { cn } from "@/layout/utils/styles";

type IconButtonProps = {
  label: string;
  children: ReactNode;
  className?: string;
  onPress?: () => void;
};

export function IconButton({
  label,
  children,
  className,
  onPress,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={({ pressed }) =>
        cn(
          "size-10 items-center justify-center rounded-full",
          pressed && "bg-surface-container-high",
          className,
        )
      }
    >
      {children}
    </Pressable>
  );
}
```

Notes:
- `flex` dropped (RN default); keep `size-10 items-center justify-center rounded-full`.
- `text-primary` on the web button colored the lucide icon via `currentColor`. On RN the icon color is **not** inherited through className from the `Pressable`. The icon child itself must carry the color (lucide-react-native takes a `color` prop, or NativeWind `className="text-primary"` via cssInterop). To preserve the web contract (parent sets the color), keep `text-primary` on the wrapper **and** rely on consumers/the icon child for actual color — but since RN won't propagate it, the recommended convention (documented for the icon-button consumers in later plans) is that the icon child sets its own color class. We therefore **drop `text-primary` from the wrapper** to avoid implying inheritance that does not happen, and leave coloring to the child. (If a later plan needs a default, it can pass `className="text-primary"` to the icon child.)
- `onClick`→`onPress`; `label`→`accessibilityLabel`; add `accessibilityRole="button"` for screen readers (RN best practice).

## Step 3 — `src/layout/components/ui/typography.tsx`

Render over `Text`, keep the exact same variant→class map. Drop the `as` / `defaultElement` element-tag mapping (RN has no semantic heading/paragraph tags, and no consumer uses `as`). Keep the module-level `Record<TypographyVariant, string>` per the component-variant-maps pattern, merged with `cn()`.

```tsx
import type { ReactNode } from "react";
import type { TextProps } from "react-native";
import { Text } from "react-native";
import { cn } from "@/layout/utils/styles";

export type TypographyVariant =
  | "wordmark"
  | "tagline"
  | "headline-lg"
  | "body-md"
  | "button-text"
  | "label-caps";

const variantClasses: Record<TypographyVariant, string> = {
  wordmark: "text-wordmark",
  tagline: "text-tagline",
  "headline-lg": "text-headline-lg",
  "body-md": "text-body-md",
  "button-text": "text-button",
  "label-caps": "text-label-caps font-mono uppercase",
};

type TypographyProps = TextProps & {
  variant: TypographyVariant;
  className?: string;
  children: ReactNode;
};

export function Typography({
  variant,
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Text className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </Text>
  );
}
```

Notes:
- `variantClasses` is copied **verbatim** from web (same keys, same values, including `font-mono uppercase` for `label-caps`).
- The named text sizes (`text-wordmark`, etc.) resolve only because plan 03 registered them as `fontSize` tokens in `tailwind.config.js` and `cn()` recognizes the size group. No values are hardcoded here.
- Spread `TextProps` so consumers can pass `numberOfLines`, `onPress`, `accessibilityRole`, etc. (the web version did not, but several mobile text consumers — e.g. truncation in `task-picker-list` which used `truncate` on web — will need `numberOfLines={1}`; exposing `...props` keeps that the consumer's choice and stays classes-only here).
- Color/alignment classes from consumers (`text-on-surface-variant`, `text-center`, `text-error`) flow through `className` exactly as on web.

## Step 4 — `src/layout/components/icons/ben-logo.tsx`

Reproduce the three-circle logo over `react-native-svg`, same `viewBox="0 0 36 28"`, same default `width=36 height=28`, same circle geometry. Replace `currentColor` fills with `color`-prop forwarding.

```tsx
import Svg, { Circle } from "react-native-svg";

type BenLogoProps = {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
};

export function BenLogo({
  className,
  width = 36,
  height = 28,
  color = "currentColor",
}: BenLogoProps) {
  return (
    <Svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 36 28"
      fill="none"
    >
      <Circle cx={9} cy={9} r={5} fill={color} />
      <Circle cx={22} cy={14} r={6} fill={color} />
      <Circle cx={13} cy={22} r={4} fill={color} />
    </Svg>
  );
}
```

Notes:
- Geometry copied exactly: circles `(9,9,r5)`, `(22,14,r6)`, `(13,22,r4)`; `viewBox 0 0 36 28`.
- `xmlns` and `aria-hidden` are web-SVG-only → dropped. RN `Svg` is not focusable so no accessibility prop is needed.
- **Color handling — the load-bearing decision.** On web, `fill="currentColor"` + a `text-*` className made the logo inherit text color. RN `react-native-svg` understands `fill="currentColor"` only if NativeWind's `cssInterop` maps the `className` color onto the SVG's `color`/`fill` prop. To keep the web ergonomics (caller sets color via the `className`'s `text-*` token, e.g. `brand-mark.tsx` passes a color class), the plan: (a) keep `className` on `<Svg>` AND (b) default `fill` to `"currentColor"` so NativeWind's SVG cssInterop resolves it from the className-driven `color`. If plan 01's NativeWind setup does **not** enable `react-native-svg` cssInterop, fall back to an explicit `color` prop (already exposed above) and have consumers pass `color={…}`. Either way the file change stays inside this folder. Verify with `tsc` + a manual render in a later integration plan.

## Step 5 — `src/layout/components/icons/google-icon.tsx`

Reproduce the four Google paths over `react-native-svg`, same `viewBox="0 0 24 24"`. Same color strategy as Step 4.

```tsx
import Svg, { Path } from "react-native-svg";

type GoogleIconProps = {
  className?: string;
  color?: string;
};

export function GoogleIcon({ className, color = "currentColor" }: GoogleIconProps) {
  return (
    <Svg className={className} fill="none" viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill={color}
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill={color}
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill={color}
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill={color}
      />
    </Svg>
  );
}
```

Notes:
- All four `d` path strings copied verbatim from web; `viewBox 0 0 24 24`; `fill="none"` on root.
- The web icon had **no** `width`/`height` props — sizing came entirely from the `size-5` className. Keep that: no width/height props, sizing stays className-driven via NativeWind's SVG cssInterop (Step 4 caveat applies). `xmlns`/`aria-hidden` dropped.

## Step 6 — Icon dependency alignment (`lucide-react-native`)

Per simple-plan step 5 and analysis: shared lucide icons must resolve to the **native** variant. This plan owns only the two custom icon files above; there is **no shared lucide re-export file to change** (per memory rule: no barrel/index re-export files — consumers import `{ IconName }` directly from `lucide-react-native` at their call sites). Therefore:

- **No new file is created in this plan for lucide.** The dependency itself (`lucide-react-native` + `react-native-svg`) is provided by plan 01.
- Action for this step: **confirm** (read-only) that `package.json` lists `lucide-react-native` and `react-native-svg`, and that no code in our two owned folders imports from `lucide-react` (web). If any web `lucide-react` import leaked into a copied file, rewrite it to `lucide-react-native`. (Our two icon files use raw `react-native-svg`, not lucide, so this is a verification-only step unless a leak is found.)

---

## Files created (exhaustive — nothing outside these two folders)

```
project-mobile/src/layout/components/
├── ui/
│   ├── button.tsx          (Step 1)
│   ├── icon-button.tsx     (Step 2)
│   └── typography.tsx      (Step 3)
└── icons/
    ├── ben-logo.tsx        (Step 4)
    └── google-icon.tsx     (Step 5)
```

No `index.ts`/barrel files (memory: no export-only files). One component per file (memory). All file names kebab-case; exported identifiers PascalCase.

## Conventions honored

- **Component variant map** pattern: `Typography` keeps the module-level `Record<TypographyVariant, string>` + `cn()` merge.
- **`cn()` from `@/layout/utils/styles`** used in every styled primitive (provided by plan 03).
- **Destructured props, function declarations, no default exports, no comments** (write-code skill).
- **No formatting step.** No `prettier`/`lint` run for this plan.

## Verification

1. `cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit` — must pass for the five files.
2. Confirm (read-only) `tailwind.config.js` resolves `text-button`, `text-wordmark`, `text-label-caps`, and the color tokens `primary`, `on-primary`, `inverse-surface`, `surface-container-high` (else the classes are inert — flag to plan 03, do not edit it here).
3. Confirm no `lucide-react` (web) import remains in the two owned folders.

## Open risk to flag (not resolved here, stays in-scope-clean)

NativeWind v4 SVG color inheritance: if `react-native-svg` cssInterop is **not** wired by plan 01, the `className`-driven `text-*` color on `BenLogo`/`GoogleIcon` will not paint the fill. Both icons already expose a `color` prop as the fallback so the contract degrades gracefully and the fix lives entirely in this folder / the consuming screen plans. No change to plan 01/03 is made from here.
