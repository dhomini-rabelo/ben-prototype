---
version: alpha
name: Ben — Blue Primary
description: Dark-first variation built around a real, visible dark blue with an electric blue as the PRIMARY action color. Complementary accents (warm coral, teal) sit in the supporting role. The system is unapologetically a blue product.
colors:
  primary: "#3D8AFE"
  secondary: "#FF8A65"
  tertiary: "#22D3CE"
  neutral: "#1B3D7A"
  surface: "#0F2A5C"
  surfaceMuted: "#1B3D7A"
  textPrimary: "#EEF3FB"
  textSecondary: "#A8BCDC"
  accent: "#5AB8FF"
  success: "#22D3CE"
  warning: "#FFC857"
  error: "#FF6B6B"
typography:
  h1:
    fontFamily: "Inter"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Inter"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  h3:
    fontFamily: "Inter"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "Inter"
    fontSize: "1.0625rem"
    fontWeight: 450
    lineHeight: 1.5
    letterSpacing: "-0.005em"
  body-md:
    fontFamily: "Inter"
    fontSize: "0.9375rem"
    fontWeight: 450
    lineHeight: 1.5
    letterSpacing: "0em"
  body-sm:
    fontFamily: "Inter"
    fontSize: "0.8125rem"
    fontWeight: 450
    lineHeight: 1.4
    letterSpacing: "0em"
  caption:
    fontFamily: "Inter"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.015em"
  mono:
    fontFamily: "JetBrains Mono"
    fontSize: "0.8125rem"
    fontWeight: 450
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  sm: 8px
  md: 14px
  lg: 20px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 20px
  xl: 32px
  2xl: 48px
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
    backgroundColor: "{colors.surfaceMuted}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  composer:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  composer-input:
    backgroundColor: "{colors.surface}"
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
    size: "56px"
  mic-button-recording:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.md}"
    size: "56px"
  send-arrow:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
    size: "40px"
  message-bubble-user:
    backgroundColor: "{colors.accent}"
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
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  capture-card-reminder:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  capture-card-task:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  capture-card-pending:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textSecondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  ledger-peek:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  ledger-drawer:
    backgroundColor: "{colors.neutral}"
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
    textColor: "{colors.tertiary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs}"
    size: "20px"
---

## Overview

This is the **dark-first, blue-primary variation**. It is built around **real, visible dark blue** as the canvas (cobalt `#0F2A5C`) and **electric blue as the PRIMARY action color** (`#3D8AFE`). The system is unapologetically a blue product — four blues stack in the visual hierarchy (canvas → elevated → user bubble → primary), and the only non-blue colors are a single warm coral for time-sensitive moments (reminder chip, recording state) and a teal for completion. That's it. The brief is *blue you can see*, and blue is what carries the brand.

This is **not Linear's dark theme** (cool corporate grey + lone electric blue accent as decoration). Here, blue is not an accent — blue is the world, the brand, and the primary action. The warm and teal hues are *supporting cast*, present only because pure-blue monochrome would feel monotone.

**Assumption stated explicitly:** "Blue primary, others second" is interpreted as: blue is everything load-bearing (canvas, surfaces, mic, send-arrow, CTA, active tab, user bubble, primary text shadows). Coral and teal are functional accents only — used to differentiate moments that need warm contrast (reminders, recording, task-done).

## Colors

- **Surface (Cobalt Navy `#0F2A5C`)** — The canvas. The load-bearing dark blue. Saturated, visibly blue, dark enough to read as "dark mode" but never blue-black or grey.
- **Neutral / SurfaceMuted (Royal Blue `#1B3D7A`)** — One step up; elevated surface for capture cards, composer, Ben's message bubbles, and the ledger drawer. The lift comes from a brighter, more saturated blue — never a grey ramp.
- **Primary (Electric Cobalt `#3D8AFE`)** — **The PRIMARY**. Anchors the mic, send-arrow, primary CTA, and active ledger tab. This is Ben's signature interactive color — the one moment in the system where blue gets *vivid*. Against the dark canvas it pops without screaming. Distinct from Linear's purple-leaning blue.
- **Accent (Sky Blue `#5AB8FF`)** — Lighter sky-blue step. Used for primary hover and the **user message bubble**, so the user's own voice is the brightest blue in the chat rhythm.
- **Secondary (Warm Coral `#FF8A65`)** — The single warm hue in the system. Used for the **recording state** of the mic and the **reminder time chip**. Coral-on-cobalt is one of the highest-legibility color pairings — perfect for "this is time-sensitive" moments. Warm enough to feel human, restrained enough to not steal the show from the blues.
- **Tertiary (Teal `#22D3CE`)** — Task-done check color. Sits adjacent to the blue family (cyan-leaning) so it harmonizes; distinct enough to read as a different "completed" cue.
- **Warning (Honey `#FFC857`)** — Only for error/warning surfaces in the friend-tone error copy.
- **Error (Soft Red `#FF6B6B`)** — Reserved for true error states.
- **Text (Off-white `#EEF3FB` / Pale Slate Blue `#A8BCDC`)** — Cool off-white primary that sits naturally against cobalt; secondary text leans into the blue family so it doesn't punch out.

