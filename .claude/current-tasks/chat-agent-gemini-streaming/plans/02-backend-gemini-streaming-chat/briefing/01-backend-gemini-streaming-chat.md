# Plan 2 [Backend] — Gemini streaming agent & /chat route

1. **Add the AI streaming dependencies to the backend**
   - Bring in the provider-agnostic AI toolkit and the Google generative provider as backend dependencies
   - Confirm the Gemini API key from the validated environment configuration is what the provider uses to authenticate

2. **Implement the Gemini agent behind the existing agent abstraction**
   - Provide a concrete agent that fulfills the abstraction defined by the contract plan, without redefining that abstraction
   - Use the Gemini Flash Lite model to produce Ben's reply as a live token-by-token stream
   - Give the agent a Ben persona instruction that keeps replies concise and on-character
   - Scope the agent to reply only, using just the latest user message with no prior conversation context
   - Keep the underlying AI toolkit fully contained inside this implementation so the rest of the system never references it directly

3. **Create the persisting streaming chat endpoint**
   - Require the same authentication the existing message routes enforce
   - Persist the incoming user message before generating any reply
   - Ask the agent to stream Ben's reply and forward that stream to the client using the agreed streaming protocol
   - Persist Ben's reply once the stream finishes, leaving any capture classification empty for now
   - Match the shared request and response shape agreed in the contract plan

4. **Expose the new chat endpoint on the server**
   - Register the streaming chat route so it is reachable as a posted request
   - Keep it consistent with how the existing authenticated routes are wired

5. **Reconcile the persistence helpers with the real agent flow**
   - Reuse or adjust the existing message persistence orchestration so both the user and Ben messages are stored through the same repository path
   - Retire or repurpose the mock reply helpers that the real streamed agent now replaces
   - Keep capture generation as an empty placeholder until classification is in scope
