---
version: alpha
name: Ben — Sharp Citrus
description: Sharper variation. Tighter type, smaller radii, cooler off-white surface — modernity pushed to its precise edge, but anchored by a vivid citrus-green primary that prevents the system from sliding into Linear-monochrome.
colors:
  primary: "#7CD11F"
  secondary: "#FF4D6D"
  tertiary: "#22C2A0"
  neutral: "#EFF1ED"
  surface: "#F8F9F6"
  surfaceMuted: "#E4E7E2"
  textPrimary: "#0F1410"
  textSecondary: "#525A52"
  accent: "#0FAA60"
  success: "#22C2A0"
  warning: "#FFB020"
  error: "#FF4D6D"
typography:
  h1:
    fontFamily: "Geist"
    fontSize: "1.6875rem"
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: "-0.025em"
  h2:
    fontFamily: "Geist"
    fontSize: "1.3125rem"
    fontWeight: 600
    lineHeight: 1.22
    letterSpacing: "-0.02em"
  h3:
    fontFamily: "Geist"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.28
    letterSpacing: "-0.015em"
  body-lg:
    fontFamily: "Geist"
    fontSize: "1rem"
    fontWeight: 450
    lineHeight: 1.45
    letterSpacing: "-0.005em"
  body-md:
    fontFamily: "Geist"
    fontSize: "0.9063rem"
    fontWeight: 450
    lineHeight: 1.45
    letterSpacing: "-0.003em"
  body-sm:
    fontFamily: "Geist"
    fontSize: "0.8125rem"
    fontWeight: 450
    lineHeight: 1.4
    letterSpacing: "0em"
  caption:
    fontFamily: "Geist"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.015em"
  mono:
    fontFamily: "Geist Mono"
    fontSize: "0.8125rem"
    fontWeight: 450
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  sm: 6px
  md: 10px
  lg: 14px
  full: 9999px
spacing:
  xs: 4px
  sm: 6px
  md: 10px
  lg: 16px
  xl: 28px
  2xl: 44px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  button-primary-disabled:
    backgroundColor: "{colors.surfaceMuted}"
    textColor: "{colors.textSecondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  composer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  composer-input:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  mic-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.md}"
    size: "52px"
  mic-button-recording:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.md}"
    size: "52px"
  send-arrow:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
    size: "38px"
  message-bubble-user:
    backgroundColor: "{colors.textPrimary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  message-bubble-ben:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  capture-card-note:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  capture-card-reminder:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  capture-card-task:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  capture-card-pending:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.textSecondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  ledger-peek:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  ledger-drawer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  ledger-tab-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
  ledger-tab-inactive:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textSecondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
  checkbox-task:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs}"
    size: "18px"
---

## Overview

This is the **sharper variation** — pushes the "modern/restrained" axis as far as it can go *without* violating the no-monochrome guardrail. Tight type tracking, smaller radii, a cool-leaning off-white surface, and a precise spacing scale. The risk in pushing sharpness is sliding into "Linear with friendlier copy" — this variation defends against that with a **vivid citrus-green primary** that is unmistakably its own identity. The green carries the personality so the chrome can stay disciplined.

**Assumption stated explicitly:** "Sharper" is interpreted as a tightening of typography, radii, and spacing — never as a desaturation of color. The palette stays vivid; only the geometry sharpens.

## Colors

- **Primary (Citrus `#7CD11F`)** — A confident, electric green. Carries enough chroma that it cannot be mistaken for Linear's monochrome system. Used on the mic, send-arrow, primary CTA, and active ledger tab. Pairs with dark text rather than white to keep its identity.
- **Secondary / Error (Cherry `#FF4D6D`)** — A vivid pink-red for the recording state and error states. The single warmest hue in the palette; deliberately bold so destructive/recording moments feel emphatic without being scary.
- **Tertiary (Mint Teal `#22C2A0`)** — Completion / success. Sits in the green-family with the primary but on the cool side so they read distinct.
- **Accent (Deep Green `#0FAA60`)** — Primary hover, also the task-checkbox check color. Darkens the citrus on interaction.
- **Surface (`#F8F9F6`) / Neutral (`#EFF1ED`) / SurfaceMuted (`#E4E7E2`)** — Three steps of a *very slightly* green-leaning off-white. Cooler than Anchor's warm bone, but **never pure grey** — the green undertone is the connective tissue with the citrus primary.
- **Text (`#0F1410` / `#525A52`)** — Near-black with the faintest green undertone; harmonizes with the surface.

