# Escopo B3: strings da página task-workspace

App: `packages/infra/mobile/ben`. Depende do escopo A e roda em paralelo com B1 (layout) e B2 (chat).

## O que fazer

Migre para dicionários as strings visíveis de `src/pages/task-workspace/**`. Pontos levantados pelo recon: `page.tsx`, `components/` (diff-bar, sub-thread-banner, text-content, todo-content/{todo-content,add-todo-row,todo-list-item}, workspace-footer, workspace-sub-thread-banner, workspace-top-banner, workspace-top-bar), `hooks/use-workspace-input.ts` e `stores/*` (só se gerarem texto visível).
- `src/pages/task-workspace/utils/diff-summary.ts:14` (`'Ben revised the draft'`) é chamado no render de `components/diff-bar/diff-bar.tsx:21`. Passe a receber `language: Language` (o chamador usa `useLanguage()`) e tire o texto do dicionário.

Dicionários em `src/pages/task-workspace/strings/{assunto}-strings.ts` (ex.: `workspace-strings.ts`, `todo-strings.ts`).

## Footprint (dono)

Somente `src/pages/task-workspace/**`.

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
