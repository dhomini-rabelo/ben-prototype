# Recon backend — configuração do modelo do agente Ben e conceito de "effort"

Read-only. Repo `/root/so/repos/ben-prototype`, branch `feat/config-model-and-effort`.

## 1. Onde `gpt-5.6-luna` está declarado

Um único arquivo, um único lugar:

- `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/models.ts`
  - `export const openRouterModel = openrouter('openai/gpt-5.6-luna', { extraBody: { provider: { sort: 'throughput', ignore: ['cerebras'], require_parameters: true } } })`
  - O id do modelo é um literal string, hardcoded, passado direto na chamada de fábrica `openrouter(modelId, settings)`. Não há env var, não há config file, não há enum de modelos.
  - `openRouterModel` é uma constante de módulo (instanciada uma vez no import), não algo criado por request.
  - No mesmo arquivo existe `export const geminiModel = google('gemini-2.5-flash-lite')` (via `@ai-sdk/google`) — **é código morto**: `grep -rn "geminiModel" src` só retorna a própria declaração, nenhum import em lugar nenhum. Achado pela run anterior (`relatorio-final.md` da run `2026-09-19-trocar-modelo-luna`), nunca removido.
  - Commit de referência `255bd80` (`git show --stat 255bd80`): trocou só a string do modelo, de `openai/gpt-oss-120b` para `openai/gpt-5.6-luna`, um arquivo, uma linha.

`openRouterModel` é consumido em exatamente 2 pontos, cada um instanciando seu próprio `BenAgentProviderService`:

- `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/chat.ts:39` → `const agentService = new BenAgentProviderService(openRouterModel)` (usado pela rota `POST /chat`)
- `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/tasks/create-task-message.ts:12` → `new BenAgentProviderService(openRouterModel)` dentro do `new CreateTaskMessageUseCase(taskRepository, ...)` (usado pela rota `POST /tasks/:id/messages/create`)

Ambos os pontos são módulo-scope (instanciados uma vez no boot do processo), não por request. Uma task de "escolher modelo por request" precisa mudar esse padrão: hoje não dá para escolher o modelo em runtime sem reinstanciar `BenAgentProviderService` (ou passar o modelo como parâmetro do método, já que `LanguageModel` é injetado só no construtor).

## 2. SDK/provider e onde entraria o parâmetro de effort

- **SDK**: Vercel AI SDK (`ai` v6, `^6.0.193`) + provider `@openrouter/ai-sdk-provider` v `^2.9.0` (todo o tráfego do agente passa pelo OpenRouter) + `@ai-sdk/google` v `^3.0.80` (só o `geminiModel` morto usa isso).
- `package.json`: `/root/so/repos/ben-prototype/project-backend/package.json`.
- **Onde os parâmetros da chamada são montados**: dois lugares, ambos em `BenAgentProviderService` (`/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/index.ts`), que chama `generateText({ model: this.model, system, prompt, output, tools, toolChoice, stopWhen, prepareStep, onStepFinish })` do `ai`. `this.model` é o `LanguageModel` injetado no construtor — hoje sempre `openRouterModel`.
- **Onde entraria um parâmetro de effort**: confirmado no `.d.ts` instalado (`node_modules/@openrouter/ai-sdk-provider/dist/index.d.ts`, tipo `OpenRouterProviderOptions`), o provider OpenRouter já suporta reasoning effort nativamente, como **irmão de `extraBody`**, no mesmo objeto de settings passado a `openrouter(modelId, settings)`:
  ```ts
  reasoning?: {
    enabled?: boolean
    exclude?: boolean
  } & ({ max_tokens: number } | { effort: 'xhigh' | 'high' | 'medium' | 'low' | 'minimal' | 'none' })
  ```
  Isso é exatamente o "nível de raciocínio" pedido pela task. `OpenRouterSharedSettings` (mesmo arquivo) também expõe `temperature`, `topP`, `topK`, `frequencyPenalty` como "default para a chamada, sobrescrevível em `generateText`/`streamText`" — ou seja, dá pra setar por modelo (em `models.ts`) OU por chamada (passando `providerOptions: { openrouter: { reasoning: {...} } }` em `generateText`, que é o padrão do AI SDK para overrides por request). A rota "por chamada" é a que permite variar o effort sem trocar a instância do modelo.
  - **Risco documentado**: o campo `reasoning.effort` aceita um enum fixo (`xhigh|high|medium|low|minimal|none`) que é o vocabulário de reasoning da OpenAI/estilo o5; não é garantido que os 3 modelos-alvo da task (deepseek, glm, luna) aceitem os mesmos valores — "controlar o effort de acordo com o que cada modelo suporta" (pedido explícito do usuário) provavelmente vai exigir uma tabela de mapeamento por modelo, não um enum único repassado cru.

