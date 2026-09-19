# Revisão do r3-plano-v2.md (rodada 3)

## Veredito
REPROVADO
Os 2 bloqueantes da r4 fecharam de verdade (conferidos no código, não só no texto). Mas a correção do
não-bloqueante "`| null` desnecessário em C9" trocou o defeito de estado obsoleto por um defeito de
ramificação: o ramo de erro da seção fica inalcançável na falha mais comum (a primeira carga), e o
`retry()` depois de um save falho não tem de onde tirar o par que vai repetir. São dois furos pequenos,
com correção de uma linha cada, mas os dois fazem a implementação sair errada se o sonnet seguir o plano
ao pé da letra — que é exatamente o que o plano manda fazer.

## Bloqueantes

1. **A ordem de ramificação da Etapa 10 deixa `AgentSettingsError` inalcançável: falha de carga vira
   skeleton infinito, sem retry.**
   - Onde no plano: Etapa 10 (bloco `const agentSection = …`, ~linhas 354-372) combinada com a derivação
     de `status` da Etapa 8 (~linha 300):
     ```tsx
     agent.state.status === 'loading' || agent.state.selection === null ? <AgentSettingsLoading />
       : agent.state.status === 'error' ? <AgentSettingsError … /> : <AgentSettingsControls … />
     ```
     com `status = state.isLoading ? 'loading' : state.isError || selection === null ? 'error' : 'ready'`.
   - Problema concreto: quando o `GET /agent-preferences/detail` falha na primeira abertura do sheet,
     `isLoading = false`, `isError = true` e `selection` **nunca** saiu de `null` (o `useEffect` só
     escreve `confirmed` a partir de `state.data`, que não existe). O primeiro ramo testa
     `selection === null` **antes** do erro, então renderiza `<AgentSettingsLoading />` para sempre.
     `<AgentSettingsError onRetry={…} />` só aparece quando `selection !== null` **e** `isError` — isto é,
     só numa falha de refetch depois de uma carga bem-sucedida. O componente que a Etapa 9 cria, e que a
     r2 exigiu criar, nasce morto no caminho principal, e o usuário fica sem botão de retry.
   - Evidência no código real:
     - `/root/so/repos/ben-prototype/project-mobile/src/layout/hooks/use-api-request.ts:12-34` — em erro,
       `data` é `undefined`, `isLoading` `false`, `isError` `true`; não há como `selection` ficar não-nulo.
     - Padrão contrariado:
       `.claude/skills/code-get-coding-designs/designs/feature-state-components-structure.md:20` — "The
       branch order is fixed: **loading → error/gone → empty → data → null**". O plano põe um teste de
       dado ausente **dentro** do ramo de loading, invertendo a ordem.
     - Precedente real do repo, que faz o contrário:
       `/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu-detail/note-detail.tsx:26-38`
       — `isLoading ? Loading : isGone ? Gone : isError ? Error : note ? Content : null`. O dado ausente
       tem ramo próprio (`gone`), nunca é dobrado no loading.
     - O roteiro de teste não pega: nenhum passo derruba o backend nem força erro na rota nova.
   - O que precisa mudar: mover o teste de estreitamento para o ramo de erro, mantendo a ordem fixa.
     Com a derivação de `status` da Etapa 8, isto basta e continua entregando `modelSlug`/`effort` não
     anuláveis a `AgentSettingsControls` (C9):
     ```tsx
     const agentSection =
       agent.state.status === 'loading' ? (
         <AgentSettingsLoading />
       ) : agent.state.status === 'error' || agent.state.selection === null ? (
         <AgentSettingsError onRetry={agent.actions.retry} />
       ) : (
         <AgentSettingsControls … />
       )
     ```
     E acrescentar ao roteiro um passo que prove o ramo de erro (derrubar o backend com
     `pkill -f "tsx watch"`, abrir o Settings, ver a banda de erro e o `retry`).

2. **`retry()` depois de um save que falhou não tem o par para repetir: o plano apaga o único lugar onde
   ele estava.**
   - Onde no plano: Etapa 8 (~linhas 313-315) — "falha → `draft = null`, `hasSaveError = true`" e
     "`retry()`: … se `hasSaveError`, repete o último par tentado"; e C7, cujo `state` só tem
     `status`, `models`, `selection`, `isSaving`, `hasSaveError`.
   - Problema concreto: o único lugar que guardava o par tentado era `draft`, e a própria linha de falha
     o zera (de propósito, para reverter a UI ao par confirmado — D12). Depois disso, "o último par
     tentado" não existe em estado nenhum descrito no plano: `confirmed` é o par **antigo**, e repetir o
     save com ele é um POST inócuo que não desfaz o erro percebido pelo usuário. O implementador sonnet
     teria de inventar um quarto pedaço de estado — exatamente o que o plano promete não exigir
     (`r3-plano-v2.md:5`, "toda decisão já está tomada aqui").
   - Evidência no código real: não há mecanismo do React Query que cubra isso —
     `/root/so/repos/ben-prototype/project-mobile/src/layout/hooks/use-api-mutation.ts:11-31` só reexpõe
     `mutateAsync`, `reset`, `isPending`, `isError`; não guarda as `variables` da última chamada.
   - O que precisa mudar: declarar em C7/Etapa 8 um `lastAttempt` (`useState<AgentSelection | null>`)
     gravado junto com `draft` no início de `selectModel`/`selectEffort` e lido por `retry()`, ou — mais
     barato — manter `draft` no lugar em caso de falha e reverter só quando o usuário sai do erro. A
     primeira opção preserva o comportamento de reversão que D12 descreve; escolha uma e escreva.