## Typography

- **Inter** as the system face.
- **JetBrains Mono** for metadata.
- Body weight 450 reads well against the navy surface; pure 400 thins out.
- Tight letter-spacing on headings (`-0.02em`) preserves modern precision.

## Layout

- **Spacing scale (4 / 8 / 12 / 20 / 32 / 48 px)** — same as Anchor.
- **Mobile-first.** Composer pinned to bottom safe area; ledger peek persists above it. **Peek does not collapse on chat scroll.**
- **OLED-friendly composition** — the navy is deep enough to benefit from true-black-pixel rendering on OLED without going pure `#000` (which would erase the blue identity).
- **Soft keyboard handling**: peek may compress only when iOS Safari vertical space genuinely forces it.

## Elevation & Depth

- **Elevation by blue tone, not shadow.** Cards, composer, and drawer sit on the brighter royal-blue step (`neutral` = `#1B3D7A`) above the cobalt canvas. The lift comes from a more saturated, lighter blue — never from a grey ramp.
- **Mic button gets a subtle electric-blue outer glow** (a brightened halo of the primary). Recording state replaces the glow with a warm coral halo — color carries the change.
- **Pending capture card** uses reduced opacity + a 1px dashed border in `textSecondary` at low contrast. Never a spinner.
- The recording overlay uses a slightly lighter blue step + coral glow — never a heavy modal scrim.

## Shapes

- **`rounded.sm = 8px`** for pills and chips.
- **`rounded.md = 14px`** for cards, capture cards, and message bubbles.
- **`rounded.lg = 20px`** for the composer container and ledger drawer.
- **`rounded.full`** for mic, send-arrow, tab chips, status dots.

## Components

- **Composer + Mic** — Mic is a 56px **electric-blue** circle (`#3D8AFE`) on the royal-blue composer, on the cobalt canvas. Three nested blues, with the mic as the brightest and most saturated — unmistakably the primary action. Press-and-hold flips it to **warm coral** for the recording state (the only warm moment in the system, signalling "something is happening *right now*"). Recording overlay above shows waveform, timer, slide-left-to-cancel.
- **Send-arrow** — 40px electric blue, replaces mic visually only when text is entered.
- **Message bubbles** — **User bubble: surface text on sky blue** (`#5AB8FF`). **Ben bubble: off-white text on royal blue** (`#1E4A8F`). Four blues stack across the screen: cobalt canvas → royal Ben bubble → sky user bubble → electric mic. The chat rhythm itself becomes the dark-blue brand.
- **Capture cards** — Card chassis is royal blue on cobalt. **Reminder time chip uses warm coral** — the warm-on-cool pairing makes "up next" pop at a glance. Task cards use a **teal checkbox** when checked.
- **Pending capture card** — Cobalt-canvas surface (one step *darker* than other cards), dashed low-opacity border, body at textSecondary.
- **Ledger peek** — Royal blue card pinned above the composer. The upcoming title is off-white; the relative-time chip is coral. Never collapses on scroll.
- **Ledger drawer (expanded)** — Royal blue sheet with `rounded.lg` top corners. Active tab: **electric blue** with off-white text (the active tab is the brightest blue in the system, signalling current section). Inactive tabs: cobalt with pale slate-blue text.

## Do's and Don'ts

- **Do** show the capture card **the instant the user stops speaking**. The pending state is visual (dashed border + faded card), never a spinner.
- **Do** keep the ledger peek persistent above the composer; **never** collapse on chat scroll.
- **Do** preserve the cobalt saturation. The canvas must read **BLUE at a glance** — if a designer opens it and thinks "that's dark grey" or "that's almost black," the variation has failed. Confirm the H value sits firmly in the blue family.
- **Do** stack four blues across the visual hierarchy: cobalt canvas → royal Ben bubble & cards → sky user bubble → electric mic/primary. The blue-on-blue layering is what makes this a *blue product*, not a dark product that happens to use blue.
- **Do** keep blue as the load-bearing primary. The mic, send-arrow, primary CTA, and active ledger tab are all electric blue. The user should never wonder "what's the brand color of this product."
- **Do** restrict warm coral to two specific roles only: the **recording state of the mic** and the **reminder time chip**. Coral is *the* warm-contrast moment; spreading it dilutes the signal.
- **Do** use teal for task-completion only. It's the second non-blue cue, and its job is to differentiate "done" from "in flight."
- **Don't** darken the canvas toward midnight or black "for elegance." Darker = greyer = Linear-dark. The brief is *blue you can see*.
- **Don't** copy Linear's dark theme or Linear's blue (`#5E6AD2`) anywhere. The blues here are more saturated and warmer-leaning by design.
- **Don't** introduce a fourth non-blue hue. The palette is: four blues + coral + teal (+ functional warning/error). That's the cap.
- **Don't** use the warm coral as a decorative accent on cards, headers, or labels. It is functional only.
- **Don't** use pure black or pure white text. Cool off-white harmonizes with cobalt.
- **Don't** add mascot or illustrative elements. On a saturated-blue canvas these read especially toy-like.
- **Don't** support inline editing on capture cards in v1.
