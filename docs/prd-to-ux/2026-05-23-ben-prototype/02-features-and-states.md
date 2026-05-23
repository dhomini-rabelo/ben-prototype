# Features & States — Ben v1

_Scoped by the chosen UX philosophy in `01b-ux-philosophy.md` — "Chat with a Live Ledger"._

---

## Feature: Sign-in (Google OAuth via Supabase)

**User Stories:**
- As the founder (sole v1 user), I want to sign in once with my Google account, so that Ben can persist my captures across sessions without me managing a password.

**Screens this feature spans:**
- Sign-in screen — single-purpose surface that hands off to Google OAuth and returns the user to the chat.

### Screen: Sign-in screen

**States:**

#### Empty
The default first-load state for an unauthenticated user. Centered layout. Ben's name/wordmark, a one-line friend-tone tagline ("your busy-day brain — say it, Ben files it"), and a single primary button: **Continue with Google**. Nothing else competes for attention. No marketing copy, no feature list, no email/password fallback.

#### Loading
Two sub-flavors:
- **Pre-OAuth click loading**: button shows a subtle pending state if the session check is still resolving on load (briefly — likely invisible).
- **Post-OAuth-click loading**: after the user taps Continue with Google, the screen shows a quiet "redirecting…" message while the OAuth window opens or the redirect fires. If Google's popup/redirect takes time, this is the only state the user sees.

#### Populated
Not applicable — there is no data layer on this screen. Treat "Empty" as the steady state.

#### Error
- **OAuth failed** (network, Supabase down, Google denied): the screen returns to a state matching Empty but with an inline error band above the button — friend-tone message ("Google didn't let me in — try again?") and the Continue with Google button re-enabled. No raw error codes.
- **Account-not-allowed** (v1 ships single-user; if Supabase RLS or an allowlist rejects the email, surface a plain message: "Ben's invite-only right now.") This is an edge state for v1 but worth a stub prompt.

#### Permission-denied
User cancels the Google popup or denies scopes: same visual as the Error state, friendlier copy ("looks like that didn't go through — want to try again?"). Button re-enabled. No data was created.

