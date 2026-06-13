# Plan 09 — Auth flow (Firebase + native Google sign-in + boot + login screen)

Wire the full native authentication flow and the protected-route guard for the mobile app. Depends on the API layer (04), storage layer (02), global stores (07), and UI primitives (05). Runs alone after Phase 1 foundation.

## Plan

1. **Initialize Firebase for the device**
   - Stand up the Firebase app using the mobile environment reader for its config, mirroring the web setup.
   - Keep this present for parity and any token-verification needs, while the actual sign-in is driven by the native Google sign-in flow rather than a web popup.

2. **Implement the native Google sign-in flow**
   - Configure the native Google sign-in once with the web client identifier so it can return a verifiable identity token.
   - On sign-in, obtain the native identity token, exchange it with the backend through the same login-or-register call the web app uses, and receive back the session token and the user.
   - Persist the returned session token to secure storage (and refresh the in-memory token cache so the API client sees it immediately), persist the identity token, store the user, and push the user into the authentication state.
   - On success, navigate to the chat destination using the file-based router.
   - Preserve the same caller-facing contract as web: expose the sign-in trigger plus loading, extended-wait, permission-denied, and error signals.
   - Map the native cancellation outcome to the permission-denied signal and any other failure to a generic error, keeping the extended-wait timer behavior from web.

3. **Bootstrap the session on app start**
   - On launch, load the cached session token into memory and hydrate the authentication state from the stored user, so the app knows whether a session already exists before rendering protected content.
   - Register the API client's unauthorized handler so that a session-expiry response clears the session and redirects the user to the login destination through the file-based router, replacing the web's direct location redirect.

4. **Build the login screen**
   - Recreate the web login screen with native primitives: brand mark, tagline, a Google sign-in action, the legal footer links, and the same copyright line.
   - Reflect every sign-in state: disable the action and show a signing-in label while loading, surface the still-waiting message during extended waits, show the gentle retry prompt when the user cancelled, and show the generic error message on failure.

5. **Establish the route entry and protected guard**
   - Make the app's entry route render the login screen, and redirect immediately to chat when an authenticated session already exists.
   - Add a guard layout for the protected route group that runs the start-up bootstrap and, when no session token or user is present, redirects to the login entry; otherwise it renders the protected navigation stack (the chat screen may remain a placeholder until the chat assembly unit lands).
   - Coordinate with the scaffold so the bootstrap is invoked from this guard and the generic root layout stays unopinionated about auth.

## Verification

- The mobile TypeScript compiler passes with no errors for the owned files.
- Unauthenticated users land on the login screen; authenticated users reach the protected stack.