## Não bloqueantes
- **`models.ts` vai precisar de um import novo que o C3 não mostra.** O arquivo hoje não importa nada de
  `ai` (`project-backend/src/infra/services/ben-agent-provider/models.ts:1-3`); o C3 anota o retorno como
  `LanguageModel`. É `import type { LanguageModel } from 'ai'` mais `AgentModelSelection` de
  `@/domain/utils/agent-models`. O `tsc` acusa na hora; só custa uma ida e volta.
- **A sonda (b) acessa `.modelId`/`.settings` num valor tipado como `LanguageModel`.** Funciona: as duas
  são `readonly` públicas em `OpenRouterChatLanguageModel`
  (`node_modules/@openrouter/ai-sdk-provider/dist/index.d.ts:559-562`), e o script roda por `tsx`, que
  transpila sem checar tipos. Mas `LanguageModel` do `ai` é uma união com `string`, então o mesmo código
  **não** compilaria se alguém o movesse para dentro de `src/`. Vale a nota no roteiro.
- **`useAPIMutation` não tem um só uso no repo** (`grep -rn "useAPIMutation" project-mobile/src` → só a
  própria declaração). O `mutate` que ele devolve é `mutateAsync`, ou seja, **rejeita** em erro: o caminho
  "falha →" da Etapa 8 precisa de `try/catch` ou `.catch`, senão vira unhandled rejection no Expo web. O
  plano descreve o efeito, não o mecanismo.
- **O roteiro não exercita nenhum estado de erro** (nem o da carga, nem o do save). É o buraco que deixou
  o bloqueante 1 passar; um passo com o backend derrubado cobre os dois.
- **`AgentPreferencesPresenter.toHttp` devolve `AGENT_MODELS` por referência** (C5). Sem risco hoje
  (nada muta), mas é o array do domínio viajando para a camada HTTP; se algum dia alguém ordenar in
  place, muda a constante global.
- **Etapa 9 depende de tokens que existem**: `bg-surface-error`, `text-text-error`, `animate-pulse`,
  `bg-outline-variant/40`, `bg-primary`, `text-on-primary` estão todos em
  `project-mobile/tailwind.config.js` e já são usados em `settings-sheet.tsx` — conferido, nada a fazer.

## Os 2 bloqueantes da r4

