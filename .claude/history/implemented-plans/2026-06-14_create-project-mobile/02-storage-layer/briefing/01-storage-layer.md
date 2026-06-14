# Plan — Storage layer (native token + user persistence)

1. **Persist the auth tokens securely**
   - Store the JWT and the auth-provider token in the device's secure storage instead of browser cookies, keyed the same way the web app keys them (`@ben/jwttoken`, `@ben/authprovidertoken`)
   - Expose reading, writing, and clearing the tokens as asynchronous operations
   - Clear both tokens together when the session ends

2. **Provide synchronous token access for the request interceptor**
   - Load the stored token into an in-memory cache once when the app boots
   - Let consumers read the current token instantly without waiting on secure storage
   - Keep the cache in sync whenever the token is written or cleared, so the interceptor never reads a stale value

3. **Persist the authenticated user**
   - Store the user object in regular device storage (not secure storage), keyed as the web app keys it (`@ben/user`)
   - Expose reading, writing, and clearing the user as asynchronous operations
   - Recover gracefully when no user is stored or the stored value is unreadable, returning an empty result instead of failing

4. **Keep the user shape independent of other in-progress work**
   - Represent the stored user with a shape this layer defines itself, so it never depends on a model owned by a parallel unit
   - Leave the mapping between this stored shape and the app's user model to the auth store that consumes this layer
