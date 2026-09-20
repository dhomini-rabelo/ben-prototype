# r1 — Plano de implementação: escolher modelo + effort do agente Ben

Branch `feat/config-model-and-effort`. Alvo: `project-backend` e `project-mobile`.
Escrito para um implementador sonnet que **não reprojeta nada** — toda decisão está tomada aqui.

---

## Decisões

### D1 — Persistência: dois campos novos em `UserProps`, sem migração de banco
O backend já tem persistência real: `PERSISTENCE_DRIVER=sqlite` → Prisma + SQLite
(`project-backend/prisma/schema.prisma`). **Cada tabela é genérica**: `model User { id String @id; props String; types String }`,
e `SqliteRepository.toInfra` serializa `entity.props` inteiro como JSON na coluna `props`.
Logo: **adicionar campo em `UserProps` não exige migração nenhuma**. Nada de `prisma migrate`.
- *Porquê*: é o formato do repo; qualquer migração seria trabalho inútil e arriscado.
- *Descartado*: tabela/entidade `UserPreferences` separada — sem ganho, entidade nova só para 2 campos escalares.
- *Consequência obrigatória*: linhas antigas voltam do JSON **sem** as chaves novas → `undefined`, não `null`.
  Todo código de leitura usa `??` (ver D3 e R1).

### D2 — Rotas: uma de leitura, uma de escrita, na feature `agent-preferences`
```
GET  /agent-preferences/detail   (authMiddleware)
POST /agent-preferences/update   (authMiddleware)
```
Segue o padrão rota-por-operação (`routes/{feature}/{operation}.ts`) e o vocabulário existente
(`/tasks/:id/detail`, `/tasks/:id/content/update`).
- *Descartado*: devolver a preferência dentro de `POST /auth/login-or-register` e guardar no `useAuthStore`.
  O mobile hidrata `user` do AsyncStorage sem relogar, então "fechar e reabrir o app" mostraria o valor
  em cache, não o do backend — não provaria a Definição de Pronto item 2.

### D3 — O catálogo de modelos viaja **junto com** a preferência, em `GET /agent-preferences/detail`
Resposta: `{ item: { modelSlug, effort, models: [{ slug, label, efforts, defaultEffort }] } }`.
O mobile espelha **o tipo** à mão (convenção do repo, igual a `message-trace.ts`) mas **nunca os valores**.
- *Porquê*: o briefing exige backend como fonte única da verdade e validação do par no backend. Se o mobile
  tivesse a tabela de efforts em código, ela poderia divergir e oferecer um effort que o backend rejeita.
  Uma tabela hardcoded no mobile é dado duplicado; o tipo espelhado não é.
- *Descartado*: rota separada `GET /agent-models/list`. Custa um segundo fetch, um segundo estado de
  loading e um segundo ponto de falha no sheet, para a mesma informação. É uma única operação do ponto
  de vista do usuário: "quais são minhas opções e qual está escolhida".
- *Descartado*: espelho manual dos valores em `src/api/models/` (o que o repo faz hoje com *tipos*). O repo
  espelha formato, não conteúdo — não há precedente de espelhar dados de negócio.

### D4 — Modelo e effort entram no **payload** de `generateReply`/`generateTaskTurn`, não no construtor
`BenAgentProviderService` perde o parâmetro `LanguageModel` do construtor e passa a resolver o modelo por
chamada, a partir de `payload.model: AgentModelSelection`. As duas rotas continuam instanciando o serviço
e os use-cases em module-scope, exatamente como hoje.
- *Porquê*: é o que o recon de backend aponta como lugar certo (`GenerateReplyPayload`/`GenerateTaskTurnPayload`
  no port `src/adapters/agent-provider.ts`); mantém o diff pequeno, não mexe na forma de wiring das rotas,
  e "qual modelo" passa a ser semanticamente parte do pedido — que é o que de fato é.
- *Descartado*: fábrica por request (`new BenAgentProviderService(model)` dentro do handler). Obrigaria a
  reconstruir `CreateTaskMessageUseCase` a cada request ou a injetar o serviço em `execute()`, mudando a
  assinatura do use-case sem ganho.
- *Descartado*: injetar um resolvedor (`(selection) => LanguageModel`) no construtor. Abstração com uma
  única implementação; `models.ts` já é o helper compartilhado na raiz da pasta do serviço
  (service-structure.md), e `index.ts` importá-lo é exatamente o padrão.

### D5 — A preferência é lida **no backend**, por `req.userId`; o mobile não manda modelo no body
`POST /chat` e `POST /tasks/:id/messages/create` mantêm o body atual. O handler chama
`GetAgentPreferencesUseCase` e passa o resultado adiante.
- *Porquê*: o briefing diz "persistida no backend por usuário"; mandar do cliente criaria uma segunda
  fonte da verdade e um vetor de spoof.

