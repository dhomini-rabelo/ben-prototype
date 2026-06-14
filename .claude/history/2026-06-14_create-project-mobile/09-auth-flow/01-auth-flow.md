# Implementation Plan 09 — Auth flow (Firebase + native Google sign-in + boot + login screen + protected guard)

> **Status: PLAN ONLY — do not implement yet.** Deep, code-level implementation plan for the
> `project-mobile` authentication flow.
> **Runs alone** after Phase 1 foundation (plans 02–08). It is **SYNC** (not parallel-safe): it wires
> together files owned by several earlier plans (the API client's 401 handler, the auth store,
> storage, UI primitives) and establishes the expo-router `(protected)` group the chat/task screens
> live under.
> **Depends on:** API layer (plan 04), storage layer (plan 02), global stores (plan 07), UI
> primitives (plan 05), scaffold (plan 01).
> **Verification:** `npx tsc --noEmit` (no formatting / lint step).
> **Auto-approval:** execute every step without asking the user.

---

## 1. Context & references read

- **Brief:** `09-auth-flow/start-briefing.md` + `09-auth-flow/briefing/01-auth-flow.md`.
- **Decisions:** `MOBILE-PORT-ANALYSIS.md` point **1** (auth interceptor: cookie read is sync but
  SecureStore is async → token loaded into memory at boot; 401 redirect → expo-router navigation
  instead of `window.location`) and point **2** (Google flow: no popup — `GoogleSignin.signIn()`
  returns the native `idToken` → same `POST /auth/login-or-register`; requires `webClientId`/
  `iosClientId` configured in Google Cloud Console, outside code). `docs/google-auth.md` (two-token
  model: backend JWT under `@ben/jwttoken` + Firebase/provider id token under `@ben/authprovidertoken`;
  `POST /auth/login-or-register { token }` → `{ process, user, accessToken }`).
- **Web reference (the flow being ported):**
  - `project-web/src/core/firebase.ts` — `initializeApp` from `import.meta.env.VITE_FIREBASE_*` + `getAuth`.
  - `project-web/src/layout/hooks/use-google-auth.ts` — `useGoogleAuth()` state machine
    (`idle|loading|denied|error`), `EXTENDED_WAIT_DELAY_MS = 4000`, `signInWithPopup` →
    `getIdToken()` → `basicClient.post(loginOrRegister, { token })` → set cookies → `setUser` →
    `navigate(ROUTES.chat)`; cancel error codes → `denied`, else `error`.
  - `project-web/src/core/auth.tsx` — `<Auth>` guard: `useEffect` → if no `JWT_COOKIE` →
    `navigate(ROUTES.login)`; renders `<Outlet/>`.
  - `project-web/src/core/router.tsx` — `login` public + `<Auth>`-wrapped `chat` / `taskWorkspace`.
  - `project-web/src/pages/login/page.tsx` — brand mark, tagline, `isPermissionDenied` notice,
    `error` line, Google button (`Signing in...` / `Continue with Google`), `isExtendedWait` line,
    footer (copyright + Privacy/Terms/Help links).
- **Design (`code-get-coding-designs`):** **Page Structure** — page lives in its own folder under
  `src/pages/`, `page.tsx` is the entry point, scoped logic in `hooks/`, kebab-case files,
  PascalCase component identifiers. **Web Page Stores Structure** — global stores under
  `src/layout/stores/`.
- **`code-write-code` + frontend preferences:** kebab-case filenames, no comments, self-explanatory
  English code, named exports, no barrel/index re-export files (user memory: *no export-only files*),
  one component per file (user memory), path-alias imports (`@/…`).

### Cross-plan symbols consumed (already exist when this plan runs — do NOT recreate)

