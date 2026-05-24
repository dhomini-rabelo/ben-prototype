## Chat screen — Edge cases

````
**What this screen is for:**
Handle the small visual variations that fall outside the primary states cleanly.

**What's visible:**
Three edge variations, each a small adjustment of the populated state:

1. **Very long single user message** (a long voice clip transcribed to dense text) — The user bubble grows vertically to accommodate the full transcript; no truncation. The chat auto-pins to the bottom so the latest content stays visible. The bubble's max-width is the same as a normal bubble; only height grows.

2. **Rapid-fire captures** (user records two clips back-to-back before Ben replies) — Two user bubbles render in order at the bottom of the chat, each with their own lifecycle (transcribing → final). Ben's replies stream in below in order as they arrive. The composer never blocks between captures.

3. **Returning from background** (the app was backgrounded mid-recording or mid-transcription) — Any in-flight recording is cancelled; the chat shows the standard error banner for the affected stage. The state is restored to the populated view at the last scroll position.

**What the user can do:**
- Primary: continue normally — these are visual edges of the standard populated state.

**Feel:**
Indistinguishable from the standard populated state except for the specific variation. The app should feel resilient — none of these edges should produce a janky or broken-looking surface.

**State context:**
Real-life usage patterns that come up during daily dogfooding. None are failures; all are normal variations the surface needs to absorb gracefully.

**Critical affordances:**
Long messages must scroll fully into view, not get cut off. Rapid-fire captures must preserve order — if Ben's replies arrive out of order due to varying model latencies, the UI must still pair each reply with the correct user message. Background return must not leave the user staring at a broken state.
````
