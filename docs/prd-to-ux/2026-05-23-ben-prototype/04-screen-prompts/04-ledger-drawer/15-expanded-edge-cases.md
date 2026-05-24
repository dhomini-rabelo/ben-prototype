## Drawer expanded — Edge cases

````
**What this screen is for:**
Handle list and interaction edges cleanly.

**What's visible:**
- **Long lists** — standard vertical scroll inside the sheet. No pagination in v1. The drag-down-to-collapse gesture should not conflict with vertical scroll inside the sheet (scroll within sheet, drag-from-top-handle to collapse).
- **Tab badge counts** (optional polish) — small count badges on tabs showing item count or "new since last open." Marked as optional; not blocking for v1.
- **Pull-to-refresh** (optional) — the ledger should stay in sync via local state updates from chat captures; pull-to-refresh is optional polish.

**What the user can do:**
- Primary: scroll, switch tabs, tap rows, collapse sheet.

**Feel:**
Smooth and resilient — none of these edges should produce a janky surface.

**State context:**
Normal real-world usage at scale.

**Critical affordances:**
Scroll-inside-sheet and drag-to-collapse gestures must coexist cleanly — the top drag handle is the dismissal affordance; scrolling list content does not dismiss the sheet.
````
