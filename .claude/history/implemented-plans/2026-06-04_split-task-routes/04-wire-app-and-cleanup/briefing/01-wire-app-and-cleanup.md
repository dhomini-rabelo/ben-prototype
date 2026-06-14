**Plan**

1. **Confirm the new per-route files exist**
   - Verify each task route handler now lives in its own dedicated location
   - Ensure every handler that the application currently relies on is accounted for before changing anything

2. **Rewire the application to the new route locations**
   - Point the application at each task handler in its new individual home instead of the single grouped source
   - Keep every task route registration, its path, and its access protection exactly as they are today

3. **Remove the obsolete grouped source**
   - Delete the old combined task routes source now that nothing references it
   - Confirm no remaining part of the application still points to the removed grouped source

4. **Validate the wiring is intact**
   - Check that the application still recognizes every task handler with no broken references
   - Confirm overall task routing behavior is unchanged from before the rewire
