# r3 — Plano de implementação v2: escolher modelo + effort do agente Ben

Branch `feat/config-model-and-effort`. Alvo: `project-backend` e `project-mobile`.
Este arquivo é autossuficiente: quem implementa lê **só ele e o `briefing.md`**.
O implementador é um sonnet que **não reprojeta nada** — toda decisão já está tomada aqui.

---

## Decisões

### D1 — Persistência: dois campos novos em `UserProps`, sem migração de banco
O backend tem persistência real: `PERSISTENCE_DRIVER=sqlite` → Prisma + SQLite
(`project-backend/prisma/schema.prisma`). **Cada tabela é genérica**:
`model User { id String @id; props String; types String }`, e `SqliteRepository.toInfra`
serializa `entity.props` inteiro como JSON na coluna `props`.
Logo: **adicionar campo em `UserProps` não exige migração**. Nada de `prisma migrate`.
- *Descartado*: entidade/tabela `UserPreferences` separada — sem ganho para 2 escalares.
- *Consequência obrigatória*: linhas gravadas antes desta feature voltam do JSON **sem** as chaves novas
  → `undefined`, não `null`. Todo código de leitura usa `??`, nunca `=== null` (ver R1).

### D2 — Rotas: uma de leitura, uma de escrita, na feature `agent-preferences`
```
GET  /agent-preferences/detail   (authMiddleware)
POST /agent-preferences/update   (authMiddleware)
```
Padrão rota-por-operação (`routes/{feature}/{operation}.ts`), vocabulário igual ao existente
(`/tasks/:id/detail`, `/tasks/:id/content/update`).
- *Descartado*: devolver a preferência em `POST /auth/login-or-register` e guardar no `useAuthStore`.
  `useAuthStore.hydrate` reidrata o user do AsyncStorage sem relogar, então "fechar e reabrir o app"
  mostraria o valor em cache, não o do backend — não provaria o item 2 da Definição de Pronto.

### D3 — O catálogo viaja **junto com** a preferência, em `GET /agent-preferences/detail`
Resposta: `{ item: { modelSlug, effort, models: [{ slug, label, efforts, defaultEffort }] } }`.
O mobile espelha **o tipo** à mão (convenção do repo, igual a `message-trace.ts`), **nunca os valores**.
- *Porquê*: o briefing exige backend como fonte única da verdade e validação do par no backend. Tabela de
  efforts em código no mobile poderia divergir e oferecer um effort que o backend rejeita.
- *Descartado*: rota separada `GET /agent-models/list` — segundo fetch, segundo loading, segundo ponto de
  falha, para a mesma operação do ponto de vista do usuário ("quais são minhas opções e qual está escolhida").
- *Descartado*: espelho manual dos valores em `src/api/models/`. O repo espelha formato, não conteúdo.

### D4 — Modelo e effort entram no **payload** de `generateReply`/`generateTaskTurn`, não no construtor
`BenAgentProviderService` perde o parâmetro `LanguageModel` do construtor e resolve o modelo por chamada a
partir de `payload.model: AgentModelSelection`. As rotas continuam instanciando serviço e use-cases em
module-scope, como hoje.
- *Porquê*: é onde o port já declara os dados do pedido (`GenerateReplyPayload` /
  `GenerateTaskTurnPayload` em `src/adapters/agent-provider.ts`); diff pequeno; "qual modelo" é
  semanticamente parte do pedido.
- *Descartado*: fábrica por request dentro do handler — obrigaria a reconstruir `CreateTaskMessageUseCase`
  a cada request ou a injetar o serviço em `execute()`.
- *Descartado*: injetar um resolvedor `(selection) => LanguageModel` no construtor — abstração com uma
  única implementação; `models.ts` já é o helper compartilhado na raiz da pasta do serviço
  (`service-structure.md`) e `index.ts` importá-lo é exatamente o padrão.

### D5 — A preferência é lida **no backend**, por `req.userId`; o mobile não manda modelo no body
`POST /chat` e `POST /tasks/:id/messages/create` mantêm o body atual.
- *Porquê*: o briefing diz "persistida no backend por usuário"; mandar do cliente criaria segunda fonte da
  verdade e vetor de spoof.

### D6 — O effort `max` viaja por `extraBody`, não por `providerOptions`
`@openrouter/ai-sdk-provider@2.9` tipa (`dist/index.d.ts`):
```ts
reasoning?: { enabled?: boolean; exclude?: boolean } &
  ({ max_tokens: number } | { effort: 'xhigh'|'high'|'medium'|'low'|'minimal'|'none' })
```
— **sem `max`**, embora a API aceite. No mesmo tipo, `extraBody?: Record<string, unknown>`.
Em `dist/index.js` (`getArgs` do `OpenRouterChatLanguageModel`, ~linha 3598) o body é montado como
`{ ..., reasoning: this.settings.reasoning, ..., ...this.config.extraBody, ...this.settings.extraBody }`:
`extraBody` é espalhado **por último**, no topo do body. Logo `extraBody.reasoning` vira `body.reasoning`
— exatamente o campo da API do OpenRouter — e sobrescreve `settings.reasoning`. Como `extraBody` é
`Record<string, unknown>`, `'max'` compila sem cast e sem `@ts-expect-error`.
- *Descartado*: `providerOptions: { openrouter: { reasoning: { effort } } }` — cai no mesmo enum.
- *Descartado*: remover `max` da lista (proibido pelo briefing) ou fazer declaration merging no pacote.

### D7 — O trace carrega o modelo e o effort **pedidos**, no nível do trace
`AgentCallTrace` ganha `modelSlug: string | null` e `effort: string | null`, preenchidos a partir da
seleção, não da resposta do provider. `AgentCallStep.modelId` (o que o provider respondeu) fica intacto.
- *Porquê*: as duas fases (`context` e `format`) usam a mesma seleção → é dado do trace, não do step; e
  registrar o **pedido** é o que prova que a escolha do usuário chegou lá.
- *Tipo `string | null` e não as unions*: o trace é registro histórico guardado como JSON em mensagens
  antigas; um slug removido do catálogo no futuro não pode quebrar o parse. Mesmo critério do `modelId`.
- *Exibição*: a pill de modelo de `message-trace-meta-strip` passa a
  `trace.modelSlug ?? trace.modelId ?? 'unknown model'` e ganha uma pill `effort · {trace.effort}`
  renderizada só quando `trace.effort` existe (traces antigos seguem legíveis). O "Raw request JSON" da
  aba Input já mostra `step.input.requestBody`, que agora contém `model` e `reasoning.effort` de verdade.

### D8 — Registro de modelos mora no **domínio**, em `src/domain/utils/agent-models.ts`
É regra de negócio (quais modelos o usuário pode escolher, qual effort cada um aceita), consumida por dois
use-cases e pelo presenter.
- *Porquê*: `backend-domain-structure.md` reserva `domain/utils/{entity}.ts` para helpers compartilhados por
  vários use-cases. Em `infra/services/`, o domínio importaria infra e inverteria a dependência.
- As unions `AgentModelSlug` e `AgentEffort` ficam em `src/domain/entities/user.ts`, ao lado de `UserProps`
  (`domain-entity-declaration.md`: "export the value/union types the props reference alongside it").

### D9 — `string` → `AgentModelSlug`: um guard `require…` dentro do use-case de update
O body chega do Zod como `{ modelSlug: string, effort: string }`. O estreitamento para as unions acontece
num guard privado `requireSupportedSelection(modelSlug: string, effort: string): AgentModelSelection`
dentro de `UpdateAgentPreferencesUseCase`, construído sobre `findAgentModel(slug): AgentModelOption | null`
e `model.efforts.find(...)`. Os dois `find` estreitam sozinhos — **nenhum `as`, nenhum type predicate**.
- *Porquê do lugar*: `use-case-structure.md` define `require…` como "returns the value it guarantees is
  present, and throws otherwise"; `backend-domain-structure.md` só manda para `domain/validation/` o que é
  compartilhado por **vários** use-cases, e este é usado por um só.
- *Porquê do Zod frouxo (`z.string()`)*: com `z.enum`, um slug desconhecido viraria erro de formato e a
  regra "este effort não existe para este modelo" — que é de negócio — ficaria partida entre duas camadas.
  O guard valida o par inteiro e lança `ValidationError` → 400 pelo `errorHandler` atual.
- O guard distingue os dois erros: slug desconhecido → `errorField: 'modelSlug'`, code `UNKNOWN_AGENT_MODEL`;
  effort não suportado → `errorField: 'effort'`, code `UNSUPPORTED_AGENT_EFFORT`.

### D10 — UI: lista de rádio para o modelo, chips pill para o effort, dentro do sheet atual
- **Modelo** (3 opções, rótulos longos): linhas `Pressable` empilhadas, no visual do botão de sign-out
  (`rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3`), com `Check` (lucide)
  e `border-primary` na selecionada. `SegmentedControl` não serve: 3 rótulos de ~18 caracteres em ~350px
  de largura útil ficam ilegíveis.
