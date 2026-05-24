## Drawer expanded — Error (any tab)

````
**What this screen is for:**
Surface a load failure for whichever tab is selected, without breaking the rest of the drawer.

**What's visible:**
Sheet with the affected tab selected. Tab switcher remains visible and functional. Below the tabs, an inline error band — soft error fill, friend-tone copy ("couldn't load your {reminders/tasks/notes} — tap to retry") with a retry tap-target. Other tabs can still be tried by tapping them.

**What the user can do:**
- Primary: tap retry.
- Secondary: switch tabs (each tab has its own load state; one tab erroring doesn't mean others will).
- Tertiary: collapse the sheet.

**Feel:**
Calm, matches other error states. The error is for one tab only; the rest of the drawer remains usable.

**State context:**
A query failed for the selected tab's data.

**Critical affordances:**
Other tabs must remain switchable — don't lock the user out of the whole drawer because one tab failed.
````
