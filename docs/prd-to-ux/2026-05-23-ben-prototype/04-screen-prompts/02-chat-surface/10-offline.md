## Chat screen — Offline

````
**What this screen is for:**
Keep the user informed and, where possible, keep capture working when the network is unavailable.

**What's visible:**
A subtle banner appears at the top of the chat area with a friend-tone message ("offline — Ben's listening but can't reply yet"). The composer remains visible. Two possible behaviors for the composer depending on implementation depth:

- **Queueing supported**: voice and text inputs continue to work; the user-message bubble appears with a "pending" indicator (similar to the transcribing state but distinct) and waits in a local queue. On reconnect, queued messages send in order and Ben's replies stream in.
- **Queueing not supported**: the composer is disabled with the same offline banner; the mic and text input show a quiet non-interactive state.

The drawer peek and existing chat history remain readable — local data is still accessible.

**What the user can do:**
- Primary (queueing): record or type — capture is queued for send on reconnect.
- Primary (no queueing): wait for reconnect; review prior captures via the ledger drawer.
- Secondary: dismiss the offline banner (it will reappear if still offline on next action).

**Feel:**
Calm and informative. The offline banner is the same quiet surface as the error band on sign-in — soft, friendly, not red. The user shouldn't feel locked out of their data, only delayed in sending new captures.

**State context:**
The browser's online detection returned false, or a recent fetch failed in a network-error way. The user may be in a tunnel, on a plane, or in a spotty area.

**Critical affordances:**
The user must always be able to read existing captures and chat history offline — the local state is intact. The offline banner must be honest about what works and what doesn't; if queueing isn't implemented, don't pretend the input went through.
````
