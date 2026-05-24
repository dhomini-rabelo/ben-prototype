## Drawer expanded — Reminders tab — Populated

````
**What this screen is for:**
Let the user scan upcoming and fired reminders quickly, sorted in a way that respects time.

**What's visible:**
Sheet layout with tab switcher at top (Reminders selected). Below the tabs, a vertical list of reminder rows organized into two sections:

- **Upcoming** — sorted ascending by fires_at (soonest first). Each row contains the reminder title (primary), the relative-time string (emphasized), and possibly the captured-at hint as supporting text. Tap a row to open item detail.
- **Fired** — past reminders, sorted descending (most recently fired first). Visually de-emphasized compared to Upcoming (slightly muted fill or lighter weight) with a "fired" indicator. Same row layout.

If only one section has content, the other is hidden (no empty section headers).

**What the user can do:**
- Primary: tap any row to open item detail.
- Secondary: scroll the list.
- Tertiary: switch tabs; drag sheet down to collapse.

**Feel:**
Scannable and well-organized. Type hierarchy is clear: title prominent, relative-time emphasized but supporting, fired-status visually distinct but quiet. Modern list layout with comfortable row spacing — generous but not wasteful.

**State context:**
At least one reminder exists. Mix of upcoming and fired possible.

**Critical affordances:**
The Upcoming/Fired distinction must be legible at a glance — the visual sort and section break does most of the work; the "fired" indicator is supplementary. Relative-time strings must update over time. The list must scroll smoothly; long lists are possible.
````
