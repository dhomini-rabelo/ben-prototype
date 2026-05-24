## Clarifying-question message — Populated (only state)

````
**What this screen is for:**
Let Ben ask the user back when the original capture was ambiguous, without rendering a card.

**What's visible:**
A normal Ben message bubble in the chat stream — left-aligned, same visual treatment as any other Ben reply. The bubble contains a friend-tone question ("you mean the 15th of every month, or just this one?" / "the proposal for Sarah at Acme — got a deadline on that?"). No card is rendered; no capture has been saved yet. The conversation continues normally — the user's next message resolves the ambiguity, and Ben replies with whichever card variant fits.

**What the user can do:**
- Primary: reply via voice or text — the composer is live.
- Secondary: ignore and say something else — Ben treats the new message fresh and the prior ambiguous capture is abandoned (no card was ever rendered for it).

**Feel:**
Conversational and warm — Ben asking back should feel like a friend pausing to confirm, not a system requesting input. The bubble is just a bubble; no special UI affordances, no inline buttons, no quick-replies.

**State context:**
The model selected the ask_clarifying_question tool instead of a save tool. The original user message is in the chat above; Ben's question is the most recent message.

**Critical affordances:**
No inline reply buttons or quick-action chips in v1 — the response mechanism is the same composer used for everything else. Ben's clarifying question must feel like part of the conversation, not a special "confirm or cancel" UI mode.
````
