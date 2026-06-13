# Mobile Icon Color and Size Patterns

How `project-mobile` colors and sizes vector icons (`lucide-react-native` / `react-native-svg`).

## Why className does not work on icons

On the web, an SVG icon inherits its color from a `text-*` class because the SVG uses `currentColor`. In React Native this does **not** happen: NativeWind's `cssInterop` is not wired for `lucide-react-native` / `react-native-svg`, so `text-*` and `size-*` classNames are silently ignored on icon components. Icons must receive explicit `color` and `size` **props**.

## Source the color from the shared theme-hex module

All icon hex values live in one module (`@/layout/utils/colors`), kept in lockstep with the theme colors in `tailwind.config.js`. Never hardcode a hex inline and never invent a new one at the call site — add or reuse a named export from that module.

```tsx
// Wrong way — className does not propagate to the icon
import { Bell } from 'lucide-react-native'

<Bell className="text-primary size-5" />
```

```tsx
// Wrong way — hardcoded hex bypasses the single source of truth
<Bell color="#121213" size={20} />
```

```tsx
// Correct way — explicit props sourced from the shared module
import { Bell } from 'lucide-react-native'
import { primary } from '@/layout/utils/colors'

<Bell color={primary} size={20} />
```

## The rule

- Never color an icon via `className`; always pass an explicit `color` prop.
- Always source the color from `@/layout/utils/colors` so it tracks the Tailwind theme tokens.
- Use the same module for other native props that cannot take a className, such as `placeholderTextColor`.
- When a needed color is missing, add a named export to `@/layout/utils/colors` (mirroring the matching `tailwind.config.js` token) rather than inlining a hex.
