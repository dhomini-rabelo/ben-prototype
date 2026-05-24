## Drawer peek (collapsed) — Loading

````
**What this screen is for:**
Bridge the brief moment between app load and ledger data arrival.

**What's visible:**
Same strip layout as Empty, but the single-line content is a soft skeleton placeholder where "Up next" text will land. The drag handle remains visible. The strip's fill matches the steady state — only the content slot is showing a skeleton.

**What the user can do:**
- Primary: wait briefly; ledger loads quickly.
- Secondary: still tap to expand — expanded view will also show loading state.

**Feel:**
Calm and brief. The skeleton is quiet — no shimmer animation. It should disappear within a second.

**State context:**
App is loading initial data — likely the same moment as the chat surface's loading state.

**Critical affordances:**
The skeleton must not flash or jitter. The drag handle must remain visible during loading so the user understands the peek is intentional.
````