## 3. Conceito de effort/reasoning/thinking/temperature hoje

- **Não existe controle de effort/reasoning hoje.** Nenhuma chamada em `ben-agent-provider` passa `reasoning`, `temperature`, `topP` nem nenhum parâmetro de sampling — nem hardcoded nem configurável. `generateText` é chamado só com `model/system/prompt/output/tools/...`. Confirmado por `grep -rniE "reasoning|effort|thinking|temperature" project-backend/src project-mobile/src`.
- **O que existe é só *leitura/observabilidade* de reasoning, não controle**: a feature recente "inspeção de input/output das mensagens" (commit `1ea2d11`) registra `reasoningTokens` no trace de cada chamada:
  - `/root/so/repos/ben-prototype/project-backend/src/adapters/agent-call-trace.ts` — tipo `AgentCallUsage.reasoningTokens: number | null`, e `AgentCallStep.modelId` / `AgentCallTrace.modelId` (já rastreiam **qual modelId respondeu cada step** — útil de reaproveitar se a escolha de modelo passar a variar por chamada).
  - `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/trace-builders.ts` — extrai `usage.outputTokenDetails.reasoningTokens` e `step.response.modelId` do resultado do AI SDK.
  - Rota `GET /messages/:id/trace` (`/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/messages/get-message-trace.ts`) expõe isso via `MessageTracePresenter`.
- **Run anterior já documentou o risco de mexer perto disso**: a run `2026-09-19-trocar-modelo-luna` (pasta `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/`, ver `relatorio-final.md` e `r3-plano-v2.md` seção 4) documenta que o provider OpenRouter manda `response_format.json_schema.strict: true` por padrão, e os schemas Zod do agente (`agentReplySchema` em `generate-reply/schemas.ts`, `taskTurnReplySchema` em `generate-task-turn/schemas.ts`) têm `required` incompleto por causa de `z.optional()` em vários campos — modelos que só roteiam para OpenAI/Azure/Bedrock (como o luna) validam isso à moda estrita da OpenAI e podem devolver 400 `Invalid schema for response_format`. A contingência pronta (não aplicada, condicional a esse erro aparecer) é `structuredOutputs: { strict: false }` como irmã de `extraBody`. **Isso é relevante para a task de 3 modelos**: deepseek/glm podem ter comportamento de roteamento e de suporte a `strict`/`response_format` diferente do luna — o mesmo tipo de armadilha pode se repetir por modelo.

## 4. Endpoints e como o mobile envia configuração hoje

Rotas registradas em `/root/so/repos/ben-prototype/project-backend/src/infra/http/app.ts`:

```
POST /auth/login-or-register
GET  /messages/list
GET  /messages/:id/trace
POST /chat
POST /transcription
GET  /tasks/list
GET  /tasks/:id/detail
POST /tasks/:id/messages/create
POST /tasks/:id/diff/approve
POST /tasks/:id/diff/reject
POST /tasks/:id/content/update
POST /tasks/:id/todos/update
POST /tasks/:id/finish
POST /tasks/:id/reopen
GET  /notes/list
GET  /notes/:id/detail
GET  /reminders/list
GET  /reminders/:id/detail
GET  /captures/counts
```

As duas rotas que chamam o agente são `POST /chat` e `POST /tasks/:id/messages/create`.

- **Body do `POST /chat`** hoje (schema Zod em `chat.ts`, `chatBodySchema`): `{ messages: [{ role: 'user'|'assistant'|'system', parts: [{ type: string, text?: string }] }] }`. Nenhum campo de modelo/effort.
  - Mobile monta esse body em `/root/so/repos/ben-prototype/project-mobile/src/api/requests/chat.ts` (`requestSendChatMessage`): `authClient.post(API_ROUTES.chat.send, { messages: [{ role: 'user', parts: [{ type: 'text', text }] }] })`. Nenhuma config de modelo/effort é enviada nem lida de nenhum store.
