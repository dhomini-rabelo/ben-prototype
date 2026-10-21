# Plano — preferencias-servidor (base 86cf204, feat/improve-ben)

Pedido (briefing task 2): idioma (hoje só local, task 2026-10-11_language-switch) e novo switch "mostrar gasto em dólar" (padrão desligado) salvos no User no servidor, expostos pela API e lidos/gravados pela tela de configurações do mobile. Exibir o gasto NÃO é desta task (gasto-dolar consome o flag no chat).

Perguntas: sem dúvidas (gate já feito no briefing).

## Premissas assumidas
1. Endpoints novos, separados de agent-preferences: `GET /user-preferences/detail` e `POST /user-preferences/update`. Agent-preferences continua intacto (é consumido pelo chat e por tarefas como `AgentModelSelection`).
2. `UserProps` ganha `language: UserLanguage | null` e `showUsdCost: boolean`. `UserLanguage` = `'en' | 'pt-BR'`, mesmo conjunto de `packages/infra/mobile/ben/src/core/languages.ts` (`LANGUAGES`). Os dois lados mantêm a lista; não há pacote compartilhado (mobile não importa domínio).
3. User é JSON em `users.props` (schema.prisma:60-66): sem migration. Usuários antigos vêm sem os campos; a leitura resolve `language ?? null` e `showUsdCost ?? false` num util único.
4. Resposta do GET/UPDATE: `{ item: { language: 'en' | 'pt-BR' | null, showUsdCost: boolean } }`. `language: null` = nunca salvo no servidor.
5. Update é parcial: body `{ language?: string, showUsdCost?: boolean }`; grava só o que veio e devolve as preferências resolvidas. Body vazio = no-op que devolve o atual. Idioma fora da lista → `ValidationError { errorField: 'language', code: 'UNSUPPORTED_USER_LANGUAGE' }` (molde update-agent-preferences).
6. Novo usuário (login-or-register) nasce com `language: null`, `showUsdCost: false`.
7. Mobile, fonte de verdade: depois do login o servidor manda. Antes do login e enquanto carrega vale o idioma local (language-store + language-storage continuam como cache local). Se o servidor devolver `language: null`, o app envia o idioma local uma vez (primeira sincronização).
8. Sincronização: hook `useUserPreferencesSync` montado em `app/(protected)/_layout.tsx` (único ponto por onde passam boot com token e login). Aplica `language` no language-store e `showUsdCost` num store global novo.
9. Flag acessível ao chat: store zustand global `layout/stores/user-preferences-store.ts` com `showUsdCost: boolean` (padrão `false`). gasto-dolar lê `useUserPreferencesStore((store) => store.showUsdCost)`.
10. Gravação na tela de configurações é otimista: aplica na hora, chama a API, em erro reverte ao valor anterior e mostra uma linha de erro localizada na seção. Sem retry dedicado (o usuário toca de novo).
11. Troca de usuário: o cache do React Query (staleTime 5 min, `use-api-request.ts:20`) não pode aplicar preferências do usuário anterior; o sync força buscar ao mudar `user.id` (detalhe no prompt B). No logout o `showUsdCost` do store volta a `false`.
12. Switch visual: componente novo `layout/components/ui/switch.tsx` sobre o `Switch` do react-native (não existe switch em `ui/`). Cores dos tokens de `.claude/agents-docs/design-advisor/design.md`. Sem passo no sandbox de design (controle simples, padrão da plataforma).
13. Seção nova na folha de configurações: "Mostrar gasto em dólar" / "Show cost in USD", logo abaixo da seção de idioma, via prop `usdCostSection?: ReactNode` (molde `languageSection`).

## Convenções aplicáveis
- Backend: `.claude/skills/code-get-coding-designs/designs/backend-domain-structure.md`, `.../designs/backend-http-layer-structure.md`, `.claude/skills/code-write-code/coding-patterns/backend/{use-case-structure,use-case-response-structure,domain-entity-declaration,http-route-handler,http-presenter,backend-code-preferences}.md`, `.../coding-patterns/automated-testing.md`.
- Mobile: `.claude/skills/code-get-coding-designs/designs/{mobile-app-structure,api-client-structure}.md`, `.claude/skills/code-write-code/coding-patterns/frontend/{api-data-hooks,react-components,react-single-responsibility,frontend-code-preferences}.md`.
- Gerais: `.claude/skills/code-write-code/general-coding-practices.md`, `.../coding-patterns/general-code-preferences.md`, `.../coding-patterns/lint.md`.

