# Plan 07 — Global stores (auth, connectivity, menu) + connectivity hook

Port the cross-page global state and the connectivity sync hook from web to the mobile app. Depends on the persistent storage layer (plan 02) and the API models (plan 04). Runs in parallel with the generic hooks unit (plan 06).

## Plan

1. **Port the authentication state**
   - Keep the same shape: hold the current user, expose an action to set the user and an action to clear the session.
   - Initialize the user from device-backed persistence instead of browser cookies.
   - On setting the user, persist the user through the mobile storage layer; on clearing, remove both the stored user and the stored auth token.
   - Account for storage being asynchronous on mobile: initial state may begin empty and hydrate once persistence resolves.

2. **Port the connectivity state**
   - Preserve the existing shape: an offline flag and an action to update it.
   - Keep it platform-agnostic so any data source can feed it.

3. **Port the menu state machine**
   - Reproduce the same state intact: current view, the active detail target, and whether settings are open.
   - Carry over every transition behavior: selecting an entry, returning to the menu, opening and closing a detail, closing settings, and resetting to the initial state.

4. **Rebuild the connectivity hook on the native network source**
   - Replace the browser online/offline signal with the device network-state source.
   - Subscribe to network changes on mount and unsubscribe on unmount.
   - Translate "connected" into the offline flag and push updates into the connectivity state.
   - Surface the current offline status to callers as the web hook did.

## Verification

- The mobile TypeScript compiler passes with no errors.
