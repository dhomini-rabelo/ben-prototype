# Plano — app-versions-in-settings

Branch `feat/add-version-in-settings`, base `d2dbfe8`. Só frontend mobile (`packages/infra/mobile/ben`, abreviado `ben/`). Um escopo: `prompts/mobile-app-versions.md`.

## Premissas assumidas
- Os textos de UI ficam em inglês, no tom informal do app. O cabeçalho da seção é "App versions", em `label-caps`, que já renderiza em caixa alta, igual a "Ben's model".
- O item de versão é um componente próprio, sem reuso do `CollapsibleSection`, porque aquele põe o título em caixa alta e traz o botão de copiar. O item copia o padrão de interação do `CollapsibleSection` (`ben/src/layout/components/ui/collapsible-section.tsx:41-84`): `Pressable` com `accessibilityState.expanded`, `ChevronDown`/`ChevronRight` e divisor `h-px bg-outline-variant/40`.
- A seção é estática, não depende do backend e aparece mesmo quando "Ben's model" está em erro ou carregando.
- A data fica em ISO `YYYY-MM-DD`. A 1.0.0 usa a data do primeiro commit do repositório (`2026-05-23`, conferida com `git log --reverse`) e a 1.1.0 usa `2026-10-11`.
- O `android.versionCode` continua 1, e o `package.json` (`0.0.0`) não muda.
- Prova por imagem: um `ben/.env` local com valores fictícios, fora do commit, e login no web injetando `@ben/jwttoken` e `@ben/user` no localStorage via Playwright, em tela de 390x844. Prints em `{task_dir}/evidence/`.

## Decisões do usuário (vinculantes)
- Fonte única: `APP_VERSIONS` em `ben/src/core/app-versions.ts`, onde a primeira entrada é a versão atual. O `app.config.ts` lê a versão dali.
- Conteúdo: semver + data + título + descrição. Só duas entradas, 1.1.0 (esta feature, a primeira da lista) e 1.0.0 (o protótipo atual), em inglês.
- Layout: seção inline "App versions" entre "Ben's model" e "Sign out". O cabeçalho mostra a versão atual, e cada item mostra o número e o título. A descrição abre e fecha com um toque, e só a mais recente começa aberta.
- Design sandbox: fica fora do escopo. Só o mobile muda.

## Convenções aplicáveis
- `.claude/skills/code-get-coding-designs/designs/mobile-app-structure.md` (`core/` para constantes; `layout/components/` para o que é compartilhado)
- `.claude/skills/code-write-code/general-coding-practices.md`
- `.claude/skills/code-write-code/coding-patterns/frontend/react-components.md`
- `.claude/skills/code-write-code/coding-patterns/frontend/react-single-responsibility.md`
- `.claude/skills/code-write-code/coding-patterns/frontend/minimum-props-strategies.md`
- `.claude/skills/code-write-code/coding-patterns/mobile/mobile-icon-colors.md`

## Desenho
1. **Novo `ben/src/core/app-versions.ts`**, sem nenhum import para que o `app.config.ts` consiga carregá-lo:
   - `export type AppVersion = { version: string; date: string; title: string; description: string }`
   - `export const APP_VERSIONS = [ {1.1.0…}, {1.0.0…} ] as const satisfies readonly [AppVersion, ...AppVersion[]]`. A tupla não vazia garante que `APP_VERSIONS[0]` nunca seja `undefined`.
   - `export const CURRENT_APP_VERSION = APP_VERSIONS[0].version`
   - Comentário de uma linha: "newest first; the first entry is the app version (app.config.ts reads it)".
2. **`ben/app.config.ts:8`**: `version: CURRENT_APP_VERSION`, com `import { CURRENT_APP_VERSION } from './src/core/app-versions'`. O import é relativo porque o alias `@/` não vale no config.
3. **Novo `ben/src/layout/components/menu-settings/app-version-item.tsx`**: `AppVersionItem({ version, defaultOpen })`. É uma linha `Pressable` com chevron, `v{version}` (label-caps, `font-mono normal-case`), o título (body-md, semibold, `flex-1`, `numberOfLines={1}`) e a data (label-caps, normal-case, `/70`). Aberto, mostra a descrição em body-md `text-on-surface-variant`. Usa `useState(defaultOpen ?? false)` e termina com o divisor.
4. **Novo `ben/src/layout/components/menu-settings/app-versions-section.tsx`**: `AppVersionsSection()` renderiza a seção inteira: o wrapper igual a `settings-sheet.tsx:121` (`gap-3 border-t border-outline-variant/40 px-5 pt-4 pb-5`), um cabeçalho em linha com "App versions" à esquerda e `v{CURRENT_APP_VERSION}` à direita, e a lista `APP_VERSIONS.map` com `key=version` e `defaultOpen={index === 0}`.
5. **`settings-sheet.tsx`**: nova prop `versionsSection?: ReactNode`, renderizada entre o bloco `agentSection` (120-130) e o de sign out (132). O sheet continua apresentacional.
6. **`settings-view.tsx:52-63`**: passa `versionsSection={<AppVersionsSection />}`.

Textos (o implementador pode polir a redação sem mudar o sentido):
- 1.1.0, "App versions in settings": "Settings now lists recent app versions so you can tell which build you're testing. Tap a version to read what changed."
- 1.0.0, "First prototype": "Sign in with Google, talk or type to Ben in the chat, open task workspaces, and pick Ben's model and effort in settings."
  O implementador confirma de leve no código (rotas `login`, `chat`, `menu`, `tasks/[taskId]` e "Ben's model") que cada feature citada existe.

## Melhorias estruturais
- A versão tem fonte única (`APP_VERSIONS[0]`), e o `app.config.ts` a importa. Adicionar uma versão nova na lista atualiza a versão nativa e o cabeçalho de uma vez.
- A tupla não vazia com `satisfies` faz o compilador acusar uma lista vazia ou uma entrada sem campo obrigatório.

## Melhorias estruturais sugeridas (fora do escopo)
- `packages/infra/mobile/design/src/layout/components/menu/settings-sheet.tsx` está defasado em relação ao mobile: não tem "Ben's model" nem "App versions". Fica para outra task, alinhar o design sandbox com o sheet do mobile.
- `android.versionCode` é incrementado à mão. Pode derivar do semver no futuro, quando houver build de loja.

## Fora do escopo
- O app `design/`, o backend, o domínio, o `package.json` e o `versionCode`.

## Critérios de aceite
1. `APP_VERSIONS` existe em `ben/src/core/app-versions.ts` com 1.1.0 e depois 1.0.0. `CURRENT_APP_VERSION === '1.1.0'`.
2. `npx expo config --type public` (no `ben/`, com o `.env` fictício) mostra `"version": "1.1.0"`.
3. A seção "App versions" aparece no Settings entre "Ben's model" e "Sign out", com `v1.1.0` no cabeçalho.
4. A 1.1.0 começa aberta, com a descrição visível, e a 1.0.0 começa fechada. Um toque alterna cada uma, o chevron e o `aria-expanded` acompanham.
5. `pnpm lint:fix` e `pnpm typecheck` passam na raiz. Não há testes automatizados para o mobile.
6. Três prints em `{task_dir}/evidence/`: estado inicial, depois de abrir a 1.0.0 e depois de fechar a 1.1.0.

## Modo de teste de sistema
UI via `browser-mobile-tester` (Playwright, :8081, 390x844), com o login injetado no localStorage. O backend é opcional, porque a seção é estática.