- **Effort** (3 a 6 opções, rótulos curtos, quantidade variável): chips pill que quebram linha
  (`flex-row flex-wrap gap-2`); selecionado `bg-primary` + `text-on-primary`, não selecionado
  `bg-surface-container` + `text-on-surface-variant`. `SegmentedControl` também não serve: é `flex-1` por
  item e com 6 itens (luna) cada célula fica com ~55px, cortando "medium"/"xhigh".
  `design.md` §Shapes autoriza: "Chips and progress indicators may use pill-shaped rounding".
- Nenhum componente novo em `layout/components/ui/`: os dois controles são específicos deste sheet e ficam
  em `layout/components/menu-settings/`, pasta plana, como `menu-detail/`.

### D11 — Estados da seção seguem `feature-state-components-structure.md`: quem ramifica é `SettingsView`
A seção do agente é uma feature que busca dados, então se parte em:
- **container**: `settings-view.tsx` — já é o container do sheet; chama o hook e **escolhe o ramo**
  na ordem fixa `loading → error → data` (não há estado `empty`: o catálogo é constante do servidor e
  sempre traz 3 modelos; registro a ausência em vez de inventar um `-empty.tsx` inalcançável);
- **status components**: `agent-settings-loading.tsx` e `agent-settings-error.tsx`, puros e sem fetch;
- **presentational**: `agent-settings-controls.tsx`, que recebe os dados já carregados.

O nó escolhido desce para `SettingsSheet` por uma prop `agentSection: ReactNode`.
- *Porquê a prop de slot*: a tarefa exige manter `settings-sheet.tsx` apresentacional. Se o sheet
  renderizasse `<AgentSettingsView/>` (um container), ele passaria a puxar dados transitivamente. Com o
  slot, o sheet só posiciona o nó — e o título estável `Ben's model` fica no sheet, exatamente como o
  `MenuListShell title="Notes"` do doc envolve o ramo escolhido pelo container `MenuNotesView`.
- *Descartado*: `SettingsSheet` ramificando sobre `agent.status` — colocaria a máquina de estados no
  componente puro, que é o que o design doc tira de lá.
- *Descartado*: um único `agent-settings-section.tsx` com os três estados dentro (era o r1) — contraria o
  design doc, como a revisão apontou.

### D12 — Estado do mobile: hook composto, otimista, com os controles travados enquanto salva
`src/layout/hooks/use-agent-preferences.ts` compõe `useAgentPreferencesData` (fetch) + `useAPIMutation`
(save) + o valor otimista local, e devolve `{ state, actions }`.
- *Porquê hook e não store*: precedente direto é `layout/hooks/use-google-auth.ts`; o estado é efêmero
  (dura o sheet aberto) e derivado de uma query. `feature-state-components-structure.md` pede zustand para
  estado estruturado de página; aqui é um par de escalares dentro de um modal.
- **Sem corrida**: os controles ficam `disabled` enquanto `isSaving` (mesmo padrão do botão de sign-out,
  que já usa `disabled={signOutState === 'pending'}`), então só existe **um save em voo por vez**. Esse
  trinco é o que resolve a corrida. Custo aceito: um toque duplo muito rápido é ignorado, o que num sheet
  de settings é irrelevante.
- **Invalidar o cache depois de todo save bem-sucedido é obrigatório**, não opcional: o hook chama
  `actions.invalidate()` do `useAgentPreferencesData` (o `useAPIRequest` já expõe) assim que o POST
  retorna. Por quê: `use-api-request.ts` usa `staleTime: 60 * 5 * 1000`, `core/query-client.ts` é um
  `new QueryClient()` sem defaults, e `pages/menu/page.tsx` monta o sheet como
  `{isSettingsOpen && <SettingsView … />}` — fechar o sheet **desmonta** o container e zera o `confirmed`
  do hook. Sem invalidar, reabrir o Settings dentro de 5 minutos reidrataria `confirmed` a partir da
  resposta antiga ainda `fresh` no cache: o backend estaria certo e a tela mostraria o modelo anterior.
  O invalidate **não** reabre a corrida, porque o `useEffect` de sincronização só escreve quando
  `confirmed === null` — um refetch tardio nunca sobrescreve um valor mais novo.
- **Ao trocar de modelo**: aplica o novo modelo no estado local na hora; se o effort atual não estiver em
  `efforts` do novo modelo, cai no `defaultEffort` dele; dispara o POST com o par já corrigido. Em falha,
  reverte para o último par confirmado e mostra banda de erro com retry.

### D13 — Altura do sheet: `maxHeight` + `ScrollView`
`SettingsSheet` mede com `useWindowDimensions()` e envolve o corpo (perfil + seção do agente + sign-out)
num `ScrollView` com `style={{ maxHeight: height * 0.7 }}` — o mesmo recurso que
`message-trace-sheet.tsx` já usa (`useWindowDimensions` + `height * 0.9`).
- *Porquê*: com luna selecionado são 3 linhas de modelo + 6 chips em 2 linhas + perfil + sign-out; em telas
  curtas isso passa de 70% da altura e o sign-out sairia da tela.
- *Descartado*: aumentar `slideOffset` no overlay — não resolve conteúdo que não cabe.

### D14 — `openRouterModel` sai de `models.ts`; `geminiModel` fica
`openRouterModel` deixa de existir porque a feature a substitui — não é "conserto de passagem", é o objeto
que esta mudança torna impossível de manter. `geminiModel`, que o briefing manda não tocar, fica intacto.

### D15 — `project-design` fica fora do escopo
O sandbox de design é o passo anterior à implementação, mas o briefing não pede tela de design e a
Definição de Pronto só cobre backend e mobile. Registrado aqui como decisão consciente, não como omissão.

---

## Etapas

Ordem obrigatória. `npx tsc --noEmit` no backend ao fim da Etapa 6; no mobile ao fim da Etapa 11.

### Etapa 1 — Tipos e campos novos no domínio do usuário
**Existem exatamente dois lugares que constroem `UserProps` no `src/` do backend** — conferido com
`grep -rn "userRepository.create\|User.create" src/`:
`domain/use-cases/auth/login-or-register.ts:56` e `infra/scripts/smoke-sqlite.ts:667`. O `tsconfig.json`
do backend tem `"include": ["./src"]` e nenhum `exclude`, então **o script de smoke é type-checado** e
precisa ser atualizado na mesma etapa. (`verify-authentication.ts:41` usa `providerId` só como filtro de
`get`, que recebe `Partial<…>` — não precisa mudar.)

Arquivos:
- **edita** `/root/so/repos/ben-prototype/project-backend/src/domain/entities/user.ts`
  — exporta `AgentModelSlug` e `AgentEffort`; adiciona `agentModelSlug: AgentModelSlug | null` e
  `agentEffort: AgentEffort | null` a `UserProps` (Contrato C1).
- **edita** `/root/so/repos/ben-prototype/project-backend/src/domain/use-cases/auth/login-or-register.ts`
  — em `registerUser`, `userRepository.create({ ..., agentModelSlug: null, agentEffort: null })`.
- **edita** `/root/so/repos/ben-prototype/project-backend/src/infra/scripts/smoke-sqlite.ts`
  — no `create` de `runUserCases` (linha ~667), acrescenta `agentModelSlug: null, agentEffort: null`.
- **edita** `/root/so/repos/ben-prototype/project-backend/src/infra/http/presenters/user-presenter.ts`
  — o retorno é `Omit<Serialize<WithID<UserProps>>, 'createdAt'>`; vira
  `Omit<Serialize<WithID<UserProps>>, 'createdAt' | 'agentModelSlug' | 'agentEffort'>`.
  **Sem isso o `tsc` quebra**: o tipo passaria a exigir dois campos que o presenter não devolve. O corpo do
  método não muda — a preferência não trafega no payload de login (D2).

*Pronto quando*: `npx tsc --noEmit` no backend não acusa **nenhum** erro em `user.ts`,
`login-or-register.ts`, `smoke-sqlite.ts` e `user-presenter.ts`. Erros restantes só podem ser
"módulo não encontrado" dos arquivos que as Etapas 2-6 ainda vão criar.
*Baseline a preservar*: hoje `npx tsc --noEmit` sai `EXIT=0` nos dois projetos.

### Etapa 2 — Registro de modelos no domínio
- **cria** `/root/so/repos/ben-prototype/project-backend/src/domain/utils/agent-models.ts` (Contrato C2):
  `AgentModelOption`, `AgentModelSelection`, `AGENT_MODELS`, `DEFAULT_AGENT_MODEL`,
  `DEFAULT_AGENT_MODEL_SLUG`, `findAgentModel(slug: string): AgentModelOption | null` e
  `resolveAgentSelection(props)`.

*Pronto quando*: compila isolado; `resolveAgentSelection({})` devolve
`{ modelSlug: 'openai/gpt-5.6-luna', effort: 'medium' }` e `findAgentModel('nao-existe')` devolve `null`.

### Etapa 3 — Port do agente e tipo do trace
- **edita** `/root/so/repos/ben-prototype/project-backend/src/adapters/agent-provider.ts`
  — `model: AgentModelSelection` em `GenerateReplyPayload` **e** em `GenerateTaskTurnPayload`, importando
  de `@/domain/utils/agent-models` (`adapters/` já importa domínio — ver
  `adapters/repositories/user-repository.ts`).
