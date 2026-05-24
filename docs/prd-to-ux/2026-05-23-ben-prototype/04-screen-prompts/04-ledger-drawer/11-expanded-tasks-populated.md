## Drawer expanded — Tasks tab — Populated

````
**What this screen is for:**
Let the user scan open tasks, check them off from the drawer, and see what they've already done.

**What's visible:**
Sheet with Tasks tab selected. Below tabs, a vertical list of task rows organized into:

- **Open tasks** — primary section, sorted reverse-chronologically (most recently captured first) or by some sensible order. Each row contains a checkbox on the leading edge and the task title. Tapping the checkbox toggles to Done.
- **Done tasks** — secondary section, visually de-emphasized (lighter weight, possibly with strike-through on titles, or behind a "show done" toggle). Done tasks may default to visible but secondary; renderer can decide whether the toggle is collapsed by default.

**What the user can do:**
- Primary: tap a row's checkbox to toggle done state.
- Secondary: tap a row's body (not the checkbox) to open item detail.
- Tertiary: switch tabs; collapse sheet.

**Feel:**
Actionable and clear. Checkboxes are comfortable to tap with thumb-reach considered. The visual distinction between open and done is gentle but unambiguous. Type is comfortable to read at length.

**State context:**
Tasks exist in some mix of open and done.

**Critical affordances:**
Toggling a task's checkbox in the drawer must update the corresponding card in the chat stream if it's still in view — single source of truth. The checkbox tap-target should be slightly larger than the visible checkbox to forgive thumb-imprecision.
````
