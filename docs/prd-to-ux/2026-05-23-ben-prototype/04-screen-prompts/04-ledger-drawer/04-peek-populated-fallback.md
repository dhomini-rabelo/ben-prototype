## Drawer peek (collapsed) — Populated (fallback content)

````
**What this screen is for:**
Surface meaningful content in the peek when there are no upcoming reminders, so the strip isn't wasted.

**What's visible:**
Same strip layout. Content depends on what exists:
- If open tasks exist but no upcoming reminders: a quiet summary like "4 tasks open" with slight emphasis on the count.
- If only notes exist: a compact summary like "12 notes · 4 tasks · 0 reminders" — a horizontal triplet of counts.
The user understands at a glance that there's content below, even if nothing is time-pressing.

**What the user can do:**
- Primary: tap or drag to expand the drawer.
- Secondary: ignore.

**Feel:**
Informational and quiet. The count summary is the content; type is comfortable but not pushed.

**State context:**
Captures exist but no reminders are upcoming. This is the typical state after the user has been using Ben for a while and has accumulated notes and a few open tasks but isn't actively waiting on a reminder to fire.

**Critical affordances:**
The fallback content must feel like real signal, not filler — counts are meaningful. The line is still single-line; the triplet of counts must fit without truncation or wrap.
````
