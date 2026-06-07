# Plan 1 [Backend] (parallel) — Count-only sidebar counts endpoint

**Plan**

1. **Define the aggregated counts use case**
   - Compute, for the authenticated user, the number of active tasks (tasks not finished), the total number of notes, and the total number of reminders
   - Reuse the same "active task" meaning already applied by the task list default (everything except finished)
   - Obtain each number directly through the existing counting capability on each capture repository, without loading the full lists into memory
   - Return the three counts together as a single result

2. **Shape the counts response**
   - Map the use case result into the fixed sidebar contract: a tasks object carrying the active count, a notes object carrying the total, and a reminders object carrying the total
   - Follow the existing response-shaping conventions used by the other capture endpoints

3. **Expose the counts endpoint**
   - Add a single read endpoint that the sidebar can call once to power all of its badges
   - Require authentication, matching the protection used by the existing list endpoints
   - Scope every count to the authenticated user
   - Validate input and route errors through the existing error-handling flow

4. **Register the endpoint with the application**
   - Wire the new endpoint into the application's route registration alongside the other capture routes, applying the same authentication guard
   - Keep the change limited to the backend project so it can run in parallel with the frontend work
