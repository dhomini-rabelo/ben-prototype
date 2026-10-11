# Verdict tests-01 (browser, 390x844, Expo web :8081)

PASS (with minor observations, none blocking).

Setup: temp `.env` from `.env.example` with fake values (deleted afterwards); Expo started by me and stopped. Backend :3333 mocked through Playwright context routes (messages, tasks, notes, reminders, counts, agent-preferences, trace). Session injected in localStorage. Real Google sign-in is not reachable (fake Firebase values), so "sign back in" was done by re-injecting the session.
Screenshots: `.claude/tasks/2026-10-11_language-switch/tests-01/screenshots/`

## Deep cases
1. Default EN: PASS. `@ben/language` cleared -> chat in English; Settings shows "English" selected, key stays null (01, 02, 04).
2. Switch to Portugues: PASS. Settings re-renders immediately: CONFIGURACOES, MODELO DO BEN, ESFORCO, IDIOMA, VERSOES DO APP, version title/description in pt, "Sair", close button "Fechar"; menu behind also switched; localStorage `@ben/language` = `pt-BR` (05, 06).
3. pt-BR walk: PASS. Menu (Tarefas/Notas/Lembretes, "1 ativa"), lists with relative times ("ha 6min", "em 4h", "capturado ha 32min"), empty states for all three lists and chat ("Nenhuma mensagem recente...", "ACOES SUGERIDAS"), note/reminder details (dates localized "11 de out. de 2026"), chat banner/placeholder ("Mensagem para o Ben..."), actions menu ("Ver input"/"Ver output"), trace sheet (MOSTRAR MAIS / MOSTRAR MENOS work), task picker ("TAREFAS ATIVAS", "mais recentes primeiro"), task workspace (banner, "Peca ao Ben para editar...", "O Ben sugeriu 2 mudancas", Rejeitar/Aprovar, "Concluir tarefa", aria-labels Voltar/Mais/Anexar) (07-23).
4. Persistence: PASS. Full reload keeps pt-BR; an in-page text sampler (10 ms) recorded only Portuguese frames from the first paint, no English flash. localStorage holds `pt-BR`.
5. Sign out / sign in: PASS (partial). After "Sair" the login screen is pt-BR ("Continuar com o Google", footer links), still pt-BR after reload; `@ben/language` survives sign-out. Re-login via Google not exercisable; session re-injected, app landed on /chat in pt-BR (24).
6. Back to English: PASS. Everything English, persists after reload (`en`), "View input"/"View output", "SHOW MORE", "Reject/Approve", "ACTIVE TASKS" (25-29).
7. Usability: PASS. SegmentedControl clearly highlights the current choice; at 390px no truncation/overflow in Settings, login, banner, workspace footer. Login footer links wrap onto two lines (acceptable).

## Observations (not blocking)
- Effort pills "none/low/medium/high" in Settings and "esforco · low" in trace come from API data, stay English in pt-BR.
- App version dates stay ISO "2026-10-11" in pt-BR (not locale formatted), whereas other dates are localized.
- Trace sheet tabs "Input"/"Output" and "ETAPA 2 · CONTEXT" (phase value) stay English in pt-BR; "Ver input/Ver output" use anglicisms.
- Pluralization: "1 mensagens · 1 ferramentas" in trace meta (screenshot 16b); should be singular for 1.
- Console: one `404 GET /tasks//detail` (empty id request) when opening the workspace; likely pre-existing, not language related.
- Task workspace: banner overlays the first todo (20); layout, not language.

## Not run
- Real Google sign-in (no Firebase credentials in test setup).
- Real backend data (all data mocked); "Mostrar mais" tested with a mocked 25-key JSON.
