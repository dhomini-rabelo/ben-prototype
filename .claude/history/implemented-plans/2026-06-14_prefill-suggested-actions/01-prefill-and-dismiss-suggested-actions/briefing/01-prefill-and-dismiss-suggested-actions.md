# Simple Plan: Prefill chat input from Suggested Actions and dismiss used buttons

1. **Define the suggested actions as data**
   - Capture each suggested action's icon, button label, and the starter text it prefills.
   - Keep the two existing actions (a reminder starter and a note starter) with stable identities so dismissal can target one at a time.

2. **Prefill the chat input on tap**
   - When a suggested action is tapped, fill the chat input draft with that action's starter text.
   - Leave the trailing space so the user can immediately continue typing.
   - Do not auto-send — the user types the rest and sends themselves.

3. **Dismiss the tapped action**
   - After a tap, hide only the tapped suggestion; keep the other untapped suggestions visible.
   - Track which actions have been used for as long as the empty state is shown.

4. **Hide the section when empty**
   - When every suggestion has been used, hide the entire "Suggested Actions" section (heading included), leaving the empty-state message in place.

## Verification
- Type-check the mobile project with the TypeScript compiler.
- Manually confirm: tapping a suggestion prefills the input and removes that button; remaining suggestions stay; using all of them hides the whole section.
