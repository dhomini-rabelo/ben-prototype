VEREDITO: RECUSADO

# Revisão independente — rodada 2

Revisor: opus, sem participação no plano. Nada foi editado no projeto; o único arquivo escrito é este.

A recusa **não é sobre a linha 15** — o diff proposto está certo. É sobre duas afirmações do plano
que não se sustentam: (a) "a troca não exige mudança nenhuma em `index.ts`", derivada só da lista
de capacidades do catálogo, quando o esquema que o AI SDK emite viola o modo `strict` dos únicos
endpoints que servem o modelo; e (b) a seção "Como provar", cujos comandos não rodam neste
ambiente — sem `node_modules` no backend e sem `.env`, os portões 2 e 4 da definição de pronto
são inexecutáveis como escritos.

---

## O que eu confirmei, item por item

### 1. O slug existe — plano CORRETO

`curl https://openrouter.ai/api/v1/models` em 2026-09-19: HTTP 200, 739.854 bytes, 447 modelos.
`openai/gpt-5.6-luna` está no catálogo com esse texto exato. A família confere com o plano:
`-pro`, `:batch`, `-pro:batch`, e as irmãs `sol` e `terra`. `openai/gpt-oss-120b` continua existindo
(não é caso de modelo removido).

Ficha, conferida por mim no mesmo payload — bate com o plano em todos os campos citados:

- `canonical_slug`: `openai/gpt-5.6-luna-20260709` · `context_length`: 1.050.000 ·
  `max_completion_tokens`: 128.000 · `knowledge_cutoff`: 2026-02-16
- `pricing`: prompt 0,20/M · completion 1,20/M · cache read 0,02/M, com override acima de 272K
- `reasoning`: `mandatory: false`, `default_enabled: true`, `default_effort: "medium"`
- `supported_parameters`: `tools`, `tool_choice`, `structured_outputs`, `response_format`,
  `reasoning`, `reasoning_effort`, `max_tokens`, `max_completion_tokens`, `seed`, `include_reasoning`

Usar o alias e não o snapshot datado está certo, e é o padrão que o arquivo já seguia.

### 2. Compatibilidade — plano INCOMPLETO (ver item 1 da lista de correções)

No nível do catálogo, sim: `tools`, `tool_choice`, `response_format` e `structured_outputs` estão
todos suportados. Mas "suportado" não é a mesma pergunta que "aceita o esquema que este código
manda". Verifiquei a segunda, que o plano não verificou. Detalhe completo na lista de correções.

### 3. O raciocínio sobre o `extraBody` — plano CORRETO, e bem argumentado

`GET /api/v1/models/openai/gpt-5.6-luna/endpoints` (HTTP 200) devolve 7 endpoints:

| provider | tags | `tools`/`tool_choice` | `response_format`/`structured_outputs` |
|---|---|---|---|
| OpenAI | `openai`, `openai/fast`, `openai/flex` | sim | sim |
| Azure | `azure`, `azure/us`, `azure/eu` | sim | sim |
| Amazon Bedrock | `amazon-bedrock/us-east-1` | sim | **não** |

- `require_parameters: true` — manter, e a justificativa do plano está certa: é o que mantém a
  chamada de saída estruturada longe do endpoint da Bedrock.
- `ignore: ['cerebras']` — o plano acertou o fato. Conferi o outro lado: a Cerebras **serve** o
  `gpt-oss-120b` (tag `cerebras/fp16`), então a entrada tinha função antes; não serve o
  `gpt-5.6-luna`, então vira no-op. Manter é a decisão certa e removê-la seria escopo extra.
- `sort: 'throughput'` — ortogonal ao modelo. Manter.

Nada a mudar aqui. A divergência foi registrada em vez de corrigida em silêncio, que é o
comportamento certo.

### 4. Completude da varredura — plano CORRETO

Repeti a busca por conta própria (`grep -rn -i -e 'gpt-oss' -e 'gpt_oss' -e '120b' -e 'gpt-5'`,
excluindo `node_modules`, `.git`, `dist`, `.expo`, `.claude/tmp`): uma única ocorrência, em
`project-backend/src/infra/services/ben-agent-provider/models.ts:15`. Nada em `project-mobile`,
nada em `project-design`, nada no `.env.example`.

Os consumidores são dois, e nenhum precisa mudar — importam o símbolo, não a string:
`src/infra/http/routes/chat.ts:18,39` e `src/infra/http/routes/tasks/create-task-message.ts:5,12`.

### 5. Padrão de código — plano CORRETO