### D6 — O effort `max` viaja por `extraBody`, não por `providerOptions`
O `.d.ts` instalado de `@openrouter/ai-sdk-provider@2.9` tipa:
```ts
reasoning?: { enabled?: boolean; exclude?: boolean } &
  ({ max_tokens: number } | { effort: 'xhigh'|'high'|'medium'|'low'|'minimal'|'none' })
```
— **sem `max`**, embora a API aceite. No mesmo tipo, `extraBody?: Record<string, unknown>`.
Verificado em `node_modules/@openrouter/ai-sdk-provider/dist/index.js` (construção do body do chat):
```js
const baseArgs = { ..., reasoning: this.settings.reasoning, ..., ...this.config.extraBody, ...this.settings.extraBody }
```
`extraBody` é espalhado **por último**, no topo do body — ou seja, `extraBody.reasoning` vira
`body.reasoning`, que é exatamente o campo da API do OpenRouter, e sobrescreve `settings.reasoning`.
Como `extraBody` é `Record<string, unknown>`, `'max'` compila sem cast e sem `@ts-expect-error`.
- *Descartado*: `providerOptions: { openrouter: { reasoning: { effort } } }` em `generateText` — cairia no
  mesmo enum e exigiria cast.
- *Descartado*: remover `max` da lista — proibido pelo briefing.
- *Descartado*: alargar o tipo com declaration merging — mexe em tipos de terceiro por um valor.

### D7 — O trace carrega o modelo e o effort **pedidos**, no nível do trace
`AgentCallTrace` ganha `modelSlug: string | null` e `effort: string | null`, preenchidos a partir da
seleção, não da resposta do provider. `AgentCallStep.modelId` (o que o provider respondeu) fica intacto.
- *Porquê*: as duas fases (`context` e `format`) usam a mesma seleção, então é um dado do trace, não do step;
  e registrar o **pedido** é o que prova que a escolha do usuário chegou lá.
- *Tipo `string | null` e não as unions*: o trace é registro histórico, guardado como JSON em mensagens
  antigas. Um slug removido do catálogo no futuro não pode quebrar o parse. É o mesmo critério do
  `modelId: string | null` que já existe.
- *Exibição*: a pill de modelo do `message-trace-meta-strip` passa a mostrar `trace.modelSlug ?? trace.modelId ?? 'unknown model'`
  e ganha uma pill nova `effort · {trace.effort}`, renderizada só quando `trace.effort` existe (traces
  antigos continuam legíveis). Bônus já existente: o "Raw request JSON" da aba Input mostra
  `step.input.requestBody`, que agora contém `"model"` e `"reasoning":{"effort":...}` de verdade.

### D8 — Registro de modelos mora no **domínio**, em `src/domain/utils/agent-models.ts`
É regra de negócio (quais modelos o usuário pode escolher e qual effort cada um aceita) e é consumida por
dois use-cases, pelo presenter e, indiretamente, pelo serviço de infra.
- *Porquê*: `backend-domain-structure.md` reserva `domain/utils/{entity}.ts` para helpers compartilhados por
  vários use-cases. Se o registro morasse em `infra/services/ben-agent-provider/`, o domínio importaria infra
  e inverteria a direção de dependência.
- As unions `AgentModelSlug` e `AgentEffort` ficam em `src/domain/entities/user.ts`, ao lado de `UserProps`
  (domain-entity-declaration.md: "export the value/union types the props reference alongside it").

### D9 — UI: lista de rádio para o modelo, chips pill para o effort, dentro do sheet atual
- **Modelo** (3 opções, rótulos longos): linhas `Pressable` empilhadas, no mesmo visual do botão de sign-out
  (`rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3`), com `Check` (lucide)
  na linha selecionada e `border-primary` nela. `SegmentedControl` não serve: 3 rótulos de ~18 caracteres
  em 350px de largura útil ficam ilegíveis.
- **Effort** (3 a 6 opções, rótulos curtos, quantidade variável): linha de chips pill que quebra em duas
  linhas (`flex-row flex-wrap gap-2`); selecionado `bg-primary` + `text-on-primary`, não selecionado
  `bg-surface-container` + `text-on-surface-variant`. `SegmentedControl` também não serve aqui: ele é
  `flex-1` por item e com 6 itens (luna) cada célula fica com ~55px, cortando "medium"/"xhigh".
  `design.md` §Shapes autoriza explicitamente: "Chips and progress indicators may use pill-shaped rounding".
- *Descartado*: `SegmentedControl` existente para qualquer um dos dois — pelos motivos acima. Nenhum
  componente novo em `ui/` é criado: os dois controles são específicos deste sheet e ficam em
  `layout/components/menu-settings/`, pasta plana, como `menu-detail/`.

