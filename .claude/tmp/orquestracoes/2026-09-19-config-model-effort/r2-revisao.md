# Revisão do r1-plano.md

## Veredito
REPROVADO
O plano quebra o `tsc` do backend numa etapa que ele mesmo declara "pronta", deixa o tipo do use-case de
update pela metade e contraria um design documentado do mobile sem dizer que está contrariando.

## Correção do briefing do revisor (antes dos achados)
A instrução que recebi diz que `OPENROUTER_API_KEY` "está preenchida" em `project-backend/.env`. **Está
preenchida com um valor falso**: `OPENROUTER_API_KEY=fake-openrouter-key-…` (idem em `.env.development`;
`diff .env .env.development` → arquivos idênticos). Além disso, `npm run dev` roda com `NODE_ENV=development`
(`project-backend/package.json:6`) e `src/infra/services/env.ts:4-8` carrega `.env.development` nesse caso —
o `.env` nem é lido. Logo **não há chamada real ao modelo possível**, o `R5` do plano está certo e o
`## Plano de teste` com provas substitutas para os itens 3 e 4 **não precisa ser corrigido por esse motivo**.
Nenhum bloqueante foi aberto a partir desse "fato novo".

## Bloqueantes

1. **A Etapa 1 quebra `npx tsc --noEmit` e não enumera todos os criadores de `UserProps`.**
   - Onde no plano: `## Etapas` → Etapa 1 (linhas 149-164), que lista só `user.ts`,
     `login-or-register.ts` e `user-presenter.ts`, e afirma "*Pronto quando*: `npx tsc --noEmit` … nenhum erro".
   - Evidência no código real: `project-backend/src/infra/scripts/smoke-sqlite.ts:667` faz
     `userRepository.create({ name, username, email, avatarUrl, providerId, createdAt })` — sem os dois campos
     novos. `project-backend/tsconfig.json` tem `"include": ["./src"]`, então esse arquivo **é** type-checado.
     Baseline conferido agora: `npx tsc --noEmit` no backend sai `EXIT=0` (e no mobile também). Com
     `agentModelSlug: AgentModelSlug | null` e `agentEffort: AgentEffort | null` obrigatórios em `UserProps`
     (Contrato C1), esse `create` passa a ser erro de tipo → Definição de Pronto item 5 falha.
   - Padrão contrariado: `.claude/skills/code-write-code/coding-patterns/general-code-preferences.md`,
     §"Apply a change across every matching file and layer" ("Enumerate the siblings first, then cover them all").
   - O que precisa mudar: a Etapa 1 passa a editar também
     `/root/so/repos/ben-prototype/project-backend/src/infra/scripts/smoke-sqlite.ts` (acrescentar
     `agentModelSlug: null, agentEffort: null` no `create` do `runUserCases`), e o critério de pronto vira
     "`npx tsc --noEmit` limpo exceto os arquivos das etapas 2-6".

2. **O contrato do `UpdateAgentPreferencesUseCase` está pela metade: não existe caminho de `string` → `AgentModelSlug` que compile.**
   - Onde no plano: Etapa 5 (linhas 213-221) + `R4` (linhas 553-556) + Contrato C2 (`isSupportedEffort(slug: string, effort: string): boolean`).
     A Etapa 6 define `bodySchema = z.object({ modelSlug: z.string(), effort: z.string() })`, e o plano nunca
     escreve a assinatura do `Payload` do use-case.
   - Evidência no código real: `src/modules/domain/repository/repository.ts:52-55` tipa
     `update(id: ID, newProps: Partial<EntityClass['props']>)`, e `UserProps` (C1) tipa os campos como
     `AgentModelSlug | null` / `AgentEffort | null`. `isSupportedEffort` devolve `boolean`, não é type
     predicate, então **não estreita nada**: com `Payload { modelSlug: string }` a linha
     `userRepository.update(user.id, { agentModelSlug: modelSlug, … })` não compila; com
     `Payload { modelSlug: AgentModelSlug }` quem não compila é a rota, que entrega `string` vindo do Zod.
     O implementador sonnet tem que escolher entre `as AgentModelSlug`, type predicate ou mudar o Zod — ou seja,
     reprojetar, que é exatamente o que o plano promete não exigir (linha 4).
   - O que precisa mudar: fixar no Contrato C2 um parser de domínio, p.ex.
     `parseAgentSelection(slug: string, effort: string): AgentModelSelection` que lança
     `ValidationError({ errorField, code: 'UNSUPPORTED_AGENT_EFFORT' })` e devolve o par já tipado, e declarar
     o `Payload` do use-case como `{ userId: string; modelSlug: string; effort: string }` usando esse parser.

