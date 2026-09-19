# Revisão do r3-plano-v2.md

## Veredito
REPROVADO
Os 3 bloqueantes da r2 foram fechados, mas a correção do terceiro não-bloqueante (tirar o `invalidate()`)
criou um defeito novo de estado obsoleto no sheet, e o roteiro de teste não consegue provar a metade
"mensagem de task" do item 3 da Definição de Pronto porque não existe task no banco nem caminho para criar uma.

## Bloqueantes

1. **Sem `invalidate()`, reabrir o Settings mostra a preferência antiga — a feature parece não ter salvo.**
   - Onde no plano: D12 (linhas 141-152) e Etapa 8 (linha 312-313): "sucesso → `confirmed = resposta do POST`
     … **Não** chama `invalidate()` (D12)".
   - Evidência no código real:
     - `/root/so/repos/ben-prototype/project-mobile/src/layout/hooks/use-api-request.ts:20` —
       `staleTime: 60 * 5 * 1000` na `useQuery` que o `useAgentPreferencesData` vai usar.
     - `/root/so/repos/ben-prototype/project-mobile/src/core/query-client.ts:3` —
       `new QueryClient()` sem defaults: `gcTime` 5 min, `refetchOnMount: true` (que só refaz fetch se o dado
       estiver **stale**).
     - `/root/so/repos/ben-prototype/project-mobile/src/pages/menu/page.tsx:49` —
       `{isSettingsOpen && <SettingsView onClose={closeSettings} />}`: fechar o sheet **desmonta** o
       `SettingsView`, logo o `useState` `confirmed` do hook (Etapa 8) volta a `null`.
     - Consequência: o usuário escolhe `DeepSeek V4.1 Flash`, o POST grava, fecha o sheet e reabre dentro de
       5 minutos → o cache da query ainda tem a resposta **anterior** (nada a invalidou, o dado ainda está
       fresh, não há refetch), `confirmed` é reidratado a partir dela e a UI volta a marcar
       `GPT-5.6 Luna`. O backend está certo, a tela mente.
     - O roteiro de teste não pega isso: o passo 2 recarrega a página (`location.reload()` / restart), o que
       zera o cache em memória e esconde o bug. Ou seja, o plano entrega um defeito que passa no próprio teste.
   - O que precisa mudar: depois do POST bem-sucedido, escrever a resposta no cache da query —
     `actions.invalidate()` (o hook já expõe, `use-api-request.ts:26-28`) ou `queryClient.setQueryData`. A
     corrida que motivou a remoção já está resolvida pelo `disabled={isSaving}` do próprio D12 (só há um save
     em voo), então invalidar não reabre o problema. Alternativa aceitável: manter o hook montado, mas isso
     exigiria mexer em `menu/page.tsx:49`, o que o plano não prevê.

2. **O roteiro não prova a metade "mensagem de task" do item 3 da Definição de Pronto: não existe task no
   banco e não existe jeito de criar uma.**
   - Onde no plano: Plano de teste, passo 3(a) (linha ~790): "Repetir com `POST /tasks/<id>/messages/create`
     para cobrir a rota de task" — o `<id>` nunca é obtido nem semeado.
   - Evidência no código real:
     - `project-backend/prisma/dev.db`: `select count(*) from tasks` → **0** (users 1, messages 6).
     - `project-backend/src/infra/http/app.ts:62-70` — não existe rota de criação de task; as tasks só nascem
       de `persistCapturesUseCase` dentro de `POST /chat`
       (`src/infra/http/routes/chat.ts:104-109`), ou seja, **de uma chamada real ao modelo**.
     - `project-mobile/src/api/routes.ts` (bloco `tasks`) — o app tem `list/detail/createMessage/...`, nenhum
       `create`: o tester também não consegue criar uma task pela UI.
     - `OPENROUTER_API_KEY` é falsa (R4, confirmado na r2), então a única fábrica de tasks está morta.
     - O seed existente `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/seed-ambiente.ts`
       cria **só** usuário + mensagem do bot (linhas 46-84); não cria task.
   - Por que é bloqueante: "chat **e** mensagens de task" é uma das 4 respostas do usuário e o item 3 da
     Definição de Pronto. O plano se propõe a ser executável lendo só ele; aqui o tester sonnet trava ou
     inventa um seed por conta própria.
   - O que precisa mudar: acrescentar ao Plano de teste um passo de seed de task (script `tsx` nos moldes do
     `seed-ambiente.ts`, usando `SqliteTaskRepository` do próprio backend, imprimindo o `taskId`), ou dizer
     explicitamente de onde sai o `<id>` (`curl /tasks/list` só serve se a task existir). Sem isso, declare no
     plano que o item 3 fica provado só no chat — o que contraria o briefing.

## Não bloqueantes
- **Corpo do 400 está escrito errado no plano.** C5 e o passo 2 do roteiro esperam
  `{"effort":["UNSUPPORTED_AGENT_EFFORT#"]}`, mas
  `project-backend/src/infra/http/middlewares/error-handler.ts` monta
  `` `${err.response.code}#${err.response.variables?.join(',')}` `` — sem `variables`, o valor real é
  `UNSUPPORTED_AGENT_EFFORT#undefined`. O tester pode ler como falha.