- **(1) Estado obsoleto ao reabrir o Settings sem o `invalidate()`: FECHADO.**
  D12 (linhas 145-155) agora manda invalidar como obrigatório e explica por quê; a Etapa 8 (linha 312)
  inclui "**chama `actions.invalidate()`**" no caminho de sucesso; o critério de pronto da etapa exige
  "há uma chamada a `invalidate()` no caminho de sucesso do save"; e o roteiro ganhou o passo 3, que fecha
  e reabre o sheet **sem reload** dentro de 1 minuto, com o critério explícito ("se voltar a marcar
  `GPT-5.6 Luna`, o `invalidate()` não foi implementado"). Conferido no código que a correção funciona:
  `use-api-request.ts:26-28` expõe mesmo `invalidate` (além de `refetch`), e o `invalidateQueries` usa a
  mesma `queryKey: [url, params]` da `useQuery` (linha 12), então marca a query como stale mesmo que o
  refetch seja cortado pelo desmonte do sheet (`pages/menu/page.tsx:49`) — na reabertura o
  `refetchOnMount` padrão refaz o fetch porque o dado deixou de estar fresh. A afirmação de D12 de que o
  invalidate não reabre a corrida também procede: o `useEffect` só escreve `confirmed` enquanto ele é
  `null`, e o sucesso do POST o preenche antes.

- **(2) O roteiro não prova a metade "mensagem de task" do item 3: FECHADO.**
  O passo 4 novo semeia a task e o passo 5(a) usa o `TASK_ID`. Conferi cada afirmação do passo 4 contra o
  código:
  - `TaskProps` (`project-backend/src/domain/entities/task.ts:33-46`) tem exatamente os 12 campos que o
    snippet do plano preenche — `userId`, `messageId`, `title`, `contentType`, `textContent`, `todoItems`,
    `pendingDiff`, `summary`, `status`, `lastActivityAt`, `finishedAt`, `createdAt`. Nenhum sobra, nenhum
    falta, e `status: 'active'` está em `TaskStatus`.
  - `SqliteTaskRepository` existe e é construído com o `PrismaClient`
    (`src/infra/services/repositories/sqlite-task-repository.ts:9-13`), igual ao `SqliteUserRepository`
    que o `seed-ambiente.ts` já usa; `SqliteRepository.create` (`sqlite-repository.ts:70-77`) devolve a
    entidade, então `task.id.toValue()` imprime o id como o plano descreve. O `userId: ID` serializa
    normalmente (`serializeValue`, linha ~277, grava `types['userId'] = 'id'`).
  - `userRepository.findUnique({ providerId })` existe (`sqlite-repository.ts:129-135`) e
    `'dev-seed-provider-id'` é a constante real do `seed-ambiente.ts:47`.
  - `GET /tasks/list` cai em `status: 'active'` por padrão
    (`src/infra/http/routes/tasks/list-tasks.ts:9-27`), então a task semeada aparece mesmo.
  - `POST /tasks/:id/messages/create` aceita exatamente `{"content": "..."}`
    (`src/infra/http/routes/tasks/create-task-message.ts:18-20`) e o use-case busca a task por
    `{ id, userId }` (`src/domain/use-cases/tasks/create-task-message.ts:33-36`) — o `userId` do JWT
    semeado bate com o da task.
  - A justificativa continua válida: `app.ts:62-70` não tem rota de criação de task, e a Premissa 12
    registra o porquê do seed direto no SQLite e que ele não entra no commit.
  - `buildAgentCallTrace` hoje recebe `{ steps, startedAt, finishedAt }`
    (`ben-agent-provider/trace-builders.ts:172-176`), então a chamada da sonda (b) com `steps: []` mais o
    `selection` novo é coerente com a Etapa 4, e `modelId` sai `null` sem quebrar.

## O que mais reconferi no código e está correto (não reabrir)
- Etapa 4/D14: `grep -rn "openRouterModel|BenAgentProviderService|geminiModel" src/` devolve **só**
  `chat.ts:16-18,39`, `tasks/create-task-message.ts:4-5,12`, `models.ts:9,15` e a classe em `index.ts:27`
  — as duas rotas que a Etapa 6 corrige, exatamente como o plano prevê. `geminiModel` fica intocado.
- Etapa 4: `generateReply` tem mesmo duas chamadas `generateText` com `model: this.model`
  (`index.ts:36,80`) e `generateTaskTurn` uma (`index.ts:123`).
- Etapa 6: `userRepository` é exportado por `src/infra/http/repositories.ts:56-58`; em `chat.ts` o ponto
  de inserção depois de `buildTopicIndexUseCase.execute` (linha ~90) existe e `req.userId` está em uso.
- Etapa 1: `UserProps` (`domain/entities/user.ts:4-11`) e `UserPresenter`
  (`presenters/user-presenter.ts:5-15`) são exatamente o que C1 e a Etapa 1 descrevem.
- D1: `SqliteRepository.toInfra/serializeValue` serializa strings e `null` sem type tag; campo novo em
  `UserProps` não pede migração, e `update` faz merge sobre os props atuais (linhas 79-95).
- C5/Premissa 13: `errorHandler` monta mesmo `` `${code}#${variables?.join(',')}` `` e faz
  `console.error(err)` (`middlewares/error-handler.ts`), o que sustenta tanto o `#undefined` quanto a
  prova 5(a) pelo log.
- Etapa 7: `API_ROUTES` (`src/api/routes.ts`), `ItemResponse` (`src/api/types.ts:16-18`) e o padrão
  `request{Action}` de `src/api/requests/tasks.ts` batem com o que a etapa manda escrever.
- Etapa 11: `message-trace.ts:71` tem `modelId: string | null` no `AgentCallTrace` e
  `message-trace-meta-strip.tsx:14-21` é a pill que o plano altera — espelho e exibição como descritos.
- D10/D13: as citações de `design.md` conferem (`:147` pill-shaped, `:154` "Avoid heavy spinners") e
  `message-trace-sheet.tsx:3,32` usa mesmo `useWindowDimensions`. `primary`, `on-primary`, `textError` e
  `onSurfaceVariant` existem em `src/layout/utils/colors.ts`.
- D9: as citações de `use-case-structure.md` ("returns the value it guarantees is present, and throws
  otherwise", §"Extract validations into `ensure`/`require` guard methods") e de
  `domain-entity-declaration.md:8` ("export the value/union types the props reference alongside it") são
  literais. Os dois docs vivem em `.claude/skills/code-write-code/coding-patterns/`.
- Escopo: continua sem contrabando — nada de catálogo dinâmico, temperature/topP, tela nova ou conserto
  do `geminiModel`.

## Premissas assumidas nesta revisão
- Não reconferi o que a r2 e a r4 já deram por verificado e a v2 não mexeu (D1/D2/D6/D7/D8, catálogo
  OpenRouter, rotas HTTP, camada de API do mobile, R4/R6, os 3 bloqueantes da r2), conforme a instrução
  desta rodada.
- Tratei o ramo de erro da seção como parte do contrato, e não como refinamento opcional: a r2 exigiu o
  `agent-settings-error.tsx` e `feature-state-components-structure.md` fixa a ordem dos ramos. Por isso o
  achado 1 é bloqueante, e não observação.
- Tratei "o plano é autossuficiente, o sonnet não reprojeta nada" (`r3-plano-v2.md:4-5`) como cláusula do
  contrato do briefing; é o que faz do buraco do `retry()` um bloqueante em vez de um detalhe.
