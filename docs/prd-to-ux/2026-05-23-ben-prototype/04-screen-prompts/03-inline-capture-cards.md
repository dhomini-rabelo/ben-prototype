# Inline capture cards — Screen Prompts

_Each block below is self-contained. Copy one block, paste into Stitch / Figma AI / Pencil / Claude Design._

Inline capture cards are elements Ben uses inside his chat-reply bubble to confirm a capture. There are four variants — Note, Reminder, Task, and Clarifying-question (the last is not a card, just a plain Ben message). Cards live inside Ben's bubble; they are not freestanding chat elements.

**Important behavioral difference between cards in this model:**
- **Note** and **Reminder** cards: tapping opens an **item-detail modal** (read-only).
- **Task** card: tapping the **Start** affordance (or the card body) opens the **task workspace** (see the task-workspaces prompts).

The Item-detail modal prompts (Note detail + Reminder detail) are included at the bottom of this file because they're triggered by these cards (and shared with the menu sidebar's lists).

---

## Note card — Loading (optimistic-save in flight)

````
**What this screen is for:**
Confirm to the user — instantly, before persistence completes — that Ben heard their note and is filing it.

**What's visible:**
Inside Ben's reply bubble, a compact card element with a quiet "note" label at the top (small, secondary type), the note title rendered prominently on one line, and a body preview of one to two lines beneath (truncated with ellipsis if longer). A subtle pending indicator is integrated into the card — a faded border, a small in-progress dot, or a slightly reduced opacity — enough to signal in-flight without dominating. The card itself is visually distinct from plain text in Ben's bubble (a soft surface fill or thin outline) but reads as part of the message.

