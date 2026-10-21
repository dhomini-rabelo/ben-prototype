# Escopo B — mobile: idioma e switch de gasto via servidor (task preferencias-servidor)

Git: branch `feat/improve-ben`, base `86cf204`; roda DEPOIS do escopo A (backend já commitado). Tasks em sequência: modelos-gpt6 → **preferencias-servidor** → gasto-dolar → historico-agente. O código pode já conter as mudanças da task modelos-gpt6 (`api/models/agent-preferences.ts`, controles de modelo); integre, não reverta.

## Contrato da API (do escopo A)
- `GET /user-preferences/detail` → `{ item: { language: 'en' | 'pt-BR' | null, showUsdCost: boolean } }` (`language: null` = nunca salvo no servidor).
- `POST /user-preferences/update` body parcial `{ language?, showUsdCost? }` → mesmo `{ item }`.

## Decisões vinculantes
- Depois do login o servidor é a fonte de verdade. Antes do login e enquanto carrega vale o idioma local (`layout/stores/language-store.ts` + `storage/language-storage.ts` continuam como cache local; `hydrate` em `core/auth-bootstrap.ts:24` fica).
- Servidor com `language: null` → o app envia o idioma local uma vez.
- `showUsdCost` padrão `false`, global, legível pelo chat sem abrir configurações (a task gasto-dolar vai ler `useUserPreferencesStore((store) => store.showUsdCost)` na tela de chat).
- Gravação otimista na tela de configurações; erro de rede reverte ao valor anterior e mostra uma linha de erro localizada na seção que falhou. Sem retry dedicado.
- Logout: `showUsdCost` volta a `false`. Troca de usuário não pode aplicar preferências em cache do usuário anterior (`use-api-request.ts:20` tem `staleTime` de 5 min e `auth-store.ts:46-48` `clear()` não limpa o React Query): force buscar ao mudar `user.id` (por exemplo `refetch()` num efeito por `user?.id`) e diga no commit qual saída usou.

## O que construir (raiz `packages/infra/mobile/ben/`)
1. `src/api/models/user-preferences.ts`: `UserPreferences { language: Language | null; showUsdCost: boolean }` com `Language` de `@/core/languages`. Molde `src/api/models/agent-preferences.ts`.
2. `src/api/routes.ts`: `userPreferences: { detail: '/user-preferences/detail', update: '/user-preferences/update' }` (molde `:37-40`).
3. `src/api/requests/user-preferences.ts`: `requestUpdateUserPreferences(payload: Partial<UserPreferences>)` (molde `api/requests/agent-preferences.ts`).
4. `src/layout/hooks/api/use-user-preferences-data.ts` (molde `use-agent-preferences-data.ts`, aceita `enabled`).
5. `src/layout/stores/user-preferences-store.ts` (zustand, molde `language-store.ts`, sem storage local): `showUsdCost`, `setShowUsdCost`, `reset`. Chame `reset` no logout (onde `useAuthStore.clear` roda, ou dentro dele).
6. `src/layout/hooks/use-user-preferences-sync.ts`, montado em `app/(protected)/_layout.tsx` antes do `if` de redirect (hooks incondicionais, `enabled` só com usuário/token): ao chegar o `item`, se `language === null` envia o idioma local do language-store; senão aplica com `useLanguageStore.getState().setLanguage` quando diferir; aplica `showUsdCost` no store.
7. `src/layout/hooks/use-user-preferences.ts` (`{ state, actions }`, molde `use-agent-preferences.ts` + `use-api-mutation`): `selectLanguage(language)` e `setShowUsdCost(value)`, otimistas, revertendo em erro; `state` com `isSaving`, `languageError`, `usdCostError` (ou equivalente). Após sucesso, `invalidate()` o data hook.
8. `src/layout/components/ui/switch.tsx`: wrapper do `Switch` do `react-native` (não existe switch em `ui/`), props mínimas `value`, `onValueChange`, `disabled`, `accessibilityLabel`; cores dos tokens de `.claude/agents-docs/design-advisor/design.md` (veja como `ui/segmented-control.tsx` resolve cor).
9. `src/layout/components/menu-settings/usd-cost-section.tsx`: mesmo bloco visual de `language-section.tsx:20-29` (título `label-caps` + linha com rótulo e o switch) e a linha de erro.
10. `language-section.tsx:17,27`: `onChange` passa a usar `selectLanguage` do hook novo; mostra a linha de erro de idioma.
11. `settings-sheet.tsx` (props `:20-28`, render `:140`): prop `usdCostSection?: ReactNode` logo abaixo de `languageSection`. `settings-view.tsx:235`: passa `<UsdCostSection />`. Uma instância do hook de preferências compartilhada pelas duas seções (passe por props a partir de `settings-view` ou chame o hook em cada seção; escolha a que não duplica mutação).
12. `src/layout/strings/settings-strings.ts`: strings en/pt-BR (`Localized`): título "Cost" / "Custo", rótulo "Show cost in USD" / "Mostrar gasto em dólar", erros "Couldn't save. Try again." / "Não foi possível salvar. Tente de novo.".

## Convenções (leia antes de codar)
`.claude/skills/code-get-coding-designs/designs/{mobile-app-structure,api-client-structure}.md`, `.claude/skills/code-write-code/general-coding-practices.md`, `.claude/skills/code-write-code/coding-patterns/frontend/{api-data-hooks,react-components,react-single-responsibility,frontend-code-preferences,minimum-props-strategies}.md`, `.claude/skills/code-write-code/coding-patterns/mobile/mobile-icon-colors.md` (se usar cor por prop). Design: `.claude/agents-docs/design-advisor/design.md`.

## Não quebrar
- Tela de login e telas antes do login seguem no idioma local.
- Seção de agente (modelo/effort) e versões das configurações intactas.
- `useLanguageStore`/`useLanguage` continuam sendo a leitura de idioma de toda a UI.

## Aceite
- Servidor `language: null` → ao entrar, POST com o idioma local; servidor `pt-BR` e local `en` → ao entrar, UI em pt-BR sem abrir configurações.
- Configurações: switch nasce desligado; trocar idioma e switch persiste (recarregar mantém); falha de rede reverte e mostra a mensagem.
- `useUserPreferencesStore.getState().showUsdCost` correto na tela de chat logo após o login.
- Na raiz: `pnpm lint:fix`, `pnpm typecheck`, cada saída redirecionada para arquivo temporário fora do repositório, limpos (`pnpm test` não é necessário: não toca domínio).

## Arquivos que você possui
Os listados acima em `packages/infra/mobile/ben/` (inclui `app/(protected)/_layout.tsx` e o ponto de logout que chamar `reset`). Não toque em backend.

## Commit
Com os comandos limpos: commit só dos arquivos que tocou mais a pasta `.claude/tasks/2026-10-21_preferencias-servidor/`, mensagem `simple-loop(preferencias-servidor): implement — mobile lê e grava preferências no servidor`, terminando com a linha de co-autoria do sistema. Sem push.
