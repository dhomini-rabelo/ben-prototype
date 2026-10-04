---
name: task-init-project
description: Initialize a new project from project-factory by aligning requirements, selecting the backend, web, and mobile conventions, and creating the agreed monorepo with automated tests. Use when the user asks to start or bootstrap a project from this base.
---

# Initialize a Project

This factory supplies instructions, not a prebuilt application. Build the destination repository from the agreed requirements. Do not initialize an application in project-factory itself when the request is to maintain the factory.

## Establish the starting point

Read [project context](../code-get-project-context/SKILL.md), the [memory index](../../memory/README.md), and the repository's instructions. Inspect the current files and manifests: empty context does not imply an empty repository. Preserve existing work; initializing a project does not authorize replacing an existing application or migrating its architecture.

When the user requests migration of an existing application's structure, use [task-migrate-project](../task-migrate-project/SKILL.md).

Use decisions already supplied in the conversation or destination repository. Ask about missing requirements that change the result, using a question tool when available. Continue independent work while awaiting answers, but do not treat unanswered questions as choices.

Align these decisions before generating dependent application files:

- Product purpose, users, and the first real flow to implement, if any.
- Destination repository and selected platforms: backend, web, mobile, or a combination; identify multiple apps of one type when relevant.
- Workspace names and responsibilities within the default [monorepo structure](../code-get-coding-designs/designs/monorepo-structure.md): `packages/domain/<module>`, `packages/adapters`, and `packages/infra/<implementation>`, with web and mobile inside infra. Reuse this default rather than reopening the layout choice unless the product requires a departure or the user requests one.
- Runtime, package manager, platform stack, persistence, and required external integrations. Architectural references do not prescribe a database, hosting provider, or authentication service.
- Test tools, environments, and execution: unit tests for every use case, integration boundaries, and E2E journeys for the selected platforms are required. Configure their tools and commands during initialization. CI and automated architecture checks are optional additions when requested, not requirements of this factory.

Present the concrete directory tree, package dependency directions, selected stack, initial flow, and test execution plan. Resolve material ambiguities before implementing them. When the user's instructions already establish these choices and authorize creation, proceed without requesting the same approval again.

## Apply the architecture and coding conventions

Read [coding designs](../code-get-coding-designs/SKILL.md), its [monorepo structure](../code-get-coding-designs/designs/monorepo-structure.md), and [coding practices](../code-write-code/SKILL.md), opening only the other references needed for the selected platforms.

- Use a monorepo with workspace packages that separate backend domain, adapter contracts, and infrastructure. Make each workspace's role and dependencies explicit in its manifest; a folder alone is not a workspace boundary.
- Preserve the agreed backend convention: repository ports live inside their domain module; `packages/adapters` contains external-service ports; infrastructure contains all production implementations. Use cases receive dependencies through constructors and expose `execute`; HTTP handlers parse, execute, and present. When the project needs `packages/domain/base`, copy [examples/domain-base](../../../examples/domain-base/) — default SQL-like `@domain/base` (`InMemoryRepository` + `JsonRepository`); NoSQL-like only if the product uses that contract, as the incompatible `@domain/base/nosql` sibling, never merged into one `InMemoryRepository`.
- Preserve the web conventions for pages, scoped components, hooks, states, stores, and the API client. Preserve the corresponding mobile conventions, with native SDK services and storage boundaries where needed. Do not force the backend's layer tree onto UI code.
- Translate reference paths to the agreed workspace layout. Names such as `project-backend`, `project-mobile`, and aliases such as `@/domain` describe source examples, not mandatory destination directories or existing helpers.
- Check the dependency graph before splitting packages. Repository contracts refer to entities within their own domain module; external-service contracts must not import feature-domain modules. Follow the monorepo design's dependency directions, including imports through shared packages, to avoid circular workspace dependencies. When the product has more than one feature domain, declare owner/consumer pairs in `packages/domain/ownerships.md` per [domain ownership](../code-get-coding-designs/designs/domain-ownership.md).

Use the reusable conventions shipped in the factory. The [monorepo design](../code-get-coding-designs/designs/monorepo-structure.md) links the Git repositories used as architectural references. Consult those repositories when useful and accessible; initialization must also work from the factory's self-contained conventions. Do not copy their business rules, application names, credentials, or deployment configuration into the new product.

## Create the agreed project

Create only the chosen apps, necessary shared packages, manifests, runtime configuration, and development commands. Resolve compatible tool versions for the chosen stack from its current official documentation. Define public package entrypoints and imports that respect the agreed dependency directions; do not bypass boundaries through relative imports into sibling package internals.

Configure automated tests using [automated testing](../code-write-code/coding-patterns/automated-testing.md). If a first product flow was requested, implement and test it across its applicable boundaries. If the request is only for an initial structure, do not invent product features to populate it or describe an empty test suite as verified behavior.

Adapt the copied skills by content to the chosen platforms: retain shared React conventions used by mobile, remove web-only guidance from mobile-only projects, and update skill indexes and links after selection. Update reference paths and available helpers to match the actual project. Keep reusable conventions separate from application context.

Document installation, configuration through an environment example without secrets, app startup, and test commands in the destination README. Record the agreed workspace tree and dependency rules in the destination's architectural guidance so subsequent feature work can find them through the coding-design index. Configure CI and automated architecture checks when they are part of the agreed scope.

Do not populate or refresh project context automatically. Its separate [update workflow](../task-update-project-context/SKILL.md) runs when explicitly invoked by the user; initialization does not change that existing convention.

## Verify the result

Run the relevant installation, type checks, lint, builds, and configured tests for the generated apps. Validate workspace resolution and local documentation links. If CI or architectural enforcement was requested, verify that the configured checks actually run and report failures.

Distinguish commands that passed from commands that could not run because of missing services, credentials, devices, or emulators. Report what was created, how to run it, and any remaining verification blockers. Do not claim integration or E2E coverage from unit tests or placeholder tests.
