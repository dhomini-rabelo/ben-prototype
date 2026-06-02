# Plan 1 [Backend] (sync): Define shared use-case response interfaces

**Plan line:** Plan 1 [Backend] (sync)

## Goal

Create the reusable response interfaces that the new use-case response standard depends on, so every backend use case can type its `Response` consistently. This is the contract foundation: it must finish before Plan 2 [Backend] runs, because the use cases will import these types.

## Standard being introduced

The use-case response pattern (see `.claude/skills/code-write-code/coding-patterns/use-case-response-structure.md`):

- single object (create/update/patch/get) → `{ item: T }`, may carry extra fields
- cursor pagination → `{ items: T[]; hasMore: boolean; nextCursor: string | null }`
- non-paginated listing → `{ items: T[] }`

## What to do

- Create a new file `project-backend/src/modules/domain/responses.ts` that exports:
  - `ItemResponse<T>` → `{ item: T }`
  - `ListingResponse<T>` → `{ items: T[] }`
  - re-export the existing `CursorPaginationResponse` from `project-backend/src/modules/domain/repository/repository.ts` so use cases have a single import home for all three. Do not duplicate or redefine it.
- Note: `CursorPaginationResponse<Data extends AnyRecord>` already exists in `repository.ts`; `ItemResponse`/`ListingResponse` must NOT constrain `T` (entities are class instances, not records).

## Files owned by this plan

- `project-backend/src/modules/domain/responses.ts` (new) — the ONLY file this plan creates/edits.

## Constraints

- Do not edit any use case, route, presenter, or `repository.ts`.
- Do not run `npm run lint:fix`.
