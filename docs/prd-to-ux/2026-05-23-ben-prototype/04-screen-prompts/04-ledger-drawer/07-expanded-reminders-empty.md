## Drawer expanded — Reminders tab — Empty

````
**What this screen is for:**
Show, friendlily, that no reminders exist yet — and hint at how to make one.

**What's visible:**
The drawer has expanded to a sheet covering most of the chat surface, anchored to the bottom of the screen. At the top of the sheet, a tab switcher with three labels: Reminders (selected), Tasks, Notes. Below the tabs, the empty state content: friend-tone copy ("no reminders yet — say 'remind me to…' and Ben'll catch it"), with the example phrasing in a slightly emphasized inline style so the user clocks how to talk to Ben. Quiet centered illustration-or-empty-visual space (abstract — the renderer decides whether to leave it blank or add a soft visual). A drag-down affordance at the top of the sheet (a small handle) allows the sheet to collapse back to peek.

**What the user can do:**
- Primary: drag the sheet back down (or tap outside the sheet) to collapse to the peek.
- Secondary: switch to Tasks or Notes tab.
- Tertiary: dismiss the drawer and dictate a reminder via the chat composer (composer remains visible at the very bottom of the screen even when the drawer is expanded, if vertical space allows).

**Feel:**
Calm and instructive. The example phrasing is the most valuable content — it teaches Ben's affordance through an example. Type is comfortable; the visual is quiet.

**State context:**
No reminders have ever been captured, or all existing reminders have been deleted (deletion isn't in v1, so practically: no reminders captured).

**Critical affordances:**
The example phrasing ("remind me to…") must read as a usage hint, not as a "command" — it should feel like a tip a friend would give, not a CLI instruction. The drag-down to collapse must be obvious from the top handle.
````