- **edita** `/root/so/repos/ben-prototype/project-backend/src/adapters/agent-call-trace.ts`
  — `AgentCallTrace` ganha `modelSlug: string | null` e `effort: string | null` (Contrato C8).

*Pronto quando*: os tipos compilam; os erros restantes apontam só para quem ainda não passa os campos novos.

### Etapa 4 — Serviço: resolver o modelo por chamada
- **edita** `.../project-backend/src/infra/services/ben-agent-provider/models.ts`
  — remove `export const openRouterModel = ...`; adiciona
  `export function resolveOpenRouterModel(selection: AgentModelSelection): LanguageModel` (Contrato C3),
  mantendo o bloco `provider` de hoje e acrescentando `reasoning: { effort: selection.effort }` dentro do
  **mesmo** `extraBody`. `geminiModel` e o `createGoogleGenerativeAI` acima dele **não são tocados**.
- **edita** `.../project-backend/src/infra/services/ben-agent-provider/trace-builders.ts`
  — `buildAgentCallTrace` recebe `selection: AgentModelSelection` a mais e devolve
  `modelSlug: selection.modelSlug, effort: selection.effort` junto dos campos atuais.
- **edita** `.../project-backend/src/infra/services/ben-agent-provider/index.ts`
  — remove `constructor(private readonly model: LanguageModel)`;
  em `generateReply`, `const model = resolveOpenRouterModel(payload.model)` no topo, usa `model` nas duas
  chamadas `generateText` (hoje `this.model`) e passa `selection: payload.model` a `buildAgentCallTrace`;
  em `generateTaskTurn`, mesma resolução; remove o import de `LanguageModel` de `ai` se ficar sem uso
  (o lint acusa).

*Pronto quando*: o serviço compila e `grep -rn "openRouterModel" project-backend/src` só retorna as duas
rotas que a Etapa 6 corrige.

### Etapa 5 — Use-cases de preferência
- **cria** `.../project-backend/src/domain/use-cases/agent-preferences/get-agent-preferences.ts`
  — `GetAgentPreferencesUseCase(userRepository)`, `execute({ userId }) → ItemResponse<AgentModelSelection>`:
  `userRepository.get({ id: createID(payload.userId) })` e devolve `{ item: resolveAgentSelection(user.props) }`.
- **cria** `.../project-backend/src/domain/use-cases/agent-preferences/update-agent-preferences.ts`
  — `UpdateAgentPreferencesUseCase(userRepository)` com `Payload { userId: string; modelSlug: string; effort: string }`
  e o guard privado `requireSupportedSelection` (Contrato C4, escrito por extenso). `execute` lê
  `load → require → apply`, persiste com
  `userRepository.update(user.id, { agentModelSlug: selection.modelSlug, agentEffort: selection.effort })`
  e devolve `{ item: selection }`.

*Pronto quando*: ambos compilam **sem nenhum `as`**; `('z-ai/glm-5.3-flash', 'medium')` lança
`ValidationError` com `errorField: 'effort'` e `('nada', 'low')` lança com `errorField: 'modelSlug'`.

### Etapa 6 — HTTP: presenter, rotas, registro e as duas rotas do agente
- **cria** `.../project-backend/src/infra/http/presenters/agent-preferences-presenter.ts`
  — `AgentPreferencesPresenter.toHttp(selection)` → `{ modelSlug, effort, models: AGENT_MODELS }`
  (Contrato C5). Precedente de presenter sobre valor não-entidade: `agent-reply-presenter.ts`.
- **cria** `.../project-backend/src/infra/http/routes/agent-preferences/get-agent-preferences.ts`
  — handler `getAgentPreferences`, sem schema (só `req.userId`), devolve
  `{ item: AgentPreferencesPresenter.toHttp(result.item) }` com `HttpStatus.OK`.
- **cria** `.../project-backend/src/infra/http/routes/agent-preferences/update-agent-preferences.ts`
  — handler `updateAgentPreferences`, `bodySchema = z.object({ modelSlug: z.string(), effort: z.string() })`
  (D9), mesma resposta.
- **edita** `.../project-backend/src/infra/http/app.ts` — registra as duas rotas com `authMiddleware`,
  no bloco depois de `/captures/counts`:
  ```ts
  app.get('/agent-preferences/detail', authMiddleware, getAgentPreferences)
  app.post('/agent-preferences/update', authMiddleware, updateAgentPreferences)
  ```
- **edita** `.../project-backend/src/infra/http/routes/chat.ts`
  — remove o import de `openRouterModel`; `const agentService = new BenAgentProviderService()`;
  adiciona `const getAgentPreferencesUseCase = new GetAgentPreferencesUseCase(userRepository)`
  (`userRepository` vem de `@/infra/http/repositories`); no handler, depois de
  `buildTopicIndexUseCase.execute`, resolve
  `const preferences = await getAgentPreferencesUseCase.execute({ userId: req.userId })`
  e passa `model: preferences.item` em `agentService.generateReply({...})`.
- **edita** `.../project-backend/src/infra/http/routes/tasks/create-task-message.ts`
  — `new BenAgentProviderService()` no construtor do use-case; instancia `GetAgentPreferencesUseCase`;
  no handler, resolve a preferência e passa `model` em `createTaskMessageUseCase.execute({...})`.
- **edita** `.../project-backend/src/domain/use-cases/tasks/create-task-message.ts`
  — `Payload` ganha `model: AgentModelSelection`; `generateAgentReply` repassa `model: payload.model`
  para `agentService.generateTaskTurn`.

*Pronto quando*:
```bash
cd /root/so/repos/ben-prototype/project-backend && npm run lint:fix && npx tsc --noEmit   # EXIT=0
curl -s localhost:3333/agent-preferences/detail -H "jwtauthenticationtoken: $JWT" -H "providerauthenticationtoken: x"
# {"item":{"modelSlug":"openai/gpt-5.6-luna","effort":"medium","models":[...3 itens...]}}
```

### Etapa 7 — Mobile: camada de API
- **cria** `/root/so/repos/ben-prototype/project-mobile/src/api/models/agent-preferences.ts` (Contrato C6).
- **edita** `/root/so/repos/ben-prototype/project-mobile/src/api/routes.ts`
  — bloco `agentPreferences: { detail: '/agent-preferences/detail', update: '/agent-preferences/update' }`.
- **cria** `/root/so/repos/ben-prototype/project-mobile/src/api/requests/agent-preferences.ts`
  — `requestUpdateAgentPreferences(payload): Promise<AgentPreferences>`, devolvendo `response.data.item`.
- **cria** `/root/so/repos/ben-prototype/project-mobile/src/layout/hooks/api/use-agent-preferences-data.ts`
  — `useAPIRequest<ItemResponse<AgentPreferences>>({ url: API_ROUTES.agentPreferences.detail })`.

*Pronto quando*: compila; nada de UI ainda.

### Etapa 8 — Mobile: hook de estado da preferência
- **cria** `/root/so/repos/ben-prototype/project-mobile/src/layout/hooks/use-agent-preferences.ts`
  (Contrato C7). Regras exatas:
  - declara no próprio arquivo o tipo local
    `type AgentSelection = { modelSlug: AgentModelSlug; effort: AgentEffort }` (é o par sem o catálogo;
    não existe em `api/models/agent-preferences.ts` e não deve ser exportado de lá — ninguém mais usa);
  - `confirmed` (`useState<AgentSelection | null>`) = último par confirmado pelo servidor;
  - `useEffect` sincroniza `confirmed` a partir de `state.data` **apenas enquanto `confirmed === null`**;
  - `draft` (`useState<AgentSelection | null>`) = valor otimista em voo; a UI mostra `draft ?? confirmed`;
  - `selection = draft ?? confirmed`;
  - `status` é derivado das flags do `useAPIRequest`, nesta ordem:
    `state.isLoading ? 'loading' : state.isError || selection === null ? 'error' : 'ready'`
    (o `selection === null` cobre uma resposta sem `item`, que não pode renderizar controles);
  - `models = state.data?.item.models ?? []`;
  - `lastAttempt` (`useState<AgentSelection | null>`) = o último par que o usuário tentou salvar. Existe
    **só** para o `retry()` do save: a linha de falha zera o `draft` (para a UI reverter ao par
    confirmado, D12), e sem `lastAttempt` não sobraria em lugar nenhum o par que o usuário queria —
    `confirmed` é o par antigo, e reenviá-lo seria um POST inócuo que não desfaz o erro percebido;
  - `selectModel(slug)`: monta o par corrigindo o effort pelo `defaultEffort` do novo modelo quando o
    effort atual não está em `efforts`; grava o par em `draft` **e** em `lastAttempt`; chama
    `save(par)` (abaixo);
  - `selectEffort(effort)`: mesmo caminho, mantendo o modelo;
  - `save(par)` é uma função interna que faz `mutate(par).then(…).catch(…)`. O `mutate` do
    `useAPIMutation` é o `mutateAsync` do React Query, ou seja **rejeita** em erro: sem o `.catch`
    (ou um `try/catch` num `async`) isso vira unhandled rejection no Expo web;
  - sucesso → `confirmed = resposta do POST`, `draft = null`, `hasSaveError = false`, e **chama
    `actions.invalidate()`** do `useAgentPreferencesData` (D12);
  - falha → `draft = null`, `hasSaveError = true` (o `lastAttempt` **permanece**);
  - `retry()`: se `hasSaveError` e `lastAttempt !== null`, faz `save(lastAttempt)` de novo; senão faz
    `actions.refetch()` (que é o caso do erro de carga, quando não houve tentativa de save nenhuma).

