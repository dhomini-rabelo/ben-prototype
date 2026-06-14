# Plan 2 — Gemini agent: structured output, one tool, streaming

**Plan**

1. **Make the agent aware of recurring topics**
   - Keep the established assistant persona and voice unchanged
   - Present the user's known topics to the agent as suggestions for the turn
   - Guide the agent to reuse a matching existing topic or create a new one when none fits

2. **Let the agent pull prior context once when needed**
   - Offer the agent a single way to request related history for a chosen set of topics
   - Have the agent decide, from the current message, which topics warrant deeper context
   - Limit this lookup to a single use before the agent commits to its reply
   - Resolve the requested history through the lookup supplied with the request

3. **Produce a structured turn result**
   - Capture the natural-language reply meant for the user
   - Capture the new suggested items the turn proposes
   - Capture which topics the turn relates to, each with a short summary

4. **Stream the reply while delivering the structured payload**
   - Continue streaming the natural-language reply as text so the existing chat keeps working
   - Append the proposed items and related topics as additional typed parts within the same stream
   - Keep this additive so clients unaware of the new parts still render the reply
   - Deliver the complete structured result through the completion signal for later persistence

5. **Preserve the existing transport and isolation**
   - Keep returning the reply through the current streaming transport
   - Confine the change to the agent's own behavior without altering surrounding consumers
   - Verify the agent type-checks on its own, accepting that older callers stay mismatched until later plans adopt the new shape
