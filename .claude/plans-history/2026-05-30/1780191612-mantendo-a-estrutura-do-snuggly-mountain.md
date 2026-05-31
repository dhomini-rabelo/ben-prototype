# Migrate Repository Interface — DynamoDB → Postgres/MongoDB-friendly

## Context

The current `Repository` abstraction was ported from mdnotes which targets DynamoDB: every query carries an `index` parameter and uses cursor-based pagination (`nextPaginationData`). This couples the domain layer to DynamoDB's access pattern. The supervisor project has a cleaner interface with no index concept, offset-based pagination (`limit/page`), richer query types (`ContainsQuery`, `InQuery`, `NotEqualQuery`, etc.) and simpler method signatures — a better fit for Postgres or MongoDB.

---

## What changes

### `src/modules/domain/repository/queries.ts` — full replace
New query set from supervisor (drop DynamoDB-style `BeginsWithQuery`, `AndQuery`, add `ContainsQuery`, `GreaterQuery`, `InQuery`, `NotInQuery`, `NotNullQuery`, `NotEqualQuery`):

```
QueryTypes: CONTAINS | LOWER_OR_EQUAL | GREATER | BETWEEN | IN | NOT_IN | NOT_NULL | NOT_EQUAL
```

### `src/modules/domain/repository/repository.ts` — full replace
- `Repository<EntityClass>` — drop `Indexes` generic, no `validateIndex`, no index-related types
- New method signatures:
  - `update(id, newProps): Promise<EntityClass>` — always returns entity (no `returnUpdated` option)
  - `delete(id): Promise<EntityClass>` — returns deleted entity
  - `findMany(props, params?)` — `params` is `QueryFilters<Props>` = `{ limit, page, orderBy, order }`; returns `EntityClass[]` (not `QueryResponse`)
  - `findManyWithPagination(props, params?)` — returns `{ items, totalItems, page }`
  - `count(props)` — replaces `countItems`
  - `deleteMany(props)` — new
  - `clone(clientRepository?)` — new
  - Drop: `reuseUpdate`, `reset`, `countItems`
- `InMemoryRepository<EntityClass>` — `implements Repository<EntityClass>`, no `Indexes` generic
  - `queryHandler` dispatch table handles all `QueryTypes`
  - Sorting/pagination via `applyQueryParams` helper
  - Uses `cloneDeep` from `lodash-es` (already a dependency)

### `src/modules/domain/repository/query-values.ts` — delete
DynamoDB `ValueQuery` (SET expressions) has no equivalent in the new interface. File is removed.

### `src/modules/domain/repository/repository-errors.ts` — minor update
`ResourceNotFoundError` constructor takes no description argument (align with supervisor).

### `src/domain/entities/user.ts` — remove Indexes
Drop `UserIndexes` enum and `UserIndexFieldSet` — index concepts belong to the old interface.

### `src/adapters/repositories/user-repository.ts` — update generic
`UserRepository extends Repository<User>` (no `UserIndexes` generic).

### `src/adapters/repositories/in-memory-user-repository.ts` — update
`InMemoryUserRepository extends InMemoryRepository<User>` (no Indexes).
Keep `protected entity = User as unknown as EntityWithStatic<User>`.
Drop `protected indexes` field.

### `src/domain/use-cases/auth/login-or-register.ts` — remove index
`findUnique({ providerId: ... })` — no second argument.

### `src/domain/use-cases/auth/verify-authentication.ts` — remove index
`get({ providerId: ... })` and `findUnique({ providerId: ... })` — no second argument.

---

## Verification

```bash
cd project-backend && npx tsc --noEmit && npm run lint:fix
```
