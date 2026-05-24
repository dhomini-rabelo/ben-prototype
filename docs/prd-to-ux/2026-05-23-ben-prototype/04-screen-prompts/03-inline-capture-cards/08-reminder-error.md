## Reminder card — Error (save failed)

````
**What this screen is for:**
Surface a save failure for the reminder in place with a one-tap retry.

**What's visible:**
The card retains its layout but adopts a soft error fill. Inline error label ("couldn't save this reminder — retry") with a clear retry tap-target. The reminder title and relative-time remain visible.

**What the user can do:**
- Primary: tap retry.
- Secondary: ignore — the reminder won't fire (visually) or land in the drawer until retried.

**Feel:**
Calm and apologetic, matching the Note error state. Soft error surface, friend-tone copy.

**State context:**
Save failed; card content is correct.

**Critical affordances:**
The relative-time string must remain visible during the error state — the user needs to know what time the failed reminder was for, in case they decide to dictate it again instead of retrying.
````
