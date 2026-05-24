## Chat screen — Recording (press-and-hold active)

````
**What this screen is for:**
Show the user that Ben is listening, give them confidence the audio is being captured, and offer a clear cancel path.

**What's visible:**
The chat behind dims slightly to focus attention on the composer area. The composer transforms into a recording state: where the mic was, an active mic indicator (held, pulsing, or glowing with the accent color); above the composer, an overlay panel containing a live waveform or audio-level meter responding to the user's voice, an elapsed timer counting up (with the 30-second maximum implied), and a "slide left to cancel" hint with a leftward arrow indicator. The text input area is hidden or de-emphasized while recording.

**What the user can do:**
- Primary: hold the mic and speak; release to send.
- Secondary: slide the finger left past a threshold to cancel — recording discarded, no message sent.
- Tertiary: lift early without sliding — same as release, sends what was captured.

**Feel:**
Alive and confident. The waveform / level meter reacts in real time to the user's voice — that responsiveness is the trust signal. Motion is purposeful, not decorative. The recording overlay feels like a small, well-crafted moment — the kind of micro-interaction that rewards attention without demanding it. Calm color, no flashing.

**State context:**
The user is actively pressing the mic. This state lasts seconds at most and ends on release or cancel.

**Critical affordances:**
The waveform / level meter must be visibly responsive — a static "recording…" label is not enough; the user needs to see that their voice is being heard. The slide-to-cancel must be discoverable from the visible hint without prior knowledge. The 30-second cap is implicit in the timer; when it's reached, the recording auto-stops with a brief explanatory banner (see the audio-over-30s error state).
````
