# Inline capture cards — Screen Prompts

_Each block below is self-contained. Copy one block, paste into Stitch / Figma AI / Pencil / Claude Design._

Inline capture cards are the elements Ben uses to confirm a capture inside his reply bubble in the chat. There are four variants — Note, Reminder, Task, and the Clarifying-question (which is not a card, just a plain Ben message). Cards live inside Ben's bubble; they are not freestanding chat elements.

---

## Note card — Loading (optimistic-save in flight)

````
**What this screen is for:**
Confirm to the user — instantly, before persistence completes — that Ben heard their note and is filing it.

**What's visible:**
Inside Ben's reply bubble, a compact card element with a quiet "note" label at the top (small, secondary type), the note title rendered prominently on one line, and a body preview of one to two lines beneath (truncated with ellipsis if longer). A subtle pending indicator is integrated into the card — a faded border, a small in-progress dot, or a slightly reduced opacity — enough to signal in-flight without dominating. The card itself is visually distinct from plain text in Ben's bubble (a soft surface fill or thin outline) but reads as part of the message.

**What the user can do:**
- Primary: wait (it'll resolve in well under a second in the happy case).
- Secondary: tap the card — opens an item detail view (see Ledger drawer / Item detail prompts).

**Feel:**
Quiet and confident. The card feels handmade — soft rounded corners, restrained type hierarchy (label small, title prominent, body preview comfortable), and the pending indicator is the most subtle thing about the card. It should feel like Ben quickly jotted something down on a card while still talking.

**State context:**
Ben's reply has just rendered with the save in flight to Postgres. The card is showing optimistically — the user sees confirmation immediately while the network does its work underneath.

**Critical affordances:**
The card must render the instant Ben's reply lands — not after persistence completes. The pending indicator must be subtle enough that the user doesn't read it as "saving" or "wait" — it's the unobtrusive trust signal that this is in-flight. If save fails, the card transitions to the Error state.
````

---

## Note card — Populated (saved successfully)

````
**What this screen is for:**
Show the user a clean, scannable confirmation that Ben filed their note correctly.

**What's visible:**
Inside Ben's reply bubble, the same compact card layout as Loading but with no pending indicator. Small "note" label at the top, title prominent on one line, body preview of one to two lines beneath (truncated with ellipsis if longer). The card is fully interactive — tapping opens the detail view.

**What the user can do:**
- Primary: tap the card to open item detail.
- Secondary: continue the conversation (composer is already live).

**Feel:**
Quietly satisfying. The card feels settled — the kind of small UI moment that rewards a glance. Type hierarchy is clear: label, title, body preview in descending visual weight.

**State context:**
The note has been persisted. This card will also appear as a row in the ledger drawer's Notes tab.

**Critical affordances:**
The card's title must be readable at a glance — the founder will scroll back through chat history and use these cards as visual landmarks. The body preview is supplementary; the title carries the meaning. Tapping the card opens detail, not a chat-internal expansion — the conversation flow stays clean.
````

---

## Note card — Error (save failed)

````
**What this screen is for:**
Surface a save failure for the note in place, without disrupting the surrounding conversation, and give the user a one-tap retry.

**What's visible:**
The card retains its layout but adopts a soft error fill (distinguishable from the normal card surface but never red-screaming). A small inline error label appears within the card ("couldn't save this note — retry") with a clear retry tap-target. The "note" label, title, and body preview remain visible so the user knows what failed to save.

**What the user can do:**
- Primary: tap the retry affordance to re-attempt the save.
- Secondary: ignore — the chat continues normally; the note simply doesn't land in the ledger until retried.

**Feel:**
Apologetic but calm. The error surface is friendly, not alarming. The retry path is the largest tap-target on the card.

**State context:**
Persistence to Postgres failed. The classification ran successfully and the card content is correct; only the write failed.

**Critical affordances:**
The note's content must remain visible — the user should be able to read what they captured even though it didn't save. The retry must be one tap, not a multi-step flow. If retry fails again, the card stays in the error state with the same affordance.
````

---

## Note card — Edge cases

````
**What this screen is for:**
Handle small content edges (empty title, very long body) cleanly so cards never look broken.

**What's visible:**
- **Empty title from the model** — the title slot renders a quiet placeholder ("untitled note") in slightly muted type. Body preview continues as normal. This is a model artifact, not a user mistake — the placeholder is forgiving, not corrective.
- **Very long body** — the body preview truncates at two lines with an ellipsis. The full body is available in detail view. The card's height does not grow indefinitely.

**What the user can do:**
- Primary: tap the card to open detail and see full content.

**Feel:**
Indistinguishable from a normal populated card — these edges should not look broken or "wrong."

**State context:**
Real-world content variability. Models sometimes produce odd outputs; users sometimes dictate long thoughts.

**Critical affordances:**
The placeholder for empty titles must be friend-tone, not technical ("untitled" is fine, "null" is not). Truncation must always preserve the ellipsis cue so the user knows to tap for more.
````

---

## Reminder card — Loading (optimistic-save in flight)

````
**What this screen is for:**
Confirm instantly that Ben heard a reminder and show when it'll fire — before persistence completes.

**What's visible:**
Inside Ben's reply bubble, a compact card with a quiet "reminder" label at the top, the reminder title on one line, and the relative-time string for when it fires rendered with primary visual emphasis below the title ("in 2h" / "tomorrow 9am" / "Fri 6pm"). A subtle pending indicator (faded border, opacity dip, or small in-progress dot) integrated into the card. The card is visually distinct from plain text but lives inside Ben's bubble.

**What the user can do:**
- Primary: wait (resolves quickly).
- Secondary: tap the card to open item detail (will show absolute time alongside relative).

**Feel:**
The relative-time string is the visual hero of the card after the title — it's what the user wants to see at a glance. Type carrying relative time should be slightly larger or weightier than the supporting "reminder" label. Soft, considered, modern.

**State context:**
Save in flight to Postgres. Card is showing optimistically.

**Critical affordances:**
Relative time must be human-readable — "in 2h" beats "in 120 minutes." The relative-time string must update over time without page reload (re-render at sensible intervals — minute resolution for near-term, hour for medium, day for distant).
````

---

## Reminder card — Populated (saved, not yet fired)

````
**What this screen is for:**
Show a clean, scannable confirmation that the reminder is filed and visible when it's due.

**What's visible:**
Same compact card layout as Loading but without the pending indicator. "Reminder" label, title, relative time (primary emphasis). The card is fully interactive — tapping opens detail.

**What the user can do:**
- Primary: tap the card to open item detail (shows absolute fires-at and captured-at timestamps).
- Secondary: continue the conversation.

**Feel:**
The card feels alive but quiet — the relative time hints that this is something that lives in the future, but the visual treatment doesn't shout urgency. Modern, considered, with the relative-time string as the focal point.

**State context:**
The reminder has been persisted with a future fires_at and will appear in the ledger drawer's Reminders tab under the Upcoming section.

**Critical affordances:**
The relative-time string is the single most important piece of information on the card after the title. Truncation rules: title may truncate; relative time never does.
````

---

## Reminder card — Populated (fired — past fires_at)

````
**What this screen is for:**
Show the user that a previously-set reminder's time has passed (visual only in v1 — no OS notification fired).

**What's visible:**
Same compact card layout but the relative-time string has switched to past-relative ("3h ago", "yesterday 9am") and the card adopts a "fired" visual marker — perhaps a small indicator near the label or a subtle de-emphasis (slightly muted fill, faded border, or a small "fired" tag). The title and time remain readable; the visual treatment communicates that this is no longer upcoming.

**What the user can do:**
- Primary: tap the card to open detail (shows full timestamps and fired status).
- Secondary: continue the conversation.

**Feel:**
Reflective and quiet. A fired reminder is a small "remember this?" moment — the visual treatment should signal "this happened" without urgency or alarm. No red, no warning iconography.

**State context:**
The reminder's fires_at has passed. In v1, no OS notification fired (alarms are mocked); the visual state is the only signal. This is a known v1 limitation explicit in the PRD.

**Critical affordances:**
The visual distinction between upcoming and fired must be legible at a glance — when scrolling chat history or the ledger, the user should be able to tell which reminders are still ahead. The treatment must remain quiet — fired ≠ failed.
````

---

## Reminder card — Error (save failed)

````
**What this screen is for:**
Surface a save failure for the reminder in place with a one-tap retry.

**What's visible:**
The card retains its layout but adopts a soft error fill. Inline error label ("couldn't save this reminder — retry") with a clear retry tap-target. The reminder title and relative-time remain visible.

**What the user can do:**
- Primary: tap retry.
- Secondary: ignore — the reminder won't fire (visually) or land in the drawer until retried.

**Feel:**
Calm and apologetic, matching the Note error state. Soft error surface, friend-tone copy.

**State context:**
Save failed; card content is correct.

**Critical affordances:**
The relative-time string must remain visible during the error state — the user needs to know what time the failed reminder was for, in case they decide to dictate it again instead of retrying.
````

---

## Reminder card — Edge cases

````
**What this screen is for:**
Handle unusual fires_at values cleanly.

**What's visible:**
- **fires_at in the past at save time** (e.g., model interpreted "remind me yesterday" as a backfill) — the card renders with past-relative time and adopts the "fired" visual immediately. Card looks like a fired reminder from the start.
- **fires_at very far in the future** — relative time degrades gracefully ("in 7 months", "in 2 years"). The string stays readable; no truncation, no fallback to absolute date in the card (absolute is in detail view).

**What the user can do:**
- Primary: tap the card to open detail (absolute timestamps available there).

**Feel:**
Indistinguishable from standard reminder card states; these edges should not look broken.

**State context:**
Edge fires_at values from real conversational input.

**Critical affordances:**
Relative time must always be a human phrase, never a raw timestamp leaked through. Far-future reminders must not crash the formatter or fall back to an absolute date.
````

---

## Task card — Loading (optimistic-save in flight)

````
**What this screen is for:**
Confirm instantly that Ben filed a task and make checking it off obvious.

**What's visible:**
Inside Ben's reply bubble, a compact card with a quiet "task" label at the top, an empty checkbox on the leading edge, and the task title beside the checkbox. A subtle pending indicator (faded border or opacity dip) signals in-flight; the checkbox itself is visible but disabled during the pending state.

**What the user can do:**
- Primary: wait briefly.
- Secondary: once saved, tap the checkbox to mark done; tap the card body to open detail.

**Feel:**
The card feels actionable but calm. The checkbox is the visual handle for the primary affordance — clear, comfortable to tap, with a satisfying-but-quiet visual when toggled.

**State context:**
Save in flight; card optimistic.

**Critical affordances:**
The checkbox must be visible but non-interactive during the pending state — tapping it before save resolves should be a no-op or a graceful queued action.
````

---

## Task card — Populated (Open — unchecked)

````
**What this screen is for:**
Show an open task and let the user check it off from inside the chat without opening the drawer.

**What's visible:**
Compact card layout: "task" label, empty checkbox on the leading edge, task title beside it. Card is fully interactive — checkbox toggles to Done on tap; card body taps open detail.

**What the user can do:**
- Primary: tap the checkbox to mark the task done.
- Secondary: tap the card body to open detail.

**Feel:**
The checkbox is the focal point. Tapping it feels satisfying — a quiet, well-timed toggle animation. Type for the title is comfortable to read at length.

**State context:**
Task is open. Same task also appears in the ledger drawer's Tasks tab.

**Critical affordances:**
Toggling the checkbox must update both this card AND the corresponding row in the ledger drawer — the source of truth is the same, and the user must see consistency between the two surfaces.
````

---

## Task card — Populated (Done — checked)

````
**What this screen is for:**
Show that the task is complete and let the user undo if they tapped by accident.

**What's visible:**
Compact card layout with the checkbox now in its checked state. The task title may render with slightly reduced visual emphasis (lighter weight, slight strike-through, or muted fill — the specific treatment is the renderer's call) to indicate completion. The card remains fully interactive — tapping the checkbox again toggles back to Open.

**What the user can do:**
- Primary: tap the checkbox to un-check (toggle back to Open).
- Secondary: tap the card body to open detail (detail shows captured-at and done-at timestamps).

**Feel:**
Quietly satisfying. The done state is gentle — not a victory lap, just a small, calm acknowledgment. No confetti, no fanfare.

**State context:**
The task has been marked done. The corresponding row in the ledger drawer's Tasks tab is also marked done.

**Critical affordances:**
The visual distinction between Open and Done must be clear at a glance (when scrolling chat history) but not heavy-handed. Un-check (toggle back to Open) must be possible — accidental taps happen.
````

---

## Task card — Error (save or toggle failed)

````
**What this screen is for:**
Surface a failed save or failed checkbox toggle in place with retry.

**What's visible:**
For a failed save (initial classification persisted but the row didn't land): soft error fill, inline error label ("couldn't save this task — retry"), retry tap-target. Checkbox is visible but disabled.

For a failed toggle (the task existed but the open↔done state didn't update on the server): the checkbox bounces back to its previous state with a small inline label ("didn't go through — retry") and a retry affordance integrated into the card.

**What the user can do:**
- Primary: tap retry.
- Secondary: ignore.

**Feel:**
Calm, apologetic, matches the other card error states.

**State context:**
Either initial save failed or a subsequent toggle failed.

**Critical affordances:**
The checkbox state must always reflect the persisted truth — never leave the user staring at a "checked" box when the server thinks it's open. The bounce-back-on-failure pattern is the trust signal.
````

---

## Task card — Edge cases

````
**What this screen is for:**
Handle unusual task content cleanly.

**What's visible:**
- **Very long task title** — the title truncates with ellipsis at the card boundary; the full title is in detail view. The checkbox remains visible and interactive.
- **Task with an implicit time** (the user said "buy milk tomorrow" but the model picked save_task instead of save_reminder) — the card renders as a normal task card. There is no compound capture in v1 — the model picked one tool, and that classification is the truth. The classifier behavior is tuned via the fixture file, not the UI.

**What the user can do:**
- Primary: same as standard task card states.

**Feel:**
Indistinguishable from standard task cards.

**State context:**
Real content variability.

**Critical affordances:**
Truncated titles must always preserve the ellipsis cue. The card must never invent a "due date" field for tasks — tasks have no time in v1; that's reminders' job.
````

---

## Clarifying-question message — Populated (only state)

````
**What this screen is for:**
Let Ben ask the user back when the original capture was ambiguous, without rendering a card.

**What's visible:**
A normal Ben message bubble in the chat stream — left-aligned, same visual treatment as any other Ben reply. The bubble contains a friend-tone question ("you mean the 15th of every month, or just this one?" / "the proposal for Sarah at Acme — got a deadline on that?"). No card is rendered; no capture has been saved yet. The conversation continues normally — the user's next message resolves the ambiguity, and Ben replies with whichever card variant fits.

**What the user can do:**
- Primary: reply via voice or text — the composer is live.
- Secondary: ignore and say something else — Ben treats the new message fresh and the prior ambiguous capture is abandoned (no card was ever rendered for it).

**Feel:**
Conversational and warm — Ben asking back should feel like a friend pausing to confirm, not a system requesting input. The bubble is just a bubble; no special UI affordances, no inline buttons, no quick-replies.

**State context:**
The model selected the ask_clarifying_question tool instead of a save tool. The original user message is in the chat above; Ben's question is the most recent message.

**Critical affordances:**
No inline reply buttons or quick-action chips in v1 — the response mechanism is the same composer used for everything else. Ben's clarifying question must feel like part of the conversation, not a special "confirm or cancel" UI mode.
````

---

## Clarifying-question message — Edge cases

````
**What this screen is for:**
Handle multi-turn clarification cleanly.

**What's visible:**
- **Chained clarification** — Ben can ask a follow-up question if the user's reply is still ambiguous. Each clarifying question is just another Ben bubble; the chain looks like a normal conversation. The capture only lands (and a card only renders) once the model has enough to call a save tool.
- **User abandons the clarification** — if the user replies with something unrelated, the original capture is dropped silently. No "abandoned" indicator, no stale "pending question" UI. Ben treats the new message fresh.

**What the user can do:**
- Primary: keep replying until Ben has enough to file something, or abandon by changing topics.

**Feel:**
Indistinguishable from normal conversation.

**State context:**
Multi-turn ambiguity resolution.

**Critical affordances:**
No "pending capture" state should leak into the UI — the ambiguous capture has no card and no row in the ledger until Ben classifies it definitively. The chat is the only surface; abandoning is silent and safe.
````