3. **A seção de settings do mobile contraria `feature-state-components-structure.md` sem dizer que contraria.**
   - Onde no plano: Etapa 9 (linhas 284-300) — `agent-settings-section.tsx` é um único componente que recebe
     `status: 'loading' | 'error' | 'ready'` e renderiza internamente skeleton, banda de erro e conteúdo.
   - Padrão contrariado: `.claude/skills/code-get-coding-designs/designs/feature-state-components-structure.md`
     — "A feature splits into a **container** that owns data and orchestration, a set of **status components**
     for the non-data states, and a **presentational** component", com "The branch order is fixed:
     loading → error/gone → empty → data → null" decidida **no container**. O repo aplica isso hoje em
     `project-mobile/src/layout/components/menu-list/` (`menu-list-loading.tsx`, `menu-list-error.tsx`,
     `menu-list-empty.tsx`) e em `menu-detail/item-detail-error.tsx` / `item-detail-gone.tsx`, usados pelo
     container `MenuNotesView`. O plano justifica a escolha do hook em vez de zustand (D11) e a escolha dos
     controles visuais (D9), mas **não** justifica juntar os estados num componente só.
   - O que precisa mudar: ou separar em `agent-settings-loading.tsx` / `agent-settings-error.tsx` +
     `agent-settings-section.tsx` (presentacional puro) e decidir **explicitamente** quem ramifica — `SettingsView`
     (container) escolhendo o nó e passando para `SettingsSheet`, ou `SettingsSheet` ramificando sobre
     `agent.status` —, ou escrever no plano a justificativa de manter inline. Do jeito que está, o sonnet
     decide sozinho.

## Não bloqueantes
- **Comentário em código.** Os Contratos C2 e C3 trazem comentários explicativos dentro do código
  (`// Tolera undefined…`, o bloco sobre `extraBody`). `.claude/skills/code-write-code/SKILL.md` §General Rules
  item 2: "Never comment the code, write self-explanatory code instead". `models.ts` tem comentários hoje, então
  é regra frouxa — mas o comentário do `extraBody` pertence ao plano, não ao arquivo final.
- **`errorField` errado para slug desconhecido.** Etapa 5 lança sempre `errorField: 'effort'`; se o slug é que
  é inválido, a resposta 400 aponta o campo errado (`{"effort":["UNSUPPORTED_AGENT_EFFORT#"]}`). Separar em
  `UNKNOWN_AGENT_MODEL` / `errorField: 'modelSlug'` custa uma linha.
- **Corrida entre otimismo e `invalidate()`** (Etapa 8): dois toques rápidos em chips diferentes disparam dois
  POSTs e dois refetchs; o `useEffect` sobre `state.data` pode reescrever o valor mais novo com o mais velho.
  Vale mandar o hook ignorar o dado do servidor enquanto `isPending`.
- **`findAgentModel` mascara slug desconhecido** com `?? AGENT_MODELS[0]` (C2, linha 392). Com a union é
  inalcançável; se o parser do bloqueante 2 passar a receber `string`, esse fallback vira o lugar onde um slug
  inválido some silenciosamente. Prefira devolver `AgentModelOption | null` e deixar o parser decidir.
- **Roteiro de teste não prova explicitamente a resposta "só os efforts suportados"**: acrescente, no passo 1,
  a checagem de que ao selecionar `GLM 5.3 Flash` o chip `none` **não** aparece (o modelo tem
  `reasoning.mandatory: true` no catálogo) — é a prova direta da 3ª resposta do usuário.
- **`project-design` fica fora.** O `code-get-project-context` descreve o sandbox de design como o passo
  anterior à implementação; o plano não desenha a seção lá. O briefing não pede e a Definição de Pronto só
  cobre backend e mobile, então tratei como fora de escopo — mas registre a decisão no plano em vez de omitir.

