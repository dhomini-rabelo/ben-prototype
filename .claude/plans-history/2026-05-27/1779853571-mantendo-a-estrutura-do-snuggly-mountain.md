# Google Auth System — Frontend & Backend

## Context

Implement the Google authentication flow for Ben: the frontend uses Firebase SDK to get a Google ID token, sends it to the backend, which verifies it via Firebase Admin SDK, creates or finds the user by `providerId`, and returns a JWT. Subsequent requests carry the JWT for identity. The flow mirrors the mdnotes auth implementation but simplified — no plan, no Stripe. The User entity already exists with the 5 auth fields.

---

## Backend — `project-backend`

### 1. Dependencies
Add to `package.json`:
- `firebase-admin` — token verification
- `jsonwebtoken` + `@types/jsonwebtoken` — JWT sign/verify

### 2. Update `src/infra/services/env.ts`
Add env vars:
- `FIREBASE_PROJECT_ID: z.string()`
- `JWT_PRIVATE_KEY: z.string()`
- `JWT_EXPIRATION_TIME_IN_SECONDS: z.coerce.number()`

Add to `.env.development`.

### 3. Service interfaces — `src/domain/services/`

**`auth-provider.ts`** — copy from mdnotes `packages/adapters/src/adapters/auth-provider.ts`:
```ts
export interface AuthProviderService {
  getUserFromToken(payload: { token: string }): Promise<{ id, name, email, photoURL } | null>
}
```

**`jwt.ts`** — simplified (no plan), based on mdnotes `packages/adapters/src/adapters/jwt-with-plan.ts`:
```ts
export abstract class JwtService {
  abstract generateToken(userId: string): string
  abstract getState(token: string): { userId: null; expired: true } | { userId: string; expired: false }
}
```

### 4. Service implementations — `src/infra/services/`

**`firebase-auth-provider.ts`** — mirrors mdnotes `packages/infra/adapters/src/adapters/auth-provider.ts`:
- `FirebaseAuthProviderService implements AuthProviderService`
- Uses `firebase-admin/auth` `verifyIdToken`, returns `{ id: uid, name, email, photoURL: picture }`
- Initialize Firebase App with `FIREBASE_PROJECT_ID` from env

**`jwt.ts`** — mirrors mdnotes `packages/infra/adapters/src/adapters/jwt-with-plan.ts`:
- `JsonWebTokenJwtService extends JwtService`
- Uses `jsonwebtoken` with `HS256`
- Token payload: `{ userId: string }`
- Config from `env.JWT_PRIVATE_KEY` and `env.JWT_EXPIRATION_TIME_IN_SECONDS`

### 5. Use cases — `src/domain/use-cases/auth/`

**`login-or-register.ts`** — mirrors mdnotes `packages/domain/auth/src/application/use-cases/user/login-or-register.ts`:
- Constructor: `(userRepository: UserRepository, authProviderService: AuthProviderService, jwtService: JwtService)`
- Verifies provider token → gets `{ id, name, email, photoURL }` from `authProviderService`
- Looks up user by `providerId` via `userRepository.findUnique({ providerId }, { index: UserIndexes.PROVIDER_ID })`
- On found: return `{ process: 'login', user, accessToken }`
- On not found: `userRepository.create(...)` then return `{ process: 'register', user, accessToken }`
- Username generated from email: `email.split('@')[0]`

**`verify-authentication.ts`** — mirrors mdnotes `packages/domain/auth/src/application/use-cases/user/verify-authentication.ts`:
- Constructor: `(userRepository: UserRepository, authProviderService: AuthProviderService, jwtService: JwtService)`
- If JWT valid → return `{ jwtToken, userId }`
- If JWT expired → re-verify provider token → find user by `providerId` → generate new JWT → return `{ jwtToken: newToken, userId }`

### 6. HTTP layer

**`src/infra/http/presenters/user-presenter.ts`**:
- `UserPresenter.toHttp(user: User)` → returns plain object with `{ id, name, username, email, photoUrl, providerId }`

**`src/infra/http/routes/login-or-register.ts`**:
- Zod body: `{ token: z.string() }`
- Instantiates `LoginOrRegisterUseCase` with `InMemoryUserRepository`, `FirebaseAuthProviderService`, `JsonWebTokenJwtService`
- Returns `{ process, user: UserPresenter.toHttp(user), accessToken }`

**`src/infra/http/middlewares/auth.ts`** — Express middleware:
- Reads headers `jwtauthenticationtoken` + `providerauthenticationtoken`
- Runs `VerifyAuthenticationUseCase`
- Sets `req.userId` (via module augmentation on Express `Request`)
- On success: attach `updatedjwtauthenticationtoken` to response header if JWT was refreshed

### 7. Update `src/infra/http/app.ts`
- Add `POST /auth/login-or-register` → `loginOrRegister` route handler

---

## Frontend — `project-web`

### 1. Dependencies
Add to `package.json`:
- `firebase` — Google sign-in via popup
- `js-cookie` + `@types/js-cookie` — token storage

### 2. Firebase config — `src/core/firebase.ts`
- Initialize Firebase App with config from `VITE_FIREBASE_*` env vars
- Export `auth` instance (`getAuth(app)`)

### 3. Env vars — `.env.development`
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_BACKEND_URL=http://localhost:3333
```

### 4. Auth hook — `src/core/hooks/use-google-auth.ts`
- `useGoogleAuth()` returns `{ signIn, isLoading, error }`
- `signIn`:
  1. `signInWithPopup(auth, new GoogleAuthProvider())`
  2. `result.user.getIdToken()` → get Firebase ID token
  3. `POST ${VITE_BACKEND_URL}/auth/login-or-register` with `{ token }`
  4. On success: store `@ben/jwttoken` + `@ben/authprovidertoken` in cookies (5-day maxAge)
  5. Redirect to `/home`

### 5. Update `src/pages/Login/page.tsx`
- Connect "Continue with Google" button to `useGoogleAuth().signIn`
- Disable button and show loading text while `isLoading`
- Show error message when `error` is set

### 6. Home placeholder — `src/pages/Home/page.tsx`
- Minimal authenticated placeholder page (can be expanded later)
- Redirect to `/` if no JWT cookie

### 7. Update router
- Add `/home` route pointing to `Home` page

---

## Verification

```bash
# Backend
cd project-backend && npx tsc --noEmit && npm run lint:fix

# Frontend  
cd project-web && npx tsc --noEmit && npm run lint:fix
```

End-to-end: start backend (`npm run dev`), start frontend (`npm run dev`), click "Continue with Google" on login page — should trigger popup, call backend, store cookies, redirect to `/home`.
