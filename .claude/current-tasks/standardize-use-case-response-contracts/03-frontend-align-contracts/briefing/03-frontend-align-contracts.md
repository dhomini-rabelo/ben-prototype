# Plan 2 [Frontend]: Align project-web API contracts, client functions, and hooks to the new response shapes

1. **Establish canonical response contract types**
   - Define a single-item response shape and a plain listing response shape that match the backend naming convention
   - Align the cursor-paginated response shape with the new contract
   - Retire or rename the legacy contract names so the frontend has one consistent vocabulary

2. **Update the task API client functions to the new shapes**
   - Make the detail, diff approve/reject, content update, todos update, finish, and reopen calls consume the new wrapped single-item response while still returning a plain task to their callers
   - Make the message-create call consume the new wrapped response plus its extra reply field and surface it in the shape callers already expect

3. **Align direct hook and component consumers**
   - Update the cursor-pagination hook to expect the new paginated response shape
   - Update the task workspace data fetch to read the task from the new wrapped response while still exposing a plain task
   - Update the active task picker to expect the new listing response shape

4. **Sweep for and fix remaining breakages**
   - Search the frontend for any other consumers affected by the renamed contract types
   - Adjust them so behavior and call-site expectations stay unchanged

5. **Validate the alignment without altering scope**
   - Confirm unchanged endpoints keep their existing custom shapes
   - Ensure no backend files are touched and that call sites continue to receive the same data they did before
