---
version: alpha
name: Ben — Editorial Ink
description: Editorial variation. A typographic serif headline voice paired with a confident sans body, on a warm ivory surface — modernity expressed through editorial restraint, with a saturated berry primary and aubergine accents.
colors:
  primary: "#B5305F"
  secondary: "#E58F2C"
  tertiary: "#2F8F7A"
  neutral: "#F2EDE4"
  surface: "#FAF6EE"
  surfaceMuted: "#E8E2D5"
  textPrimary: "#1B1816"
  textSecondary: "#5E564E"
  accent: "#4A2A55"
  success: "#2F8F7A"
  warning: "#E58F2C"
  error: "#C03B22"
typography:
  h1:
    fontFamily: "Fraunces"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Fraunces"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  h3:
    fontFamily: "Fraunces"
    fontSize: "1.1875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "Inter"
    fontSize: "1.0625rem"
    fontWeight: 450
    lineHeight: 1.55
    letterSpacing: "0em"
  body-md:
    fontFamily: "Inter"
    fontSize: "0.9375rem"
    fontWeight: 450
    lineHeight: 1.55
    letterSpacing: "0em"
  body-sm:
    fontFamily: "Inter"
    fontSize: "0.8125rem"
    fontWeight: 450
    lineHeight: 1.45
    letterSpacing: "0em"
  caption:
    fontFamily: "Inter"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.02em"
  mono:
    fontFamily: "JetBrains Mono"
    fontSize: "0.8125rem"
    fontWeight: 450
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  sm: 8px
  md: 12px
  lg: 18px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 14px
  lg: 24px
  xl: 36px
  2xl: 56px
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
    size: "56px"
  mic-button-recording:
    backgroundColor: "{colors.accent}"
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
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
  ledger-tab-inactive:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textSecondary}"
    typography: "{typography.caption}"
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

This is the **editorial variation** — leans into typographic personality. Ben's name, headings, capture-card titles, and empty-state copy are set in **Fraunces** (a contemporary serif with optical sizing); body and UI labels use **Inter**. The pairing borrows from indie editorial products (Robin Sloan's newsletters, the better Substack/Ghost themes) — modern, considered, opinionated about reading. The palette stays grown-up vivid with a confident berry primary and a deep aubergine accent, on a warm ivory canvas. This variation pushes the "personality lives in copy" principle the design-direction names — and adds the implication that *the typesetting of the copy* is itself a personality move.

**Assumption stated explicitly:** "Editorial typographic personality" is interpreted as a serif-for-display + sans-for-body system. The serif appears in moments where copy is meant to be read (headings, the welcome line, empty-state copy, capture-card titles) — not on dense interaction labels.

## Colors

- **Primary (Berry `#B5305F`)** — Saturated raspberry-magenta. Reads as confident and a little bookish. Anchors the mic, send-arrow, user bubble, and primary CTAs.
- **Secondary (Marigold `#E58F2C`)** — Warm orange for the reminder time chip — a magazine-pull-quote color, not a candy color.
- **Tertiary (Sage Teal `#2F8F7A`)** — Task completion / success. Sits comfortably against the ivory surface without screaming.
- **Accent (Aubergine `#4A2A55`)** — Deep purple-plum for hover and recording states. The "ink" in Editorial Ink — it grounds the warmer hues.
- **Surface (Ivory `#FAF6EE`) / Neutral (Parchment `#F2EDE4`) / SurfaceMuted (`#E8E2D5`)** — Warm paper. The brightest white reads as page; deeper neutrals read as a printed margin or pull-quote box.
- **Text (Ink Black `#1B1816` / Walnut `#5E564E`)** — Brown-leaning blacks chosen to look like ink on paper, not pixels on glass.

## Typography

- **Fraunces** for h1/h2/h3 — a modern serif with strong personality at display sizes, but never gimmicky. Its optical sizing keeps it readable.
- **Inter** for body, captions, labels — a clear, neutral counterweight so the serif doesn't have to do all the work. The serif/sans contrast is the variation's signature.
- **JetBrains Mono** for transcript timestamps in detail sheets — quiet, technical, grounding.
- Body type at `0.9375rem` with `1.55` line-height — set for reading, not just scanning.
- Heading sizes are slightly larger than other variations (h1 at `2rem`) — the typesetting deserves room.

