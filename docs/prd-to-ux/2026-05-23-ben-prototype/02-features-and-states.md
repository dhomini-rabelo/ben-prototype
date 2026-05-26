# Features & States — Ben v1

_Scoped by the chosen UX philosophy in `01b-ux-philosophy.md` — "Chat with Task Workspaces"._

> **PRD divergence (carried from the philosophy doc):**
> 1. The PRD's "task" capture is replaced by a richer **task workspace** with content (text, todo list) and a diff-approve loop.
> 2. The PRD's "no hamburger menu" line is relaxed — a **menu sidebar** is added for tasks history, notes, reminders, and settings.
> 3. Reminders no longer have a chat-surface peek; they're browsable from the menu sidebar.

---

## Feature: Sign-in (Google OAuth via Supabase)

**User Stories:**
- As the founder (sole v1 user), I want to sign in once with my Google account, so that Ben can persist my captures across sessions without me managing a password.

**Screens this feature spans:**
- Sign-in screen — single-purpose surface that hands off to Google OAuth and returns the user to the chat.

### Screen: Sign-in screen

**States:**

#### Empty
Centered layout. Ben's wordmark, a one-line friend-tone tagline, and a single primary button: **Continue with Google**. Nothing else.

#### Loading
Quiet "redirecting…" message; button non-interactive.

#### Populated
Not applicable — no data layer on this screen.

#### Error
OAuth failed / Supabase down / Google denied: inline soft-error band above the button with friend-tone copy; button re-enabled for retry. Allowlist-reject is a sibling state: "Ben's invite-only right now" without retry.

#### Permission-denied
User cancels Google popup or denies scopes: same visual as Error, warmer copy ("looks like that didn't go through — want to try again?"). Button re-enabled.

#### Edge cases
- **Already signed in**: user never sees this screen.
- **Extended wait**: secondary "still waiting on Google…" line fades in after a delay.
- **iOS Safari PWA redirect break**: screen must look intentional when the user returns from a full-page redirect.

**Interaction notes:**
- Single primary action. No secondary affordances.
- Retry is in-place; layout doesn't move on error.
- Friction note: errors must offer one obvious re-try on the same screen — bouncing to a separate error route drains trust on a first impression.

---

## Feature: Chat surface (the home screen)

**User Stories:**
- As a busy person mid-task, I want to press a button and dictate a sentence, so that Ben hears me, transcribes me, classifies what I said, and files it.
- As a user with active tasks, I want to see at a glance that I have unfinished work and jump into a specific one, so that I can pick up where I left off.
- As a user reviewing what I told Ben earlier today, I want to scroll back through the conversation, so that I can confirm what was captured.
- As a user, I want a text fallback when I can't speak, so that I'm never blocked from capturing.

**Screens this feature spans:**
- Chat screen — the primary surface; conversation stream + composer + active-task peek + menu affordance live here.

### Screen: Chat screen

**Persistent chrome (across states):**
- A small **menu affordance** sits in the leading edge of a minimal top bar — tap to open the menu sidebar (see Feature: Menu sidebar).
- The **active-task peek** strip sits just above the composer.
- The composer is anchored at the bottom.

**States:**

#### Empty (first-run, no message history, no active tasks)
Ben's welcome message in the chat area: a short friend-tone greeting that names the press-and-hold affordance. Active-task peek shows empty content ("nothing on deck — Ben's listening"). Composer at the bottom with mic dominant.

#### Loading (initial app load with existing history and tasks)
Composer rendered immediately and fully interactive. Skeleton bubbles in the chat area; skeleton content in the active-task peek strip.

#### Populated (steady state)
Chronological message stream. User messages right-aligned, Ben messages left-aligned with a small Ben indicator. Inline capture cards (see Feature: Inline capture cards) inside Ben's bubbles where relevant. **Active-task peek** shows the active task count and the title of the most recent active task ("3 active · {recent task title}" — exact composition is design-direction territory). Tapping the peek opens the **active-task picker**. Menu affordance in the top bar.

#### Composing (text input focused)
Keyboard up; mic morphs to send affordance once any character is in the input. Active-task peek may compress to its count-only form if keyboard space forces it.

