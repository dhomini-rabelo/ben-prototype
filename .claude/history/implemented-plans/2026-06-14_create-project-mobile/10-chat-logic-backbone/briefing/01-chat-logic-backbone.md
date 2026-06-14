# Simple Plan — Chat logic backbone (state, stores, hooks, utils)

Port the chat session's non-UI logic into `project-mobile`, copying it intact wherever the code is platform-agnostic and flagging the few browser globals that must be validated or replaced under React Native. No UI work in this unit.

## Plan

1. **Port the draft input state**
   - Recreate the Jotai draft atom for the chat input exactly as in web; it is platform-agnostic and copies with no changes.

2. **Port the chat message contract and helpers**
   - Recreate the chat message type and the text-extraction helper unchanged.
   - Confirm the message type is only a TypeScript type imported from the AI SDK (no runtime streaming usage), so it carries over with no native concern.

3. **Port the messages store folder**
   - Recreate the session messages store with its full behavior: holding in-progress session messages, tracking awaiting-reply and send-error flags, sending text, retrying the last user message, and stopping the typing animation.
   - Preserve the reply dispatch flow: send the message to the backend, invalidate the affected captured-data queries, append the assistant message, and animate its text reveal.
   - Keep the offline guard (skip sending when connectivity reports offline) and the reliance on the shared backend request and query-client utilities.

4. **Validate platform globals used by the store**
   - Confirm the typing animation's interval timing behavior works under the React Native runtime; the interval/timer APIs are available and should be kept as-is.
   - Flag the unique-id generation used when building messages: it relies on a browser/Node crypto global that is not guaranteed in the React Native runtime. Validate availability at app boot and, if absent, substitute an equivalent id generator while keeping the same id shape and uniqueness guarantees.
   - Confirm there is no actual AI-SDK streaming transport here (replies arrive as a single backend response and the "typing" effect is a purely local animation), so no SSE/fetch-streaming validation is required for this unit.

5. **Port the combined chat-messages hook**
   - Recreate the hook that merges paginated history (mapped to UI messages, oldest-first) with the live session messages.
   - Preserve the derived empty/loading state semantics and the exposed history actions; it depends only on platform-agnostic data hooks and copies intact.