| Import | From | Plan | Used for |
|---|---|---|---|
| `env.firebaseApiKey/AuthDomain/ProjectId`, `env.googleWebClientId`, `env.googleIosClientId` | `@/core/env` | 01 | firebase init + GoogleSignin config |
| `ROUTES.chat`, `ROUTES.login` | `@/core/routes` | 01 | navigation targets |
| `basicClient`, `setUnauthorizedHandler`, `JWT_COOKIE`, `PROVIDER_COOKIE` | `@/api/client` | 04 | login POST + 401 handler registration |
| `API_ROUTES.auth.loginOrRegister` | `@/api/routes` | 04 | login endpoint path |
| `User` | `@/api/models/user` | 04 | typed login response user |
| `setStoredToken`, `setStoredProviderToken`, `clearStoredToken`, `setCachedToken`, `setCachedProviderToken`, `loadTokenIntoMemory`, `getCachedToken` | `@/storage/token-storage` | 02 | persist + cache the two tokens; boot load |
| `useAuthStore` (`user`, `setUser`, `clear`, `hydrate`) | `@/layout/stores/auth-store` | 07 | session state + hydrate on boot |
| `Button` | `@/layout/components/ui/button` | 05 | Google sign-in action |
| `Typography` | `@/layout/components/ui/typography` | 05 | tagline / error / copyright |
| `GoogleIcon` | `@/layout/components/icons/google-icon` | 05 | button icon |
| `BenLogo` | `@/layout/components/icons/ben-logo` | 05 | brand mark fallback (see §6 note) |

> **Forward-dependency note — `BrandMark`.** The web login uses `<BrandMark orientation="column" …/>`
> from `src/layout/components/brand-mark.tsx`, but on mobile `brand-mark.tsx` is owned by **plan 11**
> (shared composite components), which runs **after** this plan. Since plan 09 is SYNC and runs
> before 11, `@/layout/components/brand-mark` does **not** exist yet. Resolution: the login screen
> composes the brand mark **inline** from the primitives plan 05 already provides (`BenLogo` +
> `Typography variant="wordmark"`), reproducing exactly what `BrandMark orientation="column"`
> renders. When plan 11 lands `BrandMark`, a one-line swap to `<BrandMark orientation="column" />`
> is optional refactor (not required for correctness). This keeps plan 09 self-contained and avoids
> reaching into plan 11's owned file. See Step 4.

### Library API consumed — `@react-native-google-signin/google-signin` (installed by plan 01)

The native sign-in replaces `signInWithPopup`. The relevant surface (v13+/v16 modern API):

```ts
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";

GoogleSignin.configure({ webClientId, iosClientId });   // once, at module load
const response = await GoogleSignin.signIn();            // SignInResponse
// isSuccessResponse(response) → response.data.idToken : string | null
// statusCodes.SIGN_IN_CANCELLED → user cancelled (maps to web's "denied")
```

`GoogleSignin.signIn()` resolves to a `SignInResponse` discriminated union (`{ type: "success", data: { idToken, user, … } }` | `{ type: "cancelled" }`). The `idToken` it returns is a Firebase-verifiable Google ID token — the exact same token the backend's `login-or-register` already verifies via Firebase Admin (per `docs/google-auth.md`), so **the backend contract is unchanged**.

---

## 2. Owned files (the only files this plan creates / touches)

```
project-mobile/
├── src/
│   ├── core/
│   │   ├── firebase.ts            (NEW — firebase init for parity / token verification)
│   │   └── auth-bootstrap.ts      (NEW — boot: load token + hydrate user + register 401 handler)
│   ├── layout/hooks/
│   │   └── use-google-auth.ts     (NEW — native Google sign-in flow, web-parity return shape)
│   └── pages/login/
│       └── page.tsx               (NEW — RN Login screen)
└── app/
    ├── index.tsx                  (REPLACE plan-01 placeholder — renders Login, redirects if authed)
    └── (protected)/
        └── _layout.tsx            (NEW — guard layout: bootstrap + redirect / Stack)
```

No barrel/index files. One component per file. All filenames kebab-case.

> **`app/index.tsx` overwrite:** plan 01 created `app/index.tsx` as the bootable `"Ben"` placeholder.
> This plan replaces its body with the real login route. That is the intended hand-off (plan 01 §2.11
> note: "the real login screen at `/` is owned by a later plan"). No other plan-01 file is edited —
> `app/_layout.tsx` (root) stays generic and does **not** run bootstrap (the brief: bootstrap is
> invoked from the protected guard, the root layout stays unopinionated).

