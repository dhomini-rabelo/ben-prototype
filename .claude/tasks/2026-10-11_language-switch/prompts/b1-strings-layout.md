# Escopo B1: strings do layout compartilhado, app/, login e menu

App: `packages/infra/mobile/ben`. Depende do escopo A e roda em paralelo com B2 (chat) e B3 (task-workspace).

## O que fazer

Migre para dicionários as strings visíveis destes arquivos (levantamento do recon, confira cada um):
- `app/**` (ex.: `app/_layout.tsx`, `app/(protected)/_layout.tsx`, `app/(protected)/tasks/[taskId].tsx`)
- `src/pages/login/**`, `src/pages/menu/**`
- `src/layout/components/{menu,menu-list,menu-detail,menu-tasks,menu-notes,menu-reminders,chat-input,chat-banner,ui,icons}/**`, `src/layout/components/{recording-bar,brand-mark,wave-bar}.tsx`
- `src/layout/stores/voice-store/recorder.ts:10` (`'Could not access the microphone.'`): use `getStrings(...)` na hora de emitir o erro, não numa constante de módulo.
- `src/layout/hooks/**`, `src/layout/stores/**`, `src/api/**`, `src/services/**`: só se tiverem texto visível ao usuário.
- Nos componentes de `ui/` com texto default (ex.: copy-button, collapsible-section), o default vem do dicionário.

Dicionários em `src/layout/strings/{assunto}-strings.ts` (ex.: `menu-strings.ts`, `menu-detail-strings.ts`, `chat-input-strings.ts`, `recording-strings.ts`, `ui-strings.ts`, `login-strings.ts`). Os de uma página só (login, menu) vão em `src/pages/{page}/strings/{assunto}-strings.ts`.

## Footprint (dono)

`app/**`, `src/pages/{login,menu}/**`, `src/layout/**`, `src/api/**`, `src/services/**`, **EXCETO** os arquivos do escopo A: `src/layout/components/menu-settings/**`, `src/layout/stores/language-store.ts`, `src/layout/hooks/use-strings.ts`, `src/layout/utils/{get-strings,format-time}.ts`, `src/layout/strings/{settings,format-time}-strings.ts`. Nos arquivos de menu-detail e menu-tasks que já chamam format-time com `language`, mantenha essas chamadas.

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