#### Edge cases
- **Already signed in**: route is short-circuited at app load; user never sees this screen.
- **Slow network**: loading state persists; no progress bar (we don't own the OAuth window), but a "still waiting on Google…" message can appear after ~5s.
- **iOS Safari PWA quirk**: the OAuth redirect may break out of the PWA frame. Note for the prompt: the screen needs to look intentional when the user returns from a full-page redirect (no flash of unauthenticated content).

**Interaction notes:**
- Progressive disclosure: nothing hidden — this screen has one job.
- Key affordances: **Continue with Google** is the only primary action. No secondary actions in v1.
- What changes between states: the inline error band appears/disappears above the primary button; the button label/disabled state reflects in-flight OAuth.
- Friction note: errors must offer a single, obvious re-try in place — bouncing the user to a separate error route would drain trust on a first impression.

---

## Feature: Chat surface (the home screen)

**User Stories:**
- As a busy person mid-task, I want to press a button and dictate a sentence, so that Ben hears me, transcribes me, classifies what I said, and files it — without me opening another app or typing.
- As a user reviewing what I told Ben earlier today, I want to scroll back through the conversation, so that I can confirm what was captured and re-read Ben's responses.
- As a user, I want a text fallback when I can't speak (in a meeting, mic broken, noisy environment), so that I'm never blocked from capturing.

**Screens this feature spans:**
- Chat screen — the single primary surface; the conversation stream + composer + ledger-drawer affordance live here.

### Screen: Chat screen

**States:**

#### Empty (first-run, no message history)
After sign-in, the chat opens with one welcome message from Ben in his friend tone — a short greeting and a hint at the primary affordance ("yo. press and hold the mic when you got something — or just type."). The composer is at the bottom with the mic button on the trailing edge. The ledger drawer affordance (collapsed peek strip) sits just above the composer in its empty state — "nothing upcoming yet."

#### Loading (initial app load with existing history)
Brief skeleton state: composer rendered immediately; message bubbles fade in as the last 20 are fetched. The drawer peek shows a skeleton placeholder for "Up next" until reminders load. The user can start a new capture before history finishes loading.

#### Populated (steady state)
Chronological message stream — user messages right-aligned, Ben messages left-aligned with a small Ben indicator. Inline capture cards (see Feature: Inline capture cards) appear within Ben's messages where relevant. The drawer peek shows "Up next: `{title}` `{relative-time}`" if a reminder is near-term; otherwise it shows the count of upcoming items ("3 reminders ahead"). Composer always anchored to the bottom.

#### Composing (text input focused)
Keyboard is up. The mic button collapses or fades to a send-arrow once any text is entered. The drawer peek may need to compress or hide while keyboard is up (mobile constraint) — flag this as a layout note for the prompt. Tapping outside the composer dismisses the keyboard and restores the standard populated layout.

#### Recording (press-and-hold active)
The composer transforms: the chat dims slightly, a recording overlay anchors above the held mic button. Overlay contents:
- Live waveform or audio-level meter.
- Elapsed timer ("0:07 / 0:30") — cap at 30s per PRD.
- "Slide left to cancel" hint with a leftward arrow.
- Mic button shows a held/pulsing state.
Releasing the button finalizes the recording and transitions to Transcribing. Sliding the finger left past a threshold cancels — recording is discarded, no message sent.

#### Transcribing (post-release, waiting on Whisper)
A pending user-message bubble appears with a transcribing indicator (subtle dots or "hearing you…" label). The composer is briefly disabled to prevent double-sends. Cancel option visible — tap to discard the in-flight transcription.

#### Awaiting Ben reply (post-transcription, model thinking)
The user-message bubble is now finalized with the transcribed text. A Ben-side typing indicator (three dots in his bubble style) appears below it. Composer is re-enabled — the user can stack a follow-up message.

#### Error
Specific failure modes, each with friend-tone recovery copy:
- **Mic-record failed** (browser API error mid-press): inline toast above the composer ("mic glitched — try again or type it"). The pending user-message bubble is removed.
- **Transcription failed** (Whisper API error or empty result): the pending bubble flips to an error state with a retry affordance ("couldn't catch that — tap to retry or type it instead"). The original audio blob is retained for one retry.
- **Ben reply failed** (Claude/GPT error): Ben's typing indicator flips to an error bubble ("brain hiccup — give me a sec") with a retry tap-target. The user's message stays put.
- **Save failed** (capture classification ran but persistence to Postgres failed): the inline capture card inside Ben's reply shows a small "couldn't save — retry" affordance. The chat continues; the artifact is missing from the ledger until retry succeeds.
- **Audio clip >30s** (user holds longer than max): recording auto-stops at 30s with a brief banner ("hit the 30s cap — sent what I got").

#### Permission-denied
First press-and-hold triggers the browser's mic permission prompt. If denied:
- The recording overlay collapses and the screen returns to the populated state.
- A persistent, dismissable banner appears just above the composer: "Ben can't hear you yet — turn on mic in browser settings" with a tap-target that opens browser-specific instructions (deep-link not always possible in iOS Safari, so this likely opens a help sheet).
- The mic button remains visible but tap-pressing it re-surfaces the banner. Text input continues to work.

#### Offline
Detected via `navigator.onLine` or a fetch failure. A subtle banner at the top of the chat ("offline — Ben's listening but can't reply yet"). Text and voice input continue to work; the user-message bubble is queued locally and shown with a "pending" indicator. On reconnect, queued messages send in order. If queueing isn't feasible in v1, the simpler behavior is: composer disabled with the same banner. Flag both options in the prompt.

#### Edge cases
- **Very long single user message** (long voice clip with dense transcript): bubble grows; chat scroll auto-pins to bottom. No truncation.
- **Long conversation history**: model context is bounded to last 20 messages (PRD), but the UI shows the full scrollback. No "load older" pagination needed in v1 because dogfooding history is bounded by the founder's usage.
- **Rapid-fire captures**: user records two clips back-to-back before Ben replies. Both user bubbles render in order; Ben's replies stream in as they arrive. Composer never blocks the second capture.
- **iOS Safari MediaRecorder codec quirk** (PRD week-1 spike): if `audio/webm` is unsupported, fall back to `audio/mp4`. Surfaces no UI difference unless both fail — then the Permission-denied / Error path applies.
- **Returning from background**: state restoration — chat shows last view position; recording-in-progress is cancelled on background and shows the error banner.

**Interaction notes:**
- Progressive disclosure: the recording overlay only appears during a press-and-hold. The send-arrow only appears when text is in the composer. The drawer peek's "Up next" content only appears when a reminder is near-term.
- Key affordances: (1) press-and-hold mic, (2) text composer, (3) send arrow when typing, (4) drawer peek tap-to-expand, (5) tap inline capture cards to open detail.
- What changes between states: composer morphs (mic → recording overlay → send-arrow when typing); user bubbles have a pending → transcribed → final lifecycle; Ben bubbles have a typing → final lifecycle.
- Friction note: voice-first means the mic permission prompt is the single highest-stakes moment in the entire app. If denied with no recovery, the wedge dies on that user. The persistent help banner is non-negotiable.
- Friction note: text fallback must always be reachable, including during a denied-mic state and during offline — it's the trust anchor.

---

## Feature: Inline capture cards (Note / Reminder / Task / Clarifying-question)

**User Stories:**
- As a user who just dictated something, I want immediate visible confirmation that Ben filed it correctly, so that I trust the system and don't have to re-check the ledger.
- As a user whose dictation was ambiguous, I want Ben to ask me a clarifying question in-line, so that I can resolve the ambiguity in the same conversation without context-switching.

**Screens this feature spans:**
- Note card (inline element inside Ben's reply bubble)
- Reminder card (inline element inside Ben's reply bubble)
- Task card (inline element inside Ben's reply bubble)
- Clarifying-question message (no card — Ben's reply is a plain question)

### Sub-screen: Note card

**States:**

#### Empty
Not applicable — a card only exists after Ben classifies a capture.

#### Loading (optimistic-save in flight)
The card appears immediately when Ben's reply renders, with a subtle pending indicator (a small spinner or faded border). Title and body are already visible from the model's tool-call payload. The card is non-interactive while pending.

#### Populated (saved successfully)
A compact card inside Ben's message. Contents:
- Small icon/label indicating "note" (text label, not a literal icon spec — Step 4's job).
- Title (one line, from the `save_note` tool payload).
- Body preview (one to two lines, truncated with ellipsis if longer).
Tapping the card opens an item-detail surface (see Ledger drawer / Item detail).

#### Error (save failed)
Card shows an error state with a friend-tone label ("couldn't save this note — retry"). Tapping retries the save.

#### Edge cases
- **Empty title** (model produced an empty string): show a placeholder ("untitled note") — this is an artifact of model output, not user input, so it should never block save.
- **Very long body**: truncate at ~2 lines, full content available in detail view.

### Sub-screen: Reminder card

**States:**

#### Loading (optimistic-save in flight)
Card renders immediately with pending indicator. Title and `fires_at` (rendered as relative time) visible.

#### Populated (saved, not yet fired)
Contents:
- "Reminder" label.
- Title.
- Relative time ("in 2h", "tomorrow 9am", "Fri 6pm") — primary visual emphasis after title.
- Tap-target on the card to open detail.

#### Populated (fired — past `fires_at`)
The card's relative-time label switches to past-relative ("3h ago", "yesterday 9am") and adopts a "fired" visual marker. **In v1 there is no OS notification firing**, so "fired" is a visual state only — the card's job is to surface that the reminder window has passed.

#### Error
Same as Note card error pattern.

#### Edge cases
- **`fires_at` in the past at save time** (user said "remind me yesterday" — really meaning a backfill): file it but show it as "fired" immediately. Optionally, Ben asks a clarifying question instead — that decision belongs to the model.
- **`fires_at` very far future** (e.g., "next year"): relative time degrades gracefully ("in 7 months"). Edge but legitimate.

### Sub-screen: Task card

**States:**

#### Loading (optimistic-save in flight)
Card renders immediately with pending indicator. Title visible, checkbox visible but disabled.

#### Populated — Open (unchecked)
Contents:
- "Task" label.
- Title.
- Empty checkbox affordance on the leading edge.
Tapping the checkbox toggles the task to Done (optimistic update + save).

#### Populated — Done (checked)
Checkbox is checked. Title may render with reduced emphasis (style decision deferred to Step 4) to indicate completion. Tapping the checkbox again toggles it back to Open.

#### Error
Save / toggle failed — checkbox bounces back to previous state with a small inline error label, retry-on-tap.

#### Edge cases
- **Very long title**: truncate; full title in detail view.
- **Task with implicit due date** (user said "buy milk tomorrow"): the model may classify this as a reminder, a task, or both. v1 has no compound capture — the model picks one tool. The classifier behavior is tuned via the fixture file, not the UI.

### Sub-screen: Clarifying-question message

**States:**

#### Populated (default and only state)
This is just a Ben message — no card. Ben's text asks a question ("you mean the 15th of every month, or just this one?"). No capture is saved yet. The user's next message resolves the ambiguity, and Ben replies with whichever capture card fits.

#### Edge cases
- **User ignores the question and says something new**: the original capture is abandoned (no card was ever rendered for it). Ben handles the new message fresh. No "pending question" state in v1.
- **User asks a question back**: Ben's reply continues conversationally. The `ask_clarifying_question` tool can chain — multiple turns of clarification before a capture lands.

**Interaction notes (all card types):**
- Progressive disclosure: card detail is hidden until tapped. The card itself shows only the title + key metadata (relative time for reminders, checkbox for tasks).
- Key affordances: (1) tap card to open detail, (2) tap checkbox (tasks only) to toggle done.
- What changes between states: pending indicator clears on save; checkbox state on tasks; relative-time label updates over time (re-render at sensible intervals — "in 2h" → "in 1h" → "now" → "10m ago").
- Friction note: optimistic save (card visible immediately, pending indicator until persisted) is essential — waiting for the network before showing Ben's confirmation would drain the "feels like a friend" intuition the PRD locks in.
- Friction note: no in-line edit in v1 (PRD). If the user wants to correct a capture, they tell Ben in chat. The friction of "no quick edit" is acceptable for dogfooding scope; flag this for v1.5 reconsideration.

---

## Feature: Ledger drawer (the live ledger)

**User Stories:**
- As a user who just captured a reminder, I want to glance at what's coming up next without leaving the chat, so that I trust Ben is tracking it.
- As a user starting the day, I want to expand the drawer and see my open reminders / tasks / notes, so that I can scan and act without scrolling chat history.
- As a user reviewing a captured item, I want to see its full content and metadata, so that I can verify Ben got it right.

**Screens this feature spans:**
- Drawer peek (collapsed strip on the chat surface)
- Drawer expanded (full-height sheet with Reminders / Tasks / Notes tabs)
- Item detail (modal sheet over the drawer or chat showing one capture's full content)

### Sub-screen: Drawer peek (collapsed)

**States:**

#### Empty
No upcoming reminders, no open tasks. Peek strip shows a quiet label ("nothing on deck — Ben's listening"). The drag-handle is still present and tappable to expand into empty tabs.

#### Loading
Skeleton placeholder for the "Up next" content; drag-handle visible.

#### Populated — has upcoming reminder
Peek shows: "Up next: `{title}` `{relative-time}`". Single-line, truncated if needed. Tap or drag-up to expand.

#### Populated — no upcoming reminder, but has open tasks
Peek shows a count summary ("4 tasks open"). Same expand affordance.

#### Populated — has captures but none "upcoming"
Peek shows total counts ("12 notes · 4 tasks · 0 reminders"). Compact summary.

#### Error (ledger load failed)
Peek shows a quiet error label ("couldn't load your stuff — pull to retry"). Tap-to-retry.

#### Edge cases
- **Keyboard open (user composing)**: peek may need to hide to preserve vertical space. Flag as layout note for Step 4.
- **Drawer dragged partially open** (mid-gesture): transitional state — content lerps between peek and expanded.

### Sub-screen: Drawer expanded

**States:**

The expanded drawer is a tabbed sheet covering most of the chat surface. Three tabs: **Reminders** (default), **Tasks**, **Notes**. Each tab has its own state set.

#### Expanded — Reminders tab — Empty
Friend-tone empty state ("no reminders yet — say 'remind me to…' and Ben'll catch it"). Centered illustration-or-icon space (kept abstract for the prompt).

#### Expanded — Reminders tab — Populated
Vertical list of reminder rows. Each row:
- Title.
- Relative time ("in 2h", "tomorrow 9am", "3h ago" for fired).
- Visual marker if fired (past `fires_at`).
Grouped chronologically: an "Upcoming" section (sorted ascending by `fires_at`), then a "Fired" section (descending by `fires_at`). Tap a row to open Item detail.

#### Expanded — Reminders tab — Loading
Skeleton rows.

#### Expanded — Tasks tab — Empty
Friend-tone empty state ("no tasks open — say 'I need to…' and Ben'll add it").

#### Expanded — Tasks tab — Populated
Vertical list of task rows. Each row:
- Checkbox (toggle done from here).
- Title.
Done tasks may collapse into a "Done" subsection at the bottom or hide behind a toggle. Default: open tasks first, done tasks visible but visually de-emphasized.

#### Expanded — Notes tab — Empty
Friend-tone empty state ("no notes yet — talk to Ben, he'll save the keepers").

#### Expanded — Notes tab — Populated
Vertical list of note rows. Each row:
- Title.
- One-line body preview.
- Captured-at relative time ("today", "yesterday", "3d ago").
Reverse-chronological (newest first). Tap a row to open Item detail.

#### Error (any tab)
Inline error band at the top of the tab content with retry affordance.

#### Edge cases
- **Long lists** (founder's usage may stay short, but plan for 100+ items): standard scroll, no pagination in v1.
- **Tab badge counts** (small badge on tabs showing item count or "new since last open"): flag as optional polish; not blocking.
- **Pull-to-refresh**: optional; ledger is small enough that real-time updates from the chat composer should keep it in sync without manual refresh.

### Sub-screen: Item detail

**States:**

A modal sheet that slides up from the drawer (or from a chat-card tap). Shows one capture's full content.

#### Populated (Note detail)
- Title (editable in v1? **No** per PRD — read-only).
- Full body text.
- Captured-at timestamp (absolute + relative).
- Close affordance.

#### Populated (Reminder detail)
- Title.
- `fires_at` (absolute + relative).
- Captured-at timestamp.
- Status (upcoming / fired).
- Close affordance.

#### Populated (Task detail)
- Title.
- Checkbox (large, primary action — toggle from here).
- Captured-at timestamp.
- Done-at timestamp if applicable.
- Close affordance.

#### Loading
Skeleton content while fetching detail (may not be needed if the drawer's row already carries full payload — flag for the prompt).

#### Error
Inline error band; close to retry.

#### Edge cases
- **Long content (note body)**: scrollable detail sheet.
- **Item deleted from another session**: detail sheet shows a "this one's gone" state and an auto-close. In v1 with N=1 there are no other sessions, so this is a far-edge case — leave as a graceful fallback prompt.

**Interaction notes:**
- Progressive disclosure: drawer peek shows minimum signal. Expansion reveals lists. Tapping a row reveals item detail. Three depth levels, each adding information.
- Key affordances: (1) drag handle on peek to expand, (2) tab switcher inside expanded drawer, (3) row tap to open detail, (4) checkbox tap on tasks to toggle, (5) drag-down on expanded drawer to collapse.
- What changes between states: peek content reflects ledger state (upcoming reminder if any, else task count, else note count, else empty); tab content swaps lists; item detail overlays.
- Friction note: the peek's job is glanceability — its content must be immediately scannable. If the relative-time string is too long or the title truncated awkwardly, the peek loses its purpose. Flag for design direction in Step 3.
- Friction note: the founder will likely live in the chat 80% of the time and the drawer 20%. Drawer must never feel like the "real" app — it's an affordance, not a destination. The expanded sheet should be dismissable with a single drag.
- Friction note: edits are not in v1. The friction of "to fix a typo, tell Ben in chat" should be acknowledged in the prompt as deliberate scope, so the renderer doesn't invent an edit affordance.

---
