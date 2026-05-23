# Sign-in — Screen Prompts

_Each block below is self-contained. Copy one block, paste into Stitch / Figma AI / Pencil / Claude Design._

---

## Sign-in screen — Empty (default first-load)

````
**What this screen is for:**
Get the new user signed in with one tap so they can start using Ben.

**What's visible:**
A calm, centered layout occupying the full screen. The product name "Ben" rendered as a confident wordmark sits in the upper-middle area. Just beneath it, a single short tagline in a friend tone — something like "your busy-day brain — say it, Ben files it." Below that, with comfortable breathing room, a single primary call-to-action button labeled "Continue with Google." Nothing else competes for attention — no marketing copy, no feature list, no email or password fields, no "skip" link. The lower portion of the screen is quiet whitespace.

**What the user can do:**
- Primary: tap "Continue with Google" to hand off to the OAuth flow.
- Secondary: none.

**Feel:**
Modern and human. Clean typographic hierarchy with the wordmark slightly larger and heavier than the tagline. Restrained, mostly-neutral palette with a single understated accent reserved for the primary button. Generous whitespace — the screen should feel like it's not trying to convince anyone. Surfaces have soft, rounded corners. The personality is in the tagline copy, not in visual ornament.

**State context:**
First impression. The user is unauthenticated and has never seen the product before (or has signed out). No data, no history, no decisions to make beyond one tap.

**Critical affordances:**
The single primary button is the only thing the user can do. Resist the urge to add secondary affordances ("learn more", "sign up", "skip") — Ben's wedge is reached on the other side of one tap, and adding choices here drains trust before the product has earned any.
````

---

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

---

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

---

## Sign-in screen — Permission-denied

````
**What this screen is for:**
Recover gracefully when the user cancels the Google popup or denies the requested scopes.

**What's visible:**
Visually identical to the Error state — inline soft band above the primary button. Copy is warmer and assumes good faith ("looks like that didn't go through — want to try again?"). The primary button is fully re-enabled. No data was created.

**What the user can do:**
- Primary: tap "Continue with Google" again.
- Secondary: none.

**Feel:**
Forgiving and quiet. The user might have cancelled on purpose — the screen shouldn't assume failure, just offer the door again. Same soft band aesthetic as the Error state.

**State context:**
The user reached the Google OAuth screen and either closed it, said no, or declined scopes. They're back at Ben's sign-in screen with no progress.

**Critical affordances:**
Tone is the affordance here. "You did something wrong" energy will lose the user on a first impression. Treat the cancellation as a normal outcome of a normal action.
````

---

## Sign-in screen — Edge: extended wait

````
**What this screen is for:**
Hold the user's confidence during an unusually slow OAuth handoff (slow network, slow Google response, slow Supabase callback).

**What's visible:**
Same layout as the standard Loading state, but the secondary line beneath the primary button has appeared and reads something like "still waiting on Google…" in friend tone. If the wait extends further, the line may evolve to a second message ("Google's taking its time today — give it a few more seconds"). The primary button remains non-interactive throughout. No progress bar — we don't own the OAuth window.

**What the user can do:**
- Primary: wait, with a clearer sense that the system hasn't crashed.
- Secondary: none in v1 — no "cancel and retry" affordance to avoid race conditions with the in-flight OAuth.

**Feel:**
Patient and human. The copy is what does the work — "still waiting" feels like a friend texting from a slow line, not a "timeout in 30s" warning. Calm tone, no escalation.

**State context:**
The loading state has been visible for more than a few seconds. Most users will never see this; it exists to prevent the rare "is it stuck?" moment from becoming a quit.

**Critical affordances:**
The secondary "still waiting" line must arrive only after a delay — showing it instantly defeats the point. The escalating copy (if used) must stay in friend tone, never apologetic or alarmist.
````
