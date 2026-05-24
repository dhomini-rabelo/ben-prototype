## Clarifying-question message — Edge cases

````
**What this screen is for:**
Handle multi-turn clarification cleanly.

**What's visible:**
- **Chained clarification** — Ben can ask a follow-up question if the user's reply is still ambiguous. Each clarifying question is just another Ben bubble; the chain looks like a normal conversation. The capture only lands (and a card only renders) once the model has enough to call a save tool.
- **User abandons the clarification** — if the user replies with something unrelated, the original capture is dropped silently. No "abandoned" indicator, no stale "pending question" UI. Ben treats the new message fresh.

**What the user can do:**
- Primary: keep replying until Ben has enough to file something, or abandon by changing topics.

**Feel:**
Indistinguishable from normal conversation.

**State context:**
Multi-turn ambiguity resolution.

**Critical affordances:**
No "pending capture" state should leak into the UI — the ambiguous capture has no card and no row in the ledger until Ben classifies it definitively. The chat is the only surface; abandoning is silent and safe.
````