## Arquitetura
### Escopo A — backend (prompt `prompts/a-backend-user-preferences.md`)
- `packages/domain/user/src/enterprise/entities/user.ts`: `USER_LANGUAGES = ['en', 'pt-BR'] as const`, `UserLanguage`, props `language`, `showUsdCost`.
- `packages/domain/user/src/application/utils/user-preferences.ts`: `UserPreferences = Pick<UserProps, 'language' | 'showUsdCost'>`, `isUserLanguage(value)`, `resolveUserPreferences(props)` (defaults de premissa 3).
- `packages/domain/user/src/application/use-cases/user-preferences/{get,update}-user-preferences.ts` + `__tests__/` (molde agent-preferences).
- `login-or-register.ts:61` (novos campos), factory `application/__tests__/factories/user.ts:19`, `packages/infra/db/scripts/smoke-sqlite.ts:676`, testes que montam UserProps.
- `packages/infra/server-ben/src/routes/user-preferences/{get,update}-user-preferences.ts`, `presenters/user-preferences-presenter.ts`, registro em `app.ts:83-84`.
- `presenters/user-presenter.ts`: incluir `'language' | 'showUsdCost'` no `Omit`.
### Escopo B — mobile (prompt `prompts/b-mobile-user-preferences.md`), depois de A
- `api/models/user-preferences.ts`, `api/requests/user-preferences.ts`, `api/routes.ts` (`userPreferences`), `layout/hooks/api/use-user-preferences-data.ts`.
- `layout/stores/user-preferences-store.ts`, `layout/hooks/use-user-preferences-sync.ts` (montado em `app/(protected)/_layout.tsx`), `layout/hooks/use-user-preferences.ts` (ações da tela).
- `layout/components/ui/switch.tsx`, `layout/components/menu-settings/usd-cost-section.tsx`, `language-section.tsx` passa a gravar via hook, `settings-sheet.tsx` + `settings-view.tsx` (prop `usdCostSection`), `layout/strings/settings-strings.ts` (en/pt-BR).

## Melhorias estruturais (no contrato)
- `UserPresenter` usa `Omit<Serialize<WithID<UserProps>>, …>`: as props novas viram erro de tipo até entrarem no `Omit`, e isso força a decisão consciente de não vazá-las no `/auth`.
- `UserPreferences` derivado de `UserProps` por `Pick` com a lista explícita das chaves de preferência; presenter tipado `Serialize<UserPreferences>`; payload do update `Partial<UserPreferences>`. Uma preferência nova entra em `UserProps` + na união de chaves, e o presenter/resolve quebram até tratá-la.
- Mobile: `UserPreferences.language` tipado com `Language` de `core/languages.ts`, não com string.

## Melhorias estruturais sugeridas (fora do escopo)
- `USER_LANGUAGES` (domínio) e `LANGUAGES` (mobile) são listas duplicadas; um teste de contrato ou pacote de constantes compartilhado evitaria divergência.
- `useAuthStore.clear()` não limpa o cache do React Query; agent-preferences tem o mesmo risco de cache entre usuários.

## Critérios de aceite
1. `GET /user-preferences/detail` de usuário antigo (sem campos) → `{ item: { language: null, showUsdCost: false } }`.
2. `POST /user-preferences/update` com `{ showUsdCost: true }` persiste e não altera `language`; com `{ language: 'pt-BR' }` idem; `{ language: 'fr' }` → erro de validação com o mesmo status que `UNKNOWN_AGENT_MODEL` recebe hoje no error-handler.
3. `/auth/login-or-register` não passa a expor `language`/`showUsdCost`.
4. Testes de use case get/update passam; `pnpm lint:fix`, `pnpm typecheck` e `pnpm test` limpos na raiz.
5. Mobile: com servidor `language: null`, ao entrar o app envia o idioma local; com servidor `pt-BR` e local `en`, ao entrar a UI muda para pt-BR.
6. Configurações: trocar idioma e o switch persistem no servidor (recarregar a página mantém); switch nasce desligado; erro de rede reverte e mostra mensagem.
7. `useUserPreferencesStore.getState().showUsdCost` reflete o servidor em qualquer tela protegida (inclusive o chat) sem abrir as configurações.

## Fora do escopo
Exibir/gravar custo (gasto-dolar), catálogo de modelos (modelos-gpt6), histórico (historico-agente), mudanças em agent-preferences, design sandbox, push/PR.

## Teste de sistema recomendado
Browser (web :8081, 390x844) com server-ben rodando: os critérios 5-7 só aparecem no app real; 1-3 por HTTP (curl com JWT) no mesmo run.