- **Body do `POST /tasks/:id/messages/create`**: `{ content: string }` (`messageBodySchema` em `create-task-message.ts`). Também sem config de modelo.
- **Nenhuma configuração de modelo/effort trafega hoje** nem no body, nem em headers, nem persistida em settings no mobile. Não existe tela de settings/preferências de modelo: `project-mobile/src/pages/menu/page.tsx` é a única página de "menu" e não tem nada relacionado (não lida em detalhe, mas nenhuma referência a "model"/"effort"/"reasoning" existe em `project-mobile/src` — grep já cobriu isso). Se a task quiser permitir a escolha pelo usuário, esse é um recurso novo de ponta a ponta (schema de request + tela/estado no mobile), não uma extensão de algo existente.

## 5. Types/schemas compartilhados ou duplicados entre backend e mobile

**Não há pacote compartilhado.** Backend e mobile são dois `package.json` / dois `tsconfig` independentes; os types de trace são **duplicados manualmente**, com pequenas diferenças de estilo:

- Backend: `/root/so/repos/ben-prototype/project-backend/src/adapters/agent-call-trace.ts` — `type` aliases (`AgentCallUsage`, `AgentCallStep`, `AgentCallTrace`, etc).
- Mobile: `/root/so/repos/ben-prototype/project-mobile/src/api/models/message-trace.ts` — os mesmos nomes, mas como `interface`, mais o wrapper `MessageTrace` que não existe no backend (o presenter é quem monta esse formato de resposta).

Convenção implícita confirmada: quando o backend expõe um novo formato de dado (aqui, o trace), o mobile replica o shape à mão em `src/api/models/` ou `src/api/responses/`, sem importar do backend. Qualquer novo type de "modelo escolhido" / "effort" na resposta (ex.: em `AgentCallStep`/`AgentCallTrace`, que já carregam `modelId`) vai precisar do mesmo espelhamento manual dos dois lados.

## 6. Convenções do backend a respeitar / riscos e armadilhas

Convenções (de `code-get-coding-designs`, confirmadas contra o código real):

- **Backend adapters/services** (`backend-adapters-and-services-structure.md`): a porta (`AgentService`, em `src/adapters/agent-provider.ts`) declara o contrato; a implementação (`BenAgentProviderService`, em `src/infra/services/ben-agent-provider/`) implementa a porta. Se a task adicionar "modelo escolhido"/"effort" ao payload de `generateReply`/`generateTaskTurn`, os tipos `GenerateReplyPayload`/`GenerateTaskTurnPayload` do adapter (`agent-provider.ts`) são o lugar certo para declarar o novo campo — use-cases e rotas dependem da porta, nunca da implementação direto.
- **Service structure** (`service-structure.md`): `ben-agent-provider/` já segue o padrão de pasta-por-operação (`generate-reply/`, `generate-task-turn/` com `schemas.ts`/`system-prompt.ts` próprios) com `index.ts` enxuto e `models.ts`/`trace-builders.ts` como helpers compartilhados na raiz da pasta. Uma tabela de "modelos suportados + effort permitido por modelo" deveria virar um helper novo na raiz desta pasta (ex. `models.ts` estendido, ou um `model-registry.ts` irmão), não dentro de uma pasta de operação.
- **Backend HTTP layer** (`backend-http-layer-structure.md`): um handler por arquivo em `routes/{feature}/{operation}.ts`; `repositories.ts` é fonte única de instâncias de repositório (não existe algo assim ainda para o agente — `BenAgentProviderService`/`openRouterModel` são instanciados soltos em cada rota, duplicado entre `chat.ts` e `create-task-message.ts`; ao introduzir múltiplos modelos, vale considerar centralizar essa fábrica, mas isso é decisão de design, não algo já convencionado).
- **kebab-case** para arquivos/pastas em todo o backend; só identificadores exportados (classes/interfaces) mantêm seu casing próprio.
- **Riscos/armadilhas**:
  1. **`strict: true` do OpenRouter por default** (seção 3) — cada modelo novo pode rotear para provedores diferentes com validação de schema diferente; testar com uma chamada real antes de assumir que os 3 modelos aceitam o `Output.object(agentReplySchema)`/`taskTurnReplySchema` como estão.
  2. **`require_parameters: true`** em `extraBody.provider` hoje filtra para "só provedores que suportam os parâmetros que queremos usar" — se `reasoning`/`effort` virar um parâmetro desejado, isso pode reduzir ainda mais quais provedores atendem cada um dos 3 modelos; e o enum de `reasoning.effort` do OpenRouter (`xhigh|high|medium|low|minimal|none`) é modelado no vocabulário de reasoning da OpenAI — não confirmado que deepseek/glm reconheçam os mesmos valores (o pedido do usuário já assume que isso varia por modelo, então precisa de um mapeamento explícito, não repasse cru).
  3. **Model é module-scope, não per-request** hoje (seção 1) — qualquer UI de "escolher modelo" implica mudar `BenAgentProviderService`/rotas para aceitar o modelo (e o effort) como parâmetro de request, não mais como constante de import.
  4. **`geminiModel` morto** — não confundir com um "segundo provider já pronto"; é código não referenciado, não uma segunda opção funcional.
  5. **Ambiente sem `OPENROUTER_API_KEY`/`.env`** nesta máquina (confirmado na run anterior) — qualquer teste de ponta a ponta real (chamar os 3 modelos de verdade) provavelmente vai esbarrar na mesma limitação; só `.env.example` existe.
  6. **Regra do CLAUDE.md**: depois de qualquer edição, rodar `npm run lint:fix` e `npx tsc --noEmit` dentro de `project-backend` (e do `project-mobile` se algo mudar lá).

