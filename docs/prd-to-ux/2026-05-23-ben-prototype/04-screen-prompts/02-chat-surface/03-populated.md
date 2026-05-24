## Chat screen — Populated (steady state)

````
**What this screen is for:**
Carry the ongoing conversation between the user and Ben, with the ledger peek always one glance away.

**What's visible:**
A chronological message stream filling most of the screen. User messages are right-aligned with a slightly emphasized fill; Ben's messages are left-aligned with a quieter fill and a small Ben indicator. Some of Ben's messages contain inline capture cards (Note, Reminder, or Task — see the inline-capture-cards prompts). The stream scrolls; the latest message is at the bottom by default. Above the composer, the drawer peek displays "Up next: {title} {relative-time}" if there's a near-term reminder, or a quiet count summary ("3 reminders ahead" / "12 notes · 4 tasks · 0 reminders") if not. The composer is anchored at the bottom with the mic dominant and a text input area beside it.

**What the user can do:**
- Primary: press and hold the mic to add another capture.
- Secondary: tap the text input to type a message.
- Tertiary: scroll up to review earlier conversation; tap a capture card to open its detail; tap or drag the drawer peek to expand the ledger.

**Feel:**
The conversation is the foreground; everything else recedes. Type is comfortable to read at length. Bubbles have soft rounded corners and quiet fills — the visual contrast between user and Ben sides is small but legible. Inline capture cards within Ben's messages are clearly differentiated from plain text but live inside the bubble (not separate elements competing for attention). The drawer peek persists, never hides on scroll.

**State context:**
The standard, everyday state of the app. The user has used Ben before and has accumulated captures.

**Critical affordances:**
The drawer peek must remain visible while scrolling the chat — it's the always-on ledger glance. The composer must always be reachable and always have the mic as its dominant element. Capture cards inside Ben's bubbles must feel like part of his reply, not foreign UI dropped into the conversation.
````
