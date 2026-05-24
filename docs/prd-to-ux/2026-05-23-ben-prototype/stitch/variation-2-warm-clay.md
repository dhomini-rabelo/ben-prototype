---
version: alpha
name: Ben — Warm Clay
description: Warmer variation. Pushes the warmth axis with terracotta-and-cream surfaces, friendlier radii, and softer type — modernity expressed through hospitality, not austerity.
colors:
  primary: "#D9542B"
  secondary: "#E8A33D"
  tertiary: "#3E8E7E"
  neutral: "#F2E9DD"
  surface: "#FBF5EC"
  surfaceMuted: "#EFE4D2"
  textPrimary: "#231A14"
  textSecondary: "#6B5A4A"
  accent: "#8C5BB7"
  success: "#3E8E7E"
  warning: "#E8A33D"
  error: "#C04020"
typography:
  h1:
    fontFamily: "General Sans"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.22
    letterSpacing: "-0.015em"
  h2:
    fontFamily: "General Sans"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.28
    letterSpacing: "-0.01em"
  h3:
    fontFamily: "General Sans"
    fontSize: "1.1875rem"
    fontWeight: 600
    lineHeight: 1.32
    letterSpacing: "-0.005em"
  body-lg:
    fontFamily: "General Sans"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.55
    letterSpacing: "0em"
  body-md:
    fontFamily: "General Sans"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.55
    letterSpacing: "0em"
  body-sm:
    fontFamily: "General Sans"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0em"
  caption:
    fontFamily: "General Sans"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.015em"
  mono:
    fontFamily: "IBM Plex Mono"
    fontSize: "0.8125rem"
    fontWeight: 450
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  sm: 10px
  md: 18px
  lg: 26px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 14px
  lg: 22px
  xl: 36px
  2xl: 52px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  button-primary-hover:
    backgroundColor: "{colors.error}"
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
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.md}"
    size: "60px"
  mic-button-recording:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.md}"
    size: "60px"
  send-arrow:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
    size: "42px"
  message-bubble-user:
    backgroundColor: "{colors.primary}"
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
    backgroundColor: "{colors.surfaceMuted}"
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
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
  ledger-tab-inactive:
    backgroundColor: "{colors.neutral}"
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
    size: "22px"
---

## Overview

This is the **warmer variation** — pushes the "warmth" axis hardest while staying within the grown-up palette guardrail. The system is built on terracotta and cream: surfaces feel like sun-warmed paper, the primary is a confident clay-orange, and radii are larger to invite touch. Modernity is preserved through precise typography (General Sans), tonal restraint, and the same calm transitions Linear is loved for — just expressed through hospitality rather than austerity.

**Assumption stated explicitly:** "Warmth" is interpreted as both surface temperature (cream-base palette) and shape language (larger radii, larger hit targets). The grown-up guardrail is held by keeping saturation deep rather than pastel.

## Colors

- **Primary (Clay `#D9542B`)** — Confident, earthy terracotta. Reads as warmth without falling into orange-juice territory. Anchors the mic and primary CTAs.
- **Secondary (Honey `#E8A33D`)** — Warm amber for the reminder time chip and supporting emphasis. Pairs with the clay primary without competing.
- **Tertiary (Forest Teal `#3E8E7E`)** — Completion and task-done state. Deep enough to feel adult; green-leaning enough to read as success.
- **Accent (Plum `#8C5BB7`)** — Recording state and active drag affordances. Adds a third hue dimension so the palette isn't monotone-warm.
- **Surface (Cream `#FBF5EC`) / Neutral (Sand `#F2E9DD`) / SurfaceMuted (Toast `#EFE4D2`)** — Three steps of warm off-white. The chat background is the lightest; the ledger and capture-card sit at a marginally cooler step to give them definition.
- **Text (Espresso `#231A14` / Walnut `#6B5A4A`)** — Brown-leaning blacks that sit naturally on a cream surface. Pure-black text on cream looks harsh; this avoids that.

## Typography

