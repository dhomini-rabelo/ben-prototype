# Orquestration — language-switch

Date: 2026-10-11
Skill: simple-loop

## Extrato da task

- Decisões vinculantes: sem lib i18n — dicionários próprios tipados (falta de chave pt-BR = erro de compilação); hook `useStrings(...)` (sem `t()`, lint proíbe nome de 1 letra); idioma só no aparelho (AsyncStorage `@ben/language`), hidratado antes da 1ª tela (sem flash), troca instantânea; seletor = `SegmentedControl` existente numa seção nova do Settings; default inglês. Detalhes: Premissas assumidas no plan.md.
- Fora de escopo: backend, idioma das respostas do agente, design sandbox, detecção do idioma do aparelho.
- Critérios de aceitação: trocar EN↔PT-BR no Settings muda todas as telas (menu, chat, task workspace, login) na hora; persiste após reload e após logout/login; default EN; tsc e lint limpos.
- Escopos: A `a-i18n-infra-and-settings` (primeiro, sozinho) → B1 `b1-strings-layout` (layout, app/, login, menu, api/, services/), B2 `b2-strings-chat` (pages/chat), B3 `b3-strings-task-workspace` (pages/task-workspace) em paralelo, footprints disjuntos.
- Estado de git: branch feat/add-version-in-settings | commit-base 3ec6712.
- Armadilhas: `app.config.ts` importa `app-versions.ts` fora do Metro → esse arquivo só `import type` dos tipos de idioma (A checa com `expo config`). `_layout.tsx` retorna null até `isReady` (auth-bootstrap) — ponto de hidratação.
- Cenário de teste: browser-mobile-tester em :8081 — Settings → Português; conferir menu, chat, workspace; reload persiste; logout/login; voltar a English. Mobile sem testes automatizados.

## bootstrap

- Task folder created; branch feat/add-version-in-settings | commit-base 3ec6712.
- Usuário: "não me faça nenhuma pergunta" → planner não devolve lote de perguntas; registra premissas.

## recon (recon-language-switch)

- Pointer: `recon.md`
- Veredito: complexa — sem lib i18n/molde, ~80 .tsx com literais, decisões abertas
- Partição: (a) infra i18n + seletor Settings + persistência AsyncStorage; (b) migração de strings por tela
- Next: plan em opus, sem perguntas ao usuário

## planner (plan-language-switch)

- Question batch: nenhum (override do usuário) — premissas no plan.md
- Pointers: `plan.md`, `prompts/{a-i18n-infra-and-settings,b1-strings-layout,b2-strings-chat,b3-strings-task-workspace}.md`
- Next: implement A sozinho, depois B1/B2/B3 em paralelo

## implementer A (impl-a-i18n-infra-and-settings-language-switch)

- 8 arquivos novos + menu-settings, auth-bootstrap, app-versions, format-time e callers; tocou também menu-notes-list e menu-reminders-list (callers de format-time, necessário p/ tsc)
- Orquestrador: lint:fix exit 0, typecheck exit 0. Pendente p/ validator: `expo config` (app.config.ts → app-versions.ts)
- Next: B1/B2/B3 em paralelo

## implementers B1/B2/B3 (paralelo)

- B1 layout/menu/login/recording: 8 dicionários, tsc 0. B2 chat: 4 dicionários, tsc 0 ("Ver input/Ver output" mantidos em `en` — sinalizar ao validator). B3 task-workspace: 2 dicionários + diffSummary(language), tsc 0.
- Orquestrador: lint:fix exit 0, typecheck exit 0
- Next: validate r1 (opus)

## validator (validate-language-switch-r1)

- Verdict: CHANGES_REQUIRED — `review-r1.md`
- Bloqueantes: code-block.tsx:36 "Show more/less" hardcoded; message-trace-strings.ts:4-5 en "Ver input/output" → "View input/output"
- Decisões do orquestrador (sem perguntar): reverter mudança de texto en do task-picker-list (manter comportamento anterior); aplicar consistência de copy pt-BR apontada; canal Android "Reminders" fica fora (texto do SO, não do app)
- Next: 1 implementer fresh (-fix1) cobrindo B1+B2 (B2 >80k → fresh); depois validate r2

## fix1 (impl-review-fixes-language-switch-fix1)

- 4 itens corrigidos; lint 0, tsc 0. Next: validate r2 (fresh)

## validator (validate-language-switch-r2)

- Verdict: APPROVED_WITH_RESALVAS — `review-r2.md`; bloqueantes r1 resolvidos, varredura sem texto em inglês hardcoded
- Resalvas aceitas sem correção: "fica pausado" vs "fica em pausa" (copy), ordem de imports em task-picker-list, `activityLabel` duplica parte de relativeTime (intencional)
- Rodadas: 2 (sinal registrado: fugiu do mecânico por copy/strings remanescentes)
- Next: system test — modo Docker+browser só (UI; mobile sem testes automatizados), browser-mobile-tester em :8081

## system test mode

- Mode: Docker+browser só — mudança só de UI no Expo; mobile sem testes automatizados

## tests-01 (test-language-switch-browser-r01)

- Result: PASS — `tests-01/verdict.md` (+ screenshots/); backend mockado via Playwright, login re-injetado
- Achado: trace meta em pt-BR "1 mensagens · 1 ferramentas" (plural); "CONTEXT" sem tradução. Decisão: corrigir ambos; "Input"/"Output" ficam (termo técnico, igual "Ver input"); datas ISO ficam; 404 `/tasks//detail` provavelmente pré-existente — fora do escopo
- Next: fix-after-test (sonnet fresh) → tests-02 focado

## fix after tests-01 (impl-trace-plural-language-switch-fix2)

- Plural en/pt-BR no trace meta (en também corrigido: "1 message"); fases context/format no dicionário. lint 0, tsc 0
- Next: tests-02 focado (fresh, tester-retry)