`eslint.config.js` do backend exige `quotes: single` e `prettier/prettier` com `semi: false`,
`singleQuote: true`. A linha resultante (~62 caracteres) atende. O design *Service Structure*
realmente não pede nada aqui: `index.ts` já é fino, a pasta já está dividida por operação
(`generate-reply/`, `generate-task-turn/`), e `models.ts` é exatamente o "shared setup" que o
design manda deixar na raiz da pasta. Não reorganizar está certo.

---

## O que precisa mudar antes da implementação

### 1. O `Output.object` provavelmente quebra no modo `strict` — o plano declarou isso resolvido sem testar

O plano conclui "a troca não exige mudança nenhuma em `index.ts`" a partir da lista
`supported_parameters`. Essa lista diz que o endpoint aceita `response_format`; não diz que ele
aceita **este** esquema. Fui atrás do esquema real:

**a) O provider manda `strict: true` por padrão.** Baixei o tarball de
`@openrouter/ai-sdk-provider@2.9.0` (versão travada no `package-lock.json`) e li o `dist/index.js`:

```js
response_format: responseFormat?.type === 'json' ? responseFormat.schema != null ? {
  type: 'json_schema',
  json_schema: { schema: responseFormat.schema,
                 strict: this.settings.structuredOutputs?.strict ?? true,
                 name: responseFormat.name ?? 'response' }
```

**b) O esquema que o AI SDK gera viola as regras do `strict` da OpenAI.** Instalei
`ai@6.0.193` + `zod@4.4.3` (as versões travadas) num diretório de scratch, reproduzi
`agentReplySchema` e `taskTurnReplySchema` tal como estão no repo e imprimi
`Output.object({ schema }).responseFormat`. Três objetos saem com `required` incompleto:

- `newReminders.items`: `required: ["title"]`, mas `properties` tem `remindAt` e `notes`
- `newTasks.items`: `required: ["title","contentType"]`, mas `properties` tem `textContent` e `todoItems`
- `proposedChanges` → `items.items`: `required: ["title","done","order","diff"]`, falta `id`

O modo `strict` da OpenAI exige que `required` liste **todas** as chaves de `properties`. É a
consequência direta de `z.optional()` — o gotcha clássico do AI SDK com a OpenAI, onde a saída
recomendada é `.nullable()`, não `.optional()`.

**c) Por que isso só aparece agora.** O `gpt-oss-120b` roteia para Groq, DeepInfra, Together,
Cerebras e afins, que fazem decodificação guiada por gramática e engolem esquema não conforme.
O `gpt-5.6-luna` só tem OpenAI, Azure e Bedrock — e, com `require_parameters: true`, na prática só
OpenAI e Azure, que são justamente os que validam `strict` do jeito da OpenAI. **A troca de modelo
troca o validador**, e o plano não considerou isso.

**Não confirmado:** não consegui fechar o laço em runtime — não há `OPENROUTER_API_KEY` neste
ambiente (ver item 2), então não sei dizer se o OpenRouter repassa o esquema cru (erro 400
`Invalid schema for response_format`) ou se normaliza antes de repassar. Por isso **não estou
exigindo mudar o código às cegas**. Estou exigindo que o plano pare de afirmar que está tudo certo
e prescreva a contingência.

**Ação para a rodada 3 (escolha qualquer uma, as duas são pequenas e ficam no mesmo arquivo):**

- Mínima: adicionar ao plano um passo de contingência explícito — se a chamada retornar 400 de
  esquema inválido (`'required' is required to be supplied and to be an array including every key
  in properties`), o implementador acrescenta, **no mesmo objeto de opções do `openrouter(...)`,
  ao lado do `extraBody`**:

  ```ts
  structuredOutputs: { strict: false },
  ```

  A opção existe no provider (`structuredOutputs?: { strict?: boolean }`, documentada no
  `index.d.ts` exatamente para "opt out of strict mode"). É o caminho que preserva o comportamento
  de hoje e não mexe em `index.ts` nem nos schemas.
- Alternativa: já entrar com `structuredOutputs: { strict: false }` no diff, tratando como parte da
  troca. Custa uma propriedade e elimina o risco.

O que **não** serve é o plano seguir afirmando "a troca não exige mudança nenhuma" — essa frase não
foi verificada e, pelas evidências acima, é provavelmente falsa.

### 2. A seção "Como provar" prescreve comandos que não rodam neste ambiente

Verifiquei o estado real do checkout, e ele não é o que o plano descreve quando diz que "o
implementador começa de um estado sem ruído":

