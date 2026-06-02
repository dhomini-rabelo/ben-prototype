# Deep Plan — Plan 1 [Backend]: Define shared use-case response interfaces

## Context

The codebase is introducing a use-case response standard (see
`.claude/skills/code-write-code/coding-patterns/use-case-response-structure.md`):
a use case never returns a bare entity or a bare array. Its `Response` is always
a named object:

- single object (create / update / patch / get) → `{ item: T }`, may carry extra fields
- cursor pagination → `{ items: T[]; hasMore: boolean; nextCursor: string | null }`
- non-paginated listing → `{ items: T[] }`

This plan is the contract foundation. Plan 2 (the use cases) will import these
types, so they must exist first and live in one consistent import home.

`CursorPaginationResponse<Data extends AnyRecord>` already exists in
`project-backend/src/modules/domain/repository/repository.ts` and is the exact
cursor-pagination shape used by the repository layer. It must be reused as-is —
not duplicated or redefined.

## Decisions

1. **Single import home.** Create `project-backend/src/modules/domain/responses.ts`
   exporting all three response shapes (`ItemResponse`, `ListingResponse`, and a
   re-export of `CursorPaginationResponse`) so use cases import everything from
   one path: `@/modules/domain/responses`.
2. **No type constraint on `T`.** `ItemResponse<T>` and `ListingResponse<T>` must
   NOT constrain `T`. Entities are class instances, not records, so a
   `T extends AnyRecord` constraint (as on `CursorPaginationResponse`) would
   reject them. Leave `T` unconstrained.
3. **Re-export, don't redefine `CursorPaginationResponse`.** Use
   `export { type CursorPaginationResponse } from '...'` so there is a single
   source of truth. The repository layer keeps owning the definition.
4. **`export type` aliases**, matching the surrounding domain module style
   (`types.ts`, `repository.ts` all use `export type`). Self-explanatory, no
   comments, English — per the writing-code skill.
5. **Path alias import.** Use the `@/*` → `./src/*` alias (from `tsconfig.json`)
   for the re-export, consistent with `repository.ts` which imports
   `@/modules/utils/types`.

## Files to Create

### `project-backend/src/modules/domain/responses.ts` (new)

```typescript
export { type CursorPaginationResponse } from '@/modules/domain/repository/repository'

export type ItemResponse<T> = {
  item: T
}

export type ListingResponse<T> = {
  items: T[]
}
```

## Existing Code to Reuse

- `CursorPaginationResponse<Data extends AnyRecord>` from
  `project-backend/src/modules/domain/repository/repository.ts` (lines 43-47) —
  re-exported as-is, never redefined.

## Out of Scope / Boundaries

- Do NOT edit any use case, route, presenter, or `repository.ts`.
- Do NOT run `npm run lint:fix`.
- The only file this plan creates is `responses.ts`.

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-backend && npx tsc --noEmit
```

Confirm no errors originate from `src/modules/domain/responses.ts`. Unrelated
errors from parallel in-progress plans may exist and are acceptable.
