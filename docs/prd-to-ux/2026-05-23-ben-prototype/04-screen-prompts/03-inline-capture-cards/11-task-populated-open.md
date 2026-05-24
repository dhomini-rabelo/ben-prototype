## Task card — Populated (Open — unchecked)

````
**What this screen is for:**
Show an open task and let the user check it off from inside the chat without opening the drawer.

**What's visible:**
Compact card layout: "task" label, empty checkbox on the leading edge, task title beside it. Card is fully interactive — checkbox toggles to Done on tap; card body taps open detail.

**What the user can do:**
- Primary: tap the checkbox to mark the task done.
- Secondary: tap the card body to open detail.

**Feel:**
The checkbox is the focal point. Tapping it feels satisfying — a quiet, well-timed toggle animation. Type for the title is comfortable to read at length.

**State context:**
Task is open. Same task also appears in the ledger drawer's Tasks tab.

**Critical affordances:**
Toggling the checkbox must update both this card AND the corresponding row in the ledger drawer — the source of truth is the same, and the user must see consistency between the two surfaces.
````
