# Verdict tests-02 (browser, 390x844, Expo web :8081)

PASS

Setup: same recipe as tests-01. Temp `.env` with fake values (removed), Expo started by me and stopped (:8081 now closed). Backend :3333 mocked with Playwright context routes. Session injected in localStorage (`ben.jwttoken`, `ben.authprovidertoken`). The mocked trace has 2 steps: step 1 (context) = 1 message, 1 tool, 1 char; step 2 (format) = 2 messages, 3 tools, 27 chars. This covers singular and plural in the same sheet.
Screenshots: `.claude/tasks/2026-10-11_language-switch/tests-02/screenshots/`

## Re-exercised
1. pt-BR trace (02-ptbr-trace.png): PASS.
   - Step 1 reads "ETAPA 1 · CONTEXTO" and "1 mensagem · 1 ferramenta · 1 caractere".
   - Step 2 reads "ETAPA 2 · FORMATO" and "2 mensagens · 3 ferramentas · 27 caracteres".
   - The "1 caractere" / "5 caracteres" chips are also correct.
   - The tests-01 bug "1 mensagens · 1 ferramentas" is fixed.
2. English trace (01-en-trace.png): PASS.
   - Step 1 reads "STEP 1 · CONTEXT" and "1 message · 1 tool · 1 char".
   - Step 2 reads "STEP 2 · FORMAT" and "2 messages · 3 tools · 27 chars".
3. Regression (switch and reload): PASS.
   - In Settings, "Português" sets `@ben/language` = `pt-BR` and the screen re-renders in pt-BR immediately.
   - After a full reload on /chat, the placeholder is "Mensagem para o Ben...", the banner is in pt-BR, and the actions menu shows "Ver input".
   - The trace sheet opens in pt-BR, so language persists and the chat and sheet follow it.

## Carried over from tests-01 (not re-run)
Settings strings, menu, lists, details, task workspace, login/sign-out, back-to-English and the "Mostrar mais" cases. The fix only touched the message trace sheet strings and its phase label (`message-trace-strings.ts`, `message-trace-input-step.tsx`), so those screens share no changed code. The regression in case 3 re-checked the language switch and persistence path.

## Remaining observations (unchanged, not blocking)
"Input"/"Output" tabs and the effort values stay in English (intentional / API data). Real Google sign-in and real backend data were not exercised (mocked).
