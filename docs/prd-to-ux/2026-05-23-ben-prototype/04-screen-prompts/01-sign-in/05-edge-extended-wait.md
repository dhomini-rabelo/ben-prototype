## Sign-in screen — Edge: extended wait

````
**What this screen is for:**
Hold the user's confidence during an unusually slow OAuth handoff (slow network, slow Google response, slow Supabase callback).

**What's visible:**
Same layout as the standard Loading state, but the secondary line beneath the primary button has appeared and reads something like "still waiting on Google…" in friend tone. If the wait extends further, the line may evolve to a second message ("Google's taking its time today — give it a few more seconds"). The primary button remains non-interactive throughout. No progress bar — we don't own the OAuth window.

**What the user can do:**
- Primary: wait, with a clearer sense that the system hasn't crashed.
- Secondary: none in v1 — no "cancel and retry" affordance to avoid race conditions with the in-flight OAuth.

**Feel:**
Patient and human. The copy is what does the work — "still waiting" feels like a friend texting from a slow line, not a "timeout in 30s" warning. Calm tone, no escalation.

**State context:**
The loading state has been visible for more than a few seconds. Most users will never see this; it exists to prevent the rare "is it stuck?" moment from becoming a quit.

**Critical affordances:**
The secondary "still waiting" line must arrive only after a delay — showing it instantly defeats the point. The escalating copy (if used) must stay in friend tone, never apologetic or alarmist.
````
