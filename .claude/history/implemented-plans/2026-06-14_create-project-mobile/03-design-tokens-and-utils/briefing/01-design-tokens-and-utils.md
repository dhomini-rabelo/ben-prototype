# Plan — Design tokens, styling config, and pure utils

1. **Establish the mobile styling configuration**
   - Set up the styling framework so it scans the app's source for class usage
   - Register the framework's mobile preset so utility classes resolve in the app
   - Keep the global stylesheet limited to base/components/utilities entry points, with the design tokens living in the configuration rather than in the stylesheet

2. **Migrate the color palette**
   - Carry over the full surface, on-surface, primary, secondary, tertiary, error, fixed, and background color tokens from the web design system
   - Carry over the diff (added/removed) color tokens and the supplemental accent/error/neutral tokens
   - Ensure each color is exposed as a named token usable in class names, matching the web naming exactly

3. **Migrate the typography scale**
   - Define the brand and monospace font families as named tokens
   - Reproduce the named text sizes (wordmark, tagline, headline, body, button, label) with their line height, letter spacing, and weight where applicable
   - Ensure the named text sizes are referenceable the same way they are on web

4. **Port the class-name merge helper**
   - Provide the helper that merges and de-duplicates utility class names, preserving last-wins behavior
   - Preserve recognition of the custom named text sizes so they merge correctly
   - Keep the same input handling (ignoring falsy values) as the web version

5. **Port the time-formatting helpers**
   - Reproduce the relative-time formatting (just now, minutes/hours/days/weeks ago)
   - Reproduce the absolute date-time formatting
   - Reproduce the future "fires at" relative formatting, reusing the relative and absolute helpers
   - Rely only on built-in date/locale capabilities, with no additional date library

6. **Confirm tokens and utils are consumable**
   - Verify the type checker passes for the owned files
   - Verify a sample color and text token resolve when used in a class name
