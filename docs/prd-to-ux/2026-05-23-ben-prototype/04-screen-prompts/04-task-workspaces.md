# Task workspaces — Screen Prompts

_Each block below is self-contained. Copy one block, paste into Stitch / Figma AI / Pencil / Claude Design._

A **task workspace** is a focused screen that slides up over the chat surface when the user enters a task. It has its own content area (text or todo list — possibly other typed components in future), its own chat composer scoped to a task sub-thread, and a pending-diff bar that appears when Ben proposes content edits.

This file covers two related sub-screens: the **active-task picker** (reached from the active-task peek above the main chat composer) and the **workspace shell** itself.

---

## Active-task picker — Empty

````
**What this screen is for:**
Gracefully handle the rare moment when the picker is reached but no active tasks exist.

**What's visible:**
An overlay or sheet (sliding up from the active-task peek's position) with friend-tone copy ("nothing active — you're all clear") and a single dismiss affordance. Centered, minimal, no list rows.

**What the user can do:**
- Primary: tap dismiss or tap outside to collapse back to the chat surface.

**Feel:**
Brief and quiet. This state should rarely appear in practice; when it does, it should feel like a non-event, not a dead end.

**State context:**
The user tapped the active-task peek but there are zero active tasks (race condition between the count rendered in the peek and a task being finished elsewhere).

**Critical affordances:**
Dismissal must be one tap (or tap-outside). The picker must never trap the user with no exit.
````

---

## Active-task picker — Loading

````
**What this screen is for:**
Bridge the brief moment between opening the picker and the active-task list arriving.

**What's visible:**
Picker overlay or sheet with a small header (or no header — design call). Soft skeleton placeholders for three or four task rows — each skeleton row has placeholder shapes for an icon, title, and a small supporting line.

**What the user can do:**
- Primary: wait briefly.
- Secondary: tap outside to dismiss.

**Feel:**
Calm and brief. Skeletons quiet.

**State context:**
Active tasks are loading from the data layer.

**Critical affordances:**
Dismissal must remain available during loading.
````

---

## Active-task picker — Populated

````
**What this screen is for:**
Let the user choose which active task to enter, with the most relevant tasks surfaced first.

**What's visible:**
Picker overlay or sheet with a small header ("Active tasks" or similar — quiet and supporting). Below the header, a vertical list of active task rows in reverse-chronological order by last-activity (most recently touched first). Each row contains: a small icon hint distinguishing text-shaped from list-shaped tasks, the task title (primary, may truncate with ellipsis), and a supporting line with the task's recency or status ("just created" / "active · 2h ago" / "started today"). Tap any row to enter that task's workspace; the picker dismisses.

**What the user can do:**
- Primary: tap any task row to open its workspace.
- Secondary: tap outside, drag down, or tap a close affordance to dismiss.

**Feel:**
Scannable and friendly. Type hierarchy: title prominent, supporting line quiet. Generous row spacing but not wasteful. The icon hint that distinguishes text vs list should be subtle and meaningful — never decorative.

**State context:**
There is one or more active tasks. The user wants to pick one to work on.

**Critical affordances:**
Each row's tap target must be the full row, not just the title text. The "most recent first" ordering is the founder's expected mental model — surfacing what they were just working on at the top.
````

---

## Active-task picker — Error

````
**What this screen is for:**
Surface a load failure without trapping the user.

**What's visible:**
Picker overlay with inline soft-error band — friend-tone copy ("couldn't load your tasks — tap to retry") and a clear retry tap-target. Close affordance remains usable.

**What the user can do:**
- Primary: tap retry.
- Secondary: dismiss the picker.

**Feel:**
Calm, matches other error states.

**State context:**
Failed to load the active-task list.

**Critical affordances:**
Dismissal must remain available even when the list errored.
````

---

## Active-task picker — Edge cases

````
**What this screen is for:**
Handle list-level edges cleanly.

**What's visible:**
- **Long list of active tasks** (founder accumulates many): standard vertical scroll within the picker; the picker grows up to a sensible maximum height.
- **Mid-drag dismissal** — the picker tracks the finger smoothly during a drag-down gesture; release past a threshold dismisses; release before threshold restores.

**What the user can do:**
- Primary: scroll, tap a row, or dismiss.

**Feel:**
Resilient and smooth. Gestures should feel physical.

**State context:**
Real-world usage at modest scale.

**Critical affordances:**
Scroll-within-picker and drag-to-dismiss must coexist without jank.
````

---

## Workspace shell — Empty (just created, no content yet)

````
**What this screen is for:**
Welcome the user into a brand-new workspace and make it obvious how to add the first content.

**What's visible:**
A full-height sheet sliding up over the chat surface. Persistent chrome:
- **Top bar**: a close/back affordance on the leading edge (returns to the chat); a content-type icon (text or list) and the task title centered or on the leading edge; an overflow affordance on the trailing edge containing the finish action.
- **Content area**: the bulk of the screen — currently empty, showing a quiet prompt-style affordance in friend-tone copy ("what's first?" / "tell Ben what to put here") sitting in calm whitespace, indicating where content will land. The empty state's visual treatment may differ slightly based on the content type (a hint of "this will be a list" vs "this will be a text body" — quiet, not loud).
- **Above the composer**: no diff bar (no pending changes); a small most-recent-Ben-reply banner if Ben has said something since the workspace was created (otherwise hidden).
- **Composer**: same press-and-hold-mic + text input pattern as the main chat, anchored at the bottom.

**What the user can do:**
- Primary: press and hold the mic to dictate something, or tap into the empty content area to type directly.
- Secondary: close the workspace via the back affordance (the task stays active; user can return any time).
- Tertiary: open the overflow to finish the task (rarely chosen from empty, but available).

**Feel:**
The empty workspace should feel like opening a fresh page in a well-made notebook — calm, inviting, focused. Generous whitespace; the prompt copy is friendly without being instructional. The content-type hint in the top bar quietly tells the user "this is a list" or "this is a draft."

**State context:**
Ben just created this task (typically via the user's most recent chat capture) and the user tapped Start to enter it. No content yet, no conversation in the sub-thread.

**Critical affordances:**
The empty content area must feel like an inviting canvas, not a missing component. The press-and-hold mic must be just as prominent as it is on the main chat. The close affordance must clearly return the user to chat without losing the task.
````

---

## Workspace shell — Populated (text component)

````
**What this screen is for:**
Show the working text content that the user and Ben are iterating on together — a focused draft surface.

**What's visible:**
Same persistent chrome as Empty (top bar with back, title, content-type icon, overflow). The content area displays a single text body — multi-line, readable, with comfortable line height. The text is directly editable: tapping into it focuses the text and surfaces the soft keyboard. When the keyboard is open and the user is editing directly, the bottom composer may collapse to give the content surface more vertical room, with a small affordance to expand it back. When Ben proposes edits (via the diff bar — see Pending-diff state), the changes overlay the content surface as diff markup. The most-recent-Ben-reply banner is visible just above the composer (or just above the diff bar when present) showing the latest sub-thread message.

**What the user can do:**
- Primary: read the text; talk to Ben via the composer to ask for edits; tap into the text to edit directly.
- Secondary: open the sub-thread tray (expand the most-recent-reply banner) to review back-and-forth.
- Tertiary: finish the task via the overflow; close the workspace.

**Feel:**
The content area is the focal point — the screen feels like a draft, not a chat. Type is generous and readable, optimized for prose. The composer at the bottom is quietly present but not competing with the content. The most-recent-reply banner is subtle — a quiet supporting strip, not a second content surface.

**State context:**
The task has a text body that the user (and possibly Ben) have built up. No pending diff right now.

**Critical affordances:**
The text must be editable directly (tap to type) AND ben-editable (via the composer-driven diff flow). Both routes must coexist without confusion. The content surface always takes visual priority over the sub-thread.
````

---

## Workspace shell — Populated (todo list component)

````
**What this screen is for:**
Show the working todo list that the user and Ben are building and refining together.

**What's visible:**
Same persistent chrome. The content area displays a vertical list of todo items. Each item: a checkbox on the leading edge and the item title (single line, can grow to two lines if needed). Tap a checkbox to toggle done; done items render with a quiet completed treatment (muted fill, optional strike-through). The list is reorderable by long-press-and-drag (a basic v1 interaction). An "add item" affordance sits at the bottom of the list or as a quiet inline last-row placeholder — user can type to add an item directly. Ben-driven edits (add, remove, edit) appear as pending diff markup when present. Sub-thread most-recent-reply banner above the composer as in the text component.

**What the user can do:**
- Primary: tap checkboxes to mark items done; talk to Ben via the composer to add, remove, or rewrite items; tap the add affordance to insert an item directly.
- Secondary: long-press-and-drag a row to reorder; tap into an item's title to edit it directly.
- Tertiary: finish the task; close the workspace; expand the sub-thread tray.

**Feel:**
The list is the focal point. Checkboxes are comfortable to tap. Done-state visual is gentle — not a victory lap. Type for titles is comfortable to read at length. The list feels like a well-kept piece of paper, not a corporate task tracker.

**State context:**
The task has a todo list with one or more items. No pending diff right now.

**Critical affordances:**
Both user-driven and Ben-driven edits must produce the same data — tapping a checkbox here updates the row in any other surface that shows it. The reorder gesture must be discoverable without intruding (no permanent "drag handle" widget visible on every row — long-press is enough for v1).
````

---

## Workspace shell — Composing (text input focused in the workspace composer)

````
**What this screen is for:**
Let the user type a follow-up to Ben without leaving the workspace.

**What's visible:**
Same persistent chrome. The text input area in the workspace composer is expanded; soft keyboard is up. Mic morphs to send affordance once any character is in the input. The content area remains visible above (text or list, whichever this workspace has). The most-recent-reply banner remains visible above the composer if vertical space allows.

**What the user can do:**
- Primary: type and send a message to Ben (scoped to this task's sub-thread).
- Secondary: tap outside the composer to dismiss the keyboard and return to the standard populated layout.

**Feel:**
Same morph behavior as the main chat composer. The transition is quiet.

**State context:**
The user is composing a follow-up to Ben within the workspace's sub-thread.

**Critical affordances:**
The mic remains visible even when text is being typed (de-emphasized, not removed). The workspace composer must feel identical to the main chat composer except for what it acts on.
````

---

## Workspace shell — Recording (press-and-hold mic in workspace composer)

````
**What this screen is for:**
Let the user dictate to Ben from within the workspace.

**What's visible:**
The content area dims slightly to focus attention on the composer area. The workspace composer transforms with the same recording overlay pattern as the main chat: live waveform / level meter, elapsed timer, slide-to-cancel hint. Mic indicator pulses.

**What the user can do:**
- Primary: hold and speak; release to send.
- Secondary: slide left to cancel.

**Feel:**
Identical to the main-chat recording feel — alive, responsive, calm color, no flashing.

**State context:**
The user is dictating within the workspace's sub-thread.

**Critical affordances:**
The recording experience must be indistinguishable from the main chat — same gestures, same overlay, same trust signals.
````

---

## Workspace shell — Transcribing & Awaiting Ben reply

````
**What this screen is for:**
Bridge the moment between user finishing speaking and Ben replying — within the workspace.

**What's visible:**
The recording overlay collapses. The most-recent-reply banner area updates to show a pending user-message representation with a transcribing indicator. Once transcription completes, that representation finalizes with the user's transcribed text. A Ben typing indicator then appears (still within the banner area). When Ben replies with edits, the diff bar appears (see Pending-diff state); when Ben replies with just conversation (no content edits), the banner updates with Ben's text and no diff bar appears.

**What the user can do:**
- Primary: wait briefly; capture again if rapid-fire is desired.
- Secondary: expand the sub-thread tray to see the conversation in full.

**Feel:**
Quiet and quick. The banner is the smallest surface for sub-thread activity — it should never compete with the content area.

**State context:**
Sub-thread is processing the user's most recent message.

**Critical affordances:**
The composer must remain live for stacking follow-ups. The banner must update smoothly without yanking the layout.
````

---

## Workspace shell — Pending-diff (Ben proposed content changes)

````
**What this screen is for:**
Show the user what Ben wants to change before any change lands, and give them clear approve/reject control.

**What's visible:**
Same persistent chrome. The **content area** renders the workspace content with diff markup overlaying the changes Ben proposed in his most recent turn:
- **Added** text or items rendered with a soft additive treatment (a gentle warm fill behind the new content, or a leading additive marker — quiet positive presence, not bright green).
- **Removed** text or items rendered with a soft subtractive treatment (struck-through with a muted fill, or a leading subtractive marker — quiet retraction, not bright red).
- **Replaced** segments shown side-by-side or with the old crossed out adjacent to the new highlighted.
The **diff bar** appears just above the composer as a horizontal strip containing two equal-weight actions: **Approve** and **Reject**. The bar may include a brief context line ("Ben suggested 3 changes" or similar) but should not require reading copy to act. The most-recent-Ben-reply banner is briefly suppressed or moved to make room for the diff bar.

**What the user can do:**
- Primary: tap Approve to commit the changes (content updates to the new state, diff styling clears, diff bar dismisses).
- Primary (equal weight): tap Reject to discard the changes (content reverts, diff bar dismisses).
- Secondary: scroll the content area to review the full diff before deciding.
- Tertiary: continue chatting in the composer — sending a new message before approving the diff invalidates the diff (see Edge cases). Closing the workspace preserves the pending diff.

**Feel:**
The diff treatment is a *friendly review*, not a code review. Additive and subtractive fills are soft, warm, and grown-up — no bright green / red. The visual goal is "Ben showed his work, and you're choosing whether to keep it" — calm, considered, not technical. Approve and Reject are visually equal — neither is destructive enough to need confirmation; neither is the "default safe" choice. The bar's presence is unmistakable but not alarming.

**State context:**
Ben's most recent turn included a tool call that proposed edits to the workspace content (add a todo, rewrite a paragraph, remove an item). The changes are not yet committed.

**Critical affordances:**
The Approve / Reject scope is **the whole turn** — one tap commits or discards everything Ben proposed in that turn, regardless of how many individual edits. The diff markup must be readable at a glance (the user should be able to skim and decide in seconds). The bar must never accidentally dismiss — only a deliberate Approve, Reject, or new conversation turn should clear it.
````

---

## Workspace shell — Error states

````
**What this screen is for:**
Surface failures within the workspace honestly, in place, with clear recovery.

**What's visible:**
There are four distinct error surfaces inside a workspace:

1. **Workspace load failed** (the workspace shell rendered but the content data didn't load) — Content area shows a soft-error band with friend-tone copy ("couldn't load this one — tap to retry") and a retry tap-target. Top bar and composer remain visible and functional; the user can close the workspace and return to chat.

2. **Content save failed** (a direct user edit or an Approve action didn't persist) — A small inline error toast or band appears just above the diff bar (or just above the composer if no diff is present) with friend-tone copy ("didn't go through — retry") and a retry affordance. The local content state is preserved as pending so no work is lost.

3. **Ben reply failed in sub-thread** — The typing indicator in the most-recent-reply banner flips to an error bubble with retry affordance, same pattern as the main chat. The user's message stays in the sub-thread.

4. **Diff approve/reject failed** (network blip during commit) — The diff bar shows a retry affordance instead of dismissing. Content state preserved as pending diff. The user can retry or close the workspace; the pending diff persists across close/re-open.

**What the user can do:**
- Primary: tap the relevant retry.
- Secondary: close the workspace (state is preserved).

**Feel:**
Friendly, non-alarming. Soft error fills, friend-tone copy. The workspace itself never becomes unrecoverable.

**State context:**
A specific stage of the workspace pipeline failed.

**Critical affordances:**
Each error must surface in the affected area. The user must always be able to close the workspace and return to the main chat — workspaces never trap the user.
````

---

## Workspace shell — Permission-denied (mic) & Offline

````
**What this screen is for:**
Handle the same mic and network states as the main chat, scoped to the workspace.

**What's visible:**
- **Permission-denied (mic)**: same persistent banner pattern as the main chat, placed just above the workspace composer. Text input continues to work; mic re-surfaces the banner on tap.
- **Offline**: subtle banner at the top of the workspace (below the top bar) with friend-tone copy. If queueing is implemented, captures and direct edits queue locally; on reconnect they sync. If queueing is not implemented, composer is disabled with the same banner. Content is always readable; users can scroll, check checkboxes locally, and review prior conversation.

**What the user can do:**
- Primary (permission-denied): tap the banner's help affordance; type via text input.
- Primary (offline): same as main chat — queue or wait, depending on implementation.
- Secondary: close the workspace to return to chat.

**Feel:**
Identical to the main-chat patterns. The user should never feel like the workspace is a different product from the chat.

**State context:**
Mic was denied at some point, or network is unavailable. The workspace continues to function as much as possible.

**Critical affordances:**
Text fallback is always available. Local content remains readable offline.
````

---

## Workspace shell — Finished (just marked done)

````
**What this screen is for:**
Give a small, satisfying acknowledgment when the user marks a task done, then return them to the chat.

**What's visible:**
After the user taps the finish affordance (in the top-bar overflow), a brief in-place confirmation moment: a quiet friend-tone message ("nice. that one's done.") with a subtle visual settlement on the workspace content (a soft fade or a gentle done-treatment overlay). The workspace then dismisses — sliding back down or fading out — and the main chat surface comes into view. The active-task peek above the chat composer updates to reflect the new count (one fewer active). The task card in chat scrollback transitions to its finished visual treatment.

**What the user can do:**
- Primary: nothing — the confirmation and dismissal happen automatically over a brief moment.
- Secondary: nothing yet — back at the chat surface, the user can keep capturing or open another task.

**Feel:**
Quietly satisfying. The done moment is gentle — not a victory lap, not a confetti animation. A small, well-crafted micro-moment that rewards attention without demanding it. The transition back to chat is smooth.

**State context:**
The user just marked the task done. The task is moving from active to history.

**Critical affordances:**
The finish action must produce a clear, irreversible-feeling transition (without literally being irreversible — the user can reopen from history). The active-task peek's count must visibly decrement so the user sees the consequence of their action.
````

---

## Workspace shell — Edge cases

````
**What this screen is for:**
Handle real-world interaction edges cleanly.

**What's visible:**
- **User dismisses workspace mid-pending-diff** — pending diff is preserved; the next time the user opens this workspace, the diff bar reappears with the proposal intact. The active-task peek may show a small indicator that this task has a pending review (optional polish; not blocking).
- **User edits content directly during a pending diff** — the diff is invalidated; a brief reconciliation message ("your edits made the diff stale — ask Ben to redo those") appears, and the diff bar dismisses. The user's direct edit lands; Ben's proposed changes are discarded.
- **Very long content** (text body or todo list) — content area scrolls; top bar and composer remain anchored. The most-recent-reply banner remains visible above the composer.
- **Returning to a finished task from history** — workspace opens in read-only mode: composer disabled, content non-editable, top bar shows a quiet "finished" indicator and a small "reopen" affordance in the overflow to move the task back to active.
- **Content type is set at task creation and is not changeable in v1** — if the user dictated something list-shaped but Ben created a text task (or vice versa), the user has to abandon and re-ask Ben for the right shape. Flag for the renderer to design the empty state with clear enough type signaling that the mismatch is obvious early.

**What the user can do:**
- Primary: continue normally based on the variation.

**Feel:**
Resilient. None of these edges should produce a janky or broken-looking surface.

**State context:**
Real interaction patterns. Pending diffs across sessions, direct edits during diffs, long content, finished-task review, type mismatches.

**Critical affordances:**
Pending diffs must survive close/re-open. Direct edits must invalidate stale diffs gracefully. Finished tasks must be reviewable without offering misleading edit affordances.
````
