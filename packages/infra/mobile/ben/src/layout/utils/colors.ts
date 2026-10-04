// Single source of truth for theme color hexes used as icon `color` /
// `placeholderTextColor` props. `lucide-react-native` SVG icons do not inherit
// NativeWind `text-*` classes the way web SVG inherits `currentColor`, so these
// props need explicit hex values. Keep in lockstep with the matching tokens in
// `tailwind.config.js` (theme.extend.colors).

export const primary = '#121213'
export const onPrimary = '#ffffff'
export const onSurface = '#1a1c1c'
export const onSurfaceVariant = '#444748'
export const textError = '#c53030'

// Muted variant used for finished/fired capture-card icons. Not a tailwind
// token, but kept here so all icon color values live in one place.
export const onSurfaceVariantMuted = '#9a9c9c'
