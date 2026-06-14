# Plan 3 — Route integration & wiring

**Plan**

1. **Register shared topic-memory storage**
   - Make the topic storage and the topic-summary storage available as shared, long-lived instances
   - Mirror how existing shared storage for messages is already exposed for reuse across the system

2. **Prepare the topic-memory operations for the chat turn**
   - Make the operations that build a user's topic index, serve history for requested topics, and persist topics and summaries available within the chat flow
   - Connect each operation to the shared storage so they act on the same data

3. **Surface known topics to the agent at the start of a turn**
   - After the incoming user message is recorded, gather the user's accumulated topics
   - Hand those topics to the agent as suggestions for the current turn

4. **Let the agent reach for prior context during the turn**
   - Give the agent a way to request stored history for a chosen set of topics
   - Resolve that request through the topic-memory operation that returns matching summaries

5. **Persist the turn's outcome after the agent finishes**
   - Record the assistant's natural-language reply as before
   - Save the topics the turn related to along with their summaries, linking them to the assistant message when possible
   - Leave the agent's proposed items unpersisted, since storing those belongs to a separate feature

6. **Preserve the existing response behavior and confirm the merge**
   - Keep streaming the reply to the client exactly as it works today, with no change required on the web side
   - Keep the established request-handling style, including validation and error forwarding
   - Verify the combined backend type-checks cleanly as the point where the parallel work comes together