- **General Sans** as the system face — geometric enough to feel modern, humanist enough to feel friendly. A more personable substitute for Inter without sliding into rounded-toy territory.
- **IBM Plex Mono** for technical metadata. Plex carries warmth that JetBrains Mono lacks — fits this variation's mood.
- Body weight bumped to 500 to compensate for the warm cream surface (lighter weights can wash out on warm backgrounds).
- Heading letter-spacing is less aggressive than the Anchor variation (`-0.015em` vs. `-0.02em`) — Linear's super-tight tracking would fight the warmth of this palette.

## Layout

- **More generous spacing scale (4 / 8 / 14 / 22 / 36 / 52 px)** — bigger steps than Anchor. The chat has more air. Reading rhythm is slower and calmer.
- **Mobile-first.** Composer pinned to bottom safe area; ledger peek persists above it. **Peek does not collapse on chat scroll.**
- **Bigger hit targets** — mic at 60px (vs. 56 in Anchor), checkbox at 22px. Warmth includes ergonomic generosity.
- **Soft keyboard handling**: peek may compress only when iOS Safari vertical space genuinely forces it.

## Elevation & Depth

- **No shadow drama.** Elevation is tonal — the capture card and ledger drawer sit on a marginally cooler step of the cream system, with a 1px low-contrast border. This reads as paper layered on paper, not glassmorphism.
- **One reserved soft shadow** on the mic button so it lifts visually from the composer surface. Subtle. The shadow disappears entirely in the recording state — the color shift carries the change instead.
- **Pending capture card** uses dashed border + reduced opacity — never a spinner.

## Shapes

- **`rounded.sm = 10px`** for pills and chips.
- **`rounded.md = 18px`** for cards and bubbles. Noticeably softer than Anchor (`14px`) — the dominant signal of this variation's warmth.
- **`rounded.lg = 26px`** for the composer container and ledger drawer. Pillow-soft, but still tool-like.
- **`rounded.full`** for mic, send-arrow, tab chips, status dots.

## Components

- **Composer + Mic** — Mic is the largest single element on the composer (60px clay-orange circle). Recording state shifts the mic to plum and reveals the overlay above with waveform, 0:00 / 0:30 timer, and "slide left to cancel."
- **Send-arrow** — Replaces mic visually only when text is entered. 42px, clay-orange. Same radius family.
- **Message bubbles** — User bubble: cream on clay. Ben bubble: espresso text on sand. The contrast between them carries the conversation rhythm.
- **Capture cards** — Each card sits on `surface` with a 1px border in `surfaceMuted`. Reminder cards get a honey-amber time chip. Task cards lead with a 22px checkbox that uses forest teal when checked.
- **Pending capture card** — `surfaceMuted` background, dashed 1px border in `textSecondary` at low opacity. Crisps to populated on save.
- **Ledger peek** — Pinned above composer; rounded `lg` for a soft-drawer-handle feel. Single-line content. Drag handle visible above the peek content.
- **Ledger drawer (expanded)** — Top-corner radii at `lg` (26px) — the strongest "this is a soft sheet" signal in the design. Tab pills use clay primary when active, sand when inactive.

## Do's and Don'ts

- **Do** show the capture card **the instant the user stops speaking**. The pending state is visual (dashed border + faded surface), never a spinner.
- **Do** keep the ledger peek persistent above the composer; **never** collapse on chat scroll.
- **Do** lean on tonal warmth — let the palette do the personality work so copy can stay calm and the writing carries the loud personality.
- **Don't** push warmth into pastel territory. Saturation stays deep; this is terracotta, not peach. If a renderer wants to "soften further," they should soften shapes, not desaturate colors.
- **Don't** treat the radii as "rounded for friendliness" license to grow buttons or paddings beyond the scale. Warmth is in tone and rhythm, not in oversize chrome.
- **Don't** add mascot illustrations or "personality flourishes." Warmth is in the palette and copy.
- **Don't** support inline editing on capture cards — corrections happen by telling Ben in chat (v1 constraint).
- **Don't** copy Linear's design or color system. This is Ben's warm clay world; Linear's reference is for modernity only.
