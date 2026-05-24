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
