## Sign-in screen — Error

````
**What this screen is for:**
Surface an authentication failure honestly and give the user an obvious way to try again without leaving the screen.

**What's visible:**
The same wordmark + tagline + primary button layout as empty. Above the button, an inline error band — soft warning surface, friend-tone message ("Google didn't let me in — try again?"). The primary button is re-enabled. No raw error codes, no stack traces, no "report a bug" link. If the error is an allowlist rejection (account not invited), the inline band's copy adapts ("Ben's invite-only right now — sorry") and the primary button may be hidden in that specific case since retrying won't help.

**What the user can do:**
- Primary: tap "Continue with Google" again to retry the OAuth flow.
- Secondary: none.

**Feel:**
The error should feel friendly, not alarming. Soft surface color for the error band — distinguishable from the rest of the screen but not red-screaming. Type weight matches the rest of the page. The recovery is one tap away and the layout barely moves.

**State context:**
A previous OAuth attempt failed — could be a network blip, a Supabase outage, or an account that's not allowed. The user has not been moved to a different route; the failure is surfaced in place.

**Critical affordances:**
The retry must be exactly the same action as the original attempt — no extra steps, no diagnostic questions. The user should be able to tap, fail, tap again without the screen changing layout in ways that confuse where the button went.
````