*Pronto quando*: compila; `selectModel('z-ai/glm-5.3-flash')` com effort atual `medium` produz effort `max`;
há uma chamada a `invalidate()` no caminho de sucesso do save; e o `retry()` depois de um save falho
reenvia o par de `lastAttempt`, não o `confirmed`.
*Descartado*: manter o `draft` em pé na falha e reverter só quando o usuário sai do erro. Funciona, mas
deixa a UI marcando um modelo que o backend não tem — a reversão imediata de D12 é o comportamento honesto.

### Etapa 9 — Mobile: componentes de estado e apresentação da seção
Todos em `/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu-settings/` (pasta plana,
como `menu-detail/`). Nenhum deles importa store ou hook de dados — são puros (D11).
- **cria** `agent-settings-loading.tsx` — skeleton: 3 blocos `h-12 animate-pulse rounded-xl bg-outline-variant/40`
  e uma fileira de 3 pills `h-8 w-16 animate-pulse rounded-full bg-outline-variant/30`, no estilo do
  skeleton de perfil que já existe em `settings-sheet.tsx`.
- **cria** `agent-settings-error.tsx` — `{ onRetry }`; banda
  `rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-2.5` com
  `couldn't load your model settings` e `retry` (mesmo visual da banda de sign-out, ícone `RotateCw`,
  `color={textError}` de `@/layout/utils/colors`).
- **cria** `agent-model-option.tsx` — uma linha de modelo (`label`, `isSelected`, `disabled`, `onPress`),
  `Check` do `lucide-react-native` com `color={primary}` quando selecionada (cor sempre via
  `@/layout/utils/colors`, nunca hex inline).
- **cria** `agent-effort-chips.tsx` — `{ efforts, value, disabled, onChange }`, chips pill que quebram linha.
- **cria** `agent-settings-controls.tsx` — presentacional puro com os dados já carregados (Contrato C9):
  as 3 linhas de modelo, o subtítulo `Effort` (que vira `Effort · saving…` quando `isSaving`, sem spinner —
  `design.md` §Components: "Avoid heavy spinners"), os chips, e a banda
  `didn't save that — try again?` + `retry` quando `hasSaveError`. Todos os controles recebem
  `disabled={isSaving}` (D12).

*Pronto quando*: os cinco compilam e nenhum importa `use-agent-preferences` nem `useAPIRequest`.

### Etapa 10 — Mobile: ligar no sheet de Settings
- **edita** `.../project-mobile/src/layout/components/menu-settings/settings-sheet.tsx`
  — prop nova `agentSection?: ReactNode`; corpo (perfil + bloco do agente + sign-out) envolvido num
  `ScrollView` com `style={{ maxHeight: height * 0.7 }}` de `useWindowDimensions()` e
  `showsVerticalScrollIndicator={false}`; o bloco do agente entra **entre** perfil e sign-out, como
  `border-t border-outline-variant/40` + título estável
  `<Typography variant="label-caps" className="text-on-surface-variant">Ben's model</Typography>` +
  `{agentSection}`. O sheet **não** ramifica sobre estado nenhum: só posiciona o nó (D11).
- **edita** `.../project-mobile/src/layout/components/menu-settings/settings-view.tsx`
  — chama `useAgentPreferences()` e monta o ramo na ordem fixa `loading → error → data`:
  ```tsx
  const agentSection =
    agent.state.status === 'loading' ? (
      <AgentSettingsLoading />
    ) : agent.state.status === 'error' || agent.state.selection === null ? (
      <AgentSettingsError onRetry={agent.actions.retry} />
    ) : (
      <AgentSettingsControls
        models={agent.state.models}
        modelSlug={agent.state.selection.modelSlug}
        effort={agent.state.selection.effort}
        isSaving={agent.state.isSaving}
        hasSaveError={agent.state.hasSaveError}
        onSelectModel={agent.actions.selectModel}
        onSelectEffort={agent.actions.selectEffort}
        onRetry={agent.actions.retry}
      />
    )
  ```
  e passa `agentSection={agentSection}` a `SettingsSheet`. Nada mais muda ali.
  A ordem dos ramos é **fixa: loading → error → data** (`feature-state-components-structure.md`), e o
  teste `agent.state.selection === null` fica no ramo de **erro**, nunca no de loading. O motivo é
  concreto: quando o `GET /agent-preferences/detail` falha na primeira abertura do sheet,
  `useAPIRequest` devolve `isLoading: false`, `isError: true` e `data: undefined`, então `selection`
  continua `null` — se esse teste estivesse no primeiro ramo, a tela ficaria num skeleton eterno e
  `AgentSettingsError` (com o `retry`) nunca apareceria. No ramo de erro ele serve só para estreitar o
  tipo: o `status` do hook já garante que `'ready'` implica `selection` presente, mas o TypeScript não
  sabe disso, e é isso que permite `AgentSettingsControls` receber `modelSlug`/`effort` **não anuláveis**
  (C9), sem `??` inútil dentro do componente puro.

*Pronto quando*: abrir Settings no app mostra a seção com os dados do backend.

### Etapa 11 — Mobile: espelho do trace e exibição
- **edita** `/root/so/repos/ben-prototype/project-mobile/src/api/models/message-trace.ts`
  — `AgentCallTrace` ganha `modelSlug: string | null` e `effort: string | null` (espelho exato do backend).
- **edita** `.../project-mobile/src/pages/chat/components/message-trace-sheet/message-trace-meta-strip.tsx`
  — pill 1 vira `trace.modelSlug ?? trace.modelId ?? 'unknown model'`; pill nova, só quando `trace.effort`,
  com o texto `effort · {trace.effort}`, no mesmo estilo das outras
  (`rounded-full bg-surface-container px-2 py-1`,
  `Typography variant="label-caps" className="normal-case text-on-surface-variant"`).

*Pronto quando*:
`cd /root/so/repos/ben-prototype/project-mobile && npm run lint:fix && npx tsc --noEmit` → `EXIT=0`.

---

## Contratos

Os blocos abaixo são para ler, não para colar com os comentários: **o código final não leva comentário
explicativo** (`code-write-code/SKILL.md` §General Rules item 2). A explicação vive aqui.

### C1 — `project-backend/src/domain/entities/user.ts`
```ts
export type AgentModelSlug =
  | 'openai/gpt-5.6-luna'
  | 'deepseek/deepseek-v4.1-flash'
  | 'z-ai/glm-5.3-flash'

export type AgentEffort = 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface UserProps {
  name: string
  username: string
  email: string
  avatarUrl: string
  providerId: string
  createdAt: Date
  agentModelSlug: AgentModelSlug | null
  agentEffort: AgentEffort | null
}
```

### C2 — `project-backend/src/domain/utils/agent-models.ts`
```ts
import { AgentEffort, AgentModelSlug } from '@/domain/entities/user'

export type AgentModelOption = {
  slug: AgentModelSlug
  label: string
  efforts: AgentEffort[]
  defaultEffort: AgentEffort
}

export type AgentModelSelection = {
  modelSlug: AgentModelSlug
  effort: AgentEffort
}

export const AGENT_MODELS: AgentModelOption[] = [
  {
    slug: 'openai/gpt-5.6-luna',
    label: 'GPT-5.6 Luna',
    efforts: ['none', 'low', 'medium', 'high', 'xhigh', 'max'],
    defaultEffort: 'medium',
  },
  {
    slug: 'deepseek/deepseek-v4.1-flash',
    label: 'DeepSeek V4.1 Flash',
    efforts: ['low', 'high', 'max'],
    defaultEffort: 'high',
  },
  {
    slug: 'z-ai/glm-5.3-flash',
    label: 'GLM 5.3 Flash',
    efforts: ['low', 'high', 'max'],
    defaultEffort: 'max',
  },
]

export const DEFAULT_AGENT_MODEL: AgentModelOption = AGENT_MODELS[0]
export const DEFAULT_AGENT_MODEL_SLUG: AgentModelSlug = DEFAULT_AGENT_MODEL.slug

export function findAgentModel(slug: string): AgentModelOption | null {
  return AGENT_MODELS.find((model) => model.slug === slug) ?? null
}

export function resolveAgentSelection(props: {
  agentModelSlug?: AgentModelSlug | null
  agentEffort?: AgentEffort | null
}): AgentModelSelection {
  const model = findAgentModel(props.agentModelSlug ?? DEFAULT_AGENT_MODEL_SLUG) ?? DEFAULT_AGENT_MODEL
  const effort = props.agentEffort ?? null

  return {
    modelSlug: model.slug,
    effort: effort && model.efforts.includes(effort) ? effort : model.defaultEffort,
  }
}
```
Notas (não vão para o arquivo):
- `props` é tipado com campos **opcionais** de propósito: linhas antigas voltam do JSON sem as chaves
  (`undefined`), e `User.props` as satisfaz normalmente.
