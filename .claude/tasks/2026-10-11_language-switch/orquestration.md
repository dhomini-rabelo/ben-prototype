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