---

## 3. `src/core/firebase.ts` — Firebase init (parity)

Mirror web's `firebase.ts`, swapping `import.meta.env.VITE_*` for the typed `env` reader (plan 01).
Kept present for parity / any future token-verification need; the **actual** sign-in is driven by the
native GoogleSignin flow, not the Firebase web `signInWithPopup`. The `firebase` JS SDK is listed in
plan 01's deps.

```ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { env } from "@/core/env";

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
```

Notes:
- Same three config keys as web (`apiKey`, `authDomain`, `projectId`).
- `env.firebase*` are the accessors plan 01 exposes (§2.13). If plan 01's final accessor names
  differ, adjust only these three lines.
- We do **not** call `getReactNativePersistence` / `initializeAuth` here: this module is for parity
  and potential server-token verification, not the sign-in path (which is native). Keeping `getAuth`
  matches web exactly and avoids introducing RN-persistence wiring the flow does not use. (If a later
  plan needs Firebase auth state persistence on RN, it owns that change.)

---

## 4. `src/layout/hooks/use-google-auth.ts` — native Google sign-in

Faithful port of web's `useGoogleAuth`. **Same return shape** —
`{ signIn, isLoading, isExtendedWait, isPermissionDenied, error }` — and the same
`EXTENDED_WAIT_DELAY_MS = 4000` timer behavior. The only changes are platform ones:

1. `GoogleSignin.configure({ webClientId, iosClientId })` once at module load (replaces
   `new GoogleAuthProvider()`).
2. `GoogleSignin.signIn()` → `idToken` (replaces `signInWithPopup` + `result.user.getIdToken()`).
3. Persist via plan-02 storage + plan-07 store (replaces `Cookies.set`):
   - `setStoredToken(accessToken)` + `setCachedToken(accessToken)` — backend JWT (`@ben/jwttoken`).
   - `setStoredProviderToken(idToken)` + `setCachedProviderToken(idToken)` — Firebase id token
     (`@ben/authprovidertoken`).
   - `useAuthStore.getState().setUser(user)` — same as web (the store now also persists to
     AsyncStorage via plan 07).
4. `router.replace(ROUTES.chat)` (expo-router) replaces `navigate(ROUTES.chat)` (react-router).
   `replace` (not `push`) so the back gesture cannot return to login after auth — matches the web
   intent of leaving the login route behind.
5. Cancellation: `statusCodes.SIGN_IN_CANCELLED` → `denied`; anything else → `error` (replaces the
   web `USER_CANCEL_ERROR_CODES` list).

```ts
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { basicClient } from "@/api/client";
import { API_ROUTES } from "@/api/routes";
import type { User } from "@/api/models/user";
import { env } from "@/core/env";
import { ROUTES } from "@/core/routes";
import { useAuthStore } from "@/layout/stores/auth-store";
import {
  setCachedProviderToken,
  setCachedToken,
  setStoredProviderToken,
  setStoredToken,
} from "@/storage/token-storage";

const EXTENDED_WAIT_DELAY_MS = 4000;

GoogleSignin.configure({
  webClientId: env.googleWebClientId,
  iosClientId: env.googleIosClientId,
});

interface LoginOrRegisterResponse {
  process: "login" | "register";
  user: User | null;
  accessToken: string;
}

type GoogleAuthStatus = "idle" | "loading" | "denied" | "error";

interface GoogleAuthState {
  status: GoogleAuthStatus;
  error: string;
}

export function useGoogleAuth() {
  const [state, setState] = useState<GoogleAuthState>({
    status: "idle",
    error: "",
  });
  const [isExtendedWait, setIsExtendedWait] = useState(false);

  const isLoading = state.status === "loading";

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsExtendedWait(true);
    }, EXTENDED_WAIT_DELAY_MS);

    return () => {
      clearTimeout(timeout);
      setIsExtendedWait(false);
    };
  }, [isLoading]);

  async function signIn() {
    setState({ status: "loading", error: "" });

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        setState({ status: "denied", error: "" });
        return;
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        setState({
          status: "error",
          error: "Authentication failed. Please try again.",
        });
        return;
      }

      const loginResponse = await basicClient.post<LoginOrRegisterResponse>(
        API_ROUTES.auth.loginOrRegister,
        { token: idToken },
      );

      setCachedToken(loginResponse.data.accessToken);
      setCachedProviderToken(idToken);
      await setStoredToken(loginResponse.data.accessToken);
      await setStoredProviderToken(idToken);

      if (loginResponse.data.user) {
        useAuthStore.getState().setUser(loginResponse.data.user);
      }

      router.replace(ROUTES.chat);
    } catch (caughtError) {
      const wasCancelledByUser =
        isErrorWithCode(caughtError) &&
        caughtError.code === statusCodes.SIGN_IN_CANCELLED;
      setState({
        status: wasCancelledByUser ? "denied" : "error",
        error: wasCancelledByUser
          ? ""
          : "Authentication failed. Please try again.",
      });
    }
  }

  return {
    signIn,
    isLoading,
    isExtendedWait,
    isPermissionDenied: state.status === "denied",
    error: state.error,
  };
}
```

