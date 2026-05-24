## Sign-in screen — Loading

````
**What this screen is for:**
Reassure the user that the sign-in is in progress and not stuck.

**What's visible:**
Same overall layout as the empty state — wordmark, tagline, primary button position preserved — but the button is now in a non-interactive state with a subtle in-progress indicator integrated into it (the label may swap to "redirecting…" or similar friend-tone copy). Beneath the button, a small, calm secondary line that fades in only if the wait extends ("still waiting on Google…") — it should not appear immediately. The rest of the screen is unchanged so the user doesn't feel like they've been moved.

**What the user can do:**
- Primary: wait. The button is intentionally non-interactive.
- Secondary: none — the OAuth window is doing the work.

**Feel:**
Calm and confident. No spinner that screams "loading" — a quiet, slow pulse or a barely-there indicator. The tone is "Ben's just talking to Google for a sec," not "system busy."

**State context:**
The user has tapped Continue with Google and the OAuth handoff is in flight (popup opening, redirect happening, or callback being processed).

**Critical affordances:**
The screen must look intentional if the OAuth redirect breaks the user out of the app and brings them back via a full-page navigation — there should be no flash of unauthenticated content or jarring re-mount. Visual continuity between empty and loading matters.
````
