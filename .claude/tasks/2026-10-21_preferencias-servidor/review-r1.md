APPROVED_WITH_RESALVAS

# Review r1 — preferencias-servidor (escopo A 99a8cee, escopo B df1d335)

Revisado: diff de código de 99a8cee (backend) e df1d335 (mobile) contra `prompts/a-backend-user-preferences.md`, `prompts/b-mobile-user-preferences.md`, `plan.md` e as premissas do briefing. Typecheck/lint/test não foram re-rodados (resultados do implementer: lint:fix e typecheck exit 0; test exit 0 no escopo A).

## Completude

### Escopo A — backend: completo
- `USER_LANGUAGES`/`UserLanguage` e props `language`, `showUsdCost` em `user.ts`; lista bate com `LANGUAGES` do mobile (`en`, `pt-BR`).
- `application/utils/user-preferences.ts`: `UserPreferenceKey`, `UserPreferences = Pick<UserProps, UserPreferenceKey>`, `isUserLanguage`, `resolveUserPreferences` com `?? null` / `?? false` (tolera user antigo).
- Use cases get/update no molde de agent-preferences; update parcial, no-op sem campos, `ValidationError { errorField: 'language', code: 'UNSUPPORTED_USER_LANGUAGE' }` antes de gravar (mesmo tratamento de `UNKNOWN_AGENT_MODEL` no error-handler).
- `Repository.update` faz merge (`{ ...item.props, ...newProps }`), então update parcial não toca o outro campo.
- Testes cobrem: user legado sem campos → `{ null, false }`; update parcial de cada campo; idioma inválido lança e não grava; user inexistente.
- `login-or-register.ts`, factory, `login-or-register.test.ts`, `smoke-sqlite.ts` atualizados; grep de `agentEffort` não acha outro ponto que monte `UserProps`.
- Rotas, presenter `Serialize<UserPreferences>`, registro em `app.ts`, `Omit` do `UserPresenter` ampliado (não trocado por `Pick`): `/auth` não expõe as preferências. Agent-preferences intacto.

### Escopo B — mobile: completo
- Model, rota, request, data hook (com `enabled`), store zustand com `reset`, sync montado antes do `if` de redirect no layout protegido, hook de ações otimistas com revert e erro por seção, `ui/switch.tsx`, `usd-cost-section.tsx`, `language-section` gravando via hook, prop `usdCostSection` abaixo de `languageSection`, strings en/pt-BR conforme o contrato.
- Uma instância de `useUserPreferences` em `settings-view.tsx`, passada por props às duas seções (sem mutação duplicada).
- Logout: `reset()` dentro de `auth-store.ts` `clear()` (cobre também o handler de 401 em `auth-bootstrap.ts:17`).
- Troca de usuário: `refetch()` em efeito por `user.id` + `removeQueries` da detail ao desmontar o layout protegido; saída declarada no corpo do commit, como pedido. O logout faz `router.replace(ROUTES.login)` para `app/index.tsx` (fora de `(protected)`), então o layout desmonta e o cache sai.
- `language: null` no servidor → POST único do idioma local (guardado por ref, re-armado em falha e em troca de usuário). O language-store só é hidratado antes de `isReady` (`auth-bootstrap.ts`), então o idioma enviado é o local real, não o default.

## Ressalvas (não bloqueiam; registrar)

1. `packages/infra/mobile/ben/src/layout/components/ui/switch.tsx:11` — `const TRACK_OFF = '#c4c7c7'` é hex local. A convenção `coding-patterns/mobile/mobile-icon-colors.md` (vale para props nativas que não aceitam className, caso de `trackColor`) diz para adicionar um export nomeado em `src/layout/utils/colors.ts` espelhando o token do `tailwind.config.js` (`outline-variant: '#c4c7c7'`). Correto: `export const outlineVariant = '#c4c7c7'` em `colors.ts` e `trackColor={{ false: outlineVariant, true: primary }}`.
2. `packages/infra/mobile/ben/src/layout/components/menu-settings/language-section.tsx:37` e `usd-cost-section.tsx:35` — o texto de erro usa `style={{ color: textError }}`. Os textos de erro existentes usam a classe do token (`className="text-text-error"`, ex. `agent-settings-controls.tsx:67`, `item-detail-error.tsx:19`); o hex de `colors.ts` é para props nativas/ícones. Correto: `<Typography variant="button-text" className="text-text-error">` e remover o import de `textError`.
3. `packages/infra/mobile/ben/src/layout/hooks/use-user-preferences.ts:61` — `state.isSaving` é exposto (como pedia o contrato) mas nenhum consumidor usa; o switch e o segmented não ficam `disabled` durante a gravação. Toques rápidos geram mutações concorrentes; o revert usa o `previous` capturado no clique, e o `invalidate()` final converge para o servidor, então o estado final fica correto. No máximo uma oscilação visual. Registrar, sem correção obrigatória.
4. `packages/infra/mobile/ben/src/layout/hooks/use-user-preferences-sync.ts:13` — o sync só liga com `user?.id`. Com token em cache e user ausente no storage (`auth-store.ts` `hydrate` → `user: null`), o layout protegido ainda abre (`_layout.tsx` aceita só o token) e as preferências não sincronizam. É um estado de borda pré-existente do app (outras telas também dependem do `user`), não introduzido aqui. Não verifiquei se ele ocorre na prática.
5. Commit do escopo A usa `implement-backend — …` em vez do texto pedido `implement — backend de preferências do usuário`. Só cosmético.

## Correção — sem bug funcional encontrado
- Update vazio não grava (`Object.keys(changes).length === 0`).
- Resposta pós-update é `resolveUserPreferences({ ...user.props, ...changes })`, o mesmo merge que o repositório aplica.
- `refetch` do TanStack Query é estável (ligado ao observer); o efeito por `userId` não entra em loop. Na primeira montagem, o fetch em andamento sem dado é deduplicado pelo Query, sem request duplicado.
- `removeQueries({ queryKey: [detail] })` casa por prefixo com a chave `[url, undefined]` do `useAPIRequest`.

## Critérios de aceite do plano
1–4 (backend): atendidos pelo código e pelos testes de use case. 5–7 (mobile): atendidos no código; a confirmação no app real fica com o teste de sistema (browser + HTTP), como o plano recomenda.
