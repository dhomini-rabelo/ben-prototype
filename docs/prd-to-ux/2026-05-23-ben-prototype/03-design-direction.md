# Design Direction — Ben v1

## Mood & Personality

Playful and alive, but modern and human. Ben should feel like a contemporary, well-made software tool that happens to have a soul — not a mascot, not a toy. Picture the feel of a sharp modern productivity app whose edges have been softened by warmth: friendly type, considered spacing, occasional small moments of character (a phrasing in copy, a satisfying card animation when something is filed) — never loud, never demanding attention.

The product wears its software-ness lightly. It's clearly an app, but the personality lives in the friend-tone copy and in the small, well-crafted moments — never in showy chrome.

## Tone

Modern and human. A blend of contemporary visual confidence (clean, fast, restrained — Linear-adjacent) with warmth (softer surfaces, friendly type weight, generous breathing room). Not bubbly. Not cheeky. Not clinical. The wrapper has quiet character; the content stays legible and calm.

Copy is friend-tone (slang allowed, warmth required), but visual language is restrained — the writing is where the personality is loudest.

## Inspirations

- **Linear** — sharp, fast, beautifully restrained. Modern density, precise type, calm color, considered animations. The closest visual anchor for Ben.
  - Borrow: precision of type hierarchy, restraint in color, calmness of state transitions, the sense that every pixel was decided.
  - Soften: Linear is a tool for teams; Ben is a tool for one person captured in a friendly moment. Add warmth Linear doesn't have — slightly softer surfaces, friendlier corner radii, a touch more humanity in the type.

## Key Principles

- **Personality without performance.** Ben's warmth lives in copy and micro-moments, not in loud animations, mascots, or visual noise. The product feels human but never demands attention. If a flourish doesn't reward the user, it doesn't ship.
- **Trust through visible state.** The user must always see what Ben did with their input. No silent successes, no buried confirmations. Optimistic feedback is non-negotiable — the capture card appears the instant the user finishes speaking, persistence happens underneath, and any failure surfaces inline with a clear recovery path.

## Must-Have Affordances

- **Press-and-hold mic as the dominant composer action.** The mic is the primary, visually-anchored affordance on the composer. The send-arrow / text input is the same composer in a secondary mode — text is always reachable, but never visually competing with voice on the empty state.
- **Optimistic capture cards.** No spinners between "user finishes speaking" and "Ben's confirmation card is on screen." The pending-save state is a subtle indicator within the card (faded border or tiny pending dot), never a blocker. The user should feel like Ben heard them instantly.
- **Always-visible ledger peek.** The drawer peek persists above the composer. It does not collapse on chat scroll. The only state in which it may compress or hide is when the soft keyboard is up — and even then, only if vertical-space constraints on mobile Safari force it. "What's coming up" should always be one glance away.

---

_No hex codes, dp values, component trees, or framework-specific terms in this file. Inspirations are referenced by feel, not by component spec. Renderers should interpret "Linear-like" as a mood, not a clone instruction._