- **A prova (c) do item 4 só prova a exibição.** O trace é semeado à mão com `modelSlug`/`effort`, então nada
  no roteiro prova que o backend **escreve** esses campos (`buildAgentCallTrace` só roda em chamada
  bem-sucedida, impossível sem chave). Custa pouco estender a sonda (b) para chamar `buildAgentCallTrace`
  com uma lista de steps falsa e imprimir os dois campos novos.
- **`AgentSelection` é usado sem ser declarado.** Etapa 8 (linhas 306/308) usa `useState<AgentSelection | null>`,
  mas C6 e C7 declaram `AgentPreferences`, `AgentModelOption`, `AgentModelSlug` e `AgentEffort` — não
  `AgentSelection`. É um tipo local trivial, mas o plano promete não deixar nada para o implementador decidir.
- **Etapa 8 não diz como `status` sai de `isLoading`/`isError`.** `useAPIRequest` devolve flags
  (`use-api-request.ts:29-34`), e C7 expõe `status: 'loading' | 'error' | 'ready'`. Mapeamento óbvio, mas não escrito.
- **`AgentSettingsControls` recebe `modelSlug`/`effort` como `| null`** (C9) embora o ramo `data` do
  `SettingsView` só seja escolhido quando existem. Isso força um `??` inútil no componente puro.
- **Uma leitura extra do repositório de usuário por mensagem** (chat e task) por causa do
  `GetAgentPreferencesUseCase` no handler. Correto pelo D5, só vale registrar.

## Os 3 bloqueantes da r2
- **(1) `smoke-sqlite.ts` e os demais criadores de `UserProps` / baseline `tsc`: FECHADO.**
  Confirmei no código que existem **exatamente dois** criadores —
  `project-backend/src/domain/use-cases/auth/login-or-register.ts:56` e
  `project-backend/src/infra/scripts/smoke-sqlite.ts:667` (`grep -rn "UserProps|User.create|userRepository.create" src/`);
  `tsconfig.json` tem `"include": ["./src"]` sem `exclude`. A Etapa 1 edita os dois, mais
  `user.ts` e `user-presenter.ts`. O `Omit<Serialize<WithID<UserProps>>, 'createdAt' | 'agentModelSlug' | 'agentEffort'>`
  funciona: `Serialize` (`src/modules/domain/types.ts:16-27`) só transforma `ID`/`Date`, deixa as unions
  intactas. Baseline reconferido agora: `npx tsc --noEmit` → **EXIT=0** no backend e no mobile.
  Os seeds em `.claude/tmp/` estão fora do `include` (R8 procede).
- **(2) Caminho de tipos `string` → slug/effort: FECHADO.**
  Reproduzi C2 + C4 num arquivo isolado e rodei `tsc --strict` → **EXIT=0**, sem `as` e sem type predicate:
  `AGENT_MODELS.find(m => m.slug === slug)` e `model.efforts.find(item => item === effort)` estreitam sozinhos,
  `AGENT_MODELS[0]` é `AgentModelOption` (o base `@tsconfig/node24` não liga `noUncheckedIndexedAccess`),
  e `{ agentModelSlug: selection.modelSlug, agentEffort: selection.effort }` satisfaz o
  `Partial<UserProps>` de `update` (`src/modules/domain/repository/repository.ts:52-55`). O `Payload` está
  declarado, `ValidationError` bate com `src/modules/domain/domain-errors.ts:23-35`, e o guard `require…`
  está no lugar que `use-case-structure.md:106-110` documenta.
- **(3) Componentes de estado seguindo `feature-state-components-structure.md`: FECHADO.**
  Etapa 9 cria `agent-settings-loading.tsx` e `agent-settings-error.tsx` puros e `agent-settings-controls.tsx`
  presentacional; quem ramifica é o container `SettingsView` na ordem `loading → error → data` (D11), com a
  ausência de `-empty.tsx` justificada (Premissa 10). A pasta plana `menu-settings/` bate com o precedente real
  `project-mobile/src/layout/components/menu-detail/` (9 arquivos planos, incluindo `item-detail-loading/error/gone`).
  A escolha de hook em vez de zustand contraria a seção "State ownership" do doc, mas está **explicitamente**
  justificada em D12 (estado efêmero de modal, precedente `layout/hooks/use-google-auth.ts`) — não é achado.

## Premissas assumidas nesta revisão
- Tratei "provado de fora, com o app rodando" como exigindo que cada item da Definição de Pronto tenha um
  passo executável no roteiro; por isso o item 3 sem task no banco virou bloqueante e não observação.
- Não reconferi os pontos listados em "O que verifiquei e está correto" da r2 que a v2 não mudou
  (D1/D2/D6/D7/D8, catálogo, rotas HTTP, mobile API, R6), conforme a instrução desta rodada.