**What the user can do:**
- Primary: wait (it'll resolve in well under a second in the happy case).
- Secondary: tap the card — opens the item-detail modal.

**Feel:**
Quiet and confident. The card feels handmade — soft rounded corners, restrained type hierarchy, and the pending indicator is the most subtle thing about the card.

**State context:**
Ben's reply has just rendered with the save in flight to Postgres. The card is showing optimistically.

**Critical affordances:**
The card must render the instant Ben's reply lands — not after persistence completes. The pending indicator must be subtle enough that the user doesn't read it as "wait" — it's the unobtrusive trust signal that this is in-flight.
````

---

## Note card — Populated (saved successfully)

````
**What this screen is for:**
Show the user a clean, scannable confirmation that Ben filed their note correctly.

**What's visible:**
Inside Ben's reply bubble, the same compact card layout as Loading but without a pending indicator. Small "note" label at the top, title prominent on one line, body preview of one to two lines beneath. The card is fully interactive — tapping opens the detail modal.

**What the user can do:**
- Primary: tap the card to open item-detail modal.
- Secondary: continue the conversation.

**Feel:**
Quietly satisfying. The card feels settled. Type hierarchy is clear: label, title, body preview in descending visual weight.

**State context:**
The note has been persisted. This row will also appear in the menu sidebar's Notes view.

**Critical affordances:**
The card's title must be readable at a glance — the founder will scroll back through chat history and use these cards as visual landmarks.
````

---

## Note card — Error (save failed)

````
**What this screen is for:**
Surface a save failure for the note in place, without disrupting the surrounding conversation, and give the user a one-tap retry.

**What's visible:**
The card retains its layout but adopts a soft error fill. A small inline error label appears within the card ("couldn't save this note — retry") with a clear retry tap-target. The "note" label, title, and body preview remain visible.

**What the user can do:**
- Primary: tap the retry affordance.
- Secondary: ignore — the chat continues; the note doesn't land until retried.

**Feel:**
Apologetic but calm. The error surface is friendly, not alarming.

**State context:**
Persistence failed. Classification ran successfully; only the write failed.

**Critical affordances:**
The note's content must remain visible. The retry must be one tap.
````

---

## Note card — Edge cases

````
**What this screen is for:**
Handle small content edges cleanly so cards never look broken.

**What's visible:**
- **Empty title from the model** — the title slot renders a quiet placeholder ("untitled note") in slightly muted type.
- **Very long body** — body preview truncates at two lines with an ellipsis. Full body is available in detail view.

**What the user can do:**
- Primary: tap the card to open detail and see full content.

**Feel:**
Indistinguishable from a normal populated card.

**State context:**
Real-world content variability.

**Critical affordances:**
Placeholder copy must be friend-tone. Truncation must always preserve the ellipsis cue.
````

---

## Reminder card — Loading (optimistic-save in flight)

````
**What this screen is for:**
Confirm instantly that Ben heard a reminder and show when it'll fire — before persistence completes.

**What's visible:**
Inside Ben's reply bubble, a compact card with a quiet "reminder" label at the top, the reminder title on one line, and the relative-time string for when it fires rendered with primary visual emphasis below the title ("in 2h" / "tomorrow 9am" / "Fri 6pm"). A subtle pending indicator integrated into the card. The card is visually distinct from plain text but lives inside Ben's bubble.

**What the user can do:**
- Primary: wait briefly.
- Secondary: tap the card to open detail modal.

**Feel:**
The relative-time string is the visual hero of the card after the title — it's what the user wants to see at a glance. Type carrying relative time should be slightly emphasized.

**State context:**
Save in flight. Card optimistic.

**Critical affordances:**
Relative time must be human-readable ("in 2h" beats "in 120 minutes"). The string must update over time without page reload.
````

---

## Reminder card — Populated (saved, not yet fired)

````
**What this screen is for:**
Show a clean, scannable confirmation that the reminder is filed and visible when it's due.

**What's visible:**
Same compact card layout as Loading but without the pending indicator. "Reminder" label, title, relative time (primary emphasis). Tap opens detail modal.

**What the user can do:**
- Primary: tap the card to open detail modal.
- Secondary: continue the conversation.

**Feel:**
The card feels alive but quiet — the relative time hints that this is something that lives in the future, but the visual treatment doesn't shout urgency.

**State context:**
The reminder has been persisted with a future `fires_at`. The same item will appear in the menu sidebar's Reminders view under Upcoming.

**Critical affordances:**
The relative-time string is the single most important piece of information after the title. Title may truncate; relative time never does.
````

---

## Reminder card — Populated (fired — past fires_at)

````
**What this screen is for:**
Show the user that a previously-set reminder's time has passed (visual only in v1 — no OS notification fired).

**What's visible:**
Same compact card layout but the relative-time string has switched to past-relative ("3h ago", "yesterday 9am") and the card adopts a "fired" visual marker — a small indicator near the label or a subtle de-emphasis (slightly muted fill or a small "fired" tag). The title and time remain readable.

**What the user can do:**
- Primary: tap the card to open detail.
- Secondary: continue.

**Feel:**
Reflective and quiet. A fired reminder is a small "remember this?" moment — the visual treatment should signal "this happened" without urgency or alarm. No red, no warning iconography.

**State context:**
The reminder's `fires_at` has passed. V1: no OS notification fired; the visual state is the only signal.

**Critical affordances:**
The visual distinction between upcoming and fired must be legible at a glance. The treatment must remain quiet — fired ≠ failed.
````

---

## Reminder card — Error (save failed)

````
**What this screen is for:**
Surface a save failure for the reminder in place with a one-tap retry.

**What's visible:**
The card retains its layout but adopts a soft error fill. Inline error label ("couldn't save this reminder — retry") with retry tap-target. Reminder title and relative-time remain visible.

**What the user can do:**
- Primary: tap retry.
- Secondary: ignore.

**Feel:**
Calm and apologetic, matching the Note error state.

**State context:**
Save failed; card content is correct.

**Critical affordances:**
The relative-time string must remain visible during the error state.
````

---

## Reminder card — Edge cases

````
**What this screen is for:**
Handle unusual fires_at values cleanly.

**What's visible:**
- **fires_at in the past at save time** — the card renders with past-relative time and adopts the "fired" visual immediately.
- **fires_at very far in the future** — relative time degrades gracefully ("in 7 months", "in 2 years"). No truncation; no fallback to absolute date in the card.

**What the user can do:**
- Primary: tap the card to open detail.

**Feel:**
Indistinguishable from standard reminder card states.

**State context:**
Edge `fires_at` values from real conversational input.

**Critical affordances:**
Relative time must always be a human phrase. Far-future reminders must not crash the formatter.
````

---

## Task card — Loading (optimistic-create in flight)

````
**What this screen is for:**
Confirm instantly that Ben heard a substantive task and is creating a workspace for it.

**What's visible:**
Inside Ben's reply bubble, a compact card with a quiet "task" label at the top, an icon hint indicating the task's content type (a subtle visual cue distinguishing a text-shaped task from a list-shaped task — exact iconography is the renderer's call but should be quiet and meaningful), the task title rendered prominently, and a clear **Start** affordance (a button-style element) on the trailing edge of the card or beneath the title. A subtle pending indicator (faded border or opacity dip) signals in-flight; the Start affordance is visible but disabled during the pending state.

**What the user can do:**
- Primary: wait briefly.
- Secondary: once created, tap Start to enter the task workspace, or tap the card body to do the same.

**Feel:**
The card feels actionable but calm. The Start affordance is the focal interactive element — clear, comfortable to tap, with a saturated but grown-up accent that draws the eye without shouting.

**State context:**
Ben classified the captured intent as a substantive task and called the create-workspace tool. The workspace is being persisted in the background.

**Critical affordances:**
The Start affordance must be visible but non-interactive during the pending state. The icon hint that distinguishes text vs list is the only signal the user gets, before opening, of what shape of work this task is.
````

---

## Task card — Populated (created, not yet started)

````
**What this screen is for:**
Show that a task workspace exists and make starting work on it one obvious tap away.

**What's visible:**
Compact card layout: "task" label, content-type icon hint, title, and Start affordance fully enabled. The card body is tappable as a secondary route into the same workspace. Card is visually settled (no pending indicator). The same task is reflected in the active-task peek above the composer with the count incremented.

**What the user can do:**
- Primary: tap Start (or the card body) to open the task workspace.
- Secondary: continue chatting — the task remains active and reachable later from the peek or the menu sidebar.

**Feel:**
The Start affordance is the focal point of this card — saturated accent, comfortable tap target, friendly type weight. The rest of the card is calm and quiet.

**State context:**
The workspace exists and is empty (no content yet); the user hasn't entered it.

**Critical affordances:**
Start must be unambiguously primary. Tapping the card body must also enter the workspace (forgiving the user who taps title/content area instead of the button). The icon hint distinguishing text vs list must read as quiet metadata, not decoration.
````

---

## Task card — Populated (active — user has entered the workspace at least once)

````
**What this screen is for:**
Show that the task is in progress and let the user resume work in one tap.

**What's visible:**
Same compact card layout. A small "active" visual marker is present (a quiet supporting tag or a slightly differentiated fill). The Start affordance reads as "Continue" or equivalent. The content-type icon hint remains. A small supporting line may show last-touched relative time ("active · 2h ago").

**What the user can do:**
- Primary: tap Continue (or card body) to re-enter the workspace.
- Secondary: continue chatting.

**Feel:**
The "active" treatment is gentle — a soft indicator, not a badge that shouts. The card still feels like part of the friendly conversation.

**State context:**
The task workspace has been opened at least once and is not yet finished.

**Critical affordances:**
The visual distinction between "not yet started" and "active" must be subtle but legible. The Continue affordance and the card body both lead to the same place.
````

---

## Task card — Populated (finished — moved to history)

````
**What this screen is for:**
Show in chat scrollback that the task was completed, with a quiet path to review it read-only.

**What's visible:**
Compact card layout with a "done" visual treatment — muted fill, optional strike-through on the title, and a "finished {relative-time}" supporting line (e.g., "finished 3h ago", "finished yesterday"). The Start affordance is removed or replaced with a small, secondary "view" affordance.

**What the user can do:**
- Primary: tap to open the workspace in read-only / historical mode.
- Secondary: continue chatting.

**Feel:**
Settled and quiet. A finished task is a small "remember when we did this" moment. No celebration; no fanfare; just a gentle visual settlement.

**State context:**
The user marked the task done from inside the workspace; the task moved to history. The card persists in chat scrollback as the historical artifact.

**Critical affordances:**
The done treatment must read as "complete," not as "disabled" or "failed." Tap-to-review must be available — the user may want to re-read what they accomplished.
````

---

## Task card — Error (create failed)

````
**What this screen is for:**
Surface a workspace-creation failure in place with a one-tap retry.

**What's visible:**
Card retains its layout but adopts a soft error fill. Inline error label ("couldn't set this up — retry") with a clear retry tap-target. The "task" label, icon hint, and title remain visible; the Start affordance is disabled until retry succeeds.

**What the user can do:**
- Primary: tap retry.
- Secondary: ignore — the task isn't created until retry succeeds.

**Feel:**
Calm and apologetic. Same soft-error pattern as other cards.

**State context:**
Workspace creation failed at the persistence layer.

**Critical affordances:**
Title remains visible. Retry is one tap.
````

---

## Task card — Edge cases

````
**What this screen is for:**
Handle unusual task content cleanly.

**What's visible:**
- **Very long title** — title truncates with ellipsis at the card boundary; full title is in the workspace.
- **Task that was created but never opened by user** — remains in the "not yet started" state indefinitely; still appears in the active-task peek count.

**What the user can do:**
- Primary: same as standard task card states.

**Feel:**
Indistinguishable from standard task cards.

**State context:**
Real content variability.

**Critical affordances:**
Truncated titles must preserve the ellipsis cue. The card must never invent state that doesn't match the workspace's truth.
````

---

## Clarifying-question message — Populated (only state)

````
**What this screen is for:**
Let Ben ask the user back when the original capture was ambiguous, without rendering a card.

**What's visible:**
A normal Ben message bubble in the chat stream — left-aligned, same visual treatment as any other Ben reply. The bubble contains a friend-tone question ("you mean the 15th of every month, or just this one?" / "want me to set this up as a task you'll work on, or just a quick reminder?"). No card; no capture saved yet. The conversation continues normally — the user's next message resolves the ambiguity.

**What the user can do:**
- Primary: reply via voice or text — the composer is live.
- Secondary: ignore and say something else — Ben treats the new message fresh and the prior ambiguous capture is abandoned.

**Feel:**
Conversational and warm — Ben asking back should feel like a friend pausing to confirm, not a system requesting input. The bubble is just a bubble; no special UI affordances, no inline buttons, no quick-replies.

**State context:**
The model selected the ask_clarifying_question tool instead of a save tool. The original user message is in the chat above; Ben's question is the most recent message.

**Critical affordances:**
No inline reply buttons in v1 — the response mechanism is the same composer used for everything else.
````

---

## Clarifying-question message — Edge cases

````
**What this screen is for:**
Handle multi-turn clarification cleanly.

**What's visible:**
- **Chained clarification** — Ben can ask a follow-up question if the user's reply is still ambiguous. Each clarifying question is just another Ben bubble.
- **User abandons the clarification** — if the user replies with something unrelated, the original capture is dropped silently. No "abandoned" indicator, no stale "pending question" UI.

**What the user can do:**
- Primary: keep replying until Ben has enough to file something, or abandon by changing topics.

**Feel:**
Indistinguishable from normal conversation.

**State context:**
Multi-turn ambiguity resolution.

**Critical affordances:**
No "pending capture" state should leak into the UI.
````

---

## Item detail modal — Note detail

````
**What this screen is for:**
Show the full content of a note in a focused modal sheet.

**What's visible:**
A modal sheet that slides up over the chat (or over the menu sidebar's Notes view). Top of sheet has a small drag handle and a close affordance (drag-down or tap-to-close). Content stacked top-to-bottom:
- "Note" label (small, secondary).
- Title (prominent).
- Full body text, scrollable if long.
- Captured-at timestamp shown in both absolute ("May 23, 2026 · 3:47pm") and relative ("today, 2h ago") forms — supporting text, secondary visual weight.

Read-only in v1 — no edit affordances.

**What the user can do:**
- Primary: read the note.
- Secondary: drag down or tap close to dismiss.

**Feel:**
Focused and calm. The sheet feels like opening a single index card from a stack. Type hierarchy is clean; body text is comfortable to read at length.

**State context:**
The user tapped a note card in chat or a note row in the menu sidebar's Notes view.

**Critical affordances:**
Long body text must scroll inside the sheet without conflicting with the drag-to-dismiss gesture. The absolute timestamp is the trust signal — never hide it.
````

---

## Item detail modal — Reminder detail

````
**What this screen is for:**
Show the full metadata of a reminder — both when it fires and when it was captured.

**What's visible:**
Modal sheet with drag handle and close affordance. Content:
- "Reminder" label (small, secondary).
- Title (prominent).
- `fires_at` shown in both absolute and relative forms — relative emphasized ("in 2h" or "fired 3h ago"), absolute as supporting context ("Sat, May 24 · 9:00am").
- Status indicator: upcoming or fired.
- Captured-at timestamp (small, secondary).

Read-only in v1.

**What the user can do:**
- Primary: read the reminder.
- Secondary: drag down or tap close to dismiss.

**Feel:**
The two time strings (`fires_at` and captured-at) are both important but visually ranked — `fires_at` is the hero, captured-at is supporting.

**State context:**
The user tapped a reminder card in chat or a reminder row in the menu sidebar's Reminders view.

**Critical affordances:**
The status (upcoming vs fired) must be unambiguous. Showing absolute `fires_at` alongside relative resolves ambiguity.
````

---

## Item detail modal — Loading

````
**What this screen is for:**
Bridge the brief moment if item-detail data needs to fetch.

**What's visible:**
Modal sheet with drag handle. Skeleton content for label, title, body/time slots. Close affordance visible.

**What the user can do:**
- Primary: wait briefly or dismiss.

**Feel:**
Brief, calm.

**State context:**
Data fetch in progress. In v1, may be unnecessary if rows carry full data — flag for the implementer.

**Critical affordances:**
If the row already carries the data, render directly to the populated state and skip this state.
````

---

## Item detail modal — Error

````
**What this screen is for:**
Surface a detail-load failure with retry, without trapping the user.

**What's visible:**
Modal sheet with drag handle. Inline error band — soft error fill, friend-tone copy ("couldn't load this one — tap to retry") with retry affordance. Close affordance remains visible.

**What the user can do:**
- Primary: tap retry.
- Secondary: dismiss the sheet.

**Feel:**
Calm, matches other error states.

**State context:**
Failed to load detail for the tapped item.

**Critical affordances:**
The user must be able to close the sheet even when detail errored — no trap state.
````

---

## Item detail modal — Edge cases

````
**What this screen is for:**
Handle unusual content cleanly.

**What's visible:**
- **Long note body** — body text scrolls inside the sheet. Drag handle at top remains visible.
- **Item deleted from another session** — sheet shows a graceful "this one's gone" state with friend-tone copy and auto-closes after a brief delay, or offers an explicit close.

**What the user can do:**
- Primary: read or scroll; dismiss when done.

**Feel:**
The "gone" state should be quiet and forgiving — not alarming.

**State context:**
Real-world data variability and far-edge multi-session scenarios.

**Critical affordances:**
Scroll-inside-sheet and drag-to-dismiss must not conflict.
````
