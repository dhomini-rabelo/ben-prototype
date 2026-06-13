# Plan 12 — Chat message rendering pipeline (project-mobile)

Port the message-rendering layer from `project-web` to `project-mobile` (React Native / Expo). This unit owns only the message-rendering pieces: the history list, the message bubble, the message footers, the capture card (+ its context), the typing indicator, and the list/pagination hook. It depends on the chat backbone (plan 10), shared components (plan 11), UI primitives (plan 05), and data hooks (plan 08), which are assumed to already exist on mobile.

---

## Plan

1. **Rebuild the chat history as an inverted virtualized list**
   - Render the conversation in an inverted scrolling list so the newest message sits at the bottom and the view starts pinned there, removing the web's scroll-to-bottom hacks.
   - Keep messages in newest-first order internally (matching the cursor API) and let inversion present them oldest-to-newest visually.
   - Trigger loading of older history when the user scrolls toward the top of the conversation, replacing the web's viewport-observer approach.
   - Preserve the user's reading position when an older page is prepended, relying on inversion instead of manual scroll compensation.
   - Show a loading affordance while an older page is being fetched.
   - Keep rendering the live session states: the in-flight transcription bubble, the voice-error bubble, and the "Ben is typing" indicator while awaiting a reply.
   - Provide a skeleton placeholder state for the initial load.

2. **Port the message bubble for native rendering**
   - Reproduce the visual variants: sender side (user vs. Ben), and the default / pending / error / skeleton states.
   - Render message content as plain text only (no markdown parsing or rich formatting).
   - Allow an optional footer slot beneath the bubble and allow embedded content (such as a capture card) inside the bubble.
   - Keep the same styling tokens and rounded-corner treatment used on web, adapted to native styling.

3. **Port the message footers**
   - Recreate the send-retry footer that lets the user re-send a message that failed to get a reply.
   - Recreate the voice-retry footer that lets the user retry a failed voice capture.
   - Recreate the transcribing footer that shows hearing/transcription progress with an animated indicator and a cancel control.
   - Wire each footer to the existing voice and messages state so the retry/cancel behaviors stay identical to web.

4. **Port the capture card and its context**
   - Recreate the composable capture-card structure (root + icon, body, header, title, meta, supporting text, action button, error button) sharing kind/state/shape through a card-level context.
   - Preserve kind-specific behavior (note, reminder, task) and state-specific behavior (default, pending, error, active, finished, fired), including which sub-parts hide or restyle per state.
   - Make the task action button navigate to the task workspace using native navigation instead of a web link, keeping the same action labels per state.
   - Keep icon selection rules, including task text-vs-list shape icons, mapped to native-compatible icons.

5. **Recreate the typing indicator with native animation**
   - Reproduce the three-dot "Ben is typing" indicator using a native animation driver instead of CSS keyframes.
   - Keep the staggered bounce timing and the bubble styling consistent with web.

6. **Build the list/pagination hook for the inverted list**
   - Provide a hook that exposes the ordered message data plus the load-older-page trigger and fetching state for the inverted list.
   - Consume the existing cursor-paginated message data and merge persisted history with the live in-session messages.
   - Surface whether more history exists and guard against duplicate fetches while a page is in flight.
   - Scope this hook strictly to list data and older-page pagination; scroll-to-bottom behavior belongs to another unit.
