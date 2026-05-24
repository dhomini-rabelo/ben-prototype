## Item detail — Reminder detail

````
**What this screen is for:**
Show the full metadata of a reminder — both when it fires and when it was captured.

**What's visible:**
Modal sheet with drag handle and close affordance. Content:
- "Reminder" label (small, secondary).
- Title (prominent).
- fires_at shown in both absolute and relative forms — relative emphasized ("in 2h" or "fired 3h ago"), absolute as supporting context ("Sat, May 24 · 9:00am").
- Status indicator: upcoming or fired.
- Captured-at timestamp (small, secondary).

Read-only in v1.

**What the user can do:**
- Primary: read the reminder.
- Secondary: drag down or tap close to dismiss.

**Feel:**
The two time strings (fires_at and captured-at) are both important but visually ranked — fires_at is the hero, captured-at is supporting. Modern, calm.

**State context:**
The user tapped a reminder card in chat or a reminder row in the drawer.

**Critical affordances:**
The status (upcoming vs fired) must be unambiguous — the user is here to verify what Ben filed. Showing absolute fires_at alongside relative resolves ambiguity ("in 2h" relative to what exact wall-clock time).
````
