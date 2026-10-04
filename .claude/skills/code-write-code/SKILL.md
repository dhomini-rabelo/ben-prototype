---
name: code-write-code
description: Apply general coding practices and project code conventions during both planning and implementation of features, bug fixes, and refactors. Use to guide naming, code organization within files, contracts, and implementation choices before and while writing code.
---

# Writing Code Skill

## When to use

Use these practices during planning to account for code conventions, contracts, and implementation constraints, and during implementation to write code that follows them. Loading this skill while planning does not authorize code changes.

For file and folder layouts, layer boundaries, and module composition, consult [code-get-coding-designs](../code-get-coding-designs/SKILL.md). This skill covers general coding advice and conventions for the code within those structures.

## General rules

1. Write code in English.
2. Write self-explanatory code instead of adding comments.
3. Follow the applicable coding patterns and the project's established conventions.

Read [General coding practices](./general-coding-practices.md) during planning and implementation. Open only the additional pattern files relevant to the task. Check the package manifests (`package.json` of the owning package and of the root) and existing usage before choosing libraries; do not add dependencies just to reproduce an example.

Imports between workspaces use the package names (`@ben/domain-base`, `@ben/adapters`, `@ben/domain-user/application/...`). There is no `@/` alias in the backend packages; in `packages/infra/mobile/ben` and `packages/infra/mobile/design`, `@/` points to the app's own `src/`. Repository contracts belong inside domain modules; `packages/adapters` contains external-service contracts. Run scripts with `pnpm` from the repository root.

### Coding Patterns

Keep cross-cutting patterns at the `coding-patterns/` root. Use `frontend/` for React and client-side conventions, `backend/` for server and domain conventions, and `mobile/` for React Native and mobile-specific conventions. Mobile work uses the shared frontend patterns too.

#### General Patterns

##### Automated Testing

- When to Use: When creating or changing application behavior, including every use case and its tests.
- Coding pattern: [Automated testing](./coding-patterns/automated-testing.md)

##### General Code Preferences

- When to Use: Whenever you write or refactor code in any package and want the cross-cutting preferences captured from review corrections (propagating changes across layers, contract sync, imports, file splitting).
- Coding pattern: [General code preferences](./coding-patterns/general-code-preferences.md)

##### Lint

- When to Use: Whenever you write code that must pass ESLint (`pnpm lint`) — no comments, no abbreviated names, unused values, and the abbreviation denylist.
- Coding pattern: [Lint](./coding-patterns/lint.md)

#### Frontend Patterns

##### Front-end Code Preferences

- When to Use: Whenever you write or refactor `packages/infra/mobile/ben` code and want the preferences captured from review corrections (file naming, component/store organization, api-client naming, state, props).
- Coding pattern: [Front-end code preferences](./coding-patterns/frontend/frontend-code-preferences.md)

##### React Component Patterns

- When to Use: Whenever you need to create or update reusable React components (UI or Common), including dialog flows and object-state based components.
- Coding pattern: [React component patterns](./coding-patterns/frontend/react-components.md)

##### React Single Responsibility

- When to Use: Whenever a store, hook, or component takes on more than one responsibility and should be split and composed.
- Coding pattern: [React single responsibility](./coding-patterns/frontend/react-single-responsibility.md)

##### Minimum Props Strategies

- When to Use: Whenever you need to create many components that may require sharing many states or actions.
- Coding pattern: [Minimum props strategies](./coding-patterns/frontend/minimum-props-strategies.md)

##### API Data Hooks

- When to Use: Whenever you consume the backend API in `packages/infra/mobile/ben` — the `{ state, actions }` return shape of the generic hooks, the thin per-domain `use{Domain}{Action}Data` wrappers, and the `enabled` gate.
- Coding pattern: [API data hooks](./coding-patterns/frontend/api-data-hooks.md)

##### Component Variant Maps

- When to Use: Whenever a `packages/infra/mobile/ben` component resolves a variant prop to classes or sub-components — a module-level `Record<Variant, ...>` map merged with `cn()`.
- Coding pattern: [Component variant maps](./coding-patterns/frontend/component-variant-maps.md)

#### Mobile Patterns

##### Mobile Icon Colors

- When to Use: Whenever you render an icon (`lucide-react-native` / `react-native-svg`) in `packages/infra/mobile/ben` — NativeWind `text-*`/`size-*` classNames do not propagate to icons, so pass explicit `color`/`size` props sourced from the shared `@/layout/utils/colors` theme-hex module.
- Coding pattern: [Mobile icon colors](./coding-patterns/mobile/mobile-icon-colors.md)

##### Keyboard-Aware Absolute Footer

- When to Use: Whenever you have an absolutely-positioned input footer in `packages/infra/mobile/ben` that must lift above the keyboard — track keyboard height with a `Keyboard` hook instead of `KeyboardAvoidingView`, subtract the safe-area bottom inset, and apply the offset to both the footer and the scroll content inset.
- Coding pattern: [Keyboard-aware absolute footer](./coding-patterns/mobile/keyboard-aware-absolute-footer.md)

##### Mobile Bottom Sheet Overlay

- When to Use: Whenever you build a slide-up bottom sheet in `packages/infra/mobile/ben` — a single reusable transparent `Modal` + Reanimated `withTiming` overlay with a dimmed `bg-inverse-surface/30` scrim and tap-to-dismiss, rather than duplicated inline absolute blocks.
- Coding pattern: [Mobile bottom sheet overlay](./coding-patterns/mobile/mobile-bottom-sheet-overlay.md)

#### Backend Patterns

##### Back-end Code Preferences

- When to Use: Whenever you write or refactor `the backend packages` code and want the preferences captured from review corrections (domain folder boundaries, use-case responsibility, ownership queries, contracts, presenter typing).
- Coding pattern: [Back-end code preferences](./coding-patterns/backend/backend-code-preferences.md)

##### Use Case Structure

- When to Use: Whenever you create or refactor a use case class and want `execute` to read as a clear summary of smaller, well-named private steps (guards, branch resolvers, build/apply methods).
- Coding pattern: [Use case structure](./coding-patterns/backend/use-case-structure.md)

##### Use Case Response Structure

- When to Use: Whenever you type the `Response` of a use case. Use the shared types instead of inline shapes: `ItemResponse<T>` (`{ item }`) and `ListingResponse<T>` (`{ items }`) from `@ben/domain-base`, and `CursorPaginationResponse<T>` (`{ items, hasMore, nextCursor }`) and `PaginationResponse<T>` (`{ items, totalItems, page }`) from `@ben/domain-base`.
- Coding pattern: [Use case response structure](./coding-patterns/backend/use-case-response-structure.md)

##### Domain Entity Declaration

- When to Use: Whenever you add or refactor a domain entity in `the backend packages` — extending `Entity`/`AggregateRoot<Props>`, typing the `{Entity}Props`, and exposing the `create`/`reference` static factories with `ID`-typed fields.
- Coding pattern: [Domain entity declaration](./coding-patterns/backend/domain-entity-declaration.md)

##### HTTP Route Handler

- When to Use: Whenever you write or refactor a route handler file under `packages/infra/server-ben/src/routes/` — module-level schemas and use-case instantiation, and a thin parse → execute → present flow with `next(err)`.
- Coding pattern: [HTTP route handler](./coding-patterns/backend/http-route-handler.md)

##### HTTP Presenter

- When to Use: Whenever you map a domain entity to an HTTP response — a stateless presenter class with static `toHttp`/`toListItemHttp` methods typed from the entity props via `Serialize`/`WithID`.
- Coding pattern: [HTTP presenter](./coding-patterns/backend/http-presenter.md)
