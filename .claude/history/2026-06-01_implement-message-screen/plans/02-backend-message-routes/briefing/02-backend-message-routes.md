# Plan 2 — Backend message routes (Text MVP)

This plan implements the backend side of the Text-MVP message API in the backend project, against the shared contract from Plan 1. It mirrors the existing auth flow's layering (domain entity → repository port + in-memory implementation → use-cases → http handlers + presenters → router registration). Scope is text only; no audio/voice. It touches no frontend file.

## Plan

1. **Model the message in the domain**
   - Represent a single message with its role (either the user or Ben), its text content, the owning user, and a creation timestamp.
   - Allow a message to optionally carry the capture reference produced from the exchange (its kind — note, reminder, or task — and the referenced item id), absent when nothing was filed.
   - Keep the entity consistent with how existing domain entities are created and referenced, so it can be persisted and read back the same way.

2. **Provide message persistence**
   - Define a persistence port for messages that exposes creating a message and listing a user's messages.
   - Supply an in-memory implementation consistent with the existing user persistence approach, since the prototype keeps data in memory rather than a database.
   - Ensure listing can be ordered latest-first, limited to a page size, and filtered to fetch only messages older than a given cursor point.

3. **Implement the list-messages use-case**
   - Accept the owning user, a page size that defaults to the contract's default, and an optional cursor for scrolling back through older history.
   - Return the requested window of the user's messages ordered latest-first, scoped strictly to that user.
   - Provide the pagination signal the client needs to request the next older page and to recognize when no more history exists, including the agreed empty/end-of-history behavior.

4. **Implement the create-message use-case**
   - Accept the owning user and the text content of the new message.
   - Persist the user's message, then generate Ben's reply (a stubbed/mock reply is acceptable for the prototype) and persist it as well, preserving their order and relationship.
   - Return both persisted messages together with the optional capture produced from the exchange, matching the contract's send-message response.
   - Treat a failed reply or failed capture as transient rather than a persisted field, consistent with the agreed error expectations.

5. **Expose and register the HTTP endpoints**
   - Provide a handler for retrieving message history and a handler for sending a message, each taking the owning user from the authenticated request context rather than the body or query, validating input, and shaping output to the contract DTOs via presenters.
   - Wire each handler to its use-case and the in-memory message persistence, mirroring how the existing auth route assembles its dependencies.
   - Protect both endpoints with the existing authentication so the user identity is established before the handlers run.
   - Register the history and send endpoints on the main application router following the existing auth route mounting pattern.
