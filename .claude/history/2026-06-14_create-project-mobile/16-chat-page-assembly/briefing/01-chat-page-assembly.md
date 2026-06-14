# Plan 16 — Chat page assembly + route

Simple, high-level plan to assemble the mobile chat screen from the already-built chat pieces and wire it into the app's navigation. This is a synchronization step that runs alone after the parallel chat component work is complete.

## Plan

1. **Compose the chat screen layout**
   - Bring the top bar, top banner, message history, and footer together into a single chat screen
   - Decide the empty, loading, and populated states of the history area and show the right one
   - Keep the footer (task picker plus the input area) anchored at the bottom and the header pinned at the top
   - Preserve the same vertical structure and visual hierarchy the web version has

2. **Adapt the screen to mobile platform behaviors**
   - Respect device safe areas so content does not sit under the notch or home indicator
   - Make the input area rise above the on-screen keyboard instead of being covered by it
   - Replace the web-only footer-height measurement with a native layout measurement so the history area always leaves room for the footer
   - Reflect live connectivity status on the screen

3. **Handle in-progress and transient chat states**
   - Show the task picker only when the user is not recording
   - Surface the typing indicator and capture cards within the conversation flow
   - Account for transcribing and error voice states when choosing between empty state and history
   - Stop the typing indicator when the user leaves the screen

4. **Leave a clear seam for voice transcript handling**
   - Reserve an obvious, well-marked place where voice transcription results will later be connected to message sending
   - Do not wire voice transcription in this unit; ensure the screen works end-to-end for text without it
   - Make the seam self-explanatory so the later voice unit can plug in without restructuring the screen

5. **Register the chat route**
   - Add the chat screen to the app's protected navigation so authenticated users reach it
   - Confirm the screen renders end-to-end and that sending a text message works

## Verification

- The chat screen renders fully: header, history (in each state), task picker, and footer
- Sending a text message works; voice is intentionally not yet wired
- Type-checking passes for this unit's files