Notes, line-for-line vs web:
- **State machine + extended-wait `useEffect`** are copied **verbatim** from web (same statuses, same
  4000 ms timer, same cleanup that also resets `isExtendedWait`). This guarantees the identical
  caller-facing contract the brief mandates.
- **`configure` at module load** (top-level, runs once when the hook module is first imported) mirrors
  web constructing the provider per-call but is cheaper and is the documented GoogleSignin pattern.
  Reads `env.googleWebClientId` / `env.googleIosClientId` (plan 01 §2.13). `iosClientId` is included
  because the analysis §2 lists both; on Android only `webClientId` is required, passing `iosClientId`
  is harmless.
- **`hasPlayServices()`** is the standard Android pre-check; on iOS it resolves trivially. A failure
  there throws and is caught → mapped to `error` (or `denied` only on explicit cancel), so it does
  not change the contract.
- **`isSuccessResponse` / `isErrorWithCode`** are the library's type guards (modern API). A
  `cancelled`-type response (user dismissed the sheet) → `denied`; a thrown
  `SIGN_IN_CANCELLED` (older code path) is also mapped to `denied` in the catch — covering both
  cancel surfaces, exactly matching web's `denied` branch.
- **Persistence order:** update the in-memory cache **first** (`setCachedToken` /
  `setCachedProviderToken`, synchronous) so the very next `authClient` request sees the tokens
  immediately, then `await` the SecureStore writes. This is the mobile analog of web's synchronous
  `Cookies.set`; it also matches plan 04's interceptor reading from `getCachedToken()`.
- **`setUser`** is called exactly as web (`useAuthStore.getState().setUser`), only when
  `response.data.user` is present — same null-guard as web. Plan 07's `setUser` additionally persists
  the user to AsyncStorage (fire-and-forget), so no separate `setStoredUser` call is needed here.
- **`router.replace`** uses expo-router's imported `router` singleton (no hook needed inside an async
  callback), the RN analog of web's `navigate`. `ROUTES.chat` = `/chat`.
- **`LoginOrRegisterResponse`** is typed inline here (matching `docs/google-auth.md`'s
  `{ process, user, accessToken }`) because plan 04 copies web's `requests/`/`responses/` intact and
  web had **no** typed login-or-register response (the web hook used `basicClient.post(...)` untyped
  and read `response.data.accessToken`/`.user` loosely). Typing it locally keeps the call type-safe
  without adding a file to plan 04's owned set. If a later refactor wants this in `@/api/responses/`,
  that is plan 04's territory.

---

## 5. `src/core/auth-bootstrap.ts` — app-start session bootstrap + 401 wiring

Replaces web's two implicit mechanisms — the synchronous cookie read at store init, and the
`location.pathname = ROUTES.login` inside the api-client 401 handler — with explicit boot steps,
because SecureStore is async and there is no `window.location`.

