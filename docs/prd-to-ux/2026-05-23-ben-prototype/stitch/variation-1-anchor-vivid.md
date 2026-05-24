---
version: alpha
name: Ben — Anchor Vivid
description: Anchor variation. Linear's modernity and restraint, expressed through Ben's own vivid, grown-up palette — not Linear's monochrome.
colors:
  primary: "#3D5AFE"
  secondary: "#FF7A59"
  tertiary: "#19B584"
  neutral: "#F4F2EE"
  surface: "#FBFAF7"
  surfaceMuted: "#EEEAE3"
  textPrimary: "#1A1A1F"
  textSecondary: "#5A5A66"
  accent: "#9A6BFF"
  success: "#19B584"
  warning: "#F2A93B"
  error: "#E4523B"
typography:
  h1:
    fontFamily: "Inter"
    fontSize: "1.75rem"
    fontWeight: 650
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
    letterSpacing: "0.01em"
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
    textColor: "{colors.surface}"
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
    backgroundColor: "{colors.surfaceMuted}"
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
    size: "56px"
  mic-button-recording:
    backgroundColor: "{colors.error}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.md}"
    size: "56px"
  send-arrow:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
    size: "40px"
  message-bubble-user:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  message-bubble-ben:
    backgroundColor: "{colors.surfaceMuted}"
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

This is the **anchor variation** — the most literal read of `03-design-direction.md`. It honors the *modernity* of Linear (precision of type hierarchy, calm spacing, considered transitions) but expresses Ben's own identity through a vivid, grown-up palette rather than Linear's near-monochrome system. The primary is an electric indigo-blue that is decisively *not* Linear's blue, paired with a warm coral secondary and a confident green for completion states. The neutral is a warm bone (not Linear's cool grey) so the surface reads human, not corporate.

**Assumption stated explicitly:** Where the design-direction said "Linear-like," this variation reads that as a *feel of modernity*, not a visual copy. The palette is invented for Ben; the precision is borrowed from Linear.

## Colors

- **Primary (Electric Indigo `#3D5AFE`)** — Ben's signature. Modern, confident, distinct from Linear's blue. Anchors the mic button, send-arrow, primary CTA, and user message bubble.
- **Secondary (Warm Coral `#FF7A59`)** — The warmth Linear refuses to allow itself. Used for the reminder accent and capture-card highlights so reminders feel human and time-bound, not bureaucratic.
- **Tertiary (Confident Green `#19B584`)** — Completion, "fired" state, task done. Grown-up green, not crayon-green.
- **Accent (Friendly Purple `#9A6BFF`)** — Hover and emphasis state for the primary. Lifts the palette out of pure utilitarianism.
- **Neutral / Surface (Warm Bone `#FBFAF7` / `#F4F2EE`)** — The single biggest divergence from Linear. Ben's canvas is a warm off-white, not a cool grey. The product should feel like paper lit by warm light, not a dashboard.
- **Text (Near-Black `#1A1A1F` / Slate `#5A5A66`)** — Contrast-first, never pure black.
- **Status (`#19B584` / `#F2A93B` / `#E4523B`)** — Saturated and unambiguous; legible at glance distances on the ledger peek.

## Typography

- **Inter** as the system face. Modern, neutral, infinite weights, and tuned for screen rendering — the right pick when the personality must live in copy rather than letterforms.
- Tight letter-spacing on headings (`-0.02em` → `-0.01em`) borrows Linear's optical confidence. Body type sits at a friendly 15–17px so the friend-tone copy never feels cramped.
- **JetBrains Mono** for any transcript timestamps or technical metadata in detail sheets — adds a quiet "this is a tool, not a toy" cue.
- Weight choices avoid extremes: 450 for body (slightly heavier than 400 for warmth on warm surfaces), 600–650 for headings (firm without being shouty).

## Layout

