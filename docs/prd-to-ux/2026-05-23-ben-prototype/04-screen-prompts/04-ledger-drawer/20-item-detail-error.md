## Item detail — Error

````
**What this screen is for:**
Surface a detail-load failure with retry, without confusing the user.

**What's visible:**
Modal sheet with drag handle. Inline error band — soft error fill, friend-tone copy ("couldn't load this one — tap to retry") with retry affordance. Close affordance remains visible.

**What the user can do:**
- Primary: tap retry.
- Secondary: dismiss the sheet.

**Feel:**
Calm, matches other error states.

**State context:**
Failed to load detail for the tapped item.

**Critical affordances:**
The user must be able to close the sheet even when detail errored — no trap state.
````