Responsibilities (brief item 3):
1. `loadTokenIntoMemory()` (plan 02) — populate the synchronous token cache the interceptor reads.
2. `useAuthStore.getState().hydrate()` (plan 07) — load the persisted user into the store.
3. `setUnauthorizedHandler(...)` (plan 04) — on a 401, the api client already clears the cache +
   fires `clearStoredToken()`; this registers the **navigation half**: clear the user store and
   `router.replace(ROUTES.login)`.

Exposed as a hook `useAuthBootstrap()` that returns whether boot has finished, so the guard can hold
rendering until the cache/user are loaded (prevents a flash of the protected stack before the token
is known).

```ts
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { setUnauthorizedHandler } from "@/api/client";
import { ROUTES } from "@/core/routes";
import { useAuthStore } from "@/layout/stores/auth-store";
import { loadTokenIntoMemory } from "@/storage/token-storage";

export function useAuthBootstrap() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    setUnauthorizedHandler(() => {
      useAuthStore.getState().clear();
      router.replace(ROUTES.login);
    });

    async function bootstrap() {
      await loadTokenIntoMemory();
      await useAuthStore.getState().hydrate();
      if (isActive) {
        setIsReady(true);
      }
    }

    void bootstrap();

    return () => {
      isActive = false;
      setUnauthorizedHandler(() => {});
    };
  }, []);

  return { isReady };
}
```

Notes:
- **`setUnauthorizedHandler`** is plan 04's registration export (default no-op). Plan 04's interceptor
  already does `setCachedToken(null)` + `void clearStoredToken()` on 401; here we add the user-store
  clear + navigation, completing the web behavior (`Cookies.remove ×2` + redirect). `useAuthStore`'s
  `clear()` (plan 07) also fires `clearStoredUser()` + `clearStoredToken()`, so the teardown is
  idempotent and complete.
- **`hydrate()`** is plan 07's action (`StoredUser → User` map from AsyncStorage). Running it after
  `loadTokenIntoMemory()` means by the time `isReady` flips true, both the token cache and the user
  store reflect persisted state — the guard (Step 7) can then make a correct authed/unauthed decision
  with no flash.
- **Cleanup resets the handler to a no-op** so re-mounting the guard never leaves a stale closure
  registered (and avoids navigating with an unmounted router during teardown). The `isActive` flag
  guards the `setIsReady` against a late resolve after unmount.
- **No top-level side effects** — bootstrap runs inside the guard's effect (brief: invoked from the
  protected guard; root layout stays generic).

---

## 6. `src/pages/login/page.tsx` — RN login screen

Faithful port of web's `Login` page using the plan-05 RN primitives. Same visual structure and same
five sign-in states. HTML → RN mapping: `div`→`View`, `main`→`View`, `footer`→`View`, `nav`→`View`,
anchor links→`Text` with `onPress` (`#` hrefs are no-ops on web today, so they become inert
`Pressable`/`Text` placeholders — same non-behavior), `role="status"` notice→a styled `View` +
`Typography`. NativeWind classes are kept where they have an RN equivalent; web-only utilities
(`hover:`, `transition`, `group-hover:`, `min-h-dvh`) are dropped or swapped (`min-h-dvh`→`flex-1`).

