# Plan 1 — Agent contract & env

1. **Define the shared chat request contract**
   - Specify that the client sends a message payload shaped for the chat UI streaming hook
   - Limit the request to the latest user message only (no prior turns carried in the request)
   - State that the request stays reply-only, with no capture classification or multi-turn context
   - Keep the existing JWT authentication behavior the route must enforce on every request

2. **Define the shared chat response contract**
   - Specify that the reply is returned as a live, streamed sequence rather than a single payload
   - State that the stream follows the UI message streaming protocol the frontend hook consumes
   - Clarify that the assistant reply is persisted once the stream completes

3. **Define the agent port**
   - Establish an abstraction the route depends on to obtain a streamed reply for a user message
   - Keep the underlying AI provider hidden behind this abstraction so the HTTP layer never references it directly
   - Mirror the conventions of the existing provider port so it stays consistent with the codebase

4. **Validate and document the Gemini API key**
   - Add the Gemini API key to the validated environment configuration so startup fails when it is missing
   - Add a placeholder for the key to the environment example and development configuration
   - Capture the shared chat contract shape in the project documentation so both parallel plans reference the same agreement
