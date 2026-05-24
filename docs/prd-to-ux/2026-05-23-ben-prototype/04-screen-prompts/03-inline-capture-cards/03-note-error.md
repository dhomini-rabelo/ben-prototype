## Note card — Error (save failed)

````
**What this screen is for:**
Surface a save failure for the note in place, without disrupting the surrounding conversation, and give the user a one-tap retry.

**What's visible:**
The card retains its layout but adopts a soft error fill (distinguishable from the normal card surface but never red-screaming). A small inline error label appears within the card ("couldn't save this note — retry") with a clear retry tap-target. The "note" label, title, and body preview remain visible so the user knows what failed to save.

**What the user can do:**
- Primary: tap the retry affordance to re-attempt the save.
- Secondary: ignore — the chat continues normally; the note simply doesn't land in the ledger until retried.

**Feel:**
Apologetic but calm. The error surface is friendly, not alarming. The retry path is the largest tap-target on the card.

**State context:**
Persistence to Postgres failed. The classification ran successfully and the card content is correct; only the write failed.

**Critical affordances:**
The note's content must remain visible — the user should be able to read what they captured even though it didn't save. The retry must be one tap, not a multi-step flow. If retry fails again, the card stays in the error state with the same affordance.
````