```tsx
import { Linking, View } from "react-native";
import { BenLogo } from "@/layout/components/icons/ben-logo";
import { GoogleIcon } from "@/layout/components/icons/google-icon";
import { Button } from "@/layout/components/ui/button";
import { Typography } from "@/layout/components/ui/typography";
import { useGoogleAuth } from "@/layout/hooks/use-google-auth";

const FOOTER_LINKS = [
  { label: "Privacy Policy", url: "#" },
  { label: "Terms of Service", url: "#" },
  { label: "Help Center", url: "#" },
];

export function Login() {
  const { signIn, isLoading, isExtendedWait, isPermissionDenied, error } =
    useGoogleAuth();

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="w-full max-w-[320px] items-center gap-8">
        <View className="items-center gap-3">
          <BenLogo className="text-primary" />
          <Typography variant="wordmark" className="text-primary">
            Ben
          </Typography>
          <Typography
            variant="tagline"
            className="max-w-[280px] text-center text-secondary"
          >
            your busy-day brain — say it, Ben files it
          </Typography>
        </View>

        <View className="w-full gap-3">
          {isPermissionDenied && (
            <View
              accessibilityRole="alert"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3"
            >
              <Typography
                variant="body-md"
                className="text-on-surface-variant"
              >
                looks like that didn&apos;t go through — want to try again?
              </Typography>
            </View>
          )}
          {error !== "" && (
            <Typography variant="body-md" className="text-center text-error">
              {error}
            </Typography>
          )}
          <Button className="w-full" onPress={signIn} disabled={isLoading}>
            <GoogleIcon className="size-5 text-on-primary" />
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>
          {isExtendedWait && (
            <Typography variant="body-md" className="text-center text-secondary">
              still waiting on Google…
            </Typography>
          )}
        </View>

        <View className="items-center gap-2 pt-2">
          <Typography
            variant="label-caps"
            className="font-sans normal-case tracking-normal text-secondary"
          >
            © 2026 Ben. Your busy-day brain.
          </Typography>
          <View className="flex-row items-center gap-4">
            {FOOTER_LINKS.map((link) => (
              <Typography
                key={link.label}
                variant="label-caps"
                className="font-medium text-primary"
                onPress={() => {
                  void Linking.openURL(link.url);
                }}
              >
                {link.label}
              </Typography>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
```

Notes:
- **Brand mark inline (forward-dependency resolution).** `BenLogo` + `Typography variant="wordmark"`
  reproduce `<BrandMark orientation="column" />` exactly (see web `brand-mark.tsx`: column =
  `flex-col`, logo + wordmark both `text-primary`). The web `itemClassName="fade-in-up"` entrance
  animations are dropped (CSS keyframes don't exist in RN; per analysis §77 entrance animations are a
  Reanimated concern owned by other plans, not required for the auth flow). When plan 11 ships
  `BrandMark`, this block may be swapped for `<BrandMark orientation="column" />` — optional, not
  required.