### D10 — Altura do sheet: `maxHeight` + `ScrollView`
`SettingsSheet` passa a medir com `useWindowDimensions()` e a envolver o corpo (perfil + seção do agente +
sign-out) num `ScrollView` com `style={{ maxHeight: height * 0.7 }}`. É o mesmo recurso que
`message-trace-sheet.tsx` já usa (`useWindowDimensions` + `height * 0.9`).
- *Porquê*: com luna selecionado são 3 linhas de modelo + 6 chips em 2 linhas + perfil + sign-out; em
  telas curtas isso passa de 70% da altura e o botão de sign-out sairia da tela.
- *Descartado*: `slideOffset` maior no overlay — não resolve conteúdo que não cabe.

### D11 — Estado da seção no mobile: hook composto + otimismo, sem store nova
`src/layout/hooks/use-agent-preferences.ts` compõe `useAgentPreferencesData` (fetch) + `useAPIMutation`
(save) + o valor otimista local, e devolve `{ state, actions }`. `SettingsView` continua sendo o único
container; `SettingsSheet` continua puro.
- *Porquê*: precedente direto é `layout/hooks/use-google-auth.ts` (hook composto em `layout/hooks/`); o
  estado é efêmero (dura o sheet aberto) e derivado de uma query.
- *Descartado*: store zustand dedicada — "Feature State Components Structure" pede zustand para estado
  estruturado de página; aqui é um par de escalares vivendo dentro de um modal.
- **Comportamento ao trocar de modelo**: aplica o novo modelo no estado local na hora; se o effort atual
  não estiver em `efforts` do novo modelo, cai no `defaultEffort` dele; dispara o POST com o par já
  corrigido. Em falha, reverte para o último par confirmado pelo servidor e mostra banda de erro com retry.

### D12 — `openRouterModel` sai de `models.ts`; `geminiModel` fica
`openRouterModel` (a constante module-scope) deixa de existir porque a feature a substitui — não é
"conserto de passagem", é o objeto que esta mudança torna impossível de manter. `geminiModel`, que o
briefing manda não tocar, fica exatamente como está.

---

## Etapas

Ordem obrigatória. Rodar `npx tsc --noEmit` no backend ao fim da etapa 6 e no mobile ao fim da etapa 11.

### Etapa 1 — Tipos e campos novos no domínio do usuário
Arquivos:
- **edita** `/root/so/repos/ben-prototype/project-backend/src/domain/entities/user.ts`
  - exporta `AgentModelSlug` e `AgentEffort` (ver Contratos C1);
  - adiciona `agentModelSlug: AgentModelSlug | null` e `agentEffort: AgentEffort | null` a `UserProps`.
- **edita** `/root/so/repos/ben-prototype/project-backend/src/domain/use-cases/auth/login-or-register.ts`
  - em `registerUser`, `userRepository.create({ ..., agentModelSlug: null, agentEffort: null })`.
- **edita** `/root/so/repos/ben-prototype/project-backend/src/infra/http/presenters/user-presenter.ts`
  - o retorno é `Omit<Serialize<WithID<UserProps>>, 'createdAt'>`; passa a ser
    `Omit<Serialize<WithID<UserProps>>, 'createdAt' | 'agentModelSlug' | 'agentEffort'>`.
    **Sem isso o `tsc` quebra** — o tipo passaria a exigir dois campos que o presenter não devolve.
    O corpo do método não muda: a preferência não trafega no payload de login (D2).

*Pronto quando*: `npx tsc --noEmit` no backend só reclama dos arquivos ainda não escritos das etapas
seguintes (nenhum erro em `user.ts`, `login-or-register.ts`, `user-presenter.ts`).
*Não há migração Prisma nesta etapa nem em nenhuma outra.*

### Etapa 2 — Registro de modelos no domínio
Arquivo:
- **cria** `/root/so/repos/ben-prototype/project-backend/src/domain/utils/agent-models.ts` (Contratos C2).
  Conteúdo: `AgentModelOption`, `AgentModelSelection`, a constante `AGENT_MODELS` com os 3 modelos,
  `DEFAULT_AGENT_MODEL_SLUG`, `findAgentModel(slug)`, `isSupportedEffort(slug, effort)` e
  `resolveAgentSelection(props)` (aplica defaults e tolera `undefined`).

*Pronto quando*: o arquivo compila isolado e `resolveAgentSelection({})` devolve
`{ modelSlug: 'openai/gpt-5.6-luna', effort: 'medium' }`.

### Etapa 3 — Port do agente e tipo do trace
Arquivos:
- **edita** `/root/so/repos/ben-prototype/project-backend/src/adapters/agent-provider.ts`
  - adiciona `model: AgentModelSelection` a `GenerateReplyPayload` e a `GenerateTaskTurnPayload`
    (importando de `@/domain/utils/agent-models` — `adapters/` já importa domínio, ver
    `adapters/repositories/user-repository.ts`).
- **edita** `/root/so/repos/ben-prototype/project-backend/src/adapters/agent-call-trace.ts`
  - `AgentCallTrace` ganha `modelSlug: string | null` e `effort: string | null`.

