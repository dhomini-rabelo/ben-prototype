# Plan 1 — Shared agent contracts

**Plan**

1. **Define the topic taxonomy concept**
   - Establish a shared notion of a topic key that identifies a recurring subject for a user
   - Document its expected shape so every part of the system reads and writes it consistently

2. **Describe how the agent receives prior context**
   - Allow the agent to be given the user's existing topics as suggestions when it starts a turn
   - Define how the agent can request related history for a set of topics during a turn
   - Treat that history lookup as something supplied to the agent rather than owned by it

3. **Shape the agent's structured response**
   - Capture the natural-language reply that streams back to the user
   - Capture the new items the turn proposes, kept minimal as suggestions only
   - Capture which topics the turn relates to, each with a short summary, reusing existing topics when they match and creating new ones otherwise

4. **Evolve the reply request boundary**
   - Carry the existing topic suggestions and the history lookup into the request
   - Ensure the completion signal delivers the full structured response instead of only text
   - Preserve the existing way the reply is streamed to the client

5. **Confirm the contract holds in isolation**
   - Keep this change limited to type and interface definitions with no behavior
   - Verify the contracts type-check on their own, accepting that consumers of the old shape will report mismatches until later plans adopt them
