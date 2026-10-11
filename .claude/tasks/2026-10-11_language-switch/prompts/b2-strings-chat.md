# Escopo B2: strings da página de chat

App: `packages/infra/mobile/ben`. Depende do escopo A e roda em paralelo com B1 (layout) e B3 (task-workspace).

## O que fazer

Migre para dicionários as strings visíveis de `src/pages/chat/**`. Pontos levantados pelo recon: `components/` (chat-empty-state, chat-top-banner, chat-top-bar, chat-footer, chat-history/message-trace-pressable, suggested-action, active-task-peek, typing-indicator, message-bubble, message-footers/*, message-actions-menu/*, message-trace-sheet/*, capture-card/*, task-picker/*), `hooks/` (ex.: use-microphone-permission, use-chat-input) e `stores/` (ex.: messages-store/message-builders.ts, se gerar texto visível). Fora do React, use `getStrings(...)`.
- `src/pages/chat/components/task-picker/task-picker-list.tsx:28` tem um `relativeTime` local em inglês. Troque pelo `relativeTime(iso, language)` de `@/layout/utils/format-time` e apague a cópia local.
- message-trace-sheet e message-actions-menu já chamam `absoluteDateTime(..., language)` desde o escopo A. Mantenha essas chamadas e traduza os rótulos (ex.: `'started'`, `'finished'` em `message-trace-output-step.tsx:20-21`).

Dicionários em `src/pages/chat/strings/{assunto}-strings.ts` (ex.: `chat-strings.ts`, `capture-card-strings.ts`, `message-trace-strings.ts`, `task-picker-strings.ts`).

## Footprint (dono)

Somente `src/pages/chat/**`.

## Decisões vinculantes (comuns aos escopos B)

- Parta do commit do escopo A, que já criou: `src/core/languages.ts` (`Language`, `Localized<Value>`, `LANGUAGE_LOCALES`), `src/layout/hooks/use-strings.ts` (`useStrings`, `useLanguage`), `src/layout/utils/get-strings.ts` (`getStrings` para código fora do React) e `src/layout/utils/format-time.ts` (as funções recebem `language` no fim). **Não edite esses arquivos.** Se faltar algo neles, avise no retorno.
- Forma do dicionário: `const en = { ... }` e `export const xStrings: Localized<typeof en> = { en, 'pt-BR': { ... } }`. Para frases com número ou nome, use funções (`(count: number) => ...`). Nos componentes: `const strings = useStrings(xStrings)`. Não existe `t()`, porque o lint `id-length` proíbe nomes de 1 letra.
- Migre todo texto visível escrito no mobile: filhos de JSX, `placeholder`, `accessibilityLabel`, títulos, estados vazios, de erro e de carregamento, e mensagens de erro geradas no app.
- NÃO traduza: dados do backend (títulos de tarefa, conteúdo de mensagens, nomes de modelo, erros do servidor), a marca "Ben", ids, slugs e valores técnicos em mono. Também não mexa em `testID`, chaves de log nem valores de union usados como lógica.
- Copy pt-BR na voz do inglês: minúsculas onde o inglês é minúsculo, "você", frases curtas. Glossário: task=tarefa, note=nota, reminder=lembrete, settings=configurações, sign in/out=entrar/sair, retry/try again=tentar de novo, workspace e to-do ficam iguais, chat=chat, just now=agora, yesterday=ontem.
- Mais de um escopo B roda **em paralelo** no mesmo working tree. Edite e commite **apenas** os arquivos do seu footprint. Faça `git add` com caminhos explícitos, nunca `git add -A` ou `.`. Se aparecer `index.lock`, espere e tente de novo. Sem push.
- Verificação: `pnpm exec eslint --fix <seus arquivos>` e `pnpm --filter @ben/mobile-ben typecheck`. Um erro de typecheck em arquivo fora do seu footprint não é seu: registre no retorno e siga.

## Convenções (leia)

`.claude/skills/code-get-coding-designs/designs/page-structure.md`, `.claude/skills/code-get-coding-designs/designs/mobile-app-structure.md`, `.claude/skills/code-write-code/general-coding-practices.md`, `.claude/skills/code-write-code/coding-patterns/lint.md`, `.claude/skills/code-write-code/coding-patterns/frontend/frontend-code-preferences.md`.

## Aceite

- Com o idioma em pt-BR, nenhum texto da UI do seu footprint aparece em inglês (salvo as exceções acima). Em `en`, tudo fica idêntico ao de hoje.
- `pnpm --filter @ben/mobile-ben typecheck` não tem erros nos seus arquivos, e o eslint passa nos seus arquivos.
- Commit(s) só com os seus arquivos.

Git: branch `feat/add-version-in-settings`, base `3ec6712` mais o commit do escopo A.