- **`project-backend/node_modules` NÃO EXISTE.** (`project-mobile` e `project-design` têm; o
  backend não, e não há `node_modules` na raiz do repo.) Consequência direta: `npm run lint:fix`
  falha (`Cannot find package '@eslint/js'`, e o `npx` ainda tenta baixar um eslint 10 que não é o
  do projeto) e `npx tsc --noEmit` cai no "This is not the tsc command you are looking for" —
  **e sai com código 0**, ou seja, um implementador desatento reporta os dois portões como verdes
  sem ter compilado nada. Isso derruba o critério 2 da definição de pronto de forma silenciosa.
- **Não existe `.env` nem `.env.development`** em `project-backend` — só `.env.example`.
  `npm run dev` roda com `NODE_ENV=development`, o `env.ts` carrega `.env.development` e valida o
  schema Zod; sem o arquivo ele lança `Invalid environment variables!` antes de o servidor subir.
  E, sem `OPENROUTER_API_KEY`, não existe chamada real ao `gpt-5.6-luna` para observar — o critério
  4 (verificação no browser) e a verificação do item 1 acima ficam ambos impossíveis.

O plano antecipou o risco errado: dedicou um parágrafo ao Google Sign-In (risco legítimo, bem
documentado, mantenha) e nenhum aos dois bloqueios que vêm antes dele.

**Ação para a rodada 3:**

1. Acrescentar `cd project-backend && npm ci` (ou `npm install`) como primeiro passo, **antes** de
   lint e typecheck, e trocar `npx tsc --noEmit` por `npx tsc --noEmit` rodado só depois da
   instalação, com a checagem explícita do exit code (`echo $?`) — porque o `npx` mascara a falha
   com exit 0.
2. Registrar que `.env.development` não existe e que as chaves não estão no repo. O tester **não**
   deve inventar chave, criar `.env` com valor falso, desligar o `authMiddleware` nem criar rota de
   teste: deve reportar ao orquestrador e pedir as credenciais ao usuário. Vale a pena o
   orquestrador levantar isso agora, porque sem `OPENROUTER_API_KEY` o critério 4 da definição de
   pronto não fecha de jeito nenhum.
3. Tornar o passo de verificação da saída estruturada explícito no roteiro do tester: a resposta do
   Ben na tela é o sinal de que o `Output.object` passou; um 400 de esquema é o sinal do item 1.

---

## O que NÃO é motivo de recusa (e não deve entrar na rodada 3)

Confirmo que o plano ficou dentro do escopo do briefing, e nada abaixo deve mudar:

- Não adicionar log nem o nome do modelo em log, apesar do nome da branch. Correto.
- Não mexer no `geminiModel`, não criar env var para o model id, não criar teste, não abrir PR,
  não migrar para o provider OpenAI direto. Correto.
- Não passar `reasoning_effort` nem outro parâmetro de geração. Correto — o default do modelo é
  `medium` e o código não passa nada hoje.
- Não remover o `ignore: ['cerebras']`. Correto.
- Não reorganizar o serviço em mais arquivos. Correto.

As duas correções que peço não são escopo novo: a primeira é o que faz o modelo trocado
efetivamente funcionar (critério 1 da definição de pronto), a segunda é o que torna os critérios 2
e 4 executáveis. Nenhuma das duas pede nada que o briefing tenha colocado fora do escopo.

---

## Premissas assumidas (não perguntei nada, conforme a regra da rodada)

1. O item 1 é risco, não certeza: sem chave de API não dá para fechar em runtime. Por isso a
   exigência é "prescrever a contingência", não "mudar o código já". Se o planejador preferir já
   entrar com `structuredOutputs: { strict: false }`, também aceito.
2. `/root/so/repos/ben-prototype` e `/home/dev/so/repos/ben-prototype` são a mesma árvore; conferi
   os dois e ambos estão sem `node_modules` no backend e sem `.env`.
3. A árvore está limpa (`git status --short` sem saída) na branch `feat/update-model-and-add-logs`
   — essa parte do plano confere.

## Como reproduzir as minhas verificações

```bash
curl -s https://openrouter.ai/api/v1/models | python3 -c "import json,sys; print('openai/gpt-5.6-luna' in [m['id'] for m in json.load(sys.stdin)['data']])"
curl -s https://openrouter.ai/api/v1/models/openai/gpt-5.6-luna/endpoints   # 7 endpoints: OpenAI, Azure, Bedrock
curl -s https://openrouter.ai/api/v1/models/openai/gpt-oss-120b/endpoints   # inclui cerebras/fp16
# esquema emitido: npm i ai@6.0.193 zod@4.4.3 e imprimir Output.object({schema}).responseFormat
# strict padrão: tarball de @openrouter/ai-sdk-provider@2.9.0, dist/index.js, busca por "json_schema"
ls /root/so/repos/ben-prototype/project-backend/node_modules   # não existe
ls -a /root/so/repos/ben-prototype/project-backend | grep env  # só .env.example
```
