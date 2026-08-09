---
name: code-write-code
description: Use this skill whenever you need to write code to implement a feature, fix a bug, or make any changes to the codebase. Follow best practices for writing clean, efficient, and maintainable code.
---

# Writing Code Skill

## Overview

This skill guides code changes toward maintainable, consistent, and project-aligned implementations. It emphasizes clear structure, readable naming, and respect for the codebase's existing patterns while keeping changes focused on the user's request.

### Goal

Assist users by generating high-quality, efficient, and maintainable code based on their requests. You should adhere to best practices in coding, including proper naming conventions, modular design, and clear structure.

You are an eager team member, so you respect the current code style and conventions of the project you are contributing to, always prioritize aligning with the established style.

### General Rules

1. Always write english code.
2. Never comment the code, write self-explanatory code instead.
3. You must keep the coding patterns

### General coding practices

When writing code, it's important to follow default practices to ensure that your code is clean, efficient, and maintainable.

Use the tool `read/readFile` to read `${PROJECT_ROOT}/.github/skills/writing-code/general-coding-practices.md`.

### Most Used Libraries

When writing code, you may want to utilize commonly used libraries that can help you implement features more efficiently and consistently with the rest of the codebase.

Use the skill `most-used-libraries` to find out which libraries are commonly used in the project for frontend and backend development.

### Coding Patterns

When writing code, it's important to follow established coding patterns to ensure that your code is consistent with the rest of the codebase and is easy to understand and maintain. Patterns are split by project: **Frontend Patterns** for `project-web` and **Backend Patterns** for `project-backend`.

#### General Patterns

##### General Code Preferences

- When to Use: Whenever you write or refactor code in either project and want the cross-cutting preferences captured from review corrections (propagating changes across layers, contract sync, imports, file splitting).
- Coding pattern: [General code preferences](./coding-patterns/general-code-preferences.md)

#### Frontend Patterns

##### Front-end Code Preferences

- When to Use: Whenever you write or refactor `project-web` code and want the preferences captured from review corrections (file naming, component/store organization, api-client naming, state, props).
- Coding pattern: [Front-end code preferences](./coding-patterns/frontend-code-preferences.md)

##### React Component Patterns

- When to Use: Whenever you need to create or update reusable React components (UI or Common), including dialog flows and object-state based components.
- Coding pattern: [React component patterns](./coding-patterns/react-components.md)

##### React Single Responsibility

- When to Use: Whenever a store, hook, or component takes on more than one responsibility and should be split and composed.
- Coding pattern: [React single responsibility](./coding-patterns/react-single-responsibility.md)

##### Minimum Props Strategies

- When to Use: Whenever you need to create many components that may require sharing many states or actions.
- Coding pattern: [Minimum props strategies](./coding-patterns/minimum-props-strategies.md)

##### API Data Hooks

- When to Use: Whenever you consume the backend API in `project-web` — the `{ state, actions }` return shape of the generic hooks, the thin per-domain `use{Domain}{Action}Data` wrappers, and the `enabled` gate.
- Coding pattern: [API data hooks](./coding-patterns/api-data-hooks.md)

##### Component Variant Maps

- When to Use: Whenever a `project-web` component resolves a variant prop to classes or sub-components — a module-level `Record<Variant, ...>` map merged with `cn()`.
- Coding pattern: [Component variant maps](./coding-patterns/component-variant-maps.md)

##### Mobile Icon Colors

- When to Use: Whenever you render an icon (`lucide-react-native` / `react-native-svg`) in `project-mobile` — NativeWind `text-*`/`size-*` classNames do not propagate to icons, so pass explicit `color`/`size` props sourced from the shared `@/layout/utils/colors` theme-hex module.
- Coding pattern: [Mobile icon colors](./coding-patterns/mobile-icon-colors.md)

##### Keyboard-Aware Absolute Footer

- When to Use: Whenever you have an absolutely-positioned input footer in `project-mobile` that must lift above the keyboard — track keyboard height with a `Keyboard` hook instead of `KeyboardAvoidingView`, subtract the safe-area bottom inset, and apply the offset to both the footer and the scroll content inset.
- Coding pattern: [Keyboard-aware absolute footer](./coding-patterns/keyboard-aware-absolute-footer.md)

##### Mobile Bottom Sheet Overlay

- When to Use: Whenever you build a slide-up bottom sheet in `project-mobile` — a single reusable transparent `Modal` + Reanimated `withTiming` overlay with a dimmed `bg-inverse-surface/30` scrim and tap-to-dismiss, rather than duplicated inline absolute blocks.
- Coding pattern: [Mobile bottom sheet overlay](./coding-patterns/mobile-bottom-sheet-overlay.md)

#### Backend Patterns

##### Back-end Code Preferences

- When to Use: Whenever you write or refactor `project-backend` code and want the preferences captured from review corrections (domain folder boundaries, use-case responsibility, ownership queries, contracts, presenter typing).
- Coding pattern: [Back-end code preferences](./coding-patterns/backend-code-preferences.md)

##### Use Case Structure

- When to Use: Whenever you create or refactor a use case class and want `execute` to read as a clear summary of smaller, well-named private steps (guards, branch resolvers, build/apply methods).
- Coding pattern: [Use case structure](./coding-patterns/use-case-structure.md)

##### Use Case Response Structure

- When to Use: Whenever you type the `Response` of a use case. Use the shared types instead of inline shapes: `ItemResponse<T>` (`{ item }`) and `ListingResponse<T>` (`{ items }`) from `@/modules/domain/responses`, and `CursorPaginationResponse<T>` (`{ items, hasMore, nextCursor }`) and `PaginationResponse<T>` (`{ items, totalItems, page }`) from `@/modules/domain/repository/repository`.
- Coding pattern: [Use case response structure](./coding-patterns/use-case-response-structure.md)

##### Domain Entity Declaration

- When to Use: Whenever you add or refactor a domain entity in `project-backend` — extending `Entity`/`AggregateRoot<Props>`, typing the `{Entity}Props`, and exposing the `create`/`reference` static factories with `ID`-typed fields.
- Coding pattern: [Domain entity declaration](./coding-patterns/domain-entity-declaration.md)

##### HTTP Route Handler

- When to Use: Whenever you write or refactor a route handler file under `src/infra/http/routes/` — module-level schemas and use-case instantiation, and a thin parse → execute → present flow with `next(err)`.
- Coding pattern: [HTTP route handler](./coding-patterns/http-route-handler.md)

##### HTTP Presenter

- When to Use: Whenever you map a domain entity to an HTTP response — a stateless presenter class with static `toHttp`/`toListItemHttp` methods typed from the entity props via `Serialize`/`WithID`.
- Coding pattern: [HTTP presenter](./coding-patterns/http-presenter.md)
