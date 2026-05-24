## Item detail — Edge cases

````
**What this screen is for:**
Handle unusual content and out-of-band changes cleanly.

**What's visible:**
- **Long note body** — body text scrolls inside the sheet. The drag handle at top remains visible (drag handle dismisses, scroll inside scrolls the body).
- **Item deleted from another session** — in v1 with a single user (N=1), this is a far edge. If it happens, the sheet shows a graceful "this one's gone" state with friend-tone copy ("looks like this isn't here anymore") and auto-closes after a brief delay, or offers an explicit close.

**What the user can do:**
- Primary: read or scroll; dismiss when done.

**Feel:**
The "gone" state should be quiet and forgiving — not alarming. The user almost certainly didn't delete this themselves in v1; it's a far-edge fallback.

**State context:**
Real-world data variability and far-edge multi-session scenarios.

**Critical affordances:**
Scroll-inside-sheet and drag-to-dismiss must not conflict. The "gone" state must close cleanly without leaving stale UI behind.
````
