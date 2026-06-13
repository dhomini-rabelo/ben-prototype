# Simple Plan — UI primitives + icons (project-mobile)

Port the shared web UI primitives and icons to React Native, rebuilt over RN
primitives (`Pressable`/`Text`/`View`) with NativeWind className styling, and
icons over `react-native-svg`. Owns only `src/layout/components/ui/` and
`src/layout/components/icons/`; consumes the design tokens delivered by plan 03.

## Plan

1. **Port the Button primitive**
   - Render an actionable surface backed by a pressable element instead of an HTML button
   - Keep the existing visual styling (background, on-primary text, rounded corners, padding, gap, centered layout)
   - Translate web-only interaction states (hover, focus ring) into RN-supported feedback, expressing the pressed/active state as a press-driven style (scale + inverse background)
   - Forward press handling and custom styling so callers can extend appearance and behavior

2. **Port the IconButton primitive**
   - Render a circular, fixed-size pressable container for a single icon child
   - Preserve the round shape, primary color, and pressed-state background feedback
   - Drive interaction through a press handler and expose an accessibility label for screen readers in place of the web aria attribute
   - Allow style overrides via className

3. **Port the Typography primitive**
   - Render text through the RN text element while preserving the variant system
   - Keep the same variant set (wordmark, tagline, headline-lg, body-md, button-text, label-caps) and their styling intent, including the monospace/uppercase treatment for the caps label
   - Drop the web element-tag mapping since RN has no semantic heading/paragraph tags; the variant alone decides appearance
   - Allow style overrides via className

4. **Port the brand and provider icons**
   - Recreate the Ben logo as native SVG shapes preserving its viewport and proportions
   - Recreate the Google icon as native SVG paths preserving its viewport and proportions
   - Keep color driven by the current text color so icons inherit styling from their context
   - Keep configurable sizing where the originals exposed it

5. **Align icon dependency on the native vector library**
   - Ensure shared icons sourced from the icon set resolve to the React Native variant of the library rather than the web one
   - Confirm icons render through the native SVG renderer
