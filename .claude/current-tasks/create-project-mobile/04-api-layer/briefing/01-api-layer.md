# Plan — API layer (native HTTP client + request/response contracts)

1. **Carry over the backend contract intact**
   - Reproduce the full route map exactly as on web, including the parameterized task, notes, and reminders routes
   - Reproduce the shared response envelope shapes (single item, listing, page-based pagination, cursor-based pagination)
   - Reproduce every domain model (user, message, task, note, reminder) unchanged, since the backend contract is identical
   - Reproduce every response shape (agent reply, task, transcription, capture counts) unchanged

2. **Rebuild the authenticated HTTP client for the device**
   - Keep two client instances: a basic one and an authenticated one, both pointed at the backend base URL and carrying the shared default headers
   - Read the backend base URL from the mobile environment reader rather than the web build-time variable
   - Preserve the secure-storage key names for the JWT and provider tokens, reused now as native storage keys for parity with web

3. **Attach the auth token synchronously on every authenticated request**
   - On each outgoing authenticated request, read the current JWT and provider token instantly from the in-memory token cache populated at app boot, instead of reading browser cookies
   - Send the same authentication header names the backend already expects
   - Never block the request on asynchronous secure-storage reads

4. **Handle token refresh and session expiry without browser APIs**
   - When a response carries a refreshed-token header, persist the new token to secure storage and update the in-memory cache so subsequent requests use it immediately
   - On an unauthenticated (401) response, clear both stored tokens and invoke a registered navigation callback to send the user to login, replacing the web's direct window-location redirect
   - Expose a way to register that navigation callback, defaulting to a no-op so the client is safe before the app wires up navigation

5. **Adapt audio transcription upload for native file URIs**
   - Build the multipart form payload from a recorded-file reference (URI, file name, and audio MIME type) instead of a web binary blob
   - Use the same upload field name, route, and returned text shape as web
   - Keep all other request functions (chat, tasks, notes, reminders) unchanged, since their payloads are plain data

6. **Confirm the layer type-checks**
   - Verify the type checker passes for the owned files
