# Design Direction — Ben v1

## Mood & Personality

Playful and alive, but modern and human. Ben should feel like a contemporary, well-made software tool that happens to have a soul — not a mascot, not a toy. Picture the feel of a sharp modern productivity app whose edges have been softened by warmth: friendly type, considered spacing, occasional small moments of character (a phrasing in copy, a satisfying card animation when something is filed) — never loud, never demanding attention.

The product wears its software-ness lightly. It's clearly an app, but the personality lives in the friend-tone copy and in the small, well-crafted moments — never in showy chrome.

## Tone

Modern and human. A blend of contemporary visual confidence (clean, fast, restrained — Linear-adjacent) with warmth (softer surfaces, friendly type weight, generous breathing room). Not bubbly. Not cheeky. Not clinical. The wrapper has quiet character; the content stays legible and calm.

Copy is friend-tone (slang allowed, warmth required), but visual language is restrained — the writing is where the personality is loudest.

## Inspirations

- **Linear (as a *modernity* reference — NOT a visual clone)** — sharp, fast, beautifully restrained. We reference Linear for its *feel* of being a contemporary, considered, modern tool. **We are explicitly not copying Linear's design language or its near-monochrome palette.**
  - Borrow from Linear: precision of type hierarchy, calmness of state transitions, considered spacing, the sense that every pixel was decided, the absence of visual noise.
  - Do **not** borrow from Linear: its cool/desaturated color system, its dark-grey-on-near-black palette, its team-tool austerity, its iconography.
  - Where Ben diverges hard: Ben is a one-person, friend-tone product. Where Linear uses near-monochrome grays and electric blue as the lone accent, Ben uses a **vivid but grown-up palette** (see "Color Direction" below). Where Linear's surfaces are corporate-cool, Ben's are warmer and more human.

## Color Direction

**The single most important guardrail in this document.** Ben's color system should feel **alive and friendly, but adult.** Vivid, saturated hues are encouraged — but they must read as a confident product palette, not a consumer toy or a child's app.

- **Yes:** Saturated, modern hues (think considered greens, warm corals, deep ambers, friendly purples) used with restraint. Color carries meaning (reminder vs. task vs. note can have distinct hues). A primary accent that feels human and warm, not corporate-blue.
- **No:** Pastel-soup palettes, candy-bright primary-school colors, rainbow gradients, Memphis-style chaos, anything that feels like a kids' app or a wellness mascot brand.
- **No:** A monochrome or near-monochrome system. Even the "sharpest" variation must have real color presence — Ben is not greyscale-with-an-accent. If a variation reads as "Linear with friendlier copy," it has failed the brief.
- **No:** Default to Linear's blue (#5E6AD2 and neighbors) as the primary. Pick something that signals Ben's own identity.

The vividness must serve the friend-tone wrapper without undermining the assistant substance. A reasonable mental test: would this palette look at home on a modern indie productivity app made by people with taste, or would it look at home on a learn-to-code-for-kids platform? We want the former.

## Key Principles

- **Personality without performance.** Ben's warmth lives in copy and micro-moments, not in loud animations, mascots, or visual noise. The product feels human but never demands attention. If a flourish doesn't reward the user, it doesn't ship.
- **Trust through visible state.** The user must always see what Ben did with their input. No silent successes, no buried confirmations. Optimistic feedback is non-negotiable — the capture card appears the instant the user finishes speaking, persistence happens underneath, and any failure surfaces inline with a clear recovery path.

## Must-Have Affordances

- **Press-and-hold mic as the dominant composer action.** The mic is the primary, visually-anchored affordance on the composer. The send-arrow / text input is the same composer in a secondary mode — text is always reachable, but never visually competing with voice on the empty state.
- **Optimistic capture cards.** No spinners between "user finishes speaking" and "Ben's confirmation card is on screen." The pending-save state is a subtle indicator within the card (faded border or tiny pending dot), never a blocker. The user should feel like Ben heard them instantly.
- **Always-visible active-task peek.** A peek strip persists just above the composer on the main chat surface, surfacing the count of active tasks and the most recent one. It does not collapse on chat scroll. The only state in which it may compress or hide is when the soft keyboard is up — and only if mobile vertical space forces it. "What am I working on?" should always be one glance away.

## Workspace & Diff Treatment

The **task workspace** is Ben's content surface — text drafts, todo lists, future component types. It must feel like a *focused canvas*, not a chat with a panel: the content surface is the visual center; the conversation (sub-thread) is collapsed by default to a single most-recent-reply line; the composer at the bottom mirrors the main chat composer.

The **pending-diff bar** (when Ben proposes content edits) is the workspace's trust mechanism. Treat additive content with a soft positive treatment (gentle warm fill or a leading marker), subtractive content with a quieter retraction treatment (struck-through or muted with a leading marker). Avoid red/green code-diff aesthetics — this is a friend showing edits, not a developer reviewing source. Approve and Reject are equal-weight actions, both reachable in one tap; neither is destructive enough to need confirmation.

---

_No hex codes, dp values, component trees, or framework-specific terms in this file. Inspirations are referenced by feel, not by component spec. **"Linear-like" means modernity, restraint, and precision — never the literal visual system, palette, or component language of Linear.** Renderers MUST invent Ben's own color identity per the "Color Direction" section above._
