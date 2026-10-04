---
name: code-get-coding-designs
description: Consult project structures and architectural conventions for organizing files, folders, layers, and modules. Use primarily during planning of features or refactors, and during implementation when a structural decision needs clarification.
---

# Coding Designs

Coding designs describe project structure: file organization, module composition, and boundaries between layers. Use the relevant designs when planning where code belongs and how its parts fit together. Revisit them during implementation when the structure changes or needs clarification.

Read only the design files relevant to the task. For code-level practices and conventions that also inform planning, consult [code-write-code](../code-write-code/SKILL.md). For what each app does and where its code lives, consult [code-get-project-context](../code-get-project-context/SKILL.md).

Start with [Monorepo structure](./designs/monorepo-structure.md): domain modules live under `packages/domain/`, external-service ports in `packages/adapters`, and implementation packages and apps under `packages/infra/` (the Expo app and the design sandbox under `packages/infra/mobile/`). Apply it together with the smaller designs for each package's internal organization. In an existing project, verify the adopted architecture before changing it; reading this skill does not authorize a migration.

## Designs

- **Monorepo Structure**:
  - Purpose: Define domain modules, adapter contracts, infrastructure workspaces, and the placement of the mobile apps, and how the packages depend on each other.
  - When to Use: When locating new features or changing package boundaries.
  - Coding structures: [Monorepo structure](./designs/monorepo-structure.md)

- **Mobile App Structure**:
  - Purpose: Define how a mobile app's `src/` is organized (`packages/infra/mobile/design` in full, shared layers of `packages/infra/mobile/ben`) — flat `core/` and `utils/` files, `layout/components/{ui,common,{group}}`, pages with named exports loaded through `lazy`, Tailwind tokens, and renaming rules.
  - When to Use: When adding files to `core/`, `layout/` or `pages/`, creating a page or shell, or renaming identifiers and route params.
  - Coding structures: [Mobile app structure](./designs/mobile-app-structure.md)

- **Page Structure Patterns**:
  - Purpose: Define the page-level file organization and composition pattern for frontend pages, including `page.tsx`, scoped components, hooks, and states, in `packages/infra/mobile/ben`.
  - When to Use: When creating or refactoring frontend pages to keep folder hierarchy and component boundaries consistent.
  - Coding structures: [Page structure](./designs/page-structure.md)

- **Backend Domain Structure**:
  - Purpose: Define how each `packages/domain/<module>` is organized — entities, repository ports, use cases, and the shared util and validation functions.
  - When to Use: When creating or refactoring domain code (adding a use case, or a helper shared across many use cases).
  - Coding structures: [Backend domain structure](./designs/backend-domain-structure.md)

- **Domain Ownership**:
  - Purpose: Define the owner/consumer relationship between domain modules — identity plus the owner's public contract, never shared entity classes or copied owner data. The map lives in `packages/domain/ownerships.md`.
  - When to Use: When one domain module needs a concept owned by another, or when deciding whether a type belongs in `packages/domain/base`.
  - Coding structures: [Domain ownership](./designs/domain-ownership.md)

- **Service Structure**:
  - Purpose: Define how a large infrastructure service file is split into a folder — `index.ts` holds the service class and shared setup, one subfolder per operation groups that operation's schemas, prompts, and tools, and shared helpers live at the folder root.
  - When to Use: When a service file in `packages/infra/adapters/src/services/` grows large and bundles a class together with its schemas, prompt builders, tools, or client setup, and you want to break it into a folder without changing its import path.
  - Coding structures: [Service structure](./designs/service-structure.md)

- **Backend Adapters and Services Structure**:
  - Purpose: Define how ports are separated from implementations — provider ports live in `packages/adapters`, repository ports inside their domain module, and concrete implementations in `packages/infra/adapters` and `packages/infra/db`.
  - When to Use: When adding or refactoring an external integration (auth, transcription, agent, jwt) or a repository, so the domain depends on the port and the implementation can be swapped.
  - Coding structures: [Backend adapters and services structure](./designs/backend-adapters-and-services-structure.md)

- **Backend HTTP Layer Structure**:
  - Purpose: Define how `packages/infra/server-ben/src/` is organized — one route handler per file under `routes/{feature}/`, centralized repository instances in `repositories.ts`, one presenter per entity, and route registration plus the error handler in `app.ts`.
  - When to Use: When adding or refactoring an HTTP endpoint, presenter, or route registration.
  - Coding structures: [Backend http layer structure](./designs/backend-http-layer-structure.md)

- **API Client Structure**:
  - Purpose: Define how `packages/infra/mobile/ben`'s `src/api/` layer is organized — axios clients and interceptors in `client.ts`, the `API_ROUTES` map, per-feature `request{Action}` functions, entity `models/` vs list-item `responses/`, and envelope `types.ts`.
  - When to Use: When adding or refactoring a backend API call, route, request function, or response/model contract in the mobile app.
  - Coding structures: [Api client structure](./designs/api-client-structure.md)

- **Page Stores Structure**:
  - Purpose: Define how a mobile app page organizes its Zustand state — one store per concern, a root store that coordinates `reset()`, and splitting a large store into a folder.
  - When to Use: When a page needs more than a single store, or when a store grows enough to split its async logic and builders into a folder.
  - Coding structures: [Page stores structure](./designs/page-stores-structure.md)

- **Feature State Components Structure**:
  - Purpose: Define how a data-fetching feature splits into a container view, per-state status components (loading/error/empty/gone), and a presentational component, with a fixed render order.
  - When to Use: When building or refactoring a feature that fetches data and must render loading, error, empty, and loaded states consistently.
  - Coding structures: [Feature state components structure](./designs/feature-state-components-structure.md)

- **Mobile Services Layer Structure**:
  - Purpose: Define how `packages/infra/mobile/ben` isolates native SDK integrations behind `src/services/` — one `{capability}-service.ts` module is the sole importer of a native SDK and exposes intent-named functions that screens, stores, and bootstrap call.
  - When to Use: When adding or refactoring a native platform integration (notifications, location, camera, …), so the SDK stays behind a single swappable boundary.
  - Coding structures: [Mobile services layer structure](./designs/mobile-services-layer-structure.md)

- **Mobile Token Persistence Structure**:
  - Purpose: Define how `packages/infra/mobile/ben` splits auth persistence in `src/storage/` — SecureStore holds the JWT + provider token with an in-memory synchronous cache so the sync axios interceptor can read a token, while AsyncStorage holds the user profile.
  - When to Use: When adding or refactoring token/auth persistence, or whenever a synchronous caller needs a value from an async-only native store.
  - Coding structures: [Mobile token persistence structure](./designs/mobile-token-persistence-structure.md)
