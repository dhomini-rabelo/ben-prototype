# Plan 3 — Frontend: Adopt the streaming chat hook

1. **Bring in the streaming chat capabilities**
   - Add the AI SDK chat dependencies to the web project
   - Confirm they are available for the chat experience without affecting other screens
   - Keep the change scoped to the web project only

2. **Connect the chat hook to the streaming endpoint**
   - Point the chat hook at the shared streaming chat endpoint defined by the agreed contract
   - Send only the latest user message, matching the reply-only, latest-message-only agreement
   - Carry the user's authentication credentials on every chat request the same way the existing authenticated client does
   - Reflect streaming status so the interface knows when a reply is in progress

3. **Seed the conversation with existing history**
   - Continue loading past messages as paginated history
   - Convert the loaded history into the shape the streaming hook expects as its starting messages
   - Preserve loading older messages by scrolling toward the top

4. **Render messages in the new shape**
   - Adapt the message display to read content from the streaming message structure rather than the previous model
   - Distinguish user messages from Ben's replies so each renders on the correct side
   - Keep showing captures attached to historical messages, since older entries can still carry them

5. **Preserve the send and live-reply experience**
   - Send a typed message and stream Ben's reply back into the conversation as it arrives
   - Keep the input behavior, including clearing the draft and disabling sending while a reply streams
   - Maintain automatic scrolling to the latest message as new content appears

6. **Retire the replaced send flow**
   - Remove the previous bespoke send-and-await behavior now superseded by the streaming hook
   - Keep only the history and contract pieces still required for seeding and authentication
   - Ensure the chat screen relies solely on the streaming hook for sending and receiving replies
