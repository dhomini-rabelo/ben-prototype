# Verdict tests-02 gasto-dolar (nonce modelos-gasto-historico-r14-test-real)
Environment: server-ben 3335 restarted with the real OpenRouter key (masked sk-or-***; key never logged), sqlite test copy test.db (user u1), test JWT/Firebase envs, model openai/gpt-6.1-sol effort high; proxy 3334, Expo web 8082, viewport 390x844. Text only (no AssemblyAI). Seed: 24 messages (R14 prefix) plus 4 R12 ones; real model calls via POST /chat.
- Case 5 (cost): PASS. Persisted Ben messages have costUsd > 0 and interactionCostUsd equal to the OpenRouter usage.cost: 0.0118125, 0.0147087, 0.0128125, 0.011133 (trace totalUsage.costUsd matches). After turning on the "Mostrar gasto em dolar" switch in Settings and reloading /chat, the footer shows US$ 0,0111, 0,0128, 0,0147 and 0,0118 under the Ben replies. Screenshot: tests-02/screenshots/r14-chat-cost.png.
- Not run: transcription cost (no AssemblyAI key).
## PASS
