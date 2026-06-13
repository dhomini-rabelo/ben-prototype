# Plan 15 — Chat footer + input/scroll/timer hooks (project-mobile)

Port the chat footer and its supporting hooks from `project-web` to `project-mobile` (React Native / Expo). This unit owns only the chat-footer component and the three named hooks. It depends on the shared chat-input (plan 11), the chat backbone (plan 10), and the UI primitives (plan 05). The voice/recording flow stays out of scope and is wired later in plan 19.

## Plan

1. **Port the text-input behavior hook**
   - Preserve the draft state model: a single shared draft value the footer reads and writes.
   - Keep the send behavior identical to web — clearing the draft optimistically, delegating the actual send to the messages store, and restoring the draft if the send does not commit.
   - Keep the hook platform-agnostic so the RN footer can consume it without changes to the underlying state contract.

2. **Port the elapsed-timer hook**
   - Reproduce the existing behavior unchanged: start counting seconds while running, reset to zero when stopped.
   - This hook carries no platform-specific code, so it migrates as-is for later voice use.

3. **Adapt the scroll-to-bottom hook for native lists**
   - Replace the DOM "scroll into view" approach with the inverted list ref pattern used by the chat backbone.
   - Keep the same triggers: scroll to the newest position when the latest message changes, when its streamed text grows, and when an assistant reply is awaited.
   - Expose a list ref (instead of a DOM node ref) that the chat history can attach to.

4. **Rebuild the chat footer for React Native**
   - Compose the shared chat-input for the text field plus a send affordance, using the native UI primitives.
   - Disable input/send while the message history is still loading, matching web.
   - Add a record affordance (mic button) that exposes an `onStartRecording` prop, but leave it unwired and disabled in this unit — plan 19 supplies the recording behavior and any recording-bar swap.
   - Keep the voice/recording-bar rendering branch out of scope; the footer here only shows the input + send + placeholder record button.
   - Account for keyboard avoidance as a consideration only; final keyboard/safe-area placement happens at page assembly in plan 16.

5. **Verify the unit compiles**
   - Confirm the type checker passes for the ported footer and hooks against the shared dependencies.