*Pronto quando*: os tipos compilam; os erros restantes apontam só para quem ainda não passa os campos novos.

### Etapa 4 — Serviço: resolver o modelo por chamada
Arquivos:
- **edita** `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/models.ts`
  - remove `export const openRouterModel = ...`;
  - adiciona `export function resolveOpenRouterModel(selection: AgentModelSelection): LanguageModel`
    (Contratos C3), mantendo o bloco `provider` de hoje e acrescentando `reasoning: { effort }` dentro
    do **mesmo** `extraBody`;
  - `geminiModel` e o `createGoogleGenerativeAI` acima dele **não são tocados**.
- **edita** `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/trace-builders.ts`
  - `buildAgentCallTrace` recebe `selection: AgentModelSelection` a mais e devolve
    `modelSlug: selection.modelSlug, effort: selection.effort` junto dos campos atuais.
- **edita** `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/index.ts`
  - remove o `constructor(private readonly model: LanguageModel)`;
  - em `generateReply`: `const model = resolveOpenRouterModel(payload.model)` no topo, usa `model` nas duas
    chamadas `generateText` (hoje `this.model`), e passa `selection: payload.model` a `buildAgentCallTrace`;
  - em `generateTaskTurn`: mesma resolução, usa `model` na chamada;
  - o import de `LanguageModel` de `ai` sai se ficar sem uso (o lint acusa).

*Pronto quando*: o serviço compila e `grep -rn "openRouterModel" project-backend/src` não retorna nada
além do que as etapas 5/6 ainda vão corrigir.

### Etapa 5 — Use-cases de preferência
Arquivos:
- **cria** `/root/so/repos/ben-prototype/project-backend/src/domain/use-cases/agent-preferences/get-agent-preferences.ts`
  — `GetAgentPreferencesUseCase(userRepository)`, `execute({ userId }) → ItemResponse<AgentModelSelection>`
  (busca o `User` por id e devolve `resolveAgentSelection(user.props)`).
- **cria** `/root/so/repos/ben-prototype/project-backend/src/domain/use-cases/agent-preferences/update-agent-preferences.ts`
  — `UpdateAgentPreferencesUseCase(userRepository)`, `execute({ userId, modelSlug, effort })`:
  valida o par com `isSupportedEffort` e, se inválido, lança
  `new ValidationError({ errorField: 'effort', code: 'UNSUPPORTED_AGENT_EFFORT' })` (→ HTTP 400 pelo
  `errorHandler` atual); persiste com `userRepository.update(user.id, { agentModelSlug, agentEffort })`
  e devolve `{ item: { modelSlug, effort } }`.
  O guard fica **dentro** do use-case (é usado por um só) — `domain/validation/` é só para guards
  compartilhados por vários use-cases.

*Pronto quando*: ambos compilam e o de update rejeita `('z-ai/glm-5.3-flash', 'medium')`.

### Etapa 6 — HTTP: presenter, rotas, registro e as duas rotas do agente
Arquivos:
- **cria** `/root/so/repos/ben-prototype/project-backend/src/infra/http/presenters/agent-preferences-presenter.ts`
  — `AgentPreferencesPresenter.toHttp(selection)` devolve `{ modelSlug, effort, models: AGENT_MODELS }`
  (Contratos C4). Precedente de presenter sobre valor não-entidade: `agent-reply-presenter.ts`.
- **cria** `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/agent-preferences/get-agent-preferences.ts`
  — handler `getAgentPreferences`, sem schema (só `req.userId`), devolve
  `{ item: AgentPreferencesPresenter.toHttp(result.item) }` com `HttpStatus.OK`.
- **cria** `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/agent-preferences/update-agent-preferences.ts`
  — handler `updateAgentPreferences`, `bodySchema = z.object({ modelSlug: z.string(), effort: z.string() })`
  (a validação de domínio do par é do use-case, não do Zod — ver R4), mesma resposta.
- **edita** `/root/so/repos/ben-prototype/project-backend/src/infra/http/app.ts`
  — registra as duas rotas com `authMiddleware`, no bloco depois de `/captures/counts`:
  ```ts
  app.get('/agent-preferences/detail', authMiddleware, getAgentPreferences)
  app.post('/agent-preferences/update', authMiddleware, updateAgentPreferences)
  ```
- **edita** `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/chat.ts`
  — remove o import de `openRouterModel`; `const agentService = new BenAgentProviderService()`;
  adiciona `const getAgentPreferencesUseCase = new GetAgentPreferencesUseCase(userRepository)`
  (importar `userRepository` de `@/infra/http/repositories`); dentro do handler, depois de
  `buildTopicIndexUseCase.execute`, `const preferences = await getAgentPreferencesUseCase.execute({ userId: req.userId })`
  e passa `model: preferences.item` em `agentService.generateReply({...})`.
