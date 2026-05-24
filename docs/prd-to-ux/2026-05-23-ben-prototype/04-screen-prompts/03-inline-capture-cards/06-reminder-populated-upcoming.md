## Reminder card — Populated (saved, not yet fired)

````
**What this screen is for:**
Show a clean, scannable confirmation that the reminder is filed and visible when it's due.

**What's visible:**
Same compact card layout as Loading but without the pending indicator. "Reminder" label, title, relative time (primary emphasis). The card is fully interactive — tapping opens detail.

**What the user can do:**
- Primary: tap the card to open item detail (shows absolute fires-at and captured-at timestamps).
- Secondary: continue the conversation.

**Feel:**
The card feels alive but quiet — the relative time hints that this is something that lives in the future, but the visual treatment doesn't shout urgency. Modern, considered, with the relative-time string as the focal point.

**State context:**
The reminder has been persisted with a future fires_at and will appear in the ledger drawer's Reminders tab under the Upcoming section.

**Critical affordances:**
The relative-time string is the single most important piece of information on the card after the title. Truncation rules: title may truncate; relative time never does.
````
