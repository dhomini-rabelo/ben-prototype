---
name: task-migrate-project
description: Migrate an existing application's structure to project-factory conventions through incremental changes that preserve behavior, contracts, and data. Use when the user asks to reorganize an existing project or adopt the factory architecture, rather than bootstrap a new application.
---

# Migrate a Project

Migrate the destination repository to the agreed factory architecture while preserving its implemented behavior. Work in the existing project; do not regenerate it from a starter or migrate project-factory itself when the request is to maintain this skill.

Adopting the factory's skills alone does not require moving application code. If the request is only to install or adapt those instructions, keep the work within that scope. For a new application, use [task-init-project](../task-init-project/SKILL.md).

## Establish the current state and scope

Read the repository's instructions, [project context](../code-get-project-context/SKILL.md), and [memory index](../../memory/README.md). Verify relevant context against the current files. Empty or outdated context is not a blocker: inspect the implementation directly without populating context documentation as a side effect.

Inspect the working tree and preserve existing user changes. Identify actual apps, shared packages, entrypoints, runtime responsibilities, manifests, dependency directions, and development and deployment commands. Do not assume the current project is a monorepo or already follows factory conventions.

Trace the flows affected by the migration, including their API or event contracts, persistence ownership, integrations, and web or mobile consumers. Distinguish verified behavior and existing defects from intended future behavior. Preserve existing behavior unless the user also requested a specific correction; a structural migration is not an opportunity to redesign business rules.

Resolve missing choices that materially affect the result: destination repository, apps or modules in scope, any requested departures from the factory architecture, and whether the user wants a plan or implementation. Reuse decisions and authorization already provided. A request to execute the migration authorizes the necessary local changes; do not require approval again at every stage. A planning-only request ends with the concrete migration plan.

Keep the current stack, package manager, framework versions, database schema, and external contracts unless a change is necessary for the agreed migration or explicitly requested. Explain any necessary change beyond file and package organization before performing dependent work, resolving material ambiguity with the user.

## Map the destination and migration stages

Read [coding designs](../code-get-coding-designs/SKILL.md), the [monorepo structure](../code-get-coding-designs/designs/monorepo-structure.md), and [coding practices](../code-write-code/SKILL.md). Load other design and coding references only for the affected platforms.

Use the factory's default workspace boundaries, adapted to responsibilities that actually exist:

- `packages/domain/<module>` owns entities, repository ports, use cases, and business validation. Keep entity-specific repository ports with their domain module. Shared primitives belong in `packages/domain/base`; copy [examples/domain-base](../../../examples/domain-base/) (SQL-like default; NoSQL-like is a separate type under `./nosql`, not a second implementation of the same `InMemoryRepository`).
- `packages/adapters` owns external-service contracts and must not import feature-domain modules. Concrete service and repository implementations belong under `packages/infra/<implementation>`.
- Web and mobile apps live under infrastructure with their own UI conventions. Preserve framework-required route and native project layouts; do not impose backend layers on UI code or let clients import server implementations.
- Create shared packages only for a defined shared responsibility. Check indirect imports and public entrypoints as well as direct dependencies to keep the workspace graph acyclic.

Present a concrete mapping from current paths and responsibilities to destination workspaces, with the resulting directory tree and dependency directions. Include the affected entrypoints, contracts to preserve, commands that need adjustment, and any unresolved constraints. A frontend-only or mobile-only migration must not manufacture backend packages.

Break the work into stages that can each be checked in a runnable state. Choose the order from the actual dependency graph; a small project may need only one stage. For each stage identify the source scope, destination, compatibility measures if needed, verification commands, and completion condition. Temporary forwarding exports or adapters must have a clear removal condition and must not create a second independent implementation.

Keep the proposed architecture and progress outside implemented-context documents. Use the response or a task plan appropriate to the repository; reserve the project's architectural guidance for the agreed target and dependency rules.

## Establish behavioral verification

Read [automated testing](../code-write-code/coding-patterns/automated-testing.md). Run the relevant existing checks before moving code to establish a baseline. Record pre-existing failures and unavailable environments so they can be distinguished from migration regressions.

Preserve existing tests and adapt their locations and imports with their owning code. Each use case in the migrated scope must have behavior tests; when coverage is missing, add characterization tests for its observable contracts before changing its boundaries. Cover affected real integrations and main E2E journeys for the selected platforms. Do not expand a scoped migration into test remediation for unrelated modules.

Use existing tools when suitable. If required test tooling is missing, establish the tools, commands, and environment needed for the affected scope. Unit tests or mocked boundaries do not establish that real persistence, integration, or platform behavior survived the move.

## Execute and verify each stage

Move and adapt the owning code, its tests, and its configuration together. Establish real workspace manifests, dependencies, and public exports; directory moves and TypeScript aliases alone do not establish package boundaries. Keep app-local aliases local and replace imports into sibling package internals with intentional public entrypoints.

Trace configuration that depends on paths: workspace globs, compiler and bundler resolution, test discovery, code generation and ORM schema locations, assets, environment loading, native build configuration, containers, and existing CI or deployment definitions. Update only what the selected apps and stage require. Preserve environment variable names and externally visible entrypoints unless their change is in scope.

Keep persisted data and migration history intact when relocating persistence code. Moving schema files does not authorize resetting a database or rewriting applied migrations. Preparing deployment configuration is part of making the repository runnable; publishing or applying changes to a live environment requires its own authorization.

After each stage, run the affected workspace resolution checks, type checks, lint, builds, and behavioral suites. Investigate new failures before stacking dependent stages on top. If a required environment is unavailable, continue independent work and report the unverified boundary; do not claim that stage is verified or remove a compatibility path whose removal depends on that check.

Remove obsolete paths and temporary compatibility code once their consumers have moved and the relevant checks pass. Check for remaining imports, scripts, generated-file inputs, and documentation references to old locations. Preserve unrelated user changes; do not use a repository-wide reset as a migration rollback.

For an implementation request, continue through all agreed stages unless a concrete blocker prevents dependent work. Do not deliver only the first stage or a plan when the complete migration was authorized.

## Reconcile guidance and deliver

Adapt the copied factory skills by content to the actual platforms and destination paths, preserving applicable shared React conventions for mobile. Reconcile existing repository instructions instead of overwriting project-specific rules. Update the destination README with installation, startup, build, and test commands, and record the agreed workspace responsibilities and dependency rules in its architectural guidance.

Do not populate or refresh [project context](../code-get-project-context/SKILL.md), or advance its review state, automatically. [task-update-project-context](../task-update-project-context/SKILL.md) remains an explicitly invoked workflow. If the user also invoked it, run it against the resulting implementation after the migration work, describing the actual state rather than the proposed target.

Verify the completed migration across affected apps, including integration and E2E boundaries where available, and check local documentation links. Reuse successful stage checks when they still cover the final state; rerun checks when subsequent changes invalidate them. Do not add CI, architecture enforcement, framework upgrades, or product features unless they are part of the agreed scope.

Report the resulting structure, preserved contracts, checks run, pre-existing failures, and any remaining blockers or temporary compatibility paths. Distinguish implemented changes from verified behavior, and do not describe the migration as complete while agreed structural work remains.
