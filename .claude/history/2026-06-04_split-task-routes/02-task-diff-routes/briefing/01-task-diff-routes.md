**Plan**

1. **Establish the new task routes subfolder**
   - Create a dedicated location for task route handlers, with one handler per file
   - Keep the structure consistent with the existing per-handler route convention

2. **Create the approve task diff route**
   - Wire up the approve-task-diff behavior as a self-contained handler
   - Include its own request parameter validation and shared dependencies
   - Preserve the existing approve behavior and response exactly

3. **Create the reject task diff route**
   - Wire up the reject-task-diff behavior as a self-contained handler
   - Include its own request parameter validation and shared dependencies
   - Preserve the existing reject behavior and response exactly

4. **Keep changes isolated to the owned files**
   - Avoid touching application wiring or the original combined route source
   - Avoid altering any files owned by parallel plans
