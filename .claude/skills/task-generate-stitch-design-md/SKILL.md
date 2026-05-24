---
name: task-generate-stitch-design-md
description: Generate 5 DESIGN.md variations in Google Stitch format from a PRD's design-direction and ux-philosophy documents.
disable-model-invocation: true
---

# Generate Stitch DESIGN.md Variations

## Overview

Use this skill to translate the abstract mood, tone, and UX framing of a PRD into **5 concrete DESIGN.md files** that follow Google Stitch's open `design.md` specification. Each variation is a distinct visual interpretation of the same brief, so the team can compare directions before committing.

Source of truth for the spec: [stitch.withgoogle.com/docs/design-md/overview](https://stitch.withgoogle.com/docs/design-md/overview) and [github.com/google-labs-code/design.md](https://github.com/google-labs-code/design.md).

## Inputs

Look in the **active PRD directory** (the parent directory of `03-design-direction.md`) for:

1. `03-design-direction.md` — mood, tone, inspirations, principles, must-have affordances.
2. `01b-ux-philosophy.md` — chosen organizing metaphor and how PRD features map to screens.

If either file is missing, stop and ask the user for the correct PRD path. Do **not** guess paths.

## Output

Write **5 files** into a `stitch/` subdirectory next to the inputs:

```
<prd-dir>/stitch/
  ├── variation-1-<short-slug>.md
  ├── variation-2-<short-slug>.md
  ├── variation-3-<short-slug>.md
  ├── variation-4-<short-slug>.md
  └── variation-5-<short-slug>.md
```

The slug describes the variation's identity in 2–3 words (e.g., `linear-warm`, `soft-paper`, `monochrome-noir`).

If `stitch/` does not exist, create it. If files with the same names already exist, ask the user before overwriting.

## Variation Strategy

The 5 variations must remain faithful to the **mood, principles, and must-have affordances** in the design-direction file. They differ only on dimensions that the design-direction explicitly leaves open:

1. **Anchor variation** — the most literal read of the design-direction (closest to the named inspiration).
2. **Warmer variation** — pushes the "warmth" axis (softer surfaces, friendlier type, larger radii).
3. **Sharper variation** — pushes the "modern/restrained" axis (tighter type, smaller radii, cooler neutrals).
4. **Editorial variation** — leans into typographic personality (serif or expressive sans, generous spacing).
5. **High-contrast / dark-first variation** — explores the same system with a dark surface as default.

Each file must self-describe which variation it is in its `Overview` section.

## DESIGN.md File Structure

Every variation must follow this exact structure.

### 1. YAML front matter

Delimited by `---` fences at the top.

```yaml
---
version: alpha
name: <Variation Name>
description: <one-line summary of this variation's identity>
colors:
  primary: "#RRGGBB"
  secondary: "#RRGGBB"
  tertiary: "#RRGGBB"
  neutral: "#RRGGBB"
  surface: "#RRGGBB"
  surfaceMuted: "#RRGGBB"
  textPrimary: "#RRGGBB"
  textSecondary: "#RRGGBB"
  accent: "#RRGGBB"
  success: "#RRGGBB"
  warning: "#RRGGBB"
  error: "#RRGGBB"
typography:
  h1:
    fontFamily: <font name>
    fontSize: <rem|px>
    fontWeight: <number>
    lineHeight: <number|rem>
    letterSpacing: <em>
  h2: { ... }
  h3: { ... }
  body-lg: { ... }
  body-md: { ... }
  body-sm: { ... }
  caption: { ... }
  mono: { ... }
rounded:
  sm: <px>
  md: <px>
  lg: <px>
  full: 9999px
spacing:
  xs: <px>
  sm: <px>
  md: <px>
  lg: <px>
  xl: <px>
  2xl: <px>
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  button-primary-hover: { ... }
  button-secondary: { ... }
  card: { ... }
  composer: { ... }
  capture-card-note: { ... }
  capture-card-reminder: { ... }
  capture-card-task: { ... }
  ledger-peek: { ... }
  ledger-drawer: { ... }
  mic-button: { ... }
---
```

**Rules:**

- All colors are `#` + 6-digit hex (sRGB).
- All dimensions use `px`, `em`, or `rem` — never unitless except where the spec allows (e.g., `lineHeight`).
- Use token references (`{colors.primary}`, `{typography.body-md}`) inside `components` — do not repeat raw values.
- Variants (`hover`, `active`, `pressed`, `disabled`) are **separate component entries** with related names (e.g., `button-primary-hover`).
- Component property names are limited to: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`.
- Component names must cover the **must-have affordances** named in the design-direction (mic, composer, capture cards, ledger peek/drawer) plus the standard primitives (buttons, cards, inputs).

### 2. Markdown body — canonical section order

Use these `##` headings in this order. Sections may be omitted if not relevant, but **must not be duplicated**.

1. `## Overview` — Which variation this is, the mood it targets, and how it interprets the design-direction.
2. `## Colors` — Semantic role of each palette token and why these hues fit the mood.
3. `## Typography` — Font choices, why they fit the tone, and how the type scale supports hierarchy.
4. `## Layout` — Spacing scale rationale, grid/rhythm conventions, safe areas (especially the mobile-Safari constraint named in the UX philosophy).
5. `## Elevation & Depth` — Shadow strategy or tonal alternative for the optimistic capture cards and ledger drawer.
6. `## Shapes` — Radius scale and how it expresses warmth vs. sharpness.
7. `## Components` — Prose description of each component's intent, especially the must-have affordances. Reference the UX philosophy's feature mapping so a renderer knows what each piece does in the chat-with-live-ledger model.
8. `## Do's and Don'ts` — Lift the design-direction's key principles into explicit guardrails (e.g., "no spinners between speech end and capture card"; "ledger peek never collapses on chat scroll").

## Workflow

1. Read `03-design-direction.md` and `01b-ux-philosophy.md` from the active PRD directory.
2. Extract: mood keywords, named inspirations, key principles, must-have affordances, and the feature → screen mapping.
3. Create the `stitch/` subdirectory if missing.
4. Generate the 5 variations following the strategy above. Keep all 5 faithful to the **mood, principles, and must-have affordances**; vary only the open dimensions.
5. For each file, ensure the YAML front matter parses as valid YAML and the markdown body uses the canonical section order.
6. After writing, list the 5 file paths in the final response so the user can open them.

## Requirements

- **No invention beyond the brief.** Every choice must trace back to a phrase in the design-direction or ux-philosophy. If something is genuinely undefined, state the assumption explicitly inside the variation's `## Overview`.
- **Be specific.** No placeholder hex (`#XXXXXX`) or `TBD` typography. Each variation ships with concrete, usable tokens.
- **Respect the spec.** Hex format, dimension units, token reference syntax (`{path.to.token}`), and component property names must match the Google Stitch `design.md` schema.
- **One variation per file.** Do not combine variations or write a comparison file.
- **Lift constraints verbatim.** When the design-direction names a hard rule (e.g., "no spinners", "ledger peek persists above the composer"), copy it into `## Do's and Don'ts` of every variation — these are product-level constraints, not stylistic choices.

## Example variation header

```yaml
---
version: alpha
name: Ben — Linear Warm
description: Anchor variation. Linear's precision softened with friendly radii and a warm neutral surface.
colors:
  primary: "#1F2937"
  ...
---

## Overview

This is the **anchor variation** — the most literal read of the design direction.
Linear-adjacent precision (tight type, restrained color, calm transitions) softened
by warmer neutrals and slightly larger corner radii, per the "soften" directive in
`03-design-direction.md`.
```