#### Recording (press-and-hold active)
Chat dims slightly. Recording overlay above the composer: live waveform / level meter, elapsed timer, slide-to-cancel hint. Active-task peek hides during recording.

#### Transcribing (post-release, waiting on Whisper)
Pending user bubble appears with a transcribing indicator. Composer briefly disabled. Cancel option on the pending bubble.

#### Awaiting Ben reply (post-transcription, model thinking)
User bubble finalized. Ben-side typing indicator appears. Composer re-enabled.

#### Error
- **Mic-record failed**: inline toast above the composer.
- **Transcription failed**: pending bubble flips to error with retry.
- **Ben reply failed**: typing indicator flips to error bubble with retry.
- **Save failed**: inline card inside Ben's reply shows retry.
- **Audio over 30s**: brief banner; transcription continues with truncated audio.

#### Permission-denied (mic)
Persistent dismissable banner above the composer with help-sheet link; text fallback remains live; mic taps re-surface the banner.

#### Offline
Subtle banner at the top of the chat ("offline — Ben's listening but can't reply yet"). If queueing is implemented: composer continues to work, messages queue with a pending indicator and send on reconnect. If not: composer disabled with same banner. Active-task peek and prior chat remain readable.

#### Edge cases
- **Very long single user message** — bubble grows; chat auto-pins to bottom.
- **Rapid-fire captures** — multiple pending bubbles render in order; Ben's replies stream in as they arrive.
- **Returning from background** — chat restored to last scroll position; in-flight recording cancelled with banner.

**Interaction notes:**
- Progressive disclosure: recording overlay only during press-and-hold; send affordance only when text in composer; menu sidebar only when affordance tapped; active-task picker only when peek tapped.
- Key affordances: (1) press-and-hold mic, (2) text composer, (3) menu sidebar affordance in top bar, (4) active-task peek strip above composer, (5) tap inline capture cards (note/reminder to open detail modal, task to open workspace via Start affordance).
- What changes between states: composer morphs (mic → recording → send); user bubbles have pending → transcribed → final lifecycle; Ben bubbles have typing → final lifecycle.
- Friction note: mic permission is the highest-stakes single moment in the app. Persistent help banner on denial is non-negotiable.
- Friction note: text fallback must remain reachable through all error and permission states.

---

## Feature: Inline capture cards (Note / Reminder / Task / Clarifying-question)

**User Stories:**
- As a user who just dictated something, I want immediate visible confirmation that Ben filed it correctly, so that I trust the system.
- As a user who just dictated a substantive task, I want a one-tap path into the workspace so I can start working on it, so that the friction between idea and doing is minimal.
- As a user whose dictation was ambiguous, I want Ben to ask me a clarifying question in-line, so that I resolve the ambiguity in the same conversation.

