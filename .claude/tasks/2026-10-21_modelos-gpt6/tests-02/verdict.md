# Verdict tests-02 modelos-gpt6 (nonce modelos-gasto-historico-r11-test-modelos-pref)

Environment: server API_PORT=3335 (sqlite copy of dev.db, one seeded user u1, dummy Firebase env) behind a CORS proxy on 3334 (server CORS allowlist lacks :8082; proxy script in scratchpad, no product code changed); Expo web on 8082 with dummy Firebase env; auth via JWT minted with the test JWT key and put in localStorage (ben.jwttoken). Viewport 390x844. Port 8081 (Shiplog) untouched.

## Cases
- Settings lists GPT-6 Luna, GPT-6.1 Sol (plus DeepSeek V4.1 Flash, GLM 5.3 Flash), no GPT-5.6 Luna: PASS (UI + GET /agent-preferences/detail).
- Default for a user with no saved model: GPT-6 Luna / effort medium (API). PASS. Note: the UI shows no "(padrao)" tag; Luna is only the default selection.
- Luna efforts: none, low, medium, high, xhigh, max (API). Sol efforts: low, medium, high, xhigh, max; UI after selecting Sol shows no "none" chip. PASS.
- POST /agent-preferences/update with Sol + effort none: rejected, {"effort":["UNSUPPORTED_AGENT_EFFORT#undefined"]}. PASS.
- Change Sol + high through UI persists on server and after reload (storage cleared except tokens): Sol checkmark and "high" chip selected. PASS. Screenshot: tests-02/screenshots/after-reload-cleared-storage.png (also settings-changed.png).
- Not run: sending a chat message to the agent (no OpenRouter key). Legacy slug gpt-5.6-luna fallback not exercised end to end (covered by unit tests only).

## PASS
