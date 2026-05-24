## Chat screen — Composing (text input focused)

````
**What this screen is for:**
Let the user type a message as a fallback to voice, without ever losing access to voice itself.

**What's visible:**
The text input area inside the composer is expanded to accommodate typing — the soft keyboard is up (this is mobile web). As soon as any character is in the input, the mic affordance morphs (or yields visual prominence) to a send affordance on the trailing edge of the composer. The drawer peek may compress or hide momentarily because mobile keyboard takes vertical space — this is a tolerated layout concession, not a feature; when the peek can stay visible, it should.

**What the user can do:**
- Primary: type and tap send (or press enter) to submit the message.
- Secondary: tap outside the composer to dismiss the keyboard and return to the standard populated layout (mic returns to dominance).

**Feel:**
The transition from "mic dominant" to "send dominant" is small and quiet — a morph, not a swap. Type in the input is comfortable and matches the conversation type. The composer doesn't suddenly become busy when the user starts typing.

**State context:**
The user has chosen text input — could be because they're somewhere they can't speak, the mic is unavailable, or they just prefer typing for this message.

**Critical affordances:**
The mic must remain visible (even if visually de-emphasized) — the user should be able to swap modes at any time. Clearing the input restores the mic to its dominant state. The morph between mic-dominant and send-dominant should not flash or jitter.
````
