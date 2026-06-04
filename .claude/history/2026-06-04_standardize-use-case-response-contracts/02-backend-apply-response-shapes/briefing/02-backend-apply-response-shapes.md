# Plan 2 [Backend]: Apply standardized response shapes across backend use cases and HTTP layer

1. **Adopt the shared response contracts**
   - Reuse the standardized single-item, listing, and cursor-pagination response shapes defined by the prior foundation work
   - Confirm these shared shapes are the single source of truth for the conversions in this plan

2. **Standardize single-item task responses**
   - Convert each task action that returns one task so it returns a consistent single-item shape
   - Preserve any extra accompanying data on actions that return more than the task alone, while keeping the same item wrapping

3. **Standardize task listing responses**
   - Convert the task listing behavior to return the consistent collection shape
   - Ensure listed items are represented in their list-appropriate form

4. **Align the message listing response type**
   - Re-type the message listing behavior to the standardized cursor-pagination contract without changing its existing output shape

5. **Update the HTTP serialization layer**
   - Wrap task detail and task mutation outputs in the standardized single-item envelope when sent over HTTP
   - Emit the extra accompanying data alongside the item for the action that returns it
   - Serialize the task collection using the standardized collection envelope
   - Verify the message listing endpoint still produces its expected paginated output

6. **Keep the backend consistent and compiling**
   - Find and update every internal caller affected by the response changes so the backend builds cleanly
   - Confirm no out-of-scope behaviors, frontend files, or foundation contracts are modified
