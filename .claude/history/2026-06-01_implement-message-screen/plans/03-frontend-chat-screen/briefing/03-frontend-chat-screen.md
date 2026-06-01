# Plan 3 — Frontend chat (message) screen, Text MVP (project-web)

This plan builds the chat screen in `project-web`, reproducing the visual design of the `project-design` chat screens while following `project-web`'s own code structure and conventions. It wires the screen to the shared message API contract from Plan 1 (`GET /messages/list`, `POST /messages/create`). Scope is the Text MVP only: Empty, Loading history, Populated, Composing, and Awaiting reply. Audio/voice, offline, permission-denied, and error-recovery states are out of scope. This plan owns only its frontend files and must not touch any backend file.

## Plan

1. **Register the chat screen in the app**
   - Add a dedicated chat destination to the app's route registry and wire it into the router alongside the existing login and home destinations, following the same routing approach already used in project-web.
   - Treat the chat screen as the signed-in landing experience: require an authenticated session to reach it and redirect unauthenticated visitors back to login, consistent with how the existing signed-in screen guards access.

2. **Reproduce the chat visual building blocks**
   - Recreate the shared chat layout shell (fixed top bar with brand mark and menu, scrollable message area, fixed bottom area holding the active-task peek and the input), matching the project-design look and spacing.
   - Recreate the message bubble (distinct user vs. Ben styling, plus a skeleton state), the message input (idle/composing/disabled appearance with a send affordance when text is present), the Ben typing indicator, the active-task peek (summary and skeleton variants), and the inline capture card (note/reminder/task) used inside Ben's replies.
   - Build these as project-web components using the project's existing class-merging helper and design tokens, so the screen visually matches project-design without copying its file layout.

3. **Establish the message data layer against the contract**
   - Define the message and capture shapes the client works with, mirroring the Plan 1 contract (message id, role, content, timestamp, and optional capture reference).
   - Provide a way to load message history (latest-first, with the limit and older-page cursor the contract specifies) and a way to send a new message that returns the persisted user message plus Ben's reply and any capture.
   - Reuse project-web's existing backend-communication conventions: the centralized backend base URL and endpoint definitions, JSON over the standard transport, and the stored authentication token passed via the standard auth header (userId always derived server-side, never sent by the client).

4. **Render the Text-MVP screen states**
   - Loading history: show the skeleton layout (skeleton bubbles and skeleton peek, input non-interactive) while the initial history request is in flight.
   - Empty: when there is no history, show the welcome state with the no-messages message and the suggested-action prompts, with an active input.
   - Populated: render the loaded history as ordered bubbles (oldest at top, newest at bottom), showing inline capture cards on Ben messages that filed something, with the active-task peek summarizing in-progress work.
   - Composing: reflect the user's typed text in the input and reveal the send affordance, keeping the conversation visible above.
   - Awaiting reply: after sending, immediately show the user's new bubble and a Ben typing indicator until the reply returns, then append Ben's reply (and any capture) to the conversation.

5. **Connect screen behavior to the data layer**
   - On screen open, trigger the history load and drive the state shown (loading → empty or populated) from the load outcome.
   - On send, submit the typed content, clear the input, and transition through the awaiting-reply state to the updated populated conversation when the response arrives.
   - Keep newest messages in view as the conversation grows and after sending, so the latest exchange is visible.
   - Limit handling to the in-scope states only: do not implement offline, permission-denied, or error-recovery flows, and do not add voice/audio affordances beyond the visual input already defined by the design.
