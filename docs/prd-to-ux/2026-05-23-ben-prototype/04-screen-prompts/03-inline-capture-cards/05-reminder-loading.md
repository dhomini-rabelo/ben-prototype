## Reminder card — Loading (optimistic-save in flight)

````
**What this screen is for:**
Confirm instantly that Ben heard a reminder and show when it'll fire — before persistence completes.

**What's visible:**
Inside Ben's reply bubble, a compact card with a quiet "reminder" label at the top, the reminder title on one line, and the relative-time string for when it fires rendered with primary visual emphasis below the title ("in 2h" / "tomorrow 9am" / "Fri 6pm"). A subtle pending indicator (faded border, opacity dip, or small in-progress dot) integrated into the card. The card is visually distinct from plain text but lives inside Ben's bubble.

**What the user can do:**
- Primary: wait (resolves quickly).
- Secondary: tap the card to open item detail (will show absolute time alongside relative).

**Feel:**
The relative-time string is the visual hero of the card after the title — it's what the user wants to see at a glance. Type carrying relative time should be slightly larger or weightier than the supporting "reminder" label. Soft, considered, modern.

**State context:**
Save in flight to Postgres. Card is showing optimistically.

**Critical affordances:**
Relative time must be human-readable — "in 2h" beats "in 120 minutes." The relative-time string must update over time without page reload (re-render at sensible intervals — minute resolution for near-term, hour for medium, day for distant).
````