**Screens this feature spans:**
- Note card (inline in Ben's reply bubble)
- Reminder card (inline in Ben's reply bubble)
- Task card (inline in Ben's reply bubble, with a Start affordance into the workspace)
- Clarifying-question message (no card)
- Item detail modal (shared surface — opens from note/reminder card tap, also reachable from the menu sidebar's lists)

### Sub-screen: Note card

**States:**
- **Loading (optimistic-save in flight)** — card appears immediately with subtle pending indicator; title + body preview visible from the tool payload.
- **Populated (saved)** — compact card with "note" label, title, one-to-two-line body preview, ellipsis truncation. Tap opens item detail modal.
- **Error (save failed)** — soft error fill with inline retry; content remains visible.
- **Edge cases**: empty title → "untitled note" placeholder; very long body → truncate with ellipsis.

### Sub-screen: Reminder card

**States:**
- **Loading** — pending indicator; title + relative-time visible.
- **Populated (upcoming)** — "reminder" label, title, relative-time emphasized ("in 2h", "tomorrow 9am"). Tap opens item detail modal.
- **Populated (fired — past `fires_at`)** — relative-time switches to past-relative ("3h ago"); a "fired" visual marker; visually de-emphasized. V1: no OS notification fired — this is a visual state only.
- **Error** — same pattern as Note.
- **Edge cases**: `fires_at` in the past at save time (renders as fired immediately); `fires_at` very far future (relative-time degrades gracefully — "in 7 months").

### Sub-screen: Task card

**States:**
- **Loading (optimistic-create in flight)** — card appears immediately with pending indicator. Contents: "task" label, task title, an icon hint of the task type (text vs todo list — Ben's tool-use decision), and a **Start** affordance rendered prominently. Start is disabled while pending.
- **Populated (created, not started)** — same contents, Start affordance fully enabled. Tapping Start opens the task workspace. Tapping the card body (not Start) also opens the workspace.
- **Populated (active — user has entered the workspace at least once but task not yet finished)** — visual marker indicating the task is in active progress (e.g., a small "active" label or a slightly different fill); Start affordance reads as "Continue" or equivalent. Tap to re-enter workspace.
- **Populated (finished)** — task is in history. Card adopts a "done" visual treatment (muted fill, optional strike-through on title, "finished {relative-time}" supporting text). Tap opens the workspace in a read-only/historical mode.
- **Error (create failed)** — soft error fill with retry; title and Start affordance remain visible but Start is disabled until retry succeeds.
- **Edge cases**: very long title — truncate with ellipsis; task that Ben created but never opened — still has Start affordance, lives in active-task peek.

> Note: there is no inline checkbox on the task card in this model. Marking a task done happens inside its workspace. The PRD's "quick task with title + done" is subsumed by the workspace concept.

### Sub-screen: Clarifying-question message

**States:**
- **Populated (only state)** — plain Ben message bubble with a friend-tone question. No card. Composer is the response mechanism; no inline reply chips.
- **Edge cases**: chained clarification (multiple turns); user abandons by switching topics (original capture silently dropped, no stale state).

### Sub-screen: Item detail modal (shared)

A modal sheet reachable from a note or reminder card tap (in chat) or from a note/reminder row tap (in the menu sidebar's lists).

**States:**
- **Populated (Note detail)** — note label, title, full body (scrollable), captured-at absolute + relative timestamps. Read-only in v1.
- **Populated (Reminder detail)** — reminder label, title, `fires_at` absolute + relative, status (upcoming/fired), captured-at timestamp. Read-only.
- **Loading** — skeleton (may be unnecessary if data is already in-row; flag for renderer).
- **Error** — inline error band with retry; close affordance remains usable.
- **Edge cases**: long body scrolls inside sheet; item deleted from another session → "this one's gone" graceful close.

**Interaction notes (all card and detail surfaces):**
- Progressive disclosure: cards show minimum metadata; detail modal shows the full record.
- Key affordances: Note/Reminder → tap card to open detail modal. Task → tap Start (or card body) to open workspace.
- What changes between states: pending indicator clears on save; reminder relative-time updates over time; task card state moves through created → active → finished.
- Friction note: optimistic creation (card visible immediately, pending indicator until persisted) is essential for the "feels like a friend" intuition.
- Friction note: no in-line edit on notes/reminders in v1. Corrections happen via conversation — the user tells Ben.

---

## Feature: Task workspaces (the new center of gravity)

**User Stories:**
- As a user with a substantive task ("help me draft the proposal email"), I want a dedicated screen where Ben and I can collaborate on the content turn by turn, so that I don't have to scroll through chat to find what we're working on.
- As a user, I want to see Ben's proposed edits before they land on my content, so that I keep control over what changes (like reviewing a git diff).
- As a user, I want the content surface to fit the task — text for prose-shaped work, a todo list for list-shaped work — so that the UI matches what I'm actually doing.
- As a user, I want to leave a workspace mid-work and come back to it later, so that I can context-switch without losing progress.
- As a user finishing a task, I want one obvious way to mark it done, so that completed work moves to history and stops cluttering my active list.

**Screens this feature spans:**
- Active-task picker (overlay or sheet listing all active tasks, opened from the peek)
- Workspace shell (the slide-up screen for a single task — title bar, content area, sub-thread composer, diff bar when applicable)
- Workspace content components (text component, todo list component — possibly more in future)

### Sub-screen: Active-task picker

**States:**

#### Empty
Should not appear in practice — if there are zero active tasks, the active-task peek is in its empty state and the picker isn't reachable. If reached anyway (race condition), show a friendly "nothing active — you're all clear" with a dismiss affordance.

#### Loading
Skeleton rows for active task entries.

#### Populated
Vertical list of active task rows, reverse-chronological by last-activity (most recently touched first). Each row: task icon, title (primary), and a supporting line ("just created" / "active · 2h ago" / "started today"). Tap a row to enter that task's workspace; the picker dismisses.

#### Error
Inline error band; retry affordance; dismiss still works.

#### Edge cases
- **Long list of active tasks** (founder accumulates many): standard vertical scroll.
- **Drag-to-dismiss** vs **tap outside**: both should collapse the picker back to the chat.

### Sub-screen: Workspace shell

Slides up over the chat surface (full-height sheet on mobile). Persistent chrome inside the shell:
- Top: a small back/close affordance, an **icon** representing the task type, the **task title**, and an overflow affordance (for finish + delete-or-archive actions in v1.x; v1 minimal — finish + back only).
- Middle: the **content area** (text component or todo list component — see content states below).
- Above the composer: the **diff bar** when there are pending Ben changes (otherwise hidden).
- Bottom: a **composer** (same press-and-hold-mic + text fallback pattern as the main chat, scoped to this task's sub-thread).

**States:**

#### Empty (workspace just opened, no content yet)
Ben created the task with a title but no content body yet. The content area shows a quiet prompt-style affordance — friend-tone copy in the empty content space ("what's first?" / "tell Ben what to put here") encouraging the user to dictate or type. The composer is fully live.

#### Populated — text component
Content area shows a single text body — multi-line, readable, with comfortable line height. Behaves like a focused draft surface (drafting an email, writing a plan, capturing structured notes). User can also directly edit the text by tapping into it (text is editable, not read-only). Ben's edits via tool calls appear as a pending diff (see Pending-diff state).

#### Populated — todo list component
Content area shows a vertical list of todo items, each with a checkbox on the leading edge and a title. User can tap a checkbox to toggle done. User can also long-press or use an explicit affordance to reorder, delete, or directly edit a todo (basic interaction; v1 keeps it minimal). Ben's edits via tool calls appear as pending diff.

#### Composing (text input focused in the workspace composer)
Same morph as the main chat — mic → send affordance when text in composer. Content area remains visible above; diff bar (if present) remains visible.

#### Recording (press-and-hold mic in the workspace composer)
Same recording overlay pattern as the main chat (waveform, timer, slide-to-cancel). Content area dims slightly.

#### Transcribing
Same pending-bubble pattern in the sub-thread (which is rendered… *where* in the workspace? See note below).

> **Sub-thread rendering decision:** the workspace's sub-thread conversation should not occupy the same vertical space as the content surface — the content is the focus. Option A: a collapsible "conversation" tray that slides up from above the composer when the user wants to review the back-and-forth. Option B: the most recent Ben reply is visible as a small banner just above the diff bar; full conversation reachable via a small affordance. Either way, content > conversation hierarchy. **For v1, default to Option B** (most recent reply visible, full sub-thread expandable) — it preserves content focus while keeping Ben's immediate reply close.

#### Awaiting Ben reply
Typing indicator visible in the most-recent-reply banner area (Option B).

#### Pending-diff (Ben proposed changes to content)
The diff bar appears just above the composer with two clear actions: **Approve** and **Reject**. The content area visually shows the proposed change in a diff style — added text or todo items highlighted in an additive treatment (typically a soft positive fill or a leading marker); removed text or items shown with a subtractive treatment (struck-through or muted with a leading marker); replaced segments shown side-by-side or with the old crossed out and the new highlighted. Tapping Approve commits the changes (content updates to the new state, diff styling clears, diff bar dismisses). Tapping Reject discards the changes (content reverts; diff bar dismisses). Per-turn scope — one Ben turn produces one approve/reject unit, regardless of how many individual edits it contained.

#### Error
- **Workspace load failed**: shell renders with skeleton content and an inline error band offering retry.
- **Content save failed** (user edit or approve action didn't persist): soft error toast above the diff bar / content area with retry.
- **Ben reply failed in sub-thread**: typing indicator flips to error bubble with retry, same as main chat.
- **Diff approve/reject failed** (network during commit): the diff bar shows a retry affordance instead of dismissing; content state is preserved as pending.

#### Permission-denied (mic in workspace composer)
Same banner pattern as main chat, scoped to the workspace composer.

#### Offline
Banner at the top of the workspace; sub-thread captures queue if queueing is implemented; content edits made by the user persist locally and sync on reconnect.

#### Finished (just marked done)
User taps the finish affordance (in the top bar overflow or a dedicated finish action). Brief confirmation moment (friend-tone copy or a quiet animation), then the workspace dismisses back to the chat. The task card in chat history transitions to its "finished" visual treatment; the task disappears from the active-task peek count and moves to the menu sidebar's Tasks history.

#### Edge cases
- **User dismisses workspace mid-pending-diff**: changes remain pending; the next time the user opens this workspace, the diff bar reappears with the proposal intact. Don't discard pending diffs silently.
- **User edits content directly during a pending diff**: the diff is invalidated; show a brief reconciliation message ("your edits made the diff stale — Ben needs to re-do those"). For v1, simplest behavior is to reject the pending diff on direct edit and let the user re-ask Ben.
- **Content type switch mid-task** (workspace started as text, user wants a todo list now): v1 keeps the component type fixed at create time; mid-task switching is v1.x+. Flag for the renderer to design the empty workspace state so users understand the type is set at creation.
- **Very long content** (text body or todo list): content area scrolls; top bar and composer remain anchored.
- **Returning to a finished task from history**: workspace opens read-only — composer disabled, content editable only via a "reopen" affordance that moves the task back to active.

**Interaction notes:**
- Progressive disclosure: the diff bar only appears when there are pending changes. The sub-thread conversation is collapsed to most-recent-reply by default; expand to review the back-and-forth. The finish action is one tap deep (in the top bar overflow) — important enough to be findable, not so prominent that it competes with the composer.
- Key affordances: (1) close/back to chat, (2) finish task, (3) workspace composer (mic + text), (4) content surface (editable text or interactive todos), (5) approve/reject diff bar when present.
- What changes between states: content surface reflects Ben's edits after Approve; diff bar appears/disappears; sub-thread composer mirrors main chat composer states.
- Friction note: the diff approve/reject is the *trust mechanism* — without it, the user has to either trust Ben blindly with their content or never let Ben edit. The diff bar must be visually unmistakable when present, and approving/rejecting must be one tap each.
- Friction note: workspace must preserve state across dismiss/re-enter. Losing pending diffs or in-flight edits on dismiss would break the "I'll come back to this" flow.
- Friction note: the workspace composer must not feel like a different product from the main chat — same press-and-hold mic, same friend tone, same Ben. The only thing different is the scope of what Ben's edits affect (this task's content).

---

## Feature: Menu sidebar

**User Stories:**
- As a user, I want to browse my full notes, reminders, and tasks history, so that I can find older items without scrolling chat.
- As a user, I want to access settings and sign out, so that I can manage my account when needed.

**Screens this feature spans:**
- Sidebar panel (slide-in from the leading edge of the chat or workspace)
- Tasks view (history list — both active and finished)
- Notes view (browse list)
- Reminders view (browse list with relative-time labels — this is the PRD's "in-app mocked-alarms list")
- Settings modal (profile + sign-out)

### Sub-screen: Sidebar panel

**States:**

#### Empty
Not applicable — the sidebar always has its four entries (Tasks, Notes, Reminders, Settings) regardless of data state.

#### Populated (default)
Slide-in panel from the leading edge covering a portion of the chat surface (the chat remains visible behind, dimmed). The panel contains a small header (Ben's wordmark or a user identity hint), four list entries — **Tasks**, **Notes**, **Reminders**, **Settings** — each with a small icon hint and a count badge where meaningful (e.g., Tasks: "3 active", Notes: total count, Reminders: total upcoming). Tap any entry to drill into the corresponding view.

#### Loading
Skeleton placeholders for the count badges; entry labels visible immediately.

#### Error
If counts fail to load, entries still tap-through to their detail views (which will surface their own errors).

#### Edge cases
- **Sidebar open during workspace**: yes — the menu is reachable from both the main chat and from inside a workspace (via the same top-bar menu affordance). Tapping an entry navigates appropriately (e.g., tapping a task from the menu while in a different task's workspace switches workspaces).

### Sub-screen: Tasks view (history)

**States:**

#### Empty
Friend-tone empty copy ("no tasks yet — talk to Ben, he'll set one up when something needs working on").

#### Loading
Skeleton rows.

#### Populated
Two sections: **Active** (open tasks, sorted by most recent activity) and **Finished** (completed tasks, descending by finished-at). Each row: task icon, title, supporting line ("active · 2h ago" / "finished yesterday"). Tap a row to enter that task's workspace (active tasks open editable; finished tasks open read-only with a reopen affordance).

#### Error
Inline error band with retry.

#### Edge cases
- **Very long list of finished tasks**: standard scroll; no pagination v1.
- **Active section empty but Finished has items**: only Finished section shows (no empty Active header).

### Sub-screen: Notes view

**States:**

#### Empty
Friend-tone empty copy ("no notes yet — talk to Ben, he'll save the keepers").

#### Loading
Skeleton rows.

#### Populated
Vertical list of note rows, reverse-chronological. Each row: title, one-line body preview (truncated), captured-at relative time. Tap a row to open the shared item-detail modal.

#### Error
Inline error band with retry.

#### Edge cases
- **Long body preview**: truncate with ellipsis; full body in detail modal.
- **Long list**: standard scroll.

### Sub-screen: Reminders view

**States:**

#### Empty
Friend-tone empty copy ("no reminders yet — say 'remind me to…' and Ben'll catch it").

#### Loading
Skeleton rows.

#### Populated
Two sections: **Upcoming** (sorted ascending by `fires_at`) and **Fired** (descending). Each row: title, relative-time (emphasized — "in 2h" / "tomorrow 9am" / "3h ago"), and a small status indicator for fired items. Tap a row to open the shared item-detail modal. This view is the **PRD's mocked-alarms list with relative-time labels**, relocated from the original drawer concept to the menu sidebar.

#### Error
Inline error band with retry.

#### Edge cases
- **No upcoming, has fired**: only Fired section shows.
- **All in the past**: same — Upcoming section hidden.

### Sub-screen: Settings modal

**States:**

#### Populated (default)
Modal sheet (centered or bottom-sheet — design direction's call). Contents:
- Small profile section: user's name (from Google), email, optional avatar (from Google profile picture).
- A clear **Sign out** action.

V1 does not include other settings (no vibe selector, no Notion integration toggles — all deferred per PRD).

#### Loading
Skeleton placeholders for profile fields.

#### Error
If profile loads fail, show the email (from auth context) and a quiet "couldn't load full profile" line. Sign-out remains available.

#### Edge cases
- **Sign-out in progress**: brief disabled state on the sign-out action; on completion, redirect to the sign-in screen.

**Interaction notes (sidebar overall):**
- Progressive disclosure: sidebar entries lead to dedicated views; views lead to detail modals (for notes/reminders) or workspaces (for tasks).
- Key affordances: (1) sidebar entries (Tasks, Notes, Reminders, Settings); (2) row taps within each view; (3) sign-out in Settings.
- What changes between states: counts update as data loads; sections appear/hide based on data presence.
- Friction note: the sidebar is the archive — it should feel browsable, not transactional. Don't add bulk actions, multi-select, or filters in v1; the founder's volume doesn't need them yet.
- Friction note: the relative-time labels in the Reminders view are the PRD's locked metric for the "mocked alarms" feature — they must render in friend-friendly form ("in 2h", "tomorrow 9am", "3h ago"), never as raw timestamps.

---