- `findAgentModel` devolve `null` em vez de cair no primeiro modelo: quem chama decide o que fazer com um
  slug desconhecido — `resolveAgentSelection` cai no default (leitura tolerante), o guard de C4 rejeita
  (escrita estrita). Um `?? AGENT_MODELS[0]` dentro do `find` faria um slug inválido sumir em silêncio.
- Rótulos são o `name` do catálogo OpenRouter sem o prefixo do provedor (`"OpenAI: GPT-5.6 Luna"` →
  `GPT-5.6 Luna`), porque o provedor não cabe na linha.
- `efforts` está em ordem **crescente** de esforço, que é a ordem exibida na UI.

### C3 — `project-backend/src/infra/services/ben-agent-provider/models.ts`
```ts
export function resolveOpenRouterModel(
  selection: AgentModelSelection,
): LanguageModel {
  return openrouter(selection.modelSlug, {
    extraBody: {
      provider: {
        sort: 'throughput',
        ignore: ['cerebras'],
        require_parameters: true,
      },
      reasoning: { effort: selection.effort },
    },
  })
}
```
O porquê de `reasoning` estar dentro de `extraBody` está em D6 — não repetir como comentário no arquivo.
`models.ts` hoje não importa nada de `ai`: esta função exige acrescentar
`import type { LanguageModel } from 'ai'` e `import { AgentModelSelection } from '@/domain/utils/agent-models'`.

### C4 — `UpdateAgentPreferencesUseCase` (o caminho `string` → union, por extenso)
```ts
interface Payload {
  userId: string
  modelSlug: string
  effort: string
}

export class UpdateAgentPreferencesUseCase
  implements UseCase<ItemResponse<AgentModelSelection>>
{
  constructor(private userRepository: UserRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<AgentModelSelection>> {
    const user = await this.userRepository.get({ id: createID(payload.userId) })
    const selection = this.requireSupportedSelection(payload.modelSlug, payload.effort)

    await this.userRepository.update(user.id, {
      agentModelSlug: selection.modelSlug,
      agentEffort: selection.effort,
    })

    return { item: selection }
  }

  private requireSupportedSelection(
    modelSlug: string,
    effort: string,
  ): AgentModelSelection {
    const model = findAgentModel(modelSlug)

    if (!model) {
      throw new ValidationError({
        errorField: 'modelSlug',
        code: 'UNKNOWN_AGENT_MODEL',
      })
    }

    const supportedEffort = model.efforts.find((item) => item === effort)

    if (!supportedEffort) {
      throw new ValidationError({
        errorField: 'effort',
        code: 'UNSUPPORTED_AGENT_EFFORT',
      })
    }

    return { modelSlug: model.slug, effort: supportedEffort }
  }
}
```
`model.slug` já é `AgentModelSlug` e `model.efforts.find(...)` já devolve `AgentEffort | undefined`:
o estreitamento sai dos dois `find`, **sem `as` e sem type predicate**. `userRepository.update` recebe
`Partial<UserProps>` (`modules/domain/repository/repository.ts`) e aceita os dois campos já tipados.

### C5 — resposta HTTP de `/agent-preferences/*`
```ts
// AgentPreferencesPresenter.toHttp(selection)
{
  modelSlug: 'deepseek/deepseek-v4.1-flash',
  effort: 'max',
  models: [
    { slug: 'openai/gpt-5.6-luna', label: 'GPT-5.6 Luna', efforts: ['none','low','medium','high','xhigh','max'], defaultEffort: 'medium' },
    { slug: 'deepseek/deepseek-v4.1-flash', label: 'DeepSeek V4.1 Flash', efforts: ['low','high','max'], defaultEffort: 'high' },
    { slug: 'z-ai/glm-5.3-flash', label: 'GLM 5.3 Flash', efforts: ['low','high','max'], defaultEffort: 'max' }
  ]
}
// as duas rotas envelopam como { item: ... }
// POST /agent-preferences/update  body: { modelSlug: string, effort: string }
// 400 de par inválido: {"effort":["UNSUPPORTED_AGENT_EFFORT#undefined"]}
// 400 de slug desconhecido: {"modelSlug":["UNKNOWN_AGENT_MODEL#undefined"]}
// o sufixo "#undefined" é o formato real do errorHandler atual
// (`${code}#${variables?.join(',')}` sem `variables`) — não é bug desta feature.
```

### C6 — `project-mobile/src/api/models/agent-preferences.ts`
```ts
export type AgentModelSlug =
  | 'openai/gpt-5.6-luna'
  | 'deepseek/deepseek-v4.1-flash'
  | 'z-ai/glm-5.3-flash'

export type AgentEffort = 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface AgentModelOption {
  slug: AgentModelSlug
  label: string
  efforts: AgentEffort[]
  defaultEffort: AgentEffort
}

export interface AgentPreferences {
  modelSlug: AgentModelSlug
  effort: AgentEffort
  models: AgentModelOption[]
}
```

### C7 — `project-mobile/src/layout/hooks/use-agent-preferences.ts`
```ts
type AgentSelection = {
  modelSlug: AgentModelSlug
  effort: AgentEffort
}

export function useAgentPreferences(): {
  state: {
    status: 'loading' | 'error' | 'ready'
    models: AgentModelOption[]
    selection: AgentSelection | null
    isSaving: boolean
    hasSaveError: boolean
  }
  actions: {
    selectModel: (slug: AgentModelSlug) => void
    selectEffort: (effort: AgentEffort) => void
    retry: () => void
  }
}
```
Estado interno do hook, não exposto: `confirmed`, `draft` e `lastAttempt`, todos
`useState<AgentSelection | null>` (Etapa 8). `lastAttempt` é o que o `retry()` reenvia depois de um save
que falhou; `confirmed` é o par antigo e reenviá-lo não desfaria o erro.

### C8 — `AgentCallTrace` (backend e mobile, espelhados)
```ts
type AgentCallTrace = {
  status: AgentCallStatus
  error: string | null
  modelId: string | null    // o que o provider respondeu (inalterado)
  modelSlug: string | null  // NOVO: o modelo pedido
  effort: string | null     // NOVO: o effort pedido
  startedAt: string
  finishedAt: string
  latencyMs: number
  totalUsage: AgentCallUsage
  steps: AgentCallStep[]
}
```

### C9 — `project-mobile/.../menu-settings/agent-settings-controls.tsx`
```tsx
type AgentSettingsControlsProps = {
  models: AgentModelOption[]
  modelSlug: AgentModelSlug
  effort: AgentEffort
  isSaving: boolean
  hasSaveError: boolean
  onSelectModel: (slug: AgentModelSlug) => void
  onSelectEffort: (effort: AgentEffort) => void
  onRetry: () => void
}
```
Textos da UI (inglês, sentence-case, como o resto do sheet): `Ben's model` (no sheet), `Effort`,
`Effort · saving…`, `couldn't load your model settings`, `didn't save that — try again?`, `retry`.

---

## Riscos e contingências

**R1 — Linhas antigas de `users` não têm as chaves novas.** `props` é JSON; usuários criados antes voltam
com `agentModelSlug === undefined`, não `null`. Mitigação embutida em `resolveAgentSelection` (campos
opcionais + `??`). **Nunca** comparar com `=== null`.

**R2 — `require_parameters: true` pode zerar os provedores de deepseek/glm.** O bloco `provider` só roteia
para provedores que suportam os parâmetros enviados, e agora `reasoning` entra na conta. Se o OpenRouter
responder `No allowed providers are available for the selected model`, a contingência é remover **apenas**
`require_parameters` do `extraBody` (mantendo `sort` e `ignore`) e registrar o motivo no relatório.
Não remover o `reasoning`.

**R3 — `strict: true` do `response_format`.** Precedente documentado na run `2026-09-19-trocar-modelo-luna`:
os schemas Zod do agente têm `required` incompleto e provedores estilo OpenAI podem devolver
400 `Invalid schema for response_format`. Agora são 3 modelos com roteamento diferente. Se aparecer, a
contingência pronta é `structuredOutputs: { strict: false }` como **irmã** de `extraBody` na chamada de
`openrouter(...)` em `resolveOpenRouterModel`. Não aplicar preventivamente.

**R4 — Sem `OPENROUTER_API_KEY` real no ambiente.** Confirmado duas vezes: `.env` e `.env.development` são
idênticos e trazem `OPENROUTER_API_KEY=fake-openrouter-key-…`; e `npm run dev` roda com
`NODE_ENV=development`, então `src/infra/services/env.ts` carrega `.env.development` (o `.env` nem é lido).
Itens 1 e 2 da Definição de Pronto são provados normalmente; 3 e 4 usam as provas substitutas do Plano de
teste. Isso **precisa** aparecer no relatório final, não ser escondido.

