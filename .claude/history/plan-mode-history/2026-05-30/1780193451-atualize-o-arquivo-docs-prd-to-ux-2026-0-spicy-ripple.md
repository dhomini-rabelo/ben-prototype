# Plan: Update User collection in 04-data-model.md

## Context
The `User` entity in `project-backend/src/domain/entities/user.ts` diverges from the data model doc. The doc needs to reflect the actual entity fields.

## Change

**File:** `docs/prd-to-ux/2026-05-23-ben-prototype/04-data-model.md`

Replace the `User` collection TypeScript block:

**Before:**
```ts
{
  _id: ObjectId
  googleSub: string    // identificador do Google — índice ÚNICO, usado no login
  email: string
  name: string
  avatarUrl?: string   // foto do perfil Google (Settings modal)
  createdAt: Date
}
```

**After:**
```ts
{
  _id: ObjectId
  providerId: string   // identificador do provider OAuth — índice ÚNICO, usado no login
  email: string
  username: string
  name: string
  avatarUrl: string    // foto do perfil (Settings modal)
  createdAt: Date
}
```

Also update the index note below:
- Change `{ googleSub: 1 }` → `{ providerId: 1 }`
- Update comment from "lookup de login" — keep as is (still accurate)

## Verification
Read the updated file and confirm all 6 fields match `UserProps` in `user.ts` plus `_id` and `createdAt`.