- **edita** `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/tasks/create-task-message.ts`
  — `new BenAgentProviderService()` no construtor do use-case; instancia
  `GetAgentPreferencesUseCase`; no handler, resolve a preferência e passa `model` em
  `createTaskMessageUseCase.execute({...})`.
- **edita** `/root/so/repos/ben-prototype/project-backend/src/domain/use-cases/tasks/create-task-message.ts`
  — `Payload` ganha `model: AgentModelSelection`; `generateAgentReply` repassa `model: payload.model`
  para `agentService.generateTaskTurn`.

*Pronto quando*: `cd /root/so/repos/ben-prototype/project-backend && npm run lint:fix && npx tsc --noEmit`
saem limpos, e com o backend de pé:
```bash
curl -s localhost:3333/agent-preferences/detail -H "jwtauthenticationtoken: $JWT" -H "providerauthenticationtoken: x"
# {"item":{"modelSlug":"openai/gpt-5.6-luna","effort":"medium","models":[...3 itens...]}}
```

### Etapa 7 — Mobile: camada de API
Arquivos:
- **cria** `/root/so/repos/ben-prototype/project-mobile/src/api/models/agent-preferences.ts` (Contratos C5).
- **edita** `/root/so/repos/ben-prototype/project-mobile/src/api/routes.ts`
  — bloco novo `agentPreferences: { detail: '/agent-preferences/detail', update: '/agent-preferences/update' }`.
- **cria** `/root/so/repos/ben-prototype/project-mobile/src/api/requests/agent-preferences.ts`
  — `requestUpdateAgentPreferences(payload): Promise<AgentPreferences>`, devolvendo `response.data.item`.
- **cria** `/root/so/repos/ben-prototype/project-mobile/src/layout/hooks/api/use-agent-preferences-data.ts`
  — `useAPIRequest<ItemResponse<AgentPreferences>>({ url: API_ROUTES.agentPreferences.detail })`.

*Pronto quando*: compila e o hook existe; nada de UI ainda.

### Etapa 8 — Mobile: hook de estado da preferência
Arquivo:
- **cria** `/root/so/repos/ben-prototype/project-mobile/src/layout/hooks/use-agent-preferences.ts` (Contratos C6).
  Responsabilidades: valor otimista local (`useState<AgentSelection | null>`), sincronização com o dado
  do servidor quando ele chega (`useEffect` sobre `state.data`), `selectModel`/`selectEffort` que corrigem
  o effort inválido pelo `defaultEffort` do novo modelo e disparam `mutate`, e reversão em erro.
  Após um save bem-sucedido chama `actions.invalidate()` do `useAgentPreferencesData`.

*Pronto quando*: compila e `selectModel('z-ai/glm-5.3-flash')` com effort atual `medium` produz effort `max`.

### Etapa 9 — Mobile: componentes visuais da seção
Arquivos (todos em `/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu-settings/`, pasta plana):
- **cria** `agent-model-option.tsx` — uma linha de modelo (`label`, `isSelected`, `disabled`, `onPress`),
  `Check` do `lucide-react-native` com `color={primary}` quando selecionada
  (cor via `@/layout/utils/colors`, nunca hex inline — ver `mobile-icon-colors`).
- **cria** `agent-effort-chips.tsx` — `{ efforts, value, disabled, onChange }`, chips pill que quebram linha.
- **cria** `agent-settings-section.tsx` — componente **puro**: recebe `AgentSettingsState` + callbacks
  (Contratos C7) e renderiza o bloco inteiro: título `Ben's model` (`Typography variant="label-caps"`),
  as 3 linhas, o subtítulo `Effort`, os chips, e os estados:
  - `loading` → dois blocos `animate-pulse` no estilo do skeleton de perfil já existente;
  - `error` → banda `rounded-xl border border-text-error/30 bg-surface-error` com texto
    `couldn't load your model settings` e `retry` (mesmo visual da banda de sign-out);
  - `ready` + `isSaving` → o label `Effort` vira `Effort · saving…`, sem spinner (design.md §Components:
    "Avoid heavy spinners");
  - `ready` + `hasSaveError` → banda de erro `didn't save that — try again?` com `retry`.

*Pronto quando*: os três compilam e nenhum deles importa store ou hook de dados.

### Etapa 10 — Mobile: ligar no sheet de Settings
Arquivos:
- **edita** `/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu-settings/settings-sheet.tsx`
  — props novas `agent?: AgentSettingsState`, `onSelectModel`, `onSelectEffort`, `onRetryAgent`;
  corpo (perfil + `<AgentSettingsSection/>` + sign-out) envolvido num `ScrollView`
  com `style={{ maxHeight: height * 0.7 }}` de `useWindowDimensions()` e
  `contentContainerClassName`/`showsVerticalScrollIndicator={false}`; a `<AgentSettingsSection/>` entra
  **entre** o bloco de perfil e o bloco de sign-out, com um separador
  `border-t border-outline-variant/40` acima.