**R5 — `generateTaskTurn` não produz trace.** `CreateTaskMessageUseCase` não persiste `Message` nenhuma —
só atualiza a task e devolve `benMessage`. O item 4 da Definição de Pronto ("o trace da mensagem mostra
modelo e effort") só se aplica a mensagens de chat; para task, o item 3 se prova pelo corpo efetivamente
enviado ao OpenRouter. **Não** criar trace para task — está fora do escopo do briefing.

**R6 — Altura do sheet.** Se o `ScrollView` dentro do `Animated.View` do overlay não rolar no Expo web, a
causa costuma ser altura indefinida no pai: aplicar o `maxHeight` no `View` externo (como
`message-trace-sheet.tsx` faz) em vez de no próprio `ScrollView`.

**R7 — Sem cache de instâncias de `LanguageModel`.** `openrouter(slug, settings)` constrói um objeto
stateless por request; a chamada de rede domina e um `Map` de cache seria otimização prematura.
Registrado para que a ausência não pareça esquecimento.

**R9 — Uma leitura extra do repositório de usuário por mensagem.** `GetAgentPreferencesUseCase` roda em
todo `POST /chat` e em todo `POST /tasks/:id/messages/create`, somando um `userRepository.get` antes da
chamada ao modelo. É consequência direta de D5 (a preferência é do servidor, não do cliente) e o custo é
irrelevante perto da chamada de rede ao LLM que vem em seguida. Registrado para não parecer descuido; não
cachear.

**R8 — `seed-ambiente.ts` / `seed-trace.ts` da run anterior chamam `userRepository.create` sem os campos
novos.** Rodam por `tsx` (transpila sem checar tipos), então continuam funcionando, e o usuário criado cai
exatamente no caso R1 — o que é bom: exercita o caminho do default. Eles vivem em
`.claude/tmp/orquestracoes/`, fora do `include` do tsconfig, então **não** afetam o `tsc`.

---

## Plano de teste

### Subir o ambiente
Backend (3333) e mobile (8081) estavam de pé quando este plano foi escrito (`/health` → 200, `:8081` → 200).
Se caírem:
```bash
cd /root/so/repos/ben-prototype/project-backend
nohup npm run dev > "$SCRATCH/backend.log" 2>&1 & disown
# espera "Server is running on port 3333"

cd /root/so/repos/ben-prototype/project-mobile
nohup npx expo start --web --port 8081 > "$SCRATCH/mobile.log" 2>&1 & disown
# espera curl -s -o /dev/null -w "%{http_code}" http://localhost:8081  →  200
```
Porta presa: `pkill -f "expo start --web"` e `pkill -f "tsx watch ./src/infra/http/server.ts"`.
`project-backend/.env.development` já existe com `PERSISTENCE_DRIVER=sqlite` e `prisma/dev.db` migrado —
é ele que `npm run dev` lê, **não** o `.env`.

### Autenticar no browser
```bash
cd /root/so/repos/ben-prototype/project-backend && NODE_ENV=development \
  npx tsx /root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/seed-ambiente.ts
```
(idempotente; imprime o `userId` e um JWT novo). No browser, viewport 390x844, em `http://localhost:8081`:
```js
localStorage.setItem('ben.jwttoken', '<JWT impresso acima>'); location.reload()
```
O app abre direto no chat.

### Roteiro do browser-tester
1. **DoD 1 — escolher modelo e effort, com a lista de effort mudando conforme o modelo.**
   Menu → `Settings` na sidebar → o sheet abre.
   - Seção `Ben's model` com 3 linhas, `GPT-5.6 Luna` marcada, e `Effort` com **6** chips
     (`none low medium high xhigh max`), `medium` marcado. **Screenshot.**
   - Clicar `DeepSeek V4.1 Flash` → os chips passam a **3** (`low high max`) e o selecionado vira `high`
     (default do deepseek, porque `medium` não existe lá). **Screenshot.**
   - Clicar `GLM 5.3 Flash` → 3 chips (`low high max`), selecionado `max`, e **o chip `none` não aparece**
     — prova direta da resposta "só o que cada modelo suporta" (o glm tem `reasoning.mandatory: true` no
     catálogo, não existe "desligar"). **Screenshot.**
   - Voltar para `DeepSeek V4.1 Flash` e clicar o chip `max`. **Screenshot.**
2. **DoD 2 — persistência por usuário no backend.**
   ```bash
   curl -s localhost:3333/agent-preferences/detail \
     -H "jwtauthenticationtoken: $JWT" -H "providerauthenticationtoken: x"
   # {"item":{"modelSlug":"deepseek/deepseek-v4.1-flash","effort":"max","models":[...]}}
   ```
   Reiniciar o backend (`pkill -f "tsx watch"`, `npm run dev`), recarregar a página, reabrir Settings:
   `DeepSeek V4.1 Flash` + `max` continuam marcados. **Screenshot.** (Sobrevive porque o driver é sqlite.)
   Rejeição de par inválido, de quebra:
   ```bash
   curl -s -X POST localhost:3333/agent-preferences/update -H 'Content-Type: application/json' \
     -H "jwtauthenticationtoken: $JWT" -H "providerauthenticationtoken: x" \
     -d '{"modelSlug":"z-ai/glm-5.3-flash","effort":"medium"}'
   # 400 {"effort":["UNSUPPORTED_AGENT_EFFORT#undefined"]}
   # o "#undefined" é o formato do errorHandler atual, não uma falha — ver C5.
   ```
3. **DoD 2 (parte 2) — reabrir o sheet sem recarregar a página.**
   Este passo é obrigatório e **não pode** ser substituído por um reload: recarregar zera o cache do React
   Query em memória e esconderia exatamente o defeito que o `invalidate()` de D12 evita.
   - Com `DeepSeek V4.1 Flash` + `max` salvos, fechar o sheet no X, ficar na mesma página (sem reload) e
     reabrir `Settings` **dentro de 1 minuto**. Continua marcando `DeepSeek V4.1 Flash` + `max`.
     **Screenshot.** Se voltar a marcar `GPT-5.6 Luna`, o `invalidate()` não foi implementado.
   - Repetir uma vez trocando para `GLM 5.3 Flash`, fechando e reabrindo.

4. **Semear uma task, para poder testar a rota de mensagem de task.**
   Hoje `select count(*) from tasks` no `prisma/dev.db` é **0**, não existe rota de criação de task
   (`app.ts` só tem `list/detail/messages/create/diff/...`) e tasks só nascem de `persistCapturesUseCase`
   dentro de `POST /chat` — isto é, de uma chamada real ao modelo, que a chave falsa impede. Então a task
   tem de ser semeada direto no SQLite, pelo mesmo mecanismo do `seed-ambiente.ts`.
   Criar `.../2026-09-19-config-model-effort/seed-task.ts` (fora dos dois projetos, **não entra no commit
   da feature**), nos moldes do `seed-ambiente.ts`: importa `getPrismaClient`, `SqliteUserRepository` e
   `SqliteTaskRepository` por caminho absoluto de `project-backend/src/...`, acha o usuário por
   `providerId: 'dev-seed-provider-id'` e cria a task com **todos** os campos de `TaskProps`:
   ```ts
   const task = await taskRepository.create({
     userId: user.id,
     messageId: null,
     title: 'Task semeada para o teste de modelo/effort',
     contentType: 'text',
     textContent: 'conteudo inicial',
     todoItems: null,
     pendingDiff: null,
     summary: 'task criada direto no banco porque nao ha chave de LLM no ambiente',
     status: 'active',
     lastActivityAt: new Date(),
     finishedAt: null,
     createdAt: new Date(),
   })
   console.log('taskId:', task.id.toValue())
   ```
   Rodar e guardar o id:
   ```bash
   cd /root/so/repos/ben-prototype/project-backend && NODE_ENV=development \
     npx tsx /root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/seed-task.ts
   # imprime: taskId: <TASK_ID>
   TASK_ID='<TASK_ID>'
   curl -s localhost:3333/tasks/list -H "jwtauthenticationtoken: $JWT" -H "providerauthenticationtoken: x"
   # a task semeada aparece na listagem — confirma que o app a enxerga
   ```
   `TaskProps` é o contrato exato (`project-backend/src/domain/entities/task.ts`); omitir um campo quebra a
   leitura depois. A task também fica visível no app (menu → Tasks), o que permite abrir o workspace dela.

5. **DoD 3 e 4 — a mensagem usa o modelo/effort escolhidos e o trace mostra os dois.**
   O ambiente **não tem chave real do OpenRouter** (R4), então as provas substitutas abaixo são o
   caminho principal, não um plano B:
   a) **Corpo realmente enviado ao OpenRouter** — prova as duas rotas de ponta a ponta:
      ```bash
      curl -s -X POST localhost:3333/chat -H 'Content-Type: application/json' \
        -H "jwtauthenticationtoken: $JWT" -H "providerauthenticationtoken: x" \
        -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"oi"}]}]}'
      tail -60 "$SCRATCH/backend.log"
      ```
      O `errorHandler` faz `console.error(err)` e o `APICallError` do AI SDK carrega `requestBodyValues`
      como propriedade própria — o log mostra o body enviado, com
      `model: 'deepseek/deepseek-v4.1-flash'` e `reasoning: { effort: 'max' }`.
      **A metade "mensagem de task" do item 3 se prova do mesmo jeito**, com o `TASK_ID` do passo 4:
      ```bash
      curl -s -X POST "localhost:3333/tasks/$TASK_ID/messages/create" -H 'Content-Type: application/json' \
        -H "jwtauthenticationtoken: $JWT" -H "providerauthenticationtoken: x" \
        -d '{"content":"ajusta o texto dessa task"}'
      tail -60 "$SCRATCH/backend.log"
      ```
      O log tem de mostrar o **mesmo** `model` e o mesmo `reasoning.effort` — é o que prova que a rota de
      task também lê a preferência do usuário, e não um default. O mesmo passo pode ser feito pela UI
      (menu → Tasks → abrir a task semeada → mandar uma mensagem): a mensagem falha por falta de chave,
      mas o log carrega a prova. Se o Node não imprimir `requestBodyValues`, cair para (b).
   b) **Sonda do mapeamento e da escrita do trace** — script `tsx` fora dos dois projetos, em duas partes:
      - importa `resolveOpenRouterModel` de
        `project-backend/src/infra/services/ben-agent-provider/models.ts` e imprime `model.modelId` e
        `model.settings.extraBody` para os 3 modelos em **todos** os efforts de cada um. Prova o mapeamento
        e que `max` passa pelo `tsc` e chega ao body;
      - importa `buildAgentCallTrace` de
        `project-backend/src/infra/services/ben-agent-provider/trace-builders.ts`, chama com
        `{ steps: [], startedAt: new Date(), finishedAt: new Date(), selection: { modelSlug: 'deepseek/deepseek-v4.1-flash', effort: 'max' } }`
        e imprime `modelSlug` e `effort` do trace devolvido. Isso prova que o **backend escreve** os campos
        novos — o que a prova (c), que semeia o trace à mão, sozinha não prova.
      Nota: a primeira parte lê `model.modelId` e `model.settings`, que são `readonly` públicas em
      `OpenRouterChatLanguageModel`, mas o tipo `LanguageModel` do `ai` é uma união com `string` — o
      acesso só funciona porque o script roda por `tsx`, que transpila sem checar tipos. **Não** mover
      esse trecho para dentro de `src/`: lá ele não compilaria.
   c) **Exibição do trace** — semear uma mensagem do Ben com trace, adaptando
      `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/seed-trace.ts`
      para incluir `modelSlug: 'deepseek/deepseek-v4.1-flash'` e `effort: 'max'` no objeto do trace;
      long-press na mensagem → a pill de modelo mostra o slug e existe a pill `effort · max`.
      **Screenshot.** Aba `Input` → `Raw request JSON` do step semeado. **Screenshot.**
      Escopo desta prova: ela cobre **só a exibição** (presenter → espelho do tipo no mobile → meta strip).
      Quem prova que o backend grava os campos é a segunda metade da sonda (b).
   Se por acaso existir uma `OPENROUTER_API_KEY` real, fazer também o caminho vivo: mandar uma mensagem no
   chat, long-press na resposta do Ben, conferir as duas pills e o `Raw request JSON` com
   `"reasoning":{"effort":"max"}`; depois mandar uma mensagem dentro de uma task e ver a resposta chegar.
   O relatório final diz explicitamente qual caminho foi usado.