## Typography

- **Geist** (and **Geist Mono**) as the system family. Modern, geometric, screen-tuned, neutral letterforms — ideal when the geometry needs to feel exacting.
- **Aggressive negative letter-spacing on headings (`-0.025em` → `-0.015em`)** — this is where the "Linear-like precision" cue is paid down. Headings feel decisive.
- Body type at `0.9063rem` (≈14.5px) — denser than Anchor, the densest of the five variations. Reading rhythm is faster, more tool-like.
- Body weight at 450 stays neutral on the cool surface.

## Layout

- **Tightest spacing scale (4 / 6 / 10 / 16 / 28 / 44 px)** — every step a notch tighter than Anchor. Composition feels exacting, not cramped.
- **Mobile-first.** Composer pinned to bottom safe area; ledger peek persists above it. **Peek does not collapse on chat scroll.**
- **Smaller hit targets** but never below the 44×44 platform minimum — mic at 52px, send-arrow at 38px (with extended invisible touch padding).
- **Soft keyboard handling**: peek may compress only when iOS Safari vertical space genuinely forces it.

## Elevation & Depth

- **Tonal elevation only.** No drop shadows on cards or bubbles. Cards differentiate from the chat background by sitting on `surface` while the chat scrolls behind on `neutral`, with a 1px border at low contrast.
- The mic button gets a **single very-subtle shadow** to read as the tappable primary affordance. Recording state replaces shadow with a subtle outer glow tinted cherry — color carries state, not lift.
- **Pending capture card** uses a dashed 1px border in `textSecondary` + opacity reduction. Never a spinner.

## Shapes

- **`rounded.sm = 6px`** for chips, pills, status badges. The tightest in any variation.
- **`rounded.md = 10px`** for cards, bubbles, capture cards. Restrained — borders read as "designed," not "friendly."
- **`rounded.lg = 14px`** for composer and ledger drawer. Still has identity, doesn't sit at the boring rectangle line.
- **`rounded.full`** for mic, send-arrow, tab chips.

## Components

- **Composer + Mic** — The mic is 52px citrus-green; the brightest single element on screen at empty state. Pressing and holding swaps it to cherry for the recording state with the overlay above (waveform, timer, slide-left-to-cancel hint).
- **Send-arrow** — Replaces mic only when text is entered. 38px, citrus-green with dark text. Same shape family.
- **Message bubbles** — User bubble is **near-black on near-white** (high contrast, anti-blue tradition). Ben's bubble is `neutral`. The chat rhythm is graphic and precise — the citrus lives in the composer and ledger affordances, not in the message bubbles, so the chat reads calm.
- **Capture cards** — All three share the same card chassis. Type label is a small caption-sized text label. Reminder time chip uses a citrus background with dark text for emphasis. Task checkbox is 18px (smaller than other variations), checked state uses the deep-green accent.
- **Pending capture card** — `neutral` surface, dashed 1px low-opacity border, body text at `textSecondary`.
- **Ledger peek** — Sits above the composer. Compact padding (`md = 10px`). Tight typography. Single line. Drag handle is a 2px hairline.
- **Ledger drawer (expanded)** — `rounded.lg = 14px` top corners — sharper than the other variations. Active tab pill is citrus-green; inactive pills are surface with secondary text. Rows are dense and tap-friendly.

## Do's and Don'ts

- **Do** show the capture card **the instant the user stops speaking**. The pending state is visual (dashed border + faded text), never a spinner.
- **Do** keep the ledger peek persistent above the composer; **never** collapse on chat scroll.
- **Do** use the citrus primary to carry identity. It is the load-bearing reason this sharp system does not collapse into Linear-clone territory.
- **Don't** desaturate the palette to "match" the tight geometry. The whole point of this variation is that vivid color + precise geometry can coexist. Pulling green chroma would violate the brief.
- **Don't** add a second saturated hue beyond citrus, cherry, and mint. Three vivid hues is the cap — more would jeopardize the modern read.
- **Don't** use Linear's blue as the primary or anywhere as a "safe modern color." The whole point of choosing citrus is to *not* be that.
- **Don't** add mascot or illustrative elements. This variation's mood is exacting; whimsy belongs in copy.
- **Don't** support inline editing on capture cards in v1.
