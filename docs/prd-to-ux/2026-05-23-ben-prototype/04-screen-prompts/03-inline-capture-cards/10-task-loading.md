## Task card — Loading (optimistic-save in flight)

````
**What this screen is for:**
Confirm instantly that Ben filed a task and make checking it off obvious.

**What's visible:**
Inside Ben's reply bubble, a compact card with a quiet "task" label at the top, an empty checkbox on the leading edge, and the task title beside the checkbox. A subtle pending indicator (faded border or opacity dip) signals in-flight; the checkbox itself is visible but disabled during the pending state.

**What the user can do:**
- Primary: wait briefly.
- Secondary: once saved, tap the checkbox to mark done; tap the card body to open detail.

**Feel:**
The card feels actionable but calm. The checkbox is the visual handle for the primary affordance — clear, comfortable to tap, with a satisfying-but-quiet visual when toggled.

**State context:**
Save in flight; card optimistic.

**Critical affordances:**
The checkbox must be visible but non-interactive during the pending state — tapping it before save resolves should be a no-op or a graceful queued action.
````
