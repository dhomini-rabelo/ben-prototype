# UX Philosophy — Ben v1

> **Note on PRD divergence:** The chosen philosophy below intentionally evolves past the original PRD in two places: (1) the PRD's "task" capture is upgraded from a `{ title, done }` row into a **task workspace** with rich content (text, todo list, future component types) and a chat-driven approve/reject loop; (2) the PRD's "single chat page, no hamburger" line is relaxed — a **menu sidebar** is added for tasks history, notes browsing, reminders browsing, and settings. Notes and one-off reminders are unchanged from the PRD.

## Chosen Philosophy: Chat with Task Workspaces

**Organizing metaphor / mental model:**
The main chat with Ben is the entry surface — a friend you tell things to. Lightweight captures (notes, one-off reminders) live as inline cards in that conversation, no separate browse view in the main view. When the captured intent is substantive (drafting an email, planning a trip, working through a list), Ben opens a **task workspace** — a focused screen that slides up over the chat with its own content surface (text, todo list, or other typed components), its own task-scoped chat composer, and an approve/reject diff flow for Ben's proposed edits. Tasks live in two states: active (visible from the main chat as a peek and pickable into their workspace) and history (browsable from a menu sidebar).

**How the PRD features map into this structure:**

- **Voice/text input (press-and-hold mic + text fallback)** — Lives in the chat composer at the bottom of the chat surface. The *same* composer pattern lives at the bottom of each task workspace, scoped to that task's sub-thread.
- **Ben's replies (friend tone)** — Stream into the main chat or the active workspace's sub-thread depending on where the user is.
- **Note capture** — Inline confirmation card in Ben's main-chat reply (title + body preview). No browse list in v1's main surface; browse via the menu sidebar's Notes view. Tapping a card opens an item-detail modal.
- **One-off reminder capture** — Inline confirmation card in Ben's main-chat reply (title + relative-time emphasis). Browse via the menu sidebar's Reminders view (this is where the PRD's "in-app list with relative-time labels" lives). Tapping a card opens an item-detail modal.
- **Task capture** — **Replaced by the workspace.** Ben's main-chat reply contains a task card with title, icon, and a clear **Start** affordance. Tapping Start opens the workspace; not tapping it leaves the task active in the active-task peek above the composer. Tasks have a content surface (text by default; todo list when the intent is list-shaped; other future types).
- **Workspace edits via Ben** — Inside a workspace, the user keeps talking to Ben via the bottom composer. Ben's edits to the workspace content (add a todo, remove one, rewrite a paragraph) appear as a pending diff for that turn; user approves or rejects the whole turn's changes.
- **Active-task peek** — A persistent strip just above the chat composer on the main chat surface, showing the count of active tasks and the most recent active task title. Tapping the peek opens an active-task picker; tapping a task in the picker enters its workspace.
- **Mocked alarms list (PRD)** — Reminders browse view, reached from the menu sidebar. Same relative-time labels the PRD called for, just relocated to the menu surface instead of a chat-surface drawer.
- **Fixed-window memory (last 20 messages)** — Implicit per scope: main chat keeps its own 20-message window; each workspace keeps its own 20-message window for the task sub-thread.
- **Menu sidebar (new)** — Slides in from the leading edge of the chat surface via a small affordance in the top bar. Contains four entries: **Tasks** (history view — active + done), **Notes** (browse all), **Reminders** (browse all with relative times), **Settings** (modal: profile + sign out).
- **Single chat surface (relaxed)** — Still one primary surface for conversation, but with two added surfaces above it: workspaces (slide up) and the menu sidebar (slides in from leading edge). No bottom tab nav.
- **Google OAuth (Supabase)** — Unchanged. One-screen sign-in.
- **`ask_clarifying_question` tool** — Still just a plain Ben message; works in both the main chat and inside workspaces.

**Trade-offs:**
- **Good at:** Matches how the founder actually wants to *work with* Ben — not just file things but iterate on them (draft an email by talking, build a todo list by talking, refine a plan turn by turn). The diff-approve loop is the trust mechanism for letting Ben edit content the user cares about. Lightweight captures stay lightweight (inline cards, no separate UI overhead). The menu sidebar gives a real home to notes and reminders without intruding on the chat-as-primary feel.
- **Sacrifices:** Workspace + diff approval is a meaningful chunk of build that doesn't fit in 4–6 weeks alongside everything else — the workspace is the new center of gravity for v1 effort. The "two-thread" model (main chat thread + per-workspace sub-threads) is conceptually richer than a pure single-thread chat; users have to learn what surface they're on. Reminders lose their always-visible glanceable peek (they're now one menu tap away instead of one peek glance).

**Why the user chose this:**
User-directed pivot after the initial draft. The original "chat with a live ledger" model treated all captures as equivalent rows in a tabbed drawer; the user clarified that tasks are not rows — they're things you *work on*. The workspace concept moves the heavy interaction surface (drafting, list-building, editing) into a focused container with its own conversation, while preserving the chat surface as the entry point and the menu as the archive.

---

## Rejected Alternative 1: The Single Thread

**Metaphor:** Ben is purely a chat — like texting a friend who happens to be hyper-organized. Captures live inline in the stream; "what's coming up" is summoned conversationally.

**Feature mapping summary:** Voice/text in the composer. Notes / reminders / tasks as inline confirmation cards in the thread. No persistent list UI; alarms-list is either an inline peek pinned at top of the thread or invoked by asking Ben. Memory is the scroll.

**Trade-offs:** Maximally simple, honors "single chat page" most literally, friend-tone immersion is highest. But mocked alarms are easy to lose in scrollback, weakening the v1 dogfooding signal — and it risks collapsing into "another ChatGPT skin" (a PRD-named failure mode) because there's no visible artifact layer. Critically: tasks-as-substantive-work has no home.

**Why rejected:** Doesn't support the way the founder actually wants to use Ben for substantive tasks (drafting, planning, list-building). Pure chat is fine for one-line captures but doesn't give tasks a workspace to inhabit.

## Rejected Alternative 2: Today First

**Metaphor:** Open the app, see today. Day-view dashboard (firing today / tasks today / notes today) is the home surface; chat is reached via a dominant press-and-hold capture button and lives in an expandable sheet over the dashboard.

**Feature mapping summary:** Home is the dashboard. Voice button at bottom of screen. Ben's replies appear as a peek/toast that expands into a brief chat sheet. Chat history is a modal, not the primary surface. Mocked alarms are the home screen by definition — unmissable.

**Trade-offs:** Best alignment with "what do I need to do today?" framing and strongest reminder-glance signal. But Ben becomes a today-screen with chat injected — the friend-tone wrapper gets muted by lists, and substantive task work still has no dedicated surface.

**Why rejected:** Same root issue as Single Thread — no workspace concept. Plus it drifts furthest from the chat-as-primary framing that the friend-tone wedge depends on.
