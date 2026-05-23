# Ledger drawer — Screen Prompts

_Each block below is self-contained. Copy one block, paste into Stitch / Figma AI / Pencil / Claude Design._

The ledger drawer is the always-visible glanceable surface that lives above the composer on the chat screen. It has three depth levels: collapsed peek (a strip above the composer), expanded (a full-height sheet with three tabs), and item detail (a modal sheet showing one capture's full content).

---

## Drawer peek (collapsed) — Empty

````
**What this screen is for:**
Tell the user, quietly, that the ledger is here and empty — without making "no captures yet" feel like a missing feature.

**What's visible:**
A thin strip running across the chat surface just above the composer. A subtle drag handle (a small horizontal indicator centered on the top edge of the strip) suggests the strip can be pulled up. Inside the strip, a quiet single-line message in friend tone — "nothing on deck — Ben's listening" or similar. The strip's fill is a calm neutral surface, distinguished from the chat background and the composer but not loud.

**What the user can do:**
- Primary: tap or drag the peek to expand into the full drawer (will reveal empty tabs).
- Secondary: ignore and continue chatting.

**Feel:**
Quiet and friendly. The empty peek should feel like an invitation, not a void. Type is comfortable; the drag handle is unmistakable but not large.

**State context:**
First-use or freshly cleared state — no captures of any kind exist yet.

**Critical affordances:**
The peek must remain visible even when empty — its persistent presence is part of the trust signal that "the ledger is real, just empty right now." The drag handle is the affordance that hints at depth; without it, the strip looks decorative.
````

---

## Drawer peek (collapsed) — Loading

````
**What this screen is for:**
Bridge the brief moment between app load and ledger data arrival.

**What's visible:**
Same strip layout as Empty, but the single-line content is a soft skeleton placeholder where "Up next" text will land. The drag handle remains visible. The strip's fill matches the steady state — only the content slot is showing a skeleton.

**What the user can do:**
- Primary: wait briefly; ledger loads quickly.
- Secondary: still tap to expand — expanded view will also show loading state.

**Feel:**
Calm and brief. The skeleton is quiet — no shimmer animation. It should disappear within a second.

**State context:**
App is loading initial data — likely the same moment as the chat surface's loading state.

**Critical affordances:**
The skeleton must not flash or jitter. The drag handle must remain visible during loading so the user understands the peek is intentional.
````

---

## Drawer peek (collapsed) — Populated (upcoming reminder near-term)

````
**What this screen is for:**
Tell the user, at a glance, what's coming up next.

**What's visible:**
Same strip layout. Single-line content reads "Up next: {reminder title} {relative-time}" — e.g., "Up next: pay internet bill in 2h" or "Up next: call mom tomorrow 9am". The relative-time portion is rendered with slight visual emphasis (heavier or slightly larger). Title truncates with ellipsis if needed to keep the line readable. Drag handle visible.

**What the user can do:**
- Primary: tap or drag to expand the drawer (opens to Reminders tab).
- Secondary: ignore and keep chatting — the peek will update as reminders fire or new ones get added.

**Feel:**
Glanceable. The user should be able to read the entire line in under a second. Type is comfortable; the relative-time portion stands out without shouting.

**State context:**
At least one upcoming reminder exists with a fires_at close enough to be considered "next." Definition of "near-term" can be configurable — for v1, the next upcoming reminder regardless of distance is fine.

**Critical affordances:**
The relative-time string is the single most important piece of content here. It must update over time without page reload — minute resolution for near, hour resolution for medium-term, day resolution for distant. The line must remain a single line; multi-line peek defeats the glance purpose.
````

---

## Drawer peek (collapsed) — Populated (fallback content)

````
**What this screen is for:**
Surface meaningful content in the peek when there are no upcoming reminders, so the strip isn't wasted.

**What's visible:**
Same strip layout. Content depends on what exists:
- If open tasks exist but no upcoming reminders: a quiet summary like "4 tasks open" with slight emphasis on the count.
- If only notes exist: a compact summary like "12 notes · 4 tasks · 0 reminders" — a horizontal triplet of counts.
The user understands at a glance that there's content below, even if nothing is time-pressing.

**What the user can do:**
- Primary: tap or drag to expand the drawer.
- Secondary: ignore.

**Feel:**
Informational and quiet. The count summary is the content; type is comfortable but not pushed.

**State context:**
Captures exist but no reminders are upcoming. This is the typical state after the user has been using Ben for a while and has accumulated notes and a few open tasks but isn't actively waiting on a reminder to fire.

**Critical affordances:**
The fallback content must feel like real signal, not filler — counts are meaningful. The line is still single-line; the triplet of counts must fit without truncation or wrap.
````

---

## Drawer peek (collapsed) — Error

````
**What this screen is for:**
Surface a ledger-load failure without alarming the user.

**What's visible:**
Same strip layout. Single-line content reads "couldn't load your stuff — pull to retry" in friend tone. The strip's fill may shift to a soft error surface, distinguishable from the normal state but not red. Drag handle visible.

**What the user can do:**
- Primary: tap or drag (pull) to retry loading.
- Secondary: continue chatting — chat works regardless of ledger state.

**Feel:**
Calm and forgiving. Same soft-error aesthetic as the chat surface errors.

**State context:**
The ledger query to Postgres failed. Chat history may have loaded fine; only the ledger is broken.

**Critical affordances:**
The chat must remain fully functional even when the ledger errors — the user can keep capturing; new items will land in the ledger when it recovers. The retry must be one tap or one drag.
````

---

## Drawer peek (collapsed) — Edge cases

````
**What this screen is for:**
Handle layout edges cleanly.

**What's visible:**
- **Keyboard open** (mobile, user is typing in the composer) — the peek may compress to its drag handle only, or hide entirely if vertical space is constrained. When the keyboard dismisses, the peek restores to its previous content state.
- **Mid-drag gesture** (user is dragging the peek up but hasn't committed to expand) — a transitional state where the peek content lerps toward the expanded sheet's content. The user can release to expand or pull back down to collapse.

**What the user can do:**
- Primary: same as the relevant steady state.

**Feel:**
The transitions should feel responsive and physical. Drag gestures should track the finger smoothly.

**State context:**
Real-world layout interactions on mobile.

**Critical affordances:**
The peek's compression on keyboard-open is a tolerated layout concession, not a feature — when possible, keep the peek visible. The mid-drag state must be smooth; jank here breaks the "well-made tool" feel.
````

---

## Drawer expanded — Reminders tab — Empty

````
**What this screen is for:**
Show, friendlily, that no reminders exist yet — and hint at how to make one.

**What's visible:**
The drawer has expanded to a sheet covering most of the chat surface, anchored to the bottom of the screen. At the top of the sheet, a tab switcher with three labels: Reminders (selected), Tasks, Notes. Below the tabs, the empty state content: friend-tone copy ("no reminders yet — say 'remind me to…' and Ben'll catch it"), with the example phrasing in a slightly emphasized inline style so the user clocks how to talk to Ben. Quiet centered illustration-or-empty-visual space (abstract — the renderer decides whether to leave it blank or add a soft visual). A drag-down affordance at the top of the sheet (a small handle) allows the sheet to collapse back to peek.

**What the user can do:**
- Primary: drag the sheet back down (or tap outside the sheet) to collapse to the peek.
- Secondary: switch to Tasks or Notes tab.
- Tertiary: dismiss the drawer and dictate a reminder via the chat composer (composer remains visible at the very bottom of the screen even when the drawer is expanded, if vertical space allows).

**Feel:**
Calm and instructive. The example phrasing is the most valuable content — it teaches Ben's affordance through an example. Type is comfortable; the visual is quiet.

**State context:**
No reminders have ever been captured, or all existing reminders have been deleted (deletion isn't in v1, so practically: no reminders captured).

**Critical affordances:**
The example phrasing ("remind me to…") must read as a usage hint, not as a "command" — it should feel like a tip a friend would give, not a CLI instruction. The drag-down to collapse must be obvious from the top handle.
````

---

## Drawer expanded — Reminders tab — Populated

````
**What this screen is for:**
Let the user scan upcoming and fired reminders quickly, sorted in a way that respects time.

**What's visible:**
Sheet layout with tab switcher at top (Reminders selected). Below the tabs, a vertical list of reminder rows organized into two sections:

- **Upcoming** — sorted ascending by fires_at (soonest first). Each row contains the reminder title (primary), the relative-time string (emphasized), and possibly the captured-at hint as supporting text. Tap a row to open item detail.
- **Fired** — past reminders, sorted descending (most recently fired first). Visually de-emphasized compared to Upcoming (slightly muted fill or lighter weight) with a "fired" indicator. Same row layout.

If only one section has content, the other is hidden (no empty section headers).

**What the user can do:**
- Primary: tap any row to open item detail.
- Secondary: scroll the list.
- Tertiary: switch tabs; drag sheet down to collapse.

**Feel:**
Scannable and well-organized. Type hierarchy is clear: title prominent, relative-time emphasized but supporting, fired-status visually distinct but quiet. Modern list layout with comfortable row spacing — generous but not wasteful.

**State context:**
At least one reminder exists. Mix of upcoming and fired possible.

**Critical affordances:**
The Upcoming/Fired distinction must be legible at a glance — the visual sort and section break does most of the work; the "fired" indicator is supplementary. Relative-time strings must update over time. The list must scroll smoothly; long lists are possible.
````

---

## Drawer expanded — Reminders tab — Loading

````
**What this screen is for:**
Bridge the brief load moment when expanding to the Reminders tab.

**What's visible:**
Sheet layout with tab switcher visible (Reminders selected). Below the tabs, soft skeleton rows — four to six placeholder rows of typical row height with skeleton blocks for title and relative-time positions. Drag handle visible at top.

**What the user can do:**
- Primary: wait briefly.
- Secondary: switch tabs to see if other tabs load first.

**Feel:**
Quiet and brief.

**State context:**
Data fetch in progress.

**Critical affordances:**
Skeletons must not shimmer aggressively. They should disappear gracefully as real content arrives.
````

---

## Drawer expanded — Tasks tab — Empty

````
**What this screen is for:**
Show that no tasks are open with a hint at how to create one.

**What's visible:**
Same sheet layout with Tasks tab selected. Empty state content: friend-tone copy ("no tasks open — say 'I need to…' and Ben'll add it"). Quiet visual space below.

**What the user can do:**
- Primary: drag sheet down to collapse, or switch tabs.
- Secondary: dictate a task via the chat composer.

**Feel:**
Same calm, instructive aesthetic as the Reminders empty tab. The example phrasing teaches.

**State context:**
No tasks exist, or all tasks are done and "done tasks" are hidden behind a toggle that's collapsed.

**Critical affordances:**
The example phrasing must feel like a friend's tip, not an instruction manual.
````

---

## Drawer expanded — Tasks tab — Populated

````
**What this screen is for:**
Let the user scan open tasks, check them off from the drawer, and see what they've already done.

**What's visible:**
Sheet with Tasks tab selected. Below tabs, a vertical list of task rows organized into:

- **Open tasks** — primary section, sorted reverse-chronologically (most recently captured first) or by some sensible order. Each row contains a checkbox on the leading edge and the task title. Tapping the checkbox toggles to Done.
- **Done tasks** — secondary section, visually de-emphasized (lighter weight, possibly with strike-through on titles, or behind a "show done" toggle). Done tasks may default to visible but secondary; renderer can decide whether the toggle is collapsed by default.

**What the user can do:**
- Primary: tap a row's checkbox to toggle done state.
- Secondary: tap a row's body (not the checkbox) to open item detail.
- Tertiary: switch tabs; collapse sheet.

**Feel:**
Actionable and clear. Checkboxes are comfortable to tap with thumb-reach considered. The visual distinction between open and done is gentle but unambiguous. Type is comfortable to read at length.

**State context:**
Tasks exist in some mix of open and done.

**Critical affordances:**
Toggling a task's checkbox in the drawer must update the corresponding card in the chat stream if it's still in view — single source of truth. The checkbox tap-target should be slightly larger than the visible checkbox to forgive thumb-imprecision.
````

---

## Drawer expanded — Notes tab — Empty

````
**What this screen is for:**
Show that no notes exist yet with a friendly hint.

**What's visible:**
Sheet with Notes tab selected. Empty state copy: "no notes yet — talk to Ben, he'll save the keepers." Quiet visual space.

**What the user can do:**
- Primary: drag sheet down to collapse, or switch tabs.
- Secondary: dictate a note via the chat composer.

**Feel:**
Same calm, instructive aesthetic. Notes get a softer empty message because they're less prescriptive — there's no "say 'remember…' " hint; Ben classifies notes from natural speech.

**State context:**
No notes captured yet.

**Critical affordances:**
The copy should suggest that notes are an organic outcome of conversation, not a formal capture action.
````

---

## Drawer expanded — Notes tab — Populated

````
**What this screen is for:**
Let the user browse captured notes in reverse-chronological order.

**What's visible:**
Sheet with Notes tab selected. Below tabs, a vertical list of note rows in reverse-chronological order (newest first). Each row contains:
- Note title (primary).
- One-line body preview (supporting, truncated with ellipsis).
- Captured-at relative time ("today" / "yesterday" / "3d ago") as small supporting text.

Tapping a row opens item detail (showing full body).

**What the user can do:**
- Primary: tap any row to open item detail and read the full note.
- Secondary: scroll the list; switch tabs; collapse sheet.

**Feel:**
A quiet, readable list. Type hierarchy: title prominent, body preview comfortable but secondary, captured-at smallest. Generous but not wasteful row spacing. The list should feel like a well-kept commonplace book.

**State context:**
At least one note exists.

**Critical affordances:**
The body preview must always preserve the ellipsis cue if truncated, so the user knows there's more in detail view. Captured-at relative time helps with memory anchoring — "the one I jotted yesterday" — and must read naturally.
````

---

## Drawer expanded — Error (any tab)

````
**What this screen is for:**
Surface a load failure for whichever tab is selected, without breaking the rest of the drawer.

**What's visible:**
Sheet with the affected tab selected. Tab switcher remains visible and functional. Below the tabs, an inline error band — soft error fill, friend-tone copy ("couldn't load your {reminders/tasks/notes} — tap to retry") with a retry tap-target. Other tabs can still be tried by tapping them.

**What the user can do:**
- Primary: tap retry.
- Secondary: switch tabs (each tab has its own load state; one tab erroring doesn't mean others will).
- Tertiary: collapse the sheet.

**Feel:**
Calm, matches other error states. The error is for one tab only; the rest of the drawer remains usable.

**State context:**
A query failed for the selected tab's data.

**Critical affordances:**
Other tabs must remain switchable — don't lock the user out of the whole drawer because one tab failed.
````

---

## Drawer expanded — Edge cases

````
**What this screen is for:**
Handle list and interaction edges cleanly.

**What's visible:**
- **Long lists** — standard vertical scroll inside the sheet. No pagination in v1. The drag-down-to-collapse gesture should not conflict with vertical scroll inside the sheet (scroll within sheet, drag-from-top-handle to collapse).
- **Tab badge counts** (optional polish) — small count badges on tabs showing item count or "new since last open." Marked as optional; not blocking for v1.
- **Pull-to-refresh** (optional) — the ledger should stay in sync via local state updates from chat captures; pull-to-refresh is optional polish.

**What the user can do:**
- Primary: scroll, switch tabs, tap rows, collapse sheet.

**Feel:**
Smooth and resilient — none of these edges should produce a janky surface.

**State context:**
Normal real-world usage at scale.

**Critical affordances:**
Scroll-inside-sheet and drag-to-collapse gestures must coexist cleanly — the top drag handle is the dismissal affordance; scrolling list content does not dismiss the sheet.
````

---

## Item detail — Note detail

````
**What this screen is for:**
Show the full content of a note in a focused modal sheet.

**What's visible:**
A modal sheet that slides up over the drawer (or directly from a chat-card tap). Top of sheet has a small drag handle and a close affordance (drag-down or tap-to-close). Content stacked top-to-bottom:
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
The user tapped a note card in chat or a note row in the drawer.

**Critical affordances:**
Long body text must scroll inside the sheet without conflicting with the drag-to-dismiss. The absolute timestamp is the trust signal that this is real data — never hide it.
````

---

## Item detail — Reminder detail

````
**What this screen is for:**
Show the full metadata of a reminder — both when it fires and when it was captured.

**What's visible:**
Modal sheet with drag handle and close affordance. Content:
- "Reminder" label (small, secondary).
- Title (prominent).
- fires_at shown in both absolute and relative forms — relative emphasized ("in 2h" or "fired 3h ago"), absolute as supporting context ("Sat, May 24 · 9:00am").
- Status indicator: upcoming or fired.
- Captured-at timestamp (small, secondary).

Read-only in v1.

**What the user can do:**
- Primary: read the reminder.
- Secondary: drag down or tap close to dismiss.

**Feel:**
The two time strings (fires_at and captured-at) are both important but visually ranked — fires_at is the hero, captured-at is supporting. Modern, calm.

**State context:**
The user tapped a reminder card in chat or a reminder row in the drawer.

**Critical affordances:**
The status (upcoming vs fired) must be unambiguous — the user is here to verify what Ben filed. Showing absolute fires_at alongside relative resolves ambiguity ("in 2h" relative to what exact wall-clock time).
````

---

## Item detail — Task detail

````
**What this screen is for:**
Show the full task state with a large primary action for toggling done.

**What's visible:**
Modal sheet with drag handle and close affordance. Content:
- "Task" label (small, secondary).
- Title (prominent).
- A large, primary checkbox affordance (larger than the inline-card checkbox) — clearly the focal interactive element. Tap toggles done state.
- Captured-at timestamp (small, secondary).
- If done: done-at timestamp also shown (small, secondary).

**What the user can do:**
- Primary: tap the large checkbox to toggle done.
- Secondary: drag down or tap close to dismiss.

**Feel:**
The checkbox is the focal point — large, comfortable to tap, with a satisfying toggle animation. The rest of the layout is calm and supporting.

**State context:**
The user tapped a task card in chat or a task row in the drawer.

**Critical affordances:**
The large checkbox here must produce the same toggle effect as the smaller checkbox on cards and list rows — single source of truth. Toggling done-state from item detail must update the corresponding card in chat and the row in the drawer.
````

---

## Item detail — Loading

````
**What this screen is for:**
Bridge the brief moment if item-detail data needs to fetch (in practice, may not be needed if the row already carries full payload).

**What's visible:**
Modal sheet with drag handle. Skeleton content for label, title, body/time slots. Close affordance visible.

**What the user can do:**
- Primary: wait briefly or dismiss.

**Feel:**
Brief, calm.

**State context:**
Data fetch in progress for the item detail. In v1, may be unnecessary if rows carry full data — flag this for the implementer's call.

**Critical affordances:**
If the row already carries the data, render directly to the populated state and skip this state. Don't show loading for the sake of consistency if there's nothing to load.
````

---

## Item detail — Error

````
**What this screen is for:**
Surface a detail-load failure with retry, without confusing the user.

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

## Item detail — Edge cases

````
**What this screen is for:**
Handle unusual content and out-of-band changes cleanly.

**What's visible:**
- **Long note body** — body text scrolls inside the sheet. The drag handle at top remains visible (drag handle dismisses, scroll inside scrolls the body).
- **Item deleted from another session** — in v1 with a single user (N=1), this is a far edge. If it happens, the sheet shows a graceful "this one's gone" state with friend-tone copy ("looks like this isn't here anymore") and auto-closes after a brief delay, or offers an explicit close.

**What the user can do:**
- Primary: read or scroll; dismiss when done.

**Feel:**
The "gone" state should be quiet and forgiving — not alarming. The user almost certainly didn't delete this themselves in v1; it's a far-edge fallback.

**State context:**
Real-world data variability and far-edge multi-session scenarios.

**Critical affordances:**
Scroll-inside-sheet and drag-to-dismiss must not conflict. The "gone" state must close cleanly without leaving stale UI behind.
````
