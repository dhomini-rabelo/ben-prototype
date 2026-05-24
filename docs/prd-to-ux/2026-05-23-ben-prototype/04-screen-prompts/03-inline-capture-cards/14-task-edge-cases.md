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
