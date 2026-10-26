// Single source of truth for theme color hexes used as icon `color` /
// `placeholderTextColor` props. `phosphor-react-native` (react-native-svg) icons do not inherit
// NativeWind `text-*` classes the way web SVG inherits `currentColor`, so these
// props need explicit hex values. Keep in lockstep with the matching tokens in
// `tailwind.config.js` (theme.extend.colors).

export const primary = '#f9a12f'
export const onPrimary = '#1d1814'
export const onSurface = '#1d1814'
export const onSurfaceVariant = '#605a54'
export const textError = '#c53030'
export const brandDeep = '#754602'
export const brandLight = '#f3dcbb'
export const iconNote = '#067d51'
export const iconReminder = '#724aab'
export const wave = '#ab7b48'
export const ink = '#1d1814'
export const surfaceLowest = '#ffffff'
export const fieldBorder = '#908b87'
export const dogEar = '#e9d5c1'

// Muted variant used for finished/fired capture-card icons. Not a tailwind
// token, but kept here so all icon color values live in one place.
export const onSurfaceVariantMuted = '#9a948f'
