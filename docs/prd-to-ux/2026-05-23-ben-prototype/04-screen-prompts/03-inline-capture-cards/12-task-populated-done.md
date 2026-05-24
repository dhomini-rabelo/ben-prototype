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
