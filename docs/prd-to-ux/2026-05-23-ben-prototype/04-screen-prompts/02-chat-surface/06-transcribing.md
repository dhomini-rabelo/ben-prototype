## Chat screen — Transcribing (post-release, waiting on transcription)

````
**What this screen is for:**
Bridge the moment between "user finished speaking" and "user sees their words written down" so the wait doesn't feel empty.

**What's visible:**
The recording overlay collapses. A pending user-message bubble appears at the bottom of the chat (right-aligned) with a subtle transcribing indicator — a few small dots or a quiet "hearing you…" label inside or adjacent to the bubble. The composer's mic returns to its idle position but is briefly disabled to prevent double-sends. A small cancel affordance is reachable from the pending bubble (tap to discard the in-flight transcription).

**What the user can do:**
- Primary: wait — transcription typically completes within a second or two.
- Secondary: tap to cancel the in-flight transcription (rare but possible).

**Feel:**
Quick and quiet. The pending bubble matches the look of a normal user bubble but is clearly in-flight — slightly reduced opacity, or a soft pending indicator. No spinner that dominates.

**State context:**
The user has just released the mic; the audio blob is in flight to Whisper. This state is short-lived — under a second in the happy case, a few seconds at worst.

**Critical affordances:**
The pending bubble must appear immediately on release — even a half-second of "nothing happening" undermines the press-and-hold flow. The cancel affordance must exist but be quiet enough that users don't tap it by accident.
````
