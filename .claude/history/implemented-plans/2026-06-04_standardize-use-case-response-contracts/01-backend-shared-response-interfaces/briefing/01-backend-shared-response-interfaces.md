# Plan: Define shared use-case response interfaces

1. **Establish the shared response contract location**
   - Provide a single, dedicated home where all standard use-case response shapes live
   - Ensure every backend use case can reach these shapes through one consistent entry point

2. **Define the single-object response shape**
   - Represent responses that return one entity, optionally alongside extra accompanying fields
   - Keep the entity type unconstrained so class-based entities remain valid

3. **Define the non-paginated listing response shape**
   - Represent responses that return a collection of entities without pagination
   - Keep the entity type unconstrained so class-based entities remain valid

4. **Expose the cursor pagination response shape**
   - Make the existing cursor pagination contract available from the same shared entry point
   - Reuse the current definition as-is rather than recreating or diverging from it

5. **Preserve existing behavior and boundaries**
   - Limit changes strictly to introducing the shared contract, leaving use cases, routes, presenters, and the repository untouched
   - Ensure the foundation is ready for dependent work to build upon