- **Mobile-first composition.** Composer pinned to the bottom safe area; ledger peek strip sits directly above it and **never collapses on chat scroll**.
- **Spacing scale (4 / 8 / 12 / 20 / 32 / 48 px)** — derived from a 4px base. The `md = 12px` step is the workhorse for component internals; `lg = 20px` separates major regions.
- **Safe area handling for iOS Safari**: the composer + peek live above the home-indicator inset; when the soft keyboard is up, the peek may compress but the composer must remain reachable above the keyboard.
- **One column, edge-to-edge** on phones; padded gutters (`spacing.lg`) on tablets/desktop without ever widening the chat column past a comfortable reading measure.

## Elevation & Depth

- **Tonal elevation** preferred over heavy shadows — capture cards and the ledger drawer sit on a slightly lighter or differently-tinted surface relative to the chat background, supported by a 1px hairline border at low contrast.
- **One soft shadow tier** (used only on the mic button and the expanded ledger drawer) suggests a tappable, lifted affordance — never bloomy, never theatrical.
- The optimistic capture card uses **opacity + a 1px dashed-tone border** for its pending state, not a spinner — see Do's and Don'ts.

## Shapes

- **`rounded.sm = 8px`** for inline pills (tab chips, status badges).
- **`rounded.md = 14px`** for cards, capture cards, message bubbles. Friendlier than Linear's tighter corners, but not toy-soft.
- **`rounded.lg = 20px`** for the composer container and the ledger drawer. The drawer's top-corner radius is what signals "draggable, soft surface."
- **`rounded.full`** reserved for the mic button, send-arrow, tab chips, and avatar dots.

## Components

- **Composer + Mic** — Anchored to the bottom; the mic is a 56px circular primary-color button on the trailing edge — the visually dominant action on the empty state. Press-and-hold flips it to the recording state (error-red `#E4523B`) and reveals the overlay above with waveform, timer, and "slide left to cancel" hint.
- **Send-arrow** — Replaces the mic visually when the user has entered text. Same color, smaller (40px), same shape language.
- **Message bubbles** — User bubbles use primary on surface (white text on indigo); Ben bubbles use the muted warm surface with primary text. Friend tone lives in the copy, not in a chat-avatar gimmick.
- **Capture cards (Note / Reminder / Task)** — Inline inside Ben's reply bubble. Note uses neutral surface + body-md. Reminder gets a coral accent on its time chip. Task uses the green checkbox affordance on the leading edge. All three share the same card chassis; the type indicator is a small label (text, not iconography) per Step 4 deferral.
- **Pending capture card** — Same chassis, surface set to `surfaceMuted`, text to `textSecondary`, dashed-tone 1px border. The card is on-screen the instant Ben's reply renders; it crisps to fully populated on save.
- **Ledger peek** — A single-line surface card pinned above the composer. Content varies by state ("Up next: `{title}` `{rel}`" → count summary → empty label). Tap or drag-up to expand.
- **Ledger drawer (expanded)** — Sheet over the chat with three pill-style tabs (Reminders / Tasks / Notes). Active tab uses primary background; inactive tabs use surface. Rows are tap-targets opening Item detail.

## Do's and Don'ts

- **Do** show the capture card **the instant the user stops speaking** — the pending state is visual (fade + dashed border), never a spinner. *(From `03-design-direction.md`: "no spinners between 'user finishes speaking' and 'Ben's confirmation card is on screen.'")*
- **Do** keep the ledger peek persistent above the composer; it must **not** collapse on chat scroll. The only allowed compression is when the soft keyboard is up, and only if mobile-Safari vertical constraints force it.
- **Do** keep press-and-hold mic as the dominant composer action on the empty state. Text input is reachable but must not compete visually with voice.
- **Don't** copy Linear's color system. This palette is vivid and warm by design — that is the brief, not a deviation.
- **Don't** introduce mascot illustrations, animated avatars, or "personality flourishes" that perform warmth. Warmth lives in copy and micro-moments.
- **Don't** add an inline edit affordance on capture cards — v1 corrections happen by telling Ben in chat.
- **Don't** use the primary color as a generic "Bootstrap blue" everywhere. Reserve it for the mic, send-arrow, primary CTA, user bubble, and the active ledger tab.
