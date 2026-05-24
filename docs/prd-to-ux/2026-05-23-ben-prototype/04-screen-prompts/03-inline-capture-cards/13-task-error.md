## Task card — Error (save or toggle failed)

````
**What this screen is for:**
Surface a failed save or failed checkbox toggle in place with retry.

**What's visible:**
For a failed save (initial classification persisted but the row didn't land): soft error fill, inline error label ("couldn't save this task — retry"), retry tap-target. Checkbox is visible but disabled.

For a failed toggle (the task existed but the open↔done state didn't update on the server): the checkbox bounces back to its previous state with a small inline label ("didn't go through — retry") and a retry affordance integrated into the card.

**What the user can do:**
- Primary: tap retry.
- Secondary: ignore.

**Feel:**
Calm, apologetic, matches the other card error states.

**State context:**
Either initial save failed or a subsequent toggle failed.

**Critical affordances:**
The checkbox state must always reflect the persisted truth — never leave the user staring at a "checked" box when the server thinks it's open. The bounce-back-on-failure pattern is the trust signal.
````