6. **Estados de erro da seção** — nenhum outro passo os exercita, e foi esse buraco que deixou passar um
   ramo inalcançável na revisão anterior.
   - **Erro de carga**: com o sheet fechado, derrubar o backend (`pkill -f "tsx watch ./src/infra/http/server.ts"`),
     abrir `Settings` no app. A seção tem de mostrar a banda `couldn't load your model settings` com
     `retry` — **não** um skeleton parado. **Screenshot.** Subir o backend de novo, tocar `retry`: a seção
     carrega com o par salvo. **Screenshot.**
   - **Erro de save**: com o sheet aberto e carregado, derrubar o backend e tocar em outro modelo. A UI
     reverte para o par confirmado e mostra `didn't save that — try again?` com `retry`. **Screenshot.**
     Subir o backend e tocar `retry`: o par que o usuário tentou (não o antigo) é salvo — confirmar com
     o `curl` de `/agent-preferences/detail`. Isso prova o `lastAttempt` da Etapa 8.

7. **Regressão mínima** — abrir o trace de uma mensagem antiga (sem `modelSlug`/`effort`): a pill de modelo
   cai em `trace.modelId` e a pill de effort não aparece. Nada quebra.
8. **Sheet rolável** — com `GPT-5.6 Luna` selecionado (6 chips, seção mais alta), o botão `Sign out`
   continua alcançável por scroll dentro do sheet. **Screenshot.**

### Lint e tipos (obrigatórios antes do commit)
```bash
cd /root/so/repos/ben-prototype/project-backend && npm run lint:fix && npx tsc --noEmit   # EXIT=0
cd /root/so/repos/ben-prototype/project-mobile  && npm run lint:fix && npx tsc --noEmit   # EXIT=0
```
Baseline: os dois saem `EXIT=0` hoje; qualquer erro novo é regressão desta feature.

---

## Premissas

1. **Nenhuma migração Prisma**, por `prisma/schema.prisma` (`model User { id, props, types }`) e por
   `SqliteRepository.toInfra`, que serializa os props como JSON.
2. **A preferência não entra no payload de login** nem no `User` do mobile; vem da rota dedicada (D2/D3).
3. **Rótulos dos modelos** encurtados a partir do `name` do catálogo OpenRouter, sem o prefixo do provedor.
   O usuário não especificou rótulos.
4. **Ordem dos efforts** exibida é crescente (`none → max`), invertendo a ordem em que a API devolve
   `supported_efforts`. Não foi pedida; é leitura de UI (esquerda = menos esforço).
5. **`effort` no trace só no nível do trace**, não por step: as duas fases da mesma chamada usam a mesma
   seleção. Se for preciso por step, é uma linha a mais em `buildAgentCallSteps`.
6. **Mensagens de task não ganham trace** (R5).
7. **A pill de modelo passa a preferir `modelSlug`** sobre `modelId`; traces antigos seguem mostrando
   `modelId`. A alternativa seria uma terceira pill, que polui a faixa.
8. **`openRouterModel` é removido** de `models.ts` por ficar sem uso depois de D4; `geminiModel` não é
   tocado, como o briefing manda.
9. **Sem testes automatizados novos** — o repo não tem suíte e o briefing não pede. O
   `src/infra/scripts/smoke-sqlite.ts` é atualizado só para continuar compilando, não para cobrir a feature.
10. **Sem estado `empty` na seção do agente**: o catálogo é constante do servidor e sempre traz 3 modelos,
    então um `agent-settings-empty.tsx` seria código inalcançável.
11. **`project-design` fora do escopo** (D15).
12. **A task de teste é semeada direto no SQLite.** Não existe rota nem tela de criação de task, e a única
    fábrica de tasks (`persistCapturesUseCase` dentro de `POST /chat`) depende de uma chamada real ao
    modelo. O `seed-task.ts` vive em `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/`, fora dos
    dois projetos e fora do `include` do tsconfig, e **não entra no commit da feature**.
13. **`AgentPreferencesPresenter.toHttp` devolve `AGENT_MODELS` por referência**, sem copiar. Nada muta o
    array hoje; se um dia alguém ordenar in place na camada HTTP, mudaria a constante do domínio. Copiar
    preventivamente seria ruído; fica registrado.
14. **O corpo do 400 termina em `#undefined`** porque o `errorHandler` monta
    `` `${code}#${variables?.join(',')}` `` e o guard não passa `variables`. É o formato existente do repo;
    mudar o `errorHandler` seria conserto de passagem, proibido pelo briefing.

---

## Resposta à revisão

**Bloqueante 1 — Etapa 1 quebra o `tsc` (`smoke-sqlite.ts:667`).** Procede. Conferi com
`grep -rn "userRepository.create\|User.create" src/`: são **exatamente dois** criadores de `UserProps`,
`login-or-register.ts:56` e `smoke-sqlite.ts:667`, e o `tsconfig.json` inclui `./src` sem `exclude`.
A Etapa 1 agora edita os dois, enumera os criadores por extenso, cita o baseline `EXIT=0` e o critério de
pronto virou "nenhum erro nesses quatro arquivos; o que sobrar é módulo faltando das Etapas 2-6".
(`verify-authentication.ts:41` usa `providerId` só como filtro de `get`, que recebe `Partial<…>` — não muda.)

**Bloqueante 2 — contrato `string` → `AgentModelSlug` pela metade.** Procede. `isSupportedEffort` (boolean,
que não estreitava nada) foi **removido** do C2. No lugar entrou o guard privado
`requireSupportedSelection(modelSlug: string, effort: string): AgentModelSelection` do
`UpdateAgentPreferencesUseCase`, escrito por extenso no Contrato C4 com o use-case inteiro. O estreitamento
sai de `findAgentModel(...)` (agora `AgentModelOption | null`) e de `model.efforts.find(...)`
(`AgentEffort | undefined`) — sem `as`, sem type predicate. O `Payload` está declarado.
Preferi o guard `require…` dentro do use-case a um `parseAgentSelection` em `domain/utils/`:
`use-case-structure.md` define `require…` exatamente assim, e `backend-domain-structure.md` só manda para
fora o que é compartilhado por vários use-cases — este é usado por um só. A decisão virou D9.