- **Mixed `Button` children** (`<GoogleIcon/>` + the bare string label) rely on plan 05's `Button`
  wrapping string/number children in `<Text>` — the exact hard constraint plan 05 §"Hard constraints"
  item 1 was built for. `GoogleIcon` gets `text-on-primary` so its `currentColor` fill paints white on
  the primary button (web relied on inheriting the button's `text-on-primary`; RN does not inherit, so
  the color class moves onto the icon — consistent with plan 05's icon color note).
- **Five states preserved 1:1 with web:** (a) idle → "Continue with Google"; (b) loading →
  `disabled` + "Signing in..."; (c) extended wait → "still waiting on Google…"; (d) permission denied
  → the "looks like that didn't go through" notice; (e) error → the red error line. Same copy strings,
  same conditional structure.
- `min-h-dvh` → `flex-1` (full-height RN screen). `text-on-background` from the web root is dropped on
  the container and applied per-`Typography` via existing color classes (RN `Text` doesn't inherit a
  parent `View`'s text color), matching how the plan-05 primitives expect color on the `Text` itself.
- Footer links: web used inert `href="#"` anchors. Kept as `Typography` with an `onPress` that calls
  `Linking.openURL("#")` (a harmless no-op for the placeholder URLs) to preserve the "tappable but not
  wired" parity; when real URLs exist a later plan swaps the `url` values. `&apos;`/`&hellip;` web
  entities become the literal `'` / `…` characters in RN text.

---

## 7. `app/index.tsx` — entry route (login + redirect-if-authed)

Web behavior: `login` is the public route at `/`; an already-authenticated user landing on `/` should
go to chat. Web achieved this implicitly (an authed user simply navigated to `/chat`); on mobile the
entry route renders `Login` and, if a session already exists, immediately `Redirect`s to chat.

"Authenticated" = a token is present in the cache. Because the cache is loaded asynchronously at boot
(by the protected guard's bootstrap, Step 8) and the entry route may render before that, we gate the
redirect on **both** the cached token and the hydrated store user being absent before showing login.
Simplest correct rule that matches the brief ("redirect immediately to chat when an authenticated
session already exists"): if a cached token exists, redirect to chat; otherwise render `Login`.

```tsx
import { Redirect } from "expo-router";
import { ROUTES } from "@/core/routes";
import { Login } from "@/pages/login/page";
import { getCachedToken } from "@/storage/token-storage";

export default function Index() {
  if (getCachedToken()) {
    return <Redirect href={ROUTES.chat} />;
  }

  return <Login />;
}
```

Notes:
- **`getCachedToken()`** (plan 02, synchronous) is the entry check. On a cold start the cache is empty
  until the guard's `loadTokenIntoMemory()` runs; but a cold start *begins* on `/` (this route), and an
  unauthenticated user correctly sees `Login`. After a successful `signIn()` we `router.replace`
  straight to `/chat`, so `index` is not re-rendered in that path. The redirect-if-authed branch
  matters on **warm** navigations back to `/` (e.g. after the 401 handler sends the user to login and
  they re-auth, or deep-link to `/`), where the cache is already populated — then it bounces to chat.
- `default export` is required by expo-router (file = route). The route **component** is `Index`; it
  composes the page component `Login` from `src/pages/login/page.tsx` (page-structure design:
  `page.tsx` holds the screen, the `app/` route file is the thin expo-router entry).
- This replaces plan 01's `app/index.tsx` placeholder body (the one rendering centered `"Ben"`).

---

## 8. `app/(protected)/_layout.tsx` — guard layout (bootstrap + redirect / Stack)

The expo-router `(protected)` **group** (parentheses = no URL segment) wraps every authenticated
screen (`chat`, `tasks/[taskId]` — their route files are owned by later plans). This layout is the
mobile analog of web's `<Auth>` wrapper (`core/auth.tsx` + the `<Route element={<Auth/>}>` group in
`router.tsx`).

Behavior:
1. Run `useAuthBootstrap()` (Step 5) — loads the token cache, hydrates the user, registers the 401
   handler. While `!isReady`, render nothing (hold on the splash) so we never flash protected content
   before knowing the session.
2. Once ready, if there is **no** cached token **and no** store user → `Redirect` to login (`/`).
3. Otherwise render the protected `<Stack/>`.

```tsx
import { Redirect, Stack } from "expo-router";
import { useAuthBootstrap } from "@/core/auth-bootstrap";
import { ROUTES } from "@/core/routes";
import { useAuthStore } from "@/layout/stores/auth-store";
import { getCachedToken } from "@/storage/token-storage";

export default function ProtectedLayout() {
  const { isReady } = useAuthBootstrap();
  const user = useAuthStore((store) => store.user);

  if (!isReady) {
    return null;
  }

  if (!getCachedToken() && !user) {
    return <Redirect href={ROUTES.login} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
```

Notes:
- **`useAuthBootstrap()` lives here**, satisfying the brief's coordination requirement: bootstrap is
  invoked from the protected guard, and the scaffold's root `app/_layout.tsx` (plan 01) stays generic
  / auth-agnostic. Returning `null` until `isReady` keeps the plan-01 splash visible during the async
  SecureStore/AsyncStorage reads (`SplashScreen.hideAsync()` is gated on fonts in plan 01; protected
  content simply doesn't mount until ready).
- **Guard rule** mirrors web's `if (!Cookies.get(JWT_COOKIE)) navigate(login)` — but checks the cached
  token (the cache is the mobile equivalent of the synchronously-readable cookie) AND the hydrated
  `user`. Either present ⇒ treat as a session and render the stack; the api-client 401 handler (wired
  in Step 5) is the authority that tears a stale session down later.
- **`<Stack screenOptions={{ headerShown: false }}>`** renders the protected child routes; the chat and
  task screens (later plans) place their files under `app/(protected)/`. `headerShown: false` matches
  the headerless, full-bleed web screens. Child route files are **not** created here (owned by plans
  16 / 20+); until they land, the group simply has the guard — `tsc` passes because `<Stack/>` needs no
  declared children.
- **No subscription to the token cache** (it's a plain module variable, not reactive). The `user`
  store subscription is enough to re-render the guard on login/logout; the token cache is read
  imperatively at the same render. After `signIn()` we navigate straight into `(protected)` with the
  cache already set, and `setUser` flips the store `user`, so the guard re-evaluates correctly.

---

## 9. Full flow trace (verifies the wiring end-to-end)

**Cold start, no session:** `app/_layout` (plan 01) loads fonts → renders `<Slot/>` → `app/index.tsx`:
`getCachedToken()` is `null` → renders `<Login/>`. User taps Google → `useGoogleAuth.signIn()` →
`GoogleSignin.signIn()` → `idToken` → `POST /auth/login-or-register` → `{ accessToken, user }` →
caches + SecureStore writes + `setUser` → `router.replace("/chat")` → routes into `app/(protected)/` →
`ProtectedLayout` runs `useAuthBootstrap` (loads cache — token now present, hydrates user), `isReady` →
token + user present → renders `<Stack/>` → chat screen (placeholder until plan 16).

**Warm start, valid session:** app opens at `/` → `index` sees `getCachedToken()`… on a true cold
process the cache is empty here, so `Login` renders briefly; the durable session lives in SecureStore.
Navigating into `(protected)` triggers `useAuthBootstrap` → `loadTokenIntoMemory` repopulates the
cache from SecureStore + `hydrate` restores the user → guard renders the stack. (If product wants
zero login flash on warm start, the redirect check in `index` can be promoted to also await the boot
load — out of scope here; the brief's requirement "authenticated users reach the protected stack" is
satisfied by the guard.)

**Session expiry (401):** any `authClient` call returns 401 → plan-04 interceptor clears the token
cache + `clearStoredToken()` + calls the registered `unauthorizedHandler` → `useAuthStore.clear()` +
`router.replace("/")` → `index` renders `Login`. Matches web's cookie-removal + redirect.

---

## 10. Things explicitly NOT done here

- **No `app/(protected)/chat.tsx` / `tasks/[taskId].tsx`** — owned by plans 16 / 20+. This plan only
  establishes the group + guard.
- **No edits to plan-01 `app/_layout.tsx`** (root stays generic), `src/core/env.ts`, `routes.ts`,
  `query-client.ts`.
- **No edits to plan-04 `src/api/client.ts`** — only its `setUnauthorizedHandler` export is consumed.
- **No edits to plan-02 storage or plan-07 stores** — only their exports are consumed. (`setUser` /
  `clear` / `hydrate` and the token cache/SecureStore functions already exist per those plans.)
- **No `BrandMark` file** — owned by plan 11; login composes the mark inline (§6 note).
- **No Reanimated entrance animations** (`fade-in-up`) — out of scope; not required for auth.
- **No `@/api/responses/auth.ts`** — the login response is typed inline in the hook (§4 note) to avoid
  reaching into plan 04's owned file set; web had no typed response either.
- **No formatting / lint step.** Verification is type-check only.

## 11. Conventions honored

- kebab-case filenames; PascalCase component identifiers; one component per file; no barrel/index
  re-export files (user memory); path-alias `@/…` imports throughout; no comments; named exports
  (except the two expo-router route files which require `default` exports by framework contract).
- Page-structure design: the screen lives in `src/pages/login/page.tsx`; the `app/` route files are
  thin expo-router entries that compose it; the sign-in logic is a scoped hook under
  `src/layout/hooks/` (shared-hook location, matching web where `use-google-auth.ts` is in
  `layout/hooks/`).

## 12. Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass with zero errors across the six owned files. Functional acceptance (brief): unauthenticated
users land on the login screen; authenticated users reach the protected stack (chat may remain a
placeholder until plan 16). No `npm run lint:fix` / formatting step for this plan.

> If `tsc` fails solely on a differing export name from a dependency plan (e.g. `env.firebaseApiKey`,
> a token-storage setter, or `useAuthStore.hydrate`), adjust only the corresponding import/call line
> to match that plan's final surface — no logic change. These are the documented integration seams.