## Layout

- **Generous spacing scale (4 / 8 / 14 / 24 / 36 / 56 px)** — editorial layouts breathe. The chat has clear gutters and the ledger drawer has real margins.
- **Mobile-first.** Composer pinned to bottom safe area; ledger peek persists above it. **Peek does not collapse on chat scroll.**
- **Single-column reading rhythm** — message bubbles take comfortable measure, never edge-to-edge on phones.
- **Soft keyboard handling**: peek may compress only when iOS Safari vertical space genuinely forces it.

## Elevation & Depth

- **No drop shadows.** Tonal-only elevation — capture cards and the ledger drawer sit on ivory `surface` with a 1px low-contrast hairline border, like a card laid on paper.
- The mic button is the **single exception**: a very soft shadow gives it tappable lift. Recording state replaces the shadow with an aubergine tonal halo.
- **Pending capture card** uses a 1px dashed border in `textSecondary` at low opacity. Never a spinner.

## Shapes

- **`rounded.sm = 8px`** for pills and chips.
- **`rounded.md = 12px`** for cards, capture cards, message bubbles. Restrained enough to feel editorial, soft enough to feel human.
- **`rounded.lg = 18px`** for composer and ledger drawer. Distinct soft-sheet identity for the drawer.
- **`rounded.full`** for mic, send-arrow, tab chips, dots.

## Components

- **Composer + Mic** — Mic is a 56px berry circle on the trailing edge of the composer. Recording state shifts to aubergine. The overlay above shows waveform, timer, and the "slide left to cancel" hint set in the body sans.
- **Send-arrow** — 40px, berry, replaces mic visually only when text is entered.
- **Message bubbles** — User: ivory on berry. Ben: ink on parchment. Ben's friend-tone copy is set in Inter body — the serif is reserved for moments that frame reading (welcome line, capture titles, empty states).
- **Capture cards** — Capture title is set in **Fraunces h3** — this is the editorial signature inside each card. Body preview uses Inter body-sm. The type label (Note / Reminder / Task) is a caption-sized sans label. Reminder time chip uses marigold. Task checkbox uses sage teal when checked.
- **Pending capture card** — Same chassis, surfaceMuted background, dashed border, body at textSecondary.
- **Ledger peek** — Pinned above composer. "Up next" label set in caption sans; the upcoming title can lean on Fraunces at body-lg size to anchor the eye when present. Single line; never collapses on scroll.
- **Ledger drawer (expanded)** — Tab labels set in `caption` (small, all-caps-leaning sans). Section headings inside tabs ("Upcoming" / "Fired" / "Done") use Fraunces h3. Row titles use Inter body-md.
- **Empty states** — Friend-tone copy gets a brief Fraunces serif moment ("nothing on deck — Ben's listening") so empty states feel composed rather than apologetic.

## Do's and Don'ts

- **Do** show the capture card **the instant the user stops speaking**. The pending state is visual (dashed border + faded surface), never a spinner.
- **Do** keep the ledger peek persistent above the composer; **never** collapse on chat scroll.
- **Do** restrict Fraunces to headings, capture titles, empty states, and welcome moments. Letting it bleed into dense UI labels makes the system feel costume-y.
- **Do** keep berry, marigold, sage, and aubergine as the only saturated hues. The editorial restraint depends on a small palette used confidently.
- **Don't** use the serif for interaction labels, button text, or timestamps — those are sans territory. Serifs in chrome read as twee.
- **Don't** desaturate to "match the editorial vibe." Editorial design uses confident color (think New York Magazine, MIT Technology Review); pastels and grey would betray the brief.
- **Don't** copy Linear's design or palette. The reference is for modernity (precision of spacing, calm transitions) only.
- **Don't** add mascot illustrations. The typographic system *is* the personality.
- **Don't** support inline editing on capture cards in v1.
