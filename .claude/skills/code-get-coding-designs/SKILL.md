---
name: code-get-coding-designs
description: Use when you need to create/edit a feature that requires writing code in multiple files and you are not sure about the design or architecture of the code to write. This skill will help you get the necessary context about the design structure patterns to keep the code consistent with the existing codebase.
---

- **Page Structure Patterns**:
  - Purpose: Define the page-level file organization and composition pattern for frontend pages, including `page.tsx`, scoped components, hooks, and states.
  - When to Use: Use when creating or refactoring frontend pages to keep folder hierarchy and component boundaries consistent.
  - Coding structures: `${PROJECT_ROOT}/.claude/skills/get-coding-designs/designs/page-structure.md` (use the `read/readFile` tool to understand more of this structure if needed)

- **Backend Domain Structure**:
  - Purpose: Define how the `project-backend` domain layer is organized — where use-cases, shared util functions, and shared validation functions live.
  - When to Use: Use when creating or refactoring domain code in `project-backend` (adding a use-case, or a helper shared across many use-cases).
  - Coding structures: `${PROJECT_ROOT}/.claude/skills/code-get-coding-designs/designs/backend-domain-structure.md` (use the `read/readFile` tool to understand more of this structure if needed)

- **Service Structure**:
  - Purpose: Define how a large infrastructure service file is split into a folder — `index.ts` holds the service class and shared setup, one subfolder per operation groups that operation's schemas, prompts, and tools, and shared helpers live at the folder root.
  - When to Use: Use when an `src/infra/services/` service file grows large and bundles a class together with its schemas, prompt builders, tools, or client setup, and you want to break it into a folder without changing its import path.
  - Coding structures: `${PROJECT_ROOT}/.claude/skills/code-get-coding-designs/designs/service-structure.md` (use the `read/readFile` tool to understand more of this structure if needed)

- **Backend Adapters and Services Structure**:
  - Purpose: Define how `project-backend` separates ports from implementations — provider and repository ports live in `src/adapters/`, while their concrete implementations live in `src/infra/services/`.
  - When to Use: Use when adding or refactoring an external integration (auth, transcription, agent, jwt) or a repository, so the domain depends on the port and the implementation can be swapped.
  - Coding structures: `${PROJECT_ROOT}/.claude/skills/code-get-coding-designs/designs/backend-adapters-and-services-structure.md` (use the `read/readFile` tool to understand more of this structure if needed)

- **Backend HTTP Layer Structure**:
  - Purpose: Define how `src/infra/http/` is organized — one route handler per file under `routes/{feature}/`, centralized repository instances in `repositories.ts`, one presenter per entity, and route registration plus the error handler in `app.ts`.
  - When to Use: Use when adding or refactoring an HTTP endpoint, presenter, or route registration in `project-backend`.
  - Coding structures: `${PROJECT_ROOT}/.claude/skills/code-get-coding-designs/designs/backend-http-layer-structure.md` (use the `read/readFile` tool to understand more of this structure if needed)

- **Web API Client Structure**:
  - Purpose: Define how `project-web`'s `src/api/` layer is organized — axios clients and interceptors in `client.ts`, the `API_ROUTES` map, per-feature `request{Action}` functions, entity `models/` vs list-item `responses/`, and envelope `types.ts`.
  - When to Use: Use when adding or refactoring a backend API call, route, request function, or response/model contract in `project-web`.
  - Coding structures: `${PROJECT_ROOT}/.claude/skills/code-get-coding-designs/designs/web-api-client-structure.md` (use the `read/readFile` tool to understand more of this structure if needed)

- **Web Page Stores Structure**:
  - Purpose: Define how a `project-web` page organizes its Zustand state — one store per concern, a root store that coordinates `reset()`, and splitting a large store into a folder.
  - When to Use: Use when a page needs more than a single store, or when a store grows enough to split its async logic and builders into a folder.
  - Coding structures: `${PROJECT_ROOT}/.claude/skills/code-get-coding-designs/designs/web-page-stores-structure.md` (use the `read/readFile` tool to understand more of this structure if needed)

- **Web Feature State Components Structure**:
  - Purpose: Define how a data-fetching feature splits into a container view, per-state status components (loading/error/empty/gone), and a presentational component, with a fixed render order.
  - When to Use: Use when building or refactoring a feature that fetches data and must render loading, error, empty, and loaded states consistently.
  - Coding structures: `${PROJECT_ROOT}/.claude/skills/code-get-coding-designs/designs/web-feature-state-components-structure.md` (use the `read/readFile` tool to understand more of this structure if needed)
