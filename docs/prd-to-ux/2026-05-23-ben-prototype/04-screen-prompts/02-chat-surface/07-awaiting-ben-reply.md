## Chat screen — Awaiting Ben reply (model thinking)

````
**What this screen is for:**
Signal that Ben has heard the user and is composing a reply, while keeping the composer available for follow-up.

**What's visible:**
The user's message bubble is now finalized with the transcribed text (no longer pending). Below it, a Ben-side typing indicator appears — a small left-aligned bubble with three quiet animated dots (or equivalent typing affordance), styled to match Ben's normal messages. The composer is fully re-enabled — the user can press and hold the mic again or type a follow-up while waiting.

**What the user can do:**
- Primary: wait for Ben's reply — the typing indicator suggests it's imminent.
- Secondary: stack a follow-up message via voice or text — the composer is live.

**Feel:**
The typing indicator is the friendliest part of the conversation visually — gentle dots, calm animation, no urgency. It feels like a friend gathering their thoughts.

**State context:**
The user's transcribed message has been sent to the model; the model is composing a reply and possibly calling a tool (save_note / save_reminder / save_task / ask_clarifying_question).

**Critical affordances:**
The composer must remain live — blocking the user while Ben replies would break the rapid-fire capture flow the founder explicitly wants. The typing indicator should appear quickly after transcription completes; a perceptible delay between "transcript visible" and "Ben starts typing" feels like a stall.
````
