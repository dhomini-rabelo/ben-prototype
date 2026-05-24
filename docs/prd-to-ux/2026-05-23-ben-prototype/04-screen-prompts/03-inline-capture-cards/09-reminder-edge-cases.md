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