- **edita** `/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu-settings/settings-view.tsx`
  — chama `useAgentPreferences()` e repassa `agent` + os três callbacks. Nada mais muda ali.

*Pronto quando*: abrir Settings no app mostra a seção com os dados do backend.

### Etapa 11 — Mobile: espelho do trace e exibição
Arquivos:
- **edita** `/root/so/repos/ben-prototype/project-mobile/src/api/models/message-trace.ts`
  — `AgentCallTrace` ganha `modelSlug: string | null` e `effort: string | null` (espelho exato do backend).
- **edita** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/components/message-trace-sheet/message-trace-meta-strip.tsx`
  — pill 1 vira `trace.modelSlug ?? trace.modelId ?? 'unknown model'`; pill nova, só se `trace.effort`,
  com o texto `effort · {trace.effort}`, no mesmo estilo das outras
  (`rounded-full bg-surface-container px-2 py-1`, `Typography variant="label-caps" className="normal-case text-on-surface-variant"`).

*Pronto quando*: `cd /root/so/repos/ben-prototype/project-mobile && npm run lint:fix && npx tsc --noEmit` limpos.

---

## Contratos

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
  efforts: AgentEffort[]      // ordem crescente de esforço; é a ordem exibida na UI
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

export const DEFAULT_AGENT_MODEL_SLUG: AgentModelSlug = 'openai/gpt-5.6-luna'

export function findAgentModel(slug: AgentModelSlug): AgentModelOption {
  return AGENT_MODELS.find((model) => model.slug === slug) ?? AGENT_MODELS[0]
}

export function isSupportedEffort(slug: string, effort: string): boolean {
  const model = AGENT_MODELS.find((item) => item.slug === slug)
  return model ? model.efforts.includes(effort as AgentEffort) : false
}

// Tolera `undefined`: linhas gravadas antes desta feature voltam do JSON sem as chaves.
export function resolveAgentSelection(props: {
  agentModelSlug?: AgentModelSlug | null
  agentEffort?: AgentEffort | null
}): AgentModelSelection {
  const model = findAgentModel(props.agentModelSlug ?? DEFAULT_AGENT_MODEL_SLUG)
  const effort = props.agentEffort ?? null

  return {
    modelSlug: model.slug,
    effort: effort && model.efforts.includes(effort) ? effort : model.defaultEffort,
  }
}
```
Rótulos: exatamente os `name` do catálogo do OpenRouter, sem o prefixo do provedor
(`"OpenAI: GPT-5.6 Luna"` → `GPT-5.6 Luna`), porque o provedor já não cabe na linha.

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
      // `reasoning` vai por extraBody (e não por `settings.reasoning`) porque o .d.ts
      // do provider não tipa o effort 'max', que a API do OpenRouter aceita. extraBody
      // é Record<string, unknown> e é espalhado por último no body da requisição.
      reasoning: { effort: selection.effort },
    },
  })
}
```

### C4 — resposta HTTP de `/agent-preferences/*`
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
// envelopado pelas duas rotas como { item: ... }
// POST /agent-preferences/update  body: { modelSlug: string, effort: string }
```

### C5 — `project-mobile/src/api/models/agent-preferences.ts`
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

### C6 — `project-mobile/src/layout/hooks/use-agent-preferences.ts`
```ts
export function useAgentPreferences(): {
  state: {
    status: 'loading' | 'error' | 'ready'
    models: AgentModelOption[]
    modelSlug: AgentModelSlug | null
    effort: AgentEffort | null
    isSaving: boolean
    hasSaveError: boolean
  }
  actions: {
    selectModel: (slug: AgentModelSlug) => void
    selectEffort: (effort: AgentEffort) => void
    retry: () => void   // refetch quando status === 'error', re-save quando hasSaveError
  }
}
```

### C7 — `project-mobile/.../menu-settings/agent-settings-section.tsx`
```tsx
export type AgentSettingsState = {
  status: 'loading' | 'error' | 'ready'
  models: AgentModelOption[]
  modelSlug: AgentModelSlug | null
  effort: AgentEffort | null
  isSaving: boolean
  hasSaveError: boolean
}

type AgentSettingsSectionProps = {
  state: AgentSettingsState
  onSelectModel: (slug: AgentModelSlug) => void
  onSelectEffort: (effort: AgentEffort) => void
  onRetry: () => void
}
```
Textos da UI (inglês, sentence-case, como o resto do sheet): `Ben's model`, `Effort`,
`couldn't load your model settings`, `didn't save that — try again?`, `retry`, `saving…`.

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

---

## Riscos e contingências

**R1 — Linhas antigas de `users` não têm as chaves novas.** O `props` é JSON; usuários criados antes
voltam com `agentModelSlug === undefined`, não `null`. Mitigação já embutida: `resolveAgentSelection`
tipa os campos como opcionais e usa `??`. **Nunca** comparar com `=== null`.

**R2 — `require_parameters: true` pode zerar os provedores de deepseek/glm.** O bloco `provider` de hoje
só roteia para provedores que suportam os parâmetros enviados; agora `reasoning` entra na conta. Se o
OpenRouter responder `No allowed providers are available for the selected model`, a contingência é
remover **apenas** `require_parameters` do `extraBody` (mantendo `sort` e `ignore`) e registrar o motivo
no relatório. Não remover o `reasoning`.

**R3 — `strict: true` do `response_format`.** Precedente documentado na run `2026-09-19-trocar-modelo-luna`:
os schemas Zod do agente têm `required` incompleto e provedores estilo OpenAI podem devolver
400 `Invalid schema for response_format`. Agora há 3 modelos, com roteamento diferente cada um. Se
aparecer, a contingência pronta é `structuredOutputs: { strict: false }` como **irmã** de `extraBody`
na chamada de `openrouter(...)` em `resolveOpenRouterModel`. Não aplicar preventivamente.

**R4 — Validação do par no Zod vs. no use-case.** O `bodySchema` da rota de update usa `z.string()`, não
`z.enum`. Motivo: se fosse `z.enum`, um slug desconhecido viraria erro de formato do Zod, e a regra
"este effort não existe para este modelo" — que é de negócio — ficaria partida entre duas camadas. O
use-case valida o par inteiro e lança `ValidationError` → 400 com `{"effort":["UNSUPPORTED_AGENT_EFFORT#"]}`.

**R5 — Sem `OPENROUTER_API_KEY` real no ambiente.** `project-backend/.env.development` existe com chave
fictícia. Itens 1 e 2 da Definição de Pronto são provados normalmente; 3 e 4 têm caminho alternativo no
Plano de teste (§"Sem chave real"). Isso precisa aparecer no relatório final, não ser escondido.

**R6 — `generateTaskTurn` não produz trace.** É verdade hoje e continua sendo: o item 4 da Definição de
Pronto ("o trace da mensagem mostra modelo e effort") só se aplica a mensagens de chat. Para mensagens de
task, o item 3 se prova pelo corpo efetivamente enviado ao OpenRouter (ver Plano de teste), não pelo sheet.
**Não** criar trace para task — está fora do escopo do briefing.

**R7 — Altura do sheet.** Se o `ScrollView` dentro do `Animated.View` do overlay não rolar no Expo web,
a causa costuma ser altura indefinida no pai: aplicar o `maxHeight` no `View` externo (como
`message-trace-sheet.tsx` faz) em vez de no próprio `ScrollView`.

**R8 — Sem cache de instâncias de `LanguageModel`.** `openrouter(slug, settings)` constrói um objeto
stateless por request. Não é gargalo (a chamada de rede domina) e um `Map` de cache seria otimização
prematura; registrado aqui para que a ausência não pareça esquecimento.

**R9 — `seed-ambiente.ts` / `seed-trace.ts` da run anterior chamam `userRepository.create` sem os campos
novos.** Rodam por `tsx` (transpila sem checar tipos), então continuam funcionando, e o usuário criado
cai exatamente no caso R1 — o que é bom: testa o caminho do default.

---

## Plano de teste

### Subir o ambiente
Backend e mobile **já estavam de pé** na porta 3333 e 8081 quando este plano foi escrito
(`curl localhost:3333/health` → 200, `curl localhost:8081` → 200). Se caírem:
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
é ele que o `npm run dev` lê (`NODE_ENV=development`), **não** o `.env`.

### Autenticar no browser
Gera usuário de teste + JWT (idempotente, imprime o token no fim):
```bash
cd /root/so/repos/ben-prototype/project-backend && NODE_ENV=development \
  npx tsx /root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/seed-ambiente.ts
```
No browser (viewport 390x844), em `http://localhost:8081`:
```js
localStorage.setItem('ben.jwttoken', '<JWT impresso acima>'); location.reload()
```
O app abre direto no chat.

### Roteiro do browser-tester
1. **DoD 1 — escolher modelo e effort, com a lista de effort mudando.**
   Abrir o menu → clicar `Settings` na sidebar → o sheet abre.
   - Ver a seção `Ben's model` com 3 linhas e `GPT-5.6 Luna` marcada, e `Effort` com **6** chips
     (`none low medium high xhigh max`), `medium` marcado. **Screenshot.**
   - Clicar `DeepSeek V4.1 Flash`. Os chips passam a **3** (`low high max`) e o selecionado vira `high`
     (default do deepseek, porque `medium` não existe lá). **Screenshot.**
   - Clicar o chip `max`. **Screenshot.**
2. **DoD 2 — persistência por usuário no backend.**
   - Confirmar no servidor, não só na tela:
     ```bash
     curl -s localhost:3333/agent-preferences/detail \
       -H "jwtauthenticationtoken: $JWT" -H "providerauthenticationtoken: x"
     # {"item":{"modelSlug":"deepseek/deepseek-v4.1-flash","effort":"max","models":[...]}}
     ```
   - Reiniciar o backend (`pkill -f "tsx watch" && npm run dev` de novo), recarregar a página do app,
     reabrir Settings: `DeepSeek V4.1 Flash` + `max` continuam marcados. **Screenshot.**
     (O estado sobrevive ao restart porque o driver é sqlite, não in-memory.)
3. **DoD 3 e 4 — a mensagem usa o modelo/effort escolhidos e o trace mostra os dois.**
   - **Com `OPENROUTER_API_KEY` real** (só se o ambiente tiver uma): mandar uma mensagem no chat,
     esperar a resposta do Ben, long-press na mensagem dele → sheet `Model call`:
     a pill de modelo mostra `deepseek/deepseek-v4.1-flash` e existe a pill `effort · max`. **Screenshot.**
     Aba `Input` → `Raw request JSON` contém `"model":"deepseek/deepseek-v4.1-flash"` e
     `"reasoning":{"effort":"max"}`. **Screenshot.** Depois abrir uma task e mandar uma mensagem lá:
     a resposta chega (prova que a rota de task também resolve a preferência).
   - **Sem chave real** (cenário esperado neste ambiente), três provas substitutas:
     a) **Corpo realmente enviado ao OpenRouter**, que prova as duas rotas de ponta a ponta:
        ```bash
        curl -s -X POST localhost:3333/chat -H 'Content-Type: application/json' \
          -H "jwtauthenticationtoken: $JWT" -H "providerauthenticationtoken: x" \
          -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"oi"}]}]}'
        tail -60 "$SCRATCH/backend.log"
        ```
        O `errorHandler` faz `console.error(err)` e o `APICallError` do AI SDK carrega
        `requestBodyValues` como propriedade própria — o log mostra o body enviado, com
        `model: 'deepseek/deepseek-v4.1-flash'` e `reasoning: { effort: 'max' }`. Repetir com
        `POST /tasks/<id>/messages/create` para cobrir a segunda rota. Se o Node não imprimir a
        propriedade, cair para (b).
     b) **Sonda do mapeamento**, um script `tsx` fora dos projetos que importa
        `resolveOpenRouterModel` e imprime `model.modelId` e `model.settings.extraBody` para os 3
        modelos em todos os efforts — prova inclusive que `max` passa pelo `tsc` e chega ao body.
     c) **Exibição do trace**: semear uma mensagem do Ben com trace, adaptando
        `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/seed-trace.ts`
        para incluir `modelSlug: 'deepseek/deepseek-v4.1-flash'` e `effort: 'max'` no objeto do trace;
        long-press na mensagem → as duas pills aparecem. **Screenshot.**
   - Em qualquer um dos caminhos, o relatório final diz explicitamente qual foi usado.
4. **Regressão mínima**: abrir o trace de uma mensagem antiga (sem `modelSlug`/`effort`): a pill de modelo
   cai em `trace.modelId` e a pill de effort não aparece — nada quebra.

### Lint e tipos (obrigatórios antes do commit)
```bash
cd /root/so/repos/ben-prototype/project-backend && npm run lint:fix && npx tsc --noEmit
cd /root/so/repos/ben-prototype/project-mobile  && npm run lint:fix && npx tsc --noEmit
```

---

## Premissas

1. **Nenhuma migração Prisma.** Baseado em `prisma/schema.prisma` (`model User { id, props, types }`) e em
   `SqliteRepository.toInfra`, que serializa os props como JSON. Se o revisor discordar, o ponto a atacar
   é esse arquivo, não o plano.
2. **A preferência não entra no payload de login** nem no `User` do mobile; vem da rota dedicada. Consequência
   direta de D2/D3.
3. **Rótulos dos modelos** foram encurtados a partir do `name` do catálogo OpenRouter
   (`openrouter-models.json`), tirando o prefixo do provedor. O usuário não especificou rótulos.
4. **Ordem dos efforts** exibida é crescente (`none → max`), invertendo a ordem em que a API do OpenRouter
   devolve `supported_efforts`. Não foi pedida; é leitura de UI (esquerda = menos esforço).
5. **`effort` no trace só no nível do trace**, não por step: as duas fases da mesma chamada usam a mesma
   seleção. Se o revisor quiser por step, é uma linha a mais em `buildAgentCallSteps`.
6. **Mensagens de task não ganham trace** (R6). O briefing pede o trace "da mensagem", e só mensagens de
   chat têm trace hoje.
7. **A pill de modelo passa a preferir `modelSlug`** sobre `modelId`. Traces antigos continuam mostrando
   `modelId`. Alternativa seria uma terceira pill; preferi não poluir a faixa.
8. **`openRouterModel` é removido** de `models.ts` por ficar sem uso depois de D4; `geminiModel` não é
   tocado, como o briefing manda.
9. **O implementador não cria testes automatizados** — o repo não tem suíte de testes e o briefing não pede.
