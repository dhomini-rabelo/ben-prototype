# Verdict tests-01 preferencias-servidor (nonce modelos-gasto-historico-r11-test-modelos-pref)

Environment: server API_PORT=3335 (sqlite copy of dev.db, one seeded user u1, dummy Firebase env) behind a CORS proxy on 3334 (server CORS allowlist lacks :8082; proxy script in scratchpad, no product code changed); Expo web on 8082 with dummy Firebase env; auth via JWT minted with the test JWT key and put in localStorage (ben.jwttoken). Viewport 390x844. Port 8081 (Shiplog) untouched.

## Cases
- GET /user-preferences/detail: {"item":{"language":null,"showUsdCost":false}} for a fresh user (switch off by default). PASS.
- POST /user-preferences/update {language:"pt-BR",showUsdCost:true} returns the item and a following GET returns the same. PASS. Invalid language "xx" returns 400 {"language":["UNSUPPORTED_USER_LANGUAGE#undefined"]}. PASS. Missing auth headers return 400. Valid JWT with unknown user returns 404 RESOURCE_NOT_FOUND.
- UI: through Settings, selecting Portugues and toggling the switch persisted on server (curl confirmed pt-BR/true). PASS.
- Reload after clearing localStorage except tokens/user: UI came back in Portuguese ("Configuracoes", "Mostrar gasto em dolar") and the switch is checked, so language and switch come from the server. PASS. Screenshot: tests-01/screenshots/after-reload-cleared-storage.png.
- Not directly observed in UI: the initial unchecked state of the switch (confirmed only by the API default false). The USD footer in chat was not run (no LLM key).
- Lead (not a failure): server CORS allowlist (packages/infra/server-ben/src/app.ts:38-44) has only :3001 and :8081, so web on another port needs a proxy.

## PASS
