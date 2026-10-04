# Monorepo Structure

Use this as the default architecture when starting a project from the factory. The reference repositories are:

| Repository | Architectural reference |
| --- | --- |
| [Cally](https://github.com/dhomini-rabelo/cally) | Backend coding conventions and web application organization. |
| [Ben Prototype](https://github.com/dhomini-rabelo/ben-prototype) | Backend coding conventions and mobile application organization. |
| [mdnotes](https://github.com/dhomini-rabelo/mdnotes) | Workspace separation, domain modules, repository contracts within their modules, and infrastructure packages. |

These repositories are architectural references, not application dependencies. The conventions below are self-contained; access to the reference repositories is not required to initialize a project. Do not copy their business features into a new product.

## Workspace layout

```text
packages/
├── domain/
│   ├── ownerships.md               # product owner/consumer map ([domain ownership](./domain-ownership.md))
│   ├── base/
│   │   ├── package.json
│   │   └── src/{entity,repository,errors,types,use-case}/
│   └── <module>/
│       ├── package.json
│       └── src/
│           ├── enterprise/entities/
│           └── application/
│               ├── repositories/
│               ├── use-cases/<feature>/
│               ├── use-cases/__tests__/
│               ├── utils/
│               ├── validation/
│               └── __tests__/repositories/
├── adapters/
│   ├── package.json
│   └── src/ports/
├── infra/
│   ├── <implementation>/
│   │   ├── package.json
│   │   ├── scripts/               # seeds, demo data and one-off tooling, never in src/
│   │   └── src/<nature>/          # grouped folders; only index.ts loose at the root
│   ├── websites/
│   │   └── <web-app>/
│   │       ├── package.json
│   │       └── src/
│   └── mobile/
│       └── <mobile-app>/
│           ├── package.json
│           ├── app/
│           └── src/
└── modules/
    └── <shared-capability>/
        ├── package.json
        └── src/
```

Name each app workspace after the app it hosts (for example `infra/server-{app}` and `infra/web-{app}` when one repository holds several products or runtimes), and keep seeds and demo data in the owning package's `scripts/`, never in `src/`. Only create selected apps and packages with an actual responsibility. A frontend-only or mobile-only project does not need empty backend packages. `domain/base` holds shared domain primitives when needed; `modules` is for genuinely shared capabilities, not a catch-all for business code. Domain module names come from the new product, not a predefined set such as auth, notes, or billing.

Feature domain modules follow [mdnotes](https://github.com/dhomini-rabelo/mdnotes)' `enterprise/` + `application/` split. `domain/base` stays flat primitives only.

The root workspace configuration must include the actual manifest locations, including the deeper web and mobile paths. With a glob-based workspace manager, the relevant patterns are `packages/domain/*`, `packages/adapters`, `packages/infra/*`, `packages/infra/websites/*`, `packages/infra/mobile/*`, and `packages/modules/*`. Include only patterns needed by the selected project; parent grouping folders are not packages merely because a glob matches them.

## Responsibilities and dependencies

- Domain modules own business entities (`enterprise/entities`), repository contracts (`application/repositories/{entity}.ts`), use cases, and reusable business validation. Domain modules do not import infrastructure, HTTP frameworks, database clients, or native SDKs. They do not host `services/` or `test-support/` folders.
- `packages/adapters` contains contracts for external capabilities, with their input and output types. It does not contain repository ports. `packages/modules/utils` holds helpers such as `getNow()`; `packages/modules/tests` holds adapter fakes. Concrete implementations belong in infrastructure.
- Infrastructure composes real dependencies and exposes entrypoints such as an HTTP API, workers, websites, or mobile apps. Select meaningful names for implementation packages, such as `http` or `adapters`, when those responsibilities exist.
- Shared packages have a defined dependency scope. For example, domain code must not import a shared environment helper that in turn imports infrastructure. Keep dependency directions acyclic, including imports that pass through shared helpers or package indexes.
- Web and mobile consume API contracts and their platform-safe shared libraries. They must not import backend implementations or bundle server use cases as a shortcut around an API call.

Declare workspace dependencies in each consuming package and expose intentional public entrypoints. Configure package names and exports for the chosen package manager and runtime during initialization. A TypeScript alias does not replace a workspace dependency. Keep `@/` aliases local to their app or package; do not use them to reach into a sibling package's source.

The intended backend dependency direction is:

```text
infra entrypoints → infra implementations → domain/<module> → domain/base
infra entrypoints ────────────────────────→ domain/<module>
infra implementations ───────────────────────────────────→ adapters
domain/<module> ─────────────────────────────────────────→ adapters
```

Here an arrow means “may import.” `domain/base` and `adapters` must not import feature modules or infrastructure. A feature module may import another feature module only as a **consumer** of that module's public contract, under [domain ownership](./domain-ownership.md): identity plus the owner's contract, never the entity class or a copy of the owner's object data. The owner does not import the consumer. Keeping entity-specific repository ports in their module avoids the `domain → adapters → domain` cycle that would result from moving the [Cally](https://github.com/dhomini-rabelo/cally) repository contracts unchanged into separate workspaces.

## Web and mobile organization

Each web app follows this source organization:

```text
src/
├── core/
├── api/
│   ├── models/
│   ├── requests/
│   └── responses/
├── pages/<page>/
│   ├── page.tsx
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── states/
│   ├── stores/
│   └── utils/
└── layout/
    ├── components/
    ├── hooks/
    ├── stores/
    └── utils/
```

Create page subfolders when their contents are needed. Mobile uses the same separation of page-scoped and shared UI concerns, adding `src/services` for native integrations and `src/storage` for persistence. With Expo Router, `app/` contains route entrypoints that compose pages from `src/pages`; adapt routing to the selected stack without duplicating page logic.

Backend `domain/adapters/infra` boundaries do not prescribe the internal folder structure of each UI app. Being under `packages/infra` also does not permit a UI app to import server infrastructure.

## Tests and continued development

Place each use case's unit tests in `application/use-cases/__tests__/<use-case-name>.test.ts`. Put in-memory repository doubles in `application/__tests__/repositories/{entity}.ts`. Put adapter fakes in `packages/modules/tests`, outside production exports. Put integration tests in the infrastructure package responsible for the tested implementation and E2E tests with the app they exercise.

Follow [automated testing](../../code-write-code/coding-patterns/automated-testing.md) for test behavior and execution. Production files under `use-cases/{feature}/` contain only use-case classes.

When adding a feature, identify its domain module, contracts, implementation package, affected clients, and tests before choosing file locations. Extend existing packages when they own the responsibility; do not add a package per use case or split packages without a meaningful boundary. Document agreed departures from this default in the destination's architectural guidance.

## Applying the smaller design references

This design defines workspace placement. The backend, page, API-client, and mobile designs define the internal organization and coding responsibilities inside the owning workspace. Their paths point to the owning workspaces (`packages/domain/<module>`, `packages/adapters`, `packages/infra/*`, `packages/infra/mobile/*`).

Initialization must adapt those references to the selected paths and available helpers. Preserve the distinction between adapter contracts and implementations even when both packages contain the word `adapters`. A root `infra/` directory for deployment definitions is optional and distinct from implementation workspaces; this layout does not require SST or any particular hosting provider.

## In ben-prototype

```text
packages/
├── domain/{base,user,task,chat,topic,transcription}   plus ownerships.md
├── adapters/                                          ports in src/ports/
├── modules/{utils,env,tests}
└── infra/
    ├── db/  adapters/  server-ben/
    └── mobile/{ben,design}
```

Packages are named `@ben/<layer>-<name>` (`@ben/domain-base`, `@ben/infra-db`, `@ben/server-ben`, `@ben/mobile-ben`, `@ben/mobile-design`). The Vite design sandbox lives under `infra/mobile/` because it follows the mobile app organization ([Mobile app structure](./mobile-app-structure.md)). `mobile/ben` and `mobile/design` do not extend `tsconfig.base.json`. Project context: [code-get-project-context](../../code-get-project-context/SKILL.md).
