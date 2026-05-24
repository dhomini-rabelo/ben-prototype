## Drawer peek (collapsed) — Populated (upcoming reminder near-term)

````
**What this screen is for:**
Tell the user, at a glance, what's coming up next.

**What's visible:**
Same strip layout. Single-line content reads "Up next: {reminder title} {relative-time}" — e.g., "Up next: pay internet bill in 2h" or "Up next: call mom tomorrow 9am". The relative-time portion is rendered with slight visual emphasis (heavier or slightly larger). Title truncates with ellipsis if needed to keep the line readable. Drag handle visible.

**What the user can do:**
- Primary: tap or drag to expand the drawer (opens to Reminders tab).
- Secondary: ignore and keep chatting — the peek will update as reminders fire or new ones get added.

**Feel:**
Glanceable. The user should be able to read the entire line in under a second. Type is comfortable; the relative-time portion stands out without shouting.

**State context:**
At least one upcoming reminder exists with a fires_at close enough to be considered "next." Definition of "near-term" can be configurable — for v1, the next upcoming reminder regardless of distance is fine.

**Critical affordances:**
The relative-time string is the single most important piece of content here. It must update over time without page reload — minute resolution for near, hour resolution for medium-term, day resolution for distant. The line must remain a single line; multi-line peek defeats the glance purpose.
````
