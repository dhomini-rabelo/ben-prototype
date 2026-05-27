# Add User Entity and In-Memory Repository

## Context

The project-backend needs a User entity scoped to authentication — only the fields required to identify and authenticate a user via OAuth/provider flows. No plan, billing, or AI key fields from the mdnotes User are included. An in-memory repository is added alongside the abstract contract so the domain layer can be exercised without a database.

## Files to Create

### 1. `src/domain/entities/user.ts`

- Define `UserProps` interface with: `name`, `username`, `email`, `photoUrl`, `providerId`
- Class `User extends Entity<UserProps>` (from `@/modules/domain/entity/entity`)
- Static `create(props: UserProps): User`
- Static `reference(id: ID, props: UserProps): User` — `ID` from `@/modules/domain/entity/id`
- Export `UserIndexes` enum with index `PROVIDER_ID = 'idx-providerId'`
- Export `UserIndexFieldSet` record mapping indexes to field sets (pattern from mdnotes user entity)

### 2. `src/adapters/repositories/user-repository.ts`

Mirrors mdnotes `packages/domain/common/src/application/repositories/user.ts`:

```typescript
export abstract class UserRepository extends Repository<User, UserIndexes> {}
```

Imports `Repository` from `@/modules/domain/repository/repository`, `User` and `UserIndexes` from the entity.

### 3. `src/adapters/repositories/in-memory-user-repository.ts`

```typescript
export class InMemoryUserRepository extends InMemoryRepository<User, UserIndexes> implements UserRepository
```

- `protected entity = User as unknown as EntityWithStatic<User>` (standard cast for class constructor assignment)
- `protected indexes` set to `UserIndexFieldSet`

## Patterns to Follow

- Entity imports from `@/modules/domain/entity/entity` and `@/modules/domain/entity/id`
- `UserRepository extends Repository<User, UserIndexes>` — mirrors mdnotes `packages/domain/common/src/application/repositories/user.ts`
- `InMemoryUserRepository extends InMemoryRepository<User, UserIndexes>` — uses the domain base
- Both `Repository` and `InMemoryRepository` imported from `@/modules/domain/repository/repository`

## Verification

```bash
cd project-backend && npx tsc --noEmit && npm run lint:fix
```