**Bloqueante 3 — estados da seção num componente só.** Procede. A Etapa 9 agora cria
`agent-settings-loading.tsx` e `agent-settings-error.tsx` como status components puros, e
`agent-settings-controls.tsx` como o presentational da carga. **Quem ramifica é `SettingsView`**
(container), na ordem fixa `loading → error → data`, e o nó desce por uma prop de slot
`agentSection: ReactNode` — assim `settings-sheet.tsx` continua apresentacional (a tarefa exige) sem
embutir um container. A escolha está justificada em D11, com o porquê de não deixar o sheet ramificar.
Sem `-empty.tsx`: o catálogo é constante e sempre traz 3 modelos (Premissa 10).

**Não bloqueante — comentários no código.** Aceito. Os comentários explicativos saíram dos blocos C2 e C3
e viraram notas do plano; o cabeçalho da seção `## Contratos` avisa que o código final não leva comentário.

**Não bloqueante — `errorField` errado para slug desconhecido.** Aceito. O guard de C4 distingue
`UNKNOWN_AGENT_MODEL` / `errorField: 'modelSlug'` de `UNSUPPORTED_AGENT_EFFORT` / `errorField: 'effort'`,
e o C5 documenta as duas respostas 400.

**Não bloqueante — corrida entre otimismo e `invalidate()`.** Aceito. A corrida é resolvida pelo
`disabled={isSaving}` (um save em voo por vez). **Atenção**: a primeira versão desta resposta também tirava
o `invalidate()`, e isso estava errado — a revisão v2 mostrou que gerava estado obsoleto ao reabrir o sheet.
O `invalidate()` foi restaurado; vale o que está escrito em D12 e na Etapa 8, não esta linha histórica.

**Não bloqueante — `findAgentModel` mascara slug desconhecido.** Aceito. Agora devolve
`AgentModelOption | null`; a leitura tolerante (`resolveAgentSelection`) cai no `DEFAULT_AGENT_MODEL` e a
escrita estrita (o guard) rejeita.

**Não bloqueante — teste não prova "só os efforts suportados".** Aceito. O passo 1 do roteiro agora inclui
selecionar `GLM 5.3 Flash` e verificar que o chip `none` **não** aparece.

**Não bloqueante — `project-design` fora.** Aceito como registro: virou a decisão D15 e a Premissa 11,
com o porquê (briefing não pede, Definição de Pronto só cobre backend e mobile).

**Correção do revisor sobre a `OPENROUTER_API_KEY`.** Confirmada e incorporada: R4 agora cita a evidência
(`.env` e `.env.development` idênticos com `fake-openrouter-key-…`, e `NODE_ENV=development` fazendo
`env.ts` ler só o `.env.development`), e as provas substitutas dos itens 3 e 4 viraram o caminho principal
do roteiro, não um plano B.

---

## Resposta à revisão v2

**Bloqueante 1 — sem `invalidate()`, reabrir o Settings mostra a preferência antiga.** Procede, e o defeito
era meu: a v1 desta resposta tirou o `invalidate()` para matar uma corrida que o `disabled={isSaving}` já
matava sozinho. Confirmei a cadeia: `use-api-request.ts` com `staleTime: 60 * 5 * 1000`,
`core/query-client.ts` como `new QueryClient()` sem defaults, e `pages/menu/page.tsx` montando o sheet
como `{isSettingsOpen && <SettingsView … />}` — fechar desmonta o container e zera o `confirmed`.
**Mudou em**: D12 (bullet novo explicando por que invalidar é obrigatório e por que não reabre a corrida) e
Etapa 8 (o caminho de sucesso agora chama `actions.invalidate()`). O roteiro ganhou o passo 3, que fecha e
reabre o sheet **sem reload** justamente porque o reload esconderia o bug.

**Bloqueante 2 — o roteiro não prova a metade "mensagem de task" do item 3.** Procede. Reconferi:
`select count(*) from tasks` no `prisma/dev.db` é **0**, `app.ts` não tem rota de criação de task e a única
fábrica é `persistCapturesUseCase` dentro de `POST /chat`, que precisa de chave real. **Mudou em**: passo 4
novo do roteiro, com o `seed-task.ts` especificado por extenso (todos os campos de `TaskProps`, que é o
contrato exato de `domain/entities/task.ts`), o comando `tsx` para rodar, o `curl /tasks/list` para
confirmar, e o `TASK_ID` exportado; e no passo 5(a), o `curl` de
`POST /tasks/$TASK_ID/messages/create` com o critério explícito ("o log tem de mostrar o **mesmo** `model`
e o mesmo `reasoning.effort`"). Virou também a Premissa 12.

**Não bloqueante — corpo real do 400 é `CODE#undefined`.** Aceito. Corrigido em C5 e no passo 2 do roteiro,
com a nota de que o sufixo é o formato do `errorHandler` existente, não falha. Virou a Premissa 13 (mudar o
`errorHandler` seria conserto de passagem, proibido pelo briefing).

**Não bloqueante — a prova (c) do item 4 só prova exibição.** Aceito. A sonda (b) ganhou uma segunda parte
que chama `buildAgentCallTrace` com `steps: []` e uma `selection` fixa e imprime `modelSlug`/`effort` do
trace devolvido — é o que prova que o backend **escreve** os campos. O escopo limitado de (c) ficou escrito
na própria prova.

**Não bloqueante — `AgentSelection` usado sem ser declarado.** Aceito. Declarado em C7 e na Etapa 8, como
tipo **local** do arquivo do hook (não exportado de `api/models/agent-preferences.ts`, porque ninguém mais
o usa).

**Não bloqueante — derivação de `status` não escrita.** Aceito. A Etapa 8 agora traz a expressão exata
(`state.isLoading ? 'loading' : state.isError || selection === null ? 'error' : 'ready'`) e a origem de
`models`.

**Não bloqueante — `| null` desnecessário em C9.** Aceito. `AgentSettingsControls` recebe `modelSlug` e
`effort` não anuláveis; o `state` do hook passou a expor `selection: AgentSelection | null` em vez de dois
campos anuláveis soltos, e o ramo do `SettingsView` (Etapa 10) testa `selection === null` para estreitar o
tipo antes de renderizar os controles.

**Não bloqueante — leitura extra do repositório por mensagem.** Aceito como registro: virou R9, com o
porquê (consequência de D5) e a instrução de não cachear.

---

## Resposta à revisão v3

**Bloqueante 1 — `AgentSettingsError` inalcançável na falha de primeira carga.** Procede, e o defeito foi
introduzido por mim na rodada anterior, ao atender o não-bloqueante do `| null` em C9: empurrei o teste de
estreitamento para o primeiro ramo e com isso inverti a ordem fixa do design doc. Em falha de carga o
`useAPIRequest` devolve `isLoading: false`, `isError: true`, `data: undefined`, então `selection` fica
`null` e a tela travaria num skeleton sem retry. **Mudou em**: Etapa 10 — o teste `selection === null`
passou para o ramo de **erro** (`status === 'error' || selection === null`), restaurando
`loading → error → data`, e o parágrafo abaixo do bloco explica o porquê concreto em vez de só dizer "para
estreitar o tipo". Adotei a correção exatamente como o revisor escreveu.

**Bloqueante 2 — `retry()` do save sem par para repetir.** Procede: a linha "falha → `draft = null`"
apagava o único lugar onde o par tentado vivia. **Mudou em**: Etapa 8 e C7 — entrou `lastAttempt`
(`useState<AgentSelection | null>`), gravado junto com o `draft` no início de `selectModel`/`selectEffort`
e lido pelo `retry()`; `retry()` agora está escrito por extenso com os dois caminhos (save falho →
`save(lastAttempt)`; erro de carga → `refetch()`). Escolhi a opção do `lastAttempt`, não a de manter o
`draft` em pé na falha: **registrado como descartado na própria etapa**, porque manter o draft deixaria a
UI marcando um modelo que o backend não tem, e a reversão imediata é o comportamento honesto que D12 já
descrevia.

**Não bloqueante — imports que faltam em C3.** Aceito. C3 agora diz que `models.ts` precisa de
`import type { LanguageModel } from 'ai'` e de `AgentModelSelection` de `@/domain/utils/agent-models`.

**Não bloqueante — a sonda (b) acessa `.modelId`/`.settings` num `LanguageModel`.** Aceito. A nota entrou
no roteiro: funciona porque roda por `tsx`, e o trecho não pode ser movido para dentro de `src/`.

**Não bloqueante — `mutate` é `mutateAsync` e rejeita em erro.** Aceito. A Etapa 8 agora descreve o
mecanismo, não só o efeito: uma função interna `save(par)` com `.catch` (ou `try/catch`), sob pena de
unhandled rejection no Expo web.

**Não bloqueante — o roteiro não exercita nenhum estado de erro.** Aceito, e é o mesmo buraco que deixou o
bloqueante 1 passar. **Mudou em**: passo 6 novo do roteiro, com o backend derrubado por
`pkill -f "tsx watch ./src/infra/http/server.ts"`, cobrindo erro de carga (banda + `retry`) e erro de save
(reversão + `retry` reenviando o `lastAttempt`, conferido por `curl`). Passos seguintes renumerados.

**Não bloqueante — `AGENT_MODELS` viaja por referência no presenter.** Aceito como registro: virou a
Premissa 13, sem cópia defensiva.

**Não bloqueante — tokens da Etapa 9 conferidos.** Nada a fazer; o revisor confirmou que todos existem em
`tailwind.config.js`.
