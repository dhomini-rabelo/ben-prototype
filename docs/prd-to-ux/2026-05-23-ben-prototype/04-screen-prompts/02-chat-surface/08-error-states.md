## Chat screen — Error states

````
**What this screen is for:**
Surface failures along the capture flow honestly, in place, with a clear and friendly recovery path — never lose the user's input silently.

**What's visible:**
There are five distinct error surfaces, each in its own location:

1. **Mic-record failed** (browser-level mic API error during press-and-hold) — A soft inline toast or banner appears just above the composer with a friend-tone message ("mic glitched — try again or type it"). The pending user-message bubble (if one was rendering) is removed. The composer returns to its idle state with the mic still visible.

2. **Transcription failed** (the audio was captured but Whisper returned an error or empty text) — The pending user-message bubble flips into an error state: a quiet error fill (not red-screaming), friend-tone copy ("couldn't catch that — tap to retry or type it instead"), and a clear retry affordance integrated into the bubble. The original audio is held for one retry.

3. **Ben reply failed** (the model API returned an error) — The Ben typing indicator flips into an error bubble in the same chat position: a soft error fill with friend-tone copy ("brain hiccup — give me a sec") and a tap-to-retry affordance. The user's message remains unchanged.

4. **Save failed** (the model classified successfully but the capture didn't persist) — The inline capture card inside Ben's reply shows a small "couldn't save — retry" affordance integrated into the card. The chat continues normally; the missing artifact is the only signal of the failure. The card's retry tap re-attempts the save.

5. **Audio over 30 seconds** — Recording auto-stopped at the cap. A brief banner appears just above the composer ("hit the 30s cap — sent what I got") and fades after a few seconds. The transcribing flow continues normally with the truncated audio.

**What the user can do:**
- Primary: tap the relevant retry affordance for the specific error surface.
- Secondary: fall back to text input (always available except during recording).

**Feel:**
Friendly, non-alarming. Error fills are soft and distinguishable from normal bubbles but never aggressive (no red-screen energy). Friend-tone copy carries the recovery — the visual treatment is quiet.

**State context:**
One specific stage of the capture pipeline has failed. The rest of the conversation is intact; only the affected element shows an error.

**Critical affordances:**
Each error must surface in the exact location of the affected element (toast above composer for mic, the user bubble itself for transcription, Ben's typing bubble for reply, the inline card for save) — that locality is the trust signal. The retry must be one tap, not a multi-step recovery. Text fallback must remain reachable through all error states.
````
