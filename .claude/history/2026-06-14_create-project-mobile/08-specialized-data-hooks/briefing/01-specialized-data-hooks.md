# Plan 08 — Specialized data hooks (`src/layout/hooks/api/`)

## Context

Port the entity-specific React Query data hooks from `project-web` into `project-mobile`. Each one is a thin wrapper over a generic hook (item request, listing request, or cursor pagination) bound to a specific entity and route. They are platform-agnostic and port intact — only the source location changes; the `@/` import paths resolve identically once the mobile path alias is configured. Depends on the generic hooks (plan 06) and the API requests/responses/routes (plan 04).

## Plan

1. **Port the chat message list hook**
   - Expose the cursor-paginated message feed used by the chat history
   - Bind it to the messages listing endpoint and the message entity shape

2. **Port the task data hooks**
   - Expose a task list hook that accepts an optional status filter and passes it through as a query parameter
   - Expose a task detail hook keyed by task id
   - Keep both bound to their respective task list and task detail endpoints and the task entity shapes

3. **Port the note data hooks**
   - Expose a note list hook returning the note listing shape
   - Expose a note detail hook keyed by note id
   - Bind both to their note listing and note detail endpoints

4. **Port the reminder data hooks**
   - Expose a reminder list hook returning the reminder listing shape
   - Expose a reminder detail hook keyed by reminder id
   - Bind both to their reminder listing and reminder detail endpoints

5. **Port the captures counts hook**
   - Expose the captures-counts hook returning the single counts item
   - Bind it to the captures counts endpoint

6. **Verify the ports compile**
   - Confirm every specialized hook resolves its generic hook, entity types, and route correctly
   - Ensure the type-check passes with no errors