## 7. Memória/docs do projeto sobre escolha de modelo

- **Nada em `.claude/memory/`** especificamente sobre escolha de modelo, effort ou reasoning. `.claude/memory/environment/README.md`, `.../decisions/README.md` e `.../rules/README.md` estão todos vazios ("Nenhuma entrada ainda."). O único hit de grep por "model" em memory foi `.claude/memory/business-rules/razao-de-negocio-e-casos-de-uso-v1.md`, e é sobre "modelo de dados" (entities Note/Reminder/Task), não sobre modelo de LLM — falso positivo.
- **A run anterior que troca o modelo para luna** não é memória formal, mas é o precedente direto mais relevante: `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/relatorio-final.md` e `r3-plano-v2.md` (seção 4, "Contingência de saída estruturada em modo `strict`"). Documentam: (a) o slug do OpenRouter usado é o "móvel" (`openai/gpt-5.6-luna`), não o `canonical_slug` datado, para não congelar snapshot; (b) nenhum parâmetro de geração era passado antes, e "o default do modelo é `medium`" (premissa assumida pela run anterior sobre reasoning effort, não verificada em runtime); (c) o risco de `strict` por provedor, com fix pronto e não aplicado.
- Nenhum outro documento de projeto (`.claude/agents-docs/`) menciona modelo de LLM, effort ou reasoning — são todos sobre design visual/UX, não sobre a camada de IA.

## Premissas assumidas nesta recon

- Assumi que "modelo do agente Ben" na task se refere só ao `LanguageModel` usado por `BenAgentProviderService` (as duas chamadas de `generateText`), não ao `geminiModel` (morto) nem à transcrição (AssemblyAI, provider totalmente separado em `src/infra/services/` — não investigado a fundo aqui por estar fora do escopo pedido).
- Não tentei subir o backend nem chamar o OpenRouter de verdade (sem `OPENROUTER_API_KEY` neste ambiente, confirmado pela run anterior); as afirmações sobre `reasoning`/`structuredOutputs` vêm da leitura do `.d.ts` do pacote instalado (`node_modules/@openrouter/ai-sdk-provider`), não de teste em runtime.
- Não explorei `deepseek`/`glm 5.3 flash` no catálogo real do OpenRouter (precisaria de acesso de rede/API que não tentei aqui, já que a task pediu só mapear o estado atual do backend, não validar os 3 modelos-alvo).
