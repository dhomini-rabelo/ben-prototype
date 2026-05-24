## Chat screen — Permission-denied (mic access denied)

````
**What this screen is for:**
Recover from the highest-stakes single moment in the app — the user denied mic access — without losing them.

**What's visible:**
The recording overlay (if it was open) collapses. The screen returns to the populated chat layout. A persistent, dismissible banner appears just above the composer with a friend-tone message ("Ben can't hear you yet — turn on mic in browser settings") and a tap-target ("show me how") that opens a help sheet or modal explaining how to grant mic access in mobile browser settings. The mic affordance in the composer remains visible but tapping it re-surfaces the banner rather than triggering recording. The text input area in the composer remains fully functional.

**What the user can do:**
- Primary: tap "show me how" to see browser-specific instructions for enabling mic.
- Secondary: type messages via the text input — text fallback works regardless of mic state.
- Tertiary: dismiss the banner (it will reappear next time the user taps the mic).

**Feel:**
Honest and non-judgmental. The banner is a quiet alert surface, not an angry warning. Copy assumes the user might fix it later and doesn't shame the choice. Text input remains a first-class option, not a punishment.

**State context:**
The user denied mic permission via the browser's prompt. Voice capture is unavailable until they change browser settings. This may be permanent if the user doesn't fix it — text fallback is the lifeline.

**Critical affordances:**
The help sheet must give clear, browser-specific guidance — many mobile browsers don't allow deep-linking to settings, so the instructions need to be readable and easy to follow. The mic affordance must not silently fail when tapped — it must always re-surface the banner so the user understands why nothing is happening. Text input must work flawlessly.
````
