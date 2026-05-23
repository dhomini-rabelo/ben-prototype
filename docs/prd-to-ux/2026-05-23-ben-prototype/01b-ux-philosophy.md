# UX Philosophy — Ben v1

## Chosen Philosophy: Chat with a Live Ledger

**Organizing metaphor / mental model:**
A single chat with Ben is the primary surface, but a persistent, glanceable ledger of your captures lives alongside it — the conversation feeds the ledger, and the ledger is the visible proof that Ben heard you.

**How the PRD features map into this structure:**

- **Voice/text input (press-and-hold mic + text fallback)** — Lives in the chat composer at the bottom of the chat surface. Press-and-hold reveals a recording state (waveform / timer / cancel-by-swipe). Text input is the same composer in keyboard mode.
- **Ben's replies (friend tone)** — Stream into the chat as conversational messages. When a capture is filed, Ben's reply *contains* the inline confirmation card (Note / Reminder / Task) rather than spawning a separate UI block.
- **Note capture** — Confirmation card inline in chat ("saved a note — `{title}`"). The note row also lands in the ledger's Notes tab.
- **Reminder capture (one-off, v1)** — Confirmation card inline in chat with title + `fires_at` rendered as relative time ("in 2h", "tomorrow 9am"). Row lands in the ledger's Reminders tab and bubbles up to the drawer's "Up next" peek if it's near-term.
- **Task capture** — Confirmation card inline in chat with a checkbox. Row lands in the ledger's Tasks tab; checking it off works from either the chat card or the ledger.
- **Mocked alarms list (in-app, relative-time labels)** — *This is the ledger.* On mobile, it's a bottom drawer with three tabs (Reminders / Tasks / Notes). Its collapsed state is a peek strip showing "Up next: `{title}` in 2h". Expanding gives the full lists with relative-time labels.
- **Fixed-window memory (last 20 messages)** — Implicit; user sees recent chat by scrolling the thread. No UI surfacing of "memory depth."
- **Single chat page (no hamburger menu, no nav)** — Preserved. The ledger drawer is an affordance on the chat surface, not a separate route.
- **Google OAuth (Supabase)** — One-screen sign-in before the chat. Standard "Continue with Google."
- **`ask_clarifying_question` tool** — Ben's clarifying question is just another chat message; the user replies normally. No special UI state.

**Trade-offs:**
- **Good at:** Glanceability of upcoming reminders (the v1 dogfooding signal — "did I see my reminder?" — is answerable at a glance). Preserves chat-as-primary-surface and the friend tone. Honors the PRD's "single chat page" constraint. Mobile-Safari-friendly (one well-known drawer interaction, no custom OS chrome).
- **Sacrifices:** Slightly more design surface than a pure chat (drawer states: collapsed peek / expanded / empty / loading / item-tap detail). The ledger reminds the user Ben is a tool, mildly diluting the immersive-friend feel. Tasks and reminders are conceptually adjacent but split into separate tabs, which could feel arbitrary at low item counts.

**Why the user chose this:**
Recommended by the skill — user confirmed. Reasoning: it threads the needle the PRD sets up (single chat page **and** in-app alarms list with relative-time labels), keeps Ben legible as a friend-chat product, and gives the founder the visible feedback loop needed for daily dogfooding.

---

## Rejected Alternative 1: The Single Thread

**Metaphor:** Ben is purely a chat — like texting a friend who happens to be hyper-organized. Captures live inline in the stream; "what's coming up" is summoned conversationally.

**Feature mapping summary:** Voice/text in the composer. Notes / reminders / tasks as inline confirmation cards in the thread. No persistent list UI; alarms-list is either an inline peek pinned at top of the thread or invoked by asking Ben. Memory is the scroll.

**Trade-offs:** Maximally simple, honors "single chat page" most literally, friend-tone immersion is highest. But mocked alarms are easy to lose in scrollback, weakening the v1 dogfooding signal — and it risks collapsing into "another ChatGPT skin" (a PRD-named failure mode) because there's no visible artifact layer.

**Why rejected:** The PRD explicitly says mocked alarms must be surfaced "as an in-app list with relative-time labels" — burying that into pure conversation makes the v1 success test (founder sees their reminders) harder to run.

## Rejected Alternative 2: Today First

**Metaphor:** Open the app, see today. Day-view dashboard (firing today / tasks today / notes today) is the home surface; chat is reached via a dominant press-and-hold capture button and lives in an expandable sheet over the dashboard.

**Feature mapping summary:** Home is the dashboard. Voice button at bottom of screen. Ben's replies appear as a peek/toast that expands into a brief chat sheet. Chat history is a modal, not the primary surface. Mocked alarms are the home screen by definition — unmissable.

**Trade-offs:** Best alignment with the user's actual JTBD ("what do I need to do today?") and strongest dogfooding signal for "did Ben fire my bill reminder?". But it diverges most from the PRD's "single chat page" framing — Ben becomes a today-screen with chat injected. Friend tone gets muted because lists dominate visually.

**Why rejected:** Drifts furthest from the PRD's locked framing of Ben-as-chat-product. Risk of the friend-tone wrapper becoming background decoration instead of the substance the PRD names as the wedge.
