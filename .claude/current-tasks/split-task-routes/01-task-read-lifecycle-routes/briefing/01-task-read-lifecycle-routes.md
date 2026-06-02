**Plan**

1. **Establish the dedicated route grouping**
   - Create a separate home for the read and lifecycle task routes, kept apart from the other route groupings
   - Mirror the existing organization used by the related task concepts

2. **Carve out the task listing route**
   - Give the listing behavior its own self-contained unit
   - Bring along the query filtering rules and the list response shaping it depends on
   - Preserve the current listing behavior exactly

3. **Carve out the single task detail route**
   - Give the detail-retrieval behavior its own self-contained unit
   - Bring along the identifier validation and the detail response shaping it depends on
   - Preserve the current detail behavior exactly

4. **Carve out the finish-task lifecycle route**
   - Give the task-finishing behavior its own self-contained unit
   - Bring along the identifier validation and response shaping it depends on
   - Preserve the current finishing behavior exactly

5. **Carve out the reopen-task lifecycle route**
   - Give the task-reopening behavior its own self-contained unit
   - Bring along the identifier validation and response shaping it depends on
   - Preserve the current reopening behavior exactly

6. **Keep each route fully independent**
   - Ensure every route unit carries its own validation and dependencies, accepting small duplication in line with the existing convention
   - Leave the application wiring and the original grouped source untouched, as those are handled elsewhere
