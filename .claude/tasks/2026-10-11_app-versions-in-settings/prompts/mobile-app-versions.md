# Escopo — mobile-app-versions

Git: branch `feat/add-version-in-settings`, base `d2dbfe8`. `ben/` = `packages/infra/mobile/ben`.

## Arquivos que este escopo possui
- NOVO `ben/src/core/app-versions.ts`
- NOVO `ben/src/layout/components/menu-settings/app-version-item.tsx`
- NOVO `ben/src/layout/components/menu-settings/app-versions-section.tsx`
- `ben/src/layout/components/menu-settings/settings-sheet.tsx`
- `ben/src/layout/components/menu-settings/settings-view.tsx`
- `ben/app.config.ts`

## Decisões vinculantes
- Fonte única: `APP_VERSIONS`, ordenado da mais nova para a mais antiga. A primeira entrada é a versão do app, e o `app.config.ts` a lê.
- Entradas: 1.1.0 (`2026-10-11`, "App versions in settings") e 1.0.0 (`2026-05-23`, "First prototype"). Textos em inglês, com descrições conforme o plan.md. Confirme de leve que as features citadas na 1.0.0 existem: rotas em `ben/src/core/routes.ts` e "Ben's model" no settings.
  - 1.1.0: "Settings now lists recent app versions so you can tell which build you're testing. Tap a version to read what changed."
  - 1.0.0: "Sign in with Google, talk or type to Ben in the chat, open task workspaces, and pick Ben's model and effort in settings."
- A seção "App versions" (label-caps) fica entre "Ben's model" e "Sign out", com `v{CURRENT_APP_VERSION}` à direita do cabeçalho. Cada item mostra `v{version}`, o título e a data, e a descrição abre e fecha com um toque. Só o índice 0 começa aberto.
- Item próprio, sem reuso do `CollapsibleSection`, que tem título em caixa alta e botão de copiar. Copie o padrão de interação dele.
- `android.versionCode` e `package.json` não mudam. O app `design/` fica fora.

## Contrato
1. `core/app-versions.ts`, SEM nenhum import:
   `export type AppVersion = { version: string; date: string; title: string; description: string }`;
   `export const APP_VERSIONS = [...] as const satisfies readonly [AppVersion, ...AppVersion[]]`;
   `export const CURRENT_APP_VERSION = APP_VERSIONS[0].version`.
2. `app.config.ts:8`: `version: CURRENT_APP_VERSION`, com import relativo `./src/core/app-versions`.
3. `AppVersionItem({ version: AppVersion, defaultOpen?: boolean })`: `Pressable` com `accessibilityRole="button"` e `accessibilityState={{ expanded }}`, depois o chevron (Down/Right, 16, `onSurfaceVariant`), `v{version}` (label-caps `font-mono normal-case text-on-surface-variant`), o título (body-md `flex-1 font-semibold text-on-surface`, `numberOfLines={1}`) e a data (label-caps `normal-case text-on-surface-variant/70`). Aberto, mostra a descrição (body-md `text-on-surface-variant`). Fecha com o divisor `h-px bg-outline-variant/40`.
4. `AppVersionsSection()`: wrapper `gap-3 border-t border-outline-variant/40 px-5 pt-4 pb-5`, cabeçalho `flex-row justify-between` ("App versions" e `v{CURRENT_APP_VERSION}`) e a lista `APP_VERSIONS.map((v, i) => <AppVersionItem key={v.version} version={v} defaultOpen={i === 0} />)`.
5. `SettingsSheet`: nova prop `versionsSection?: ReactNode`, renderizada depois do bloco `agentSection` e antes do `<View className="px-5">` do sign out.
6. `SettingsView`: `versionsSection={<AppVersionsSection />}`.

## Moldes (path:line)
- Seção do sheet: `ben/src/layout/components/menu-settings/settings-sheet.tsx:120-130`. Sign out em 132-171.
- Accordion: `ben/src/layout/components/ui/collapsible-section.tsx:30-84`.
- Montagem no container: `ben/src/layout/components/menu-settings/settings-view.tsx:52-63`.
- Estilo de constante: `ben/src/core/routes.ts`.

## Convenções (siga)
- `.claude/skills/code-get-coding-designs/designs/mobile-app-structure.md`
- `.claude/skills/code-write-code/general-coding-practices.md`
- `.claude/skills/code-write-code/coding-patterns/frontend/react-components.md`
- `.claude/skills/code-write-code/coding-patterns/frontend/react-single-responsibility.md`
- `.claude/skills/code-write-code/coding-patterns/frontend/minimum-props-strategies.md`
- `.claude/skills/code-write-code/coding-patterns/mobile/mobile-icon-colors.md`

## Footprint que não pode quebrar
- `ben/src/pages/menu/page.tsx:49` e `ben/src/pages/chat/page.tsx:~125` consomem `SettingsView` sem mudança.
- O `agentSection`, o sign out e o retry continuam como estão.

## Aceite
1. `CURRENT_APP_VERSION === '1.1.0'`, e a lista tem 1.1.0 e depois 1.0.0.
2. Com um `ben/.env` fictício (não commitado), `npx expo config --type public` no `ben/` mostra `"version": "1.1.0"`.
3. `pnpm lint:fix` e `pnpm typecheck` na raiz passam.
4. A seção aparece no lugar certo, a 1.1.0 começa aberta e a 1.0.0 fechada, e o toque alterna cada item.
5. Commit único ao terminar (não faça push), seguindo o CLAUDE.md.
