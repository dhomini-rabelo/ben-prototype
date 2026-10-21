# Escopo A — backend: preferências do usuário no servidor (task preferencias-servidor)

Git: branch `feat/improve-ben`, base `86cf204`. Tasks em sequência: modelos-gpt6 → **preferencias-servidor** → gasto-dolar → historico-agente. O código pode já conter as mudanças da task modelos-gpt6 (catálogo em `agent-models.ts`, entidade User); integre, não reverta.

## Contrato
Salvar no User `language` (idioma do app) e `showUsdCost` (switch "mostrar gasto em dólar", padrão desligado), expostos por `GET /user-preferences/detail` e `POST /user-preferences/update`.

1. `packages/domain/user/src/enterprise/entities/user.ts`: exportar `USER_LANGUAGES = ['en', 'pt-BR'] as const` e `type UserLanguage`; em `UserProps` adicionar `language: UserLanguage | null` e `showUsdCost: boolean`. A lista tem de bater com `packages/infra/mobile/ben/src/core/languages.ts` (`LANGUAGES`).
2. `packages/domain/user/src/application/utils/user-preferences.ts` (molde `application/utils/agent-models.ts:40-45`, que tolera prop ausente): `type UserPreferenceKey = 'language' | 'showUsdCost'`, `type UserPreferences = Pick<UserProps, UserPreferenceKey>`, `isUserLanguage(value: unknown): value is UserLanguage`, `resolveUserPreferences(props)` → `{ language: props.language ?? null, showUsdCost: props.showUsdCost ?? false }` (users antigos não têm os campos no JSON; não há migration).
3. Use cases em `packages/domain/user/src/application/use-cases/user-preferences/` (molde `use-cases/agent-preferences/{get,update}-agent-preferences.ts`):
   - `GetUserPreferencesUseCase` `{ userId }` → `ItemResponse<UserPreferences>` via `resolveUserPreferences`.
   - `UpdateUserPreferencesUseCase` `{ userId, language?: string, showUsdCost?: boolean }`: idioma presente e fora da lista → `ValidationError({ errorField: 'language', code: 'UNSUPPORTED_USER_LANGUAGE' })`; grava só os campos presentes (`userRepository.update(user.id, {...})`); devolve as preferências resolvidas após a gravação. Payload sem campos = no-op que devolve o atual.
   - Testes em `__tests__/get-user-preferences.test.ts` e `update-user-preferences.test.ts` (molde `agent-preferences/__tests__/`): user sem campos → `{ null, false }`; update parcial de cada campo não toca o outro; idioma inválido lança e não grava.
4. Criação e dublês: `use-cases/auth/login-or-register.ts:61` cria com `language: null, showUsdCost: false`; factory `application/__tests__/factories/user.ts:19` aceita os dois com os mesmos padrões; ajuste testes que montam `UserProps` inteiro (`login-or-register.test.ts:73`, testes de agent-preferences) e `packages/infra/db/scripts/smoke-sqlite.ts:676`. Rode `grep -rn "agentEffort" packages --include=*.ts` para achar qualquer outro ponto que monte UserProps.
5. HTTP em `packages/infra/server-ben/src/`:
   - `presenters/user-preferences-presenter.ts`: `UserPreferencesPresenter.toHttp(preferences: UserPreferences): Serialize<UserPreferences>` (molde `presenters/agent-preferences-presenter.ts`).
   - `routes/user-preferences/get-user-preferences.ts` e `update-user-preferences.ts` (molde `routes/agent-preferences/*.ts`; body Zod `z.object({ language: z.string().optional(), showUsdCost: z.boolean().optional() })`), resposta `{ item: … }`.
   - `app.ts` (junto de `:83-84`): `app.get('/user-preferences/detail', authMiddleware, …)` e `app.post('/user-preferences/update', authMiddleware, …)`.
   - `presenters/user-presenter.ts:71-74`: acrescentar `'language' | 'showUsdCost'` ao `Omit` (o `/auth` não expõe preferências).

## Segurança estrutural (parte do contrato)
- Não troque o `Omit` do UserPresenter por `Pick`: ele é o que obriga cada prop nova de User a ser decidida.
- `UserPreferences` vem de `UserProps` por `Pick` com `UserPreferenceKey`; presenter e payload derivam dele (`Serialize<UserPreferences>`, `Partial<UserPreferences>`), sem tipos irmãos duplicados.

## Convenções (leia antes de codar)
`.claude/skills/code-get-coding-designs/designs/backend-domain-structure.md`, `.../designs/backend-http-layer-structure.md`, `.claude/skills/code-write-code/general-coding-practices.md`, `.claude/skills/code-write-code/coding-patterns/backend/{use-case-structure,use-case-response-structure,domain-entity-declaration,http-route-handler,http-presenter,backend-code-preferences}.md`, `.claude/skills/code-write-code/coding-patterns/automated-testing.md`.

## Não quebrar
- `GET /agent-preferences/detail`, `POST /agent-preferences/update` e `resolveAgentSelection` (usado em `routes/chat.ts` e `routes/tasks/create-task-message.ts`): sem mudança de comportamento.
- Resposta de `/auth/login-or-register` idêntica à de hoje.

## Aceite
- User antigo → GET devolve `{ item: { language: null, showUsdCost: false } }`.
- Update `{ showUsdCost: true }` não muda `language`, e vice-versa; `{ language: 'fr' }` → erro de validação (mesmo tratamento de `UNKNOWN_AGENT_MODEL`).
- Na raiz: `pnpm lint:fix`, `pnpm typecheck`, `pnpm test`, nessa ordem, cada saída redirecionada para um arquivo temporário (fora do repositório), todos limpos.

## Arquivos que você possui
Os listados acima em `packages/domain/user/`, `packages/infra/server-ben/src/{app.ts,routes/user-preferences/,presenters/user-preferences-presenter.ts,presenters/user-presenter.ts}`, `packages/infra/db/scripts/smoke-sqlite.ts`. Não toque em `packages/infra/mobile/`.

## Commit
Ao terminar e com os três comandos limpos: commit só dos arquivos que tocou mais a pasta `.claude/tasks/2026-10-21_preferencias-servidor/`, mensagem `simple-loop(preferencias-servidor): implement — backend de preferências do usuário`, terminando com a linha de co-autoria do sistema. Sem push.