## O que verifiquei e está correto
- **D1 (sem migração)**: `prisma/schema.prisma` tem `model User { id, props, types }` e
  `SqliteRepository.toInfra` (`sqlite-repository.ts:240-244`) serializa os props inteiros como JSON. Nenhuma
  migração é necessária. `prisma/dev.db` existe e backend (3333) e mobile (8081) respondem 200 agora.
- **D2 (rota dedicada, não no login)**: `useAuthStore.hydrate` (`src/layout/stores/auth-store.ts`) reidrata o
  user do AsyncStorage sem relogar — a crítica do plano à alternativa procede.
- **D4/Etapa 4**: `BenAgentProviderService` recebe mesmo `LanguageModel` no construtor
  (`ben-agent-provider/index.ts:28`) e é instanciado module-scope em `routes/chat.ts:38` e
  `routes/tasks/create-task-message.ts:10-13`. As duas rotas estão cobertas, e `AgentService` não tem
  nenhuma outra implementação no repo.
- **D6 (`max` por `extraBody`)**: confirmado no pacote instalado v2.9.0 — `dist/index.d.ts:394` tipa o enum
  sem `max`, `extraBody?: Record<string, unknown>` existe, e em `dist/index.js` (getArgs do
  `OpenRouterChatLanguageModel`, ~linha 3598) `this.settings.extraBody` é espalhado **por último**, depois de
  `reasoning: this.settings.reasoning`. `extraBody.reasoning` vira `body.reasoning` e compila sem cast.
- **D7 (trace)**: `AgentCallTrace` (`adapters/agent-call-trace.ts:66-76`) tem `modelId: string | null` e é
  construído só em `buildAgentCallTrace`; `MessageTracePresenter` devolve `message.props.trace` inteiro, então
  os campos novos chegam ao mobile sem mudar o presenter. O espelho do mobile
  (`src/api/models/message-trace.ts`) e a pill de modelo (`message-trace-meta-strip.tsx`) estão como o plano descreve.
- **D8 (registro no domínio)**: `domain/utils/` existe com `auth.ts` e o doc `backend-domain-structure.md`
  reserva a pasta para helpers compartilhados; `adapters/` já importa domínio.
- **Catálogo**: `openrouter-models.json` confirma os 3 slugs, os `supported_efforts` e os `default_effort`
  exatamente como a constante `AGENT_MODELS` do C2 (deepseek low/high/max default high; glm low/high/max
  default max e `mandatory: true`; luna none…max default medium). `deepseek/deepseek-v4.1-flash` é o slug certo
  do "V4.1 Flash".
- **Rotas/HTTP**: `app.ts` registra tudo com `authMiddleware` e `errorHandler` por último; o `ValidationError`
  vira 400 com `{campo:["CODE#"]}` (`error-handler.ts`); o padrão rota-por-operação e o
  `http-route-handler.md` batem com a Etapa 6.
- **Mobile API**: `useAPIRequest`/`useAPIMutation` devolvem `{state, actions}`, `layout/hooks/api/use-*-data.ts`
  é o padrão real, `API_ROUTES` é o mapa único — Etapas 7 e 8 seguem `api-client-structure.md` e `api-data-hooks.md`.
- **Etapa 1 / `UserPresenter`**: o `Omit<… , 'createdAt'>` realmente quebraria sem o ajuste; a correção proposta
  é a certa e o modelo `User` do mobile não precisa mudar.
- **R6 (task sem trace)**: `CreateTaskMessageUseCase` não persiste `Message` nenhuma — só atualiza a task e
  devolve `benMessage`. O item 4 da Definição de Pronto é mesmo só do chat.
- **Teste/ambiente**: `seed-ambiente.ts` e `seed-trace.ts` existem na pasta da run anterior, o login por
  `localStorage['ben.jwttoken']` está documentado e foi executado em `r9-teste.md`, e o `authMiddleware` aceita
  `providerauthenticationtoken` qualquer enquanto o JWT não expirou (`verify-authentication.ts:25-30`) — os
  `curl` do plano funcionam como escritos.
- **Escopo**: nada de contrabando — `geminiModel` intocado, sem catálogo dinâmico, sem temperature/topP, sem
  tela nova; as 4 respostas do usuário (persistência por usuário + modelo/effort no trace, deepseek fixo em
  V4.1 Flash, efforts por modelo, chat + task) têm etapa que as entrega.
