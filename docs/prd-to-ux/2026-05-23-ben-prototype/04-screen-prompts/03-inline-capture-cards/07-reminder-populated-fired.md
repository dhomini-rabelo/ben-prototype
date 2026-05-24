## Reminder card — Populated (fired — past fires_at)

````
**What this screen is for:**
Show the user that a previously-set reminder's time has passed (visual only in v1 — no OS notification fired).

**What's visible:**
Same compact card layout but the relative-time string has switched to past-relative ("3h ago", "yesterday 9am") and the card adopts a "fired" visual marker — perhaps a small indicator near the label or a subtle de-emphasis (slightly muted fill, faded border, or a small "fired" tag). The title and time remain readable; the visual treatment communicates that this is no longer upcoming.

**What the user can do:**
- Primary: tap the card to open detail (shows full timestamps and fired status).
- Secondary: continue the conversation.

**Feel:**
Reflective and quiet. A fired reminder is a small "remember this?" moment — the visual treatment should signal "this happened" without urgency or alarm. No red, no warning iconography.

**State context:**
The reminder's fires_at has passed. In v1, no OS notification fired (alarms are mocked); the visual state is the only signal. This is a known v1 limitation explicit in the PRD.

**Critical affordances:**
The visual distinction between upcoming and fired must be legible at a glance — when scrolling chat history or the ledger, the user should be able to tell which reminders are still ahead. The treatment must remain quiet — fired ≠ failed.
````
