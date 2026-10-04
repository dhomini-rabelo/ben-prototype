# Automated Testing

Apply this convention when initializing a project or creating or changing application behavior. Select tools for the destination stack during initialization; the required test responsibilities do not depend on a particular runner.

## Every use case has behavior tests

Create or update automated tests in the same change as each use case. Exercise the public `execute` method with controlled dependencies supplied through its constructor. Test successful behavior, applicable validation and authorization failures, meaningful branches, and observable side effects. For a rejected operation, assert that forbidden effects did not occur when that is part of its contract.

Place each use-case unit test under `application/use-cases/{feature}/__tests__/{use-case-name}.test.ts`, next to the use case file. Use `application/use-cases/__tests__/` only for integration suites that span features or for a use case that has no `{feature}` folder. Every class named `*UseCase` with a public `execute` method needs a behavior test in the same change.

Use deterministic in-memory repositories or fakes that implement the same ports as production. Keep in-memory repository doubles in `application/__tests__/repositories/` and adapter fakes in `packages/modules/tests`, outside production exports. Unit tests must not require a running database, HTTP server, or external provider. Control time and randomness when they affect assertions, and reset mutable state between tests.

Do not mock the use case being tested, assert private method calls, or reproduce its implementation in assertions. A trivial delegation still needs a test of its input/output or effect contract; its suite should remain proportionate to its behavior.

## Cover every success and error variation

The tests of each use case must enumerate every variation of its contract and cover each one with its own test, one test per branch. List the success variations (for example an invite already accepted versus creating a new member) and every error variation (each validation, each authorization rule, each not-found or conflict). A branch without a test is an unverified behavior.

```typescript
// Wrong way, one happy-path test for a use case with several branches
it('accepts the invite', async () => {})

// Correct way
describe('Accept{Invite}UseCase', () => {
  it('creates a new member when the invite is pending', async () => {})
  it('returns the existing member when the invite was already accepted', async () => {})
  it('rejects an expired invite', async () => {})
  it('rejects a user whose email differs from the invite', async () => {})
  it('rejects an unknown invite', async () => {})
})
```

## Integration tests validate real boundaries

Domain packages chain real use cases over shared in-memory repositories in `application/__tests__/integration/`; chain the use cases of a feature the way production composes them, with the same in-memory repositories and adapter fakes. Backend E2E suites drive the running API through a complete consumer workflow.

Test concrete repository implementations against the selected database engine in an isolated test environment, including relevant queries, serialization, constraints, and transaction behavior. In-memory repository tests do not verify the production repository.

Exercise HTTP routes with their real middleware, validation, use-case composition, and presenters where those boundaries apply. State which dependencies are real and which are substituted. Use controlled external-provider fixtures or test environments for integrations; never rely on production credentials or customer data.

Give each suite isolated data and an explicit setup and teardown procedure. Apply the schema or migrations required by the tested implementation. Never reset a database selected from an unchecked production environment configuration.

## E2E tests validate selected user journeys

Choose the main journeys from the product requirements during initialization and extend them as those journeys evolve. For backend-only projects, drive the running API through a complete consumer workflow. For web or mobile projects that include a backend, drive the UI through that backend and the test database and verify the user-visible result.

For standalone web or mobile projects whose backend is outside the repository, agree on an integration environment or a controlled API substitute. Describe the tested boundary accurately: an E2E test against a substitute does not prove integration with the real backend. Mobile device flows require the agreed device or emulator environment.

Wait on observable readiness and UI state instead of fixed sleeps. Isolate accounts and records between runs. Keep external paid or nondeterministic providers controlled while retaining the application boundaries the journey is meant to verify.

## Make execution and coverage explicit

During initialization, agree on test locations and separate commands for unit, integration, and E2E suites. Document each suite's prerequisites and how to start and clean up its environment. CI requirements and coverage thresholds are project decisions; do not invent them from a reference application's configuration.

When CI is selected, wire the agreed suites and their services into executable jobs. Do not silently skip required tests, allow failing checks to succeed, or use an empty suite as evidence that a behavior passed.

A test filename or a numerical coverage score alone does not establish behavioral coverage. Review assertions against the use-case contract and the selected journeys. Report the tests run and any unverified boundary when delivering a change.
