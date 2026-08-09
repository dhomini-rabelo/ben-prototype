# Plan 05 — Add a dimmed, unclickable backdrop behind the settings sheet

## Design decision

Introduce a small reusable backdrop-and-modal wrapper that lives alongside the settings-sheet components, rather than inlining the modal/scrim logic in the menu page. Justification:

- The page currently renders the settings content through a thin `absolute` positioning wrapper; keeping the new modal/backdrop behavior encapsulated in its own settings component keeps the page declarative and avoids duplicating animation and scrim wiring inline.
- The settings area already follows a "view wraps sheet" composition (a view component delegating to a presentational sheet). Adding the backdrop wrapper in the same area mirrors that structure and keeps everything this plan owns self-contained.
- It reuses the gold-standard pattern (transparent native modal + animated scrim + tappable backdrop wired to close + sheet sliding up) without touching files owned by other plans.

## Plan

1. **Provide a dimmed scrim while the settings sheet is open**
   - Cover the entire menu screen with a translucent dark overlay whenever the settings sheet is visible
   - Fade the overlay in as the sheet opens so the transition feels smooth
   - Ensure the overlay sits above the menu content but below the sheet itself

2. **Block interaction with the menu behind the sheet**
   - Prevent taps and gestures from reaching the menu screen while the sheet is open
   - Keep all controls inside the sheet (profile, sign out, retry, close) fully interactive

3. **Allow dismissing the sheet by tapping the backdrop**
   - Close the settings sheet when the user taps the dimmed area outside the sheet
   - Reuse the existing close behavior so the open/closed state stays consistent
   - Preserve the existing explicit close control and the sign-out flow unchanged

4. **Animate the sheet sliding up from the bottom**
   - Have the sheet slide up into view when opened, consistent with the established sheet behavior
   - Keep the sheet anchored to the bottom and respect the device safe area

5. **Keep the existing settings content and state intact**
   - Continue rendering the current profile, sign-out, and error/retry states inside the sheet
   - Leave the open/close state source and its actions working as before
   - Optionally and secondarily, the same dimmed backdrop behavior could later be applied to the note/reminder detail sheet for consistency; the settings sheet is the required deliverable
