## Drawer peek (collapsed) — Error

````
**What this screen is for:**
Surface a ledger-load failure without alarming the user.

**What's visible:**
Same strip layout. Single-line content reads "couldn't load your stuff — pull to retry" in friend tone. The strip's fill may shift to a soft error surface, distinguishable from the normal state but not red. Drag handle visible.

**What the user can do:**
- Primary: tap or drag (pull) to retry loading.
- Secondary: continue chatting — chat works regardless of ledger state.

**Feel:**
Calm and forgiving. Same soft-error aesthetic as the chat surface errors.

**State context:**
The ledger query to Postgres failed. Chat history may have loaded fine; only the ledger is broken.

**Critical affordances:**
The chat must remain fully functional even when the ledger errors — the user can keep capturing; new items will land in the ledger when it recovers. The retry must be one tap or one drag.
````
