## Note card — Loading (optimistic-save in flight)

````
**What this screen is for:**
Confirm to the user — instantly, before persistence completes — that Ben heard their note and is filing it.

**What's visible:**
Inside Ben's reply bubble, a compact card element with a quiet "note" label at the top (small, secondary type), the note title rendered prominently on one line, and a body preview of one to two lines beneath (truncated with ellipsis if longer). A subtle pending indicator is integrated into the card — a faded border, a small in-progress dot, or a slightly reduced opacity — enough to signal in-flight without dominating. The card itself is visually distinct from plain text in Ben's bubble (a soft surface fill or thin outline) but reads as part of the message.

**What the user can do:**
- Primary: wait (it'll resolve in well under a second in the happy case).
- Secondary: tap the card — opens an item detail view (see Ledger drawer / Item detail prompts).

**Feel:**
Quiet and confident. The card feels handmade — soft rounded corners, restrained type hierarchy (label small, title prominent, body preview comfortable), and the pending indicator is the most subtle thing about the card. It should feel like Ben quickly jotted something down on a card while still talking.

**State context:**
Ben's reply has just rendered with the save in flight to Postgres. The card is showing optimistically — the user sees confirmation immediately while the network does its work underneath.

**Critical affordances:**
The card must render the instant Ben's reply lands — not after persistence completes. The pending indicator must be subtle enough that the user doesn't read it as "saving" or "wait" — it's the unobtrusive trust signal that this is in-flight. If save fails, the card transitions to the Error state.
````
