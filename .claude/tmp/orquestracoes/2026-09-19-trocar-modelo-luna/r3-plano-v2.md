# Plano v2 — trocar o modelo do agente Ben para `openai/gpt-5.6-luna`

Rodada 3. Substitui o `r1-plano.md` (que fica no diretório, mas **não precisa ser lido**: este
arquivo é autossuficiente). Escrito depois da recusa do revisor em `r2-revisao.md`.

**Para o implementador (`sonnet`): execute as seções 1 a 6 na ordem. Não decida nada — tudo que
podia ser decidido já está decidido aqui. Onde houver bifurcação, ela está escrita como
"se X, então Y", com o gatilho exato.**

O que mudou da v1 para cá, e só isso:
- entrou um **passo 1 de preparo do ambiente** (`npm ci`), porque `project-backend/node_modules`
  não existe neste checkout e, sem ele, lint e typecheck **falham saindo com código 0** — portão
  verde falso;
- entrou a **contingência de `strict`** (seção 4), condicional, com gatilho e linha exata;
- entrou o **procedimento para `.env` ausente** (seção 6).

---

## 1. Preparo do ambiente — FAÇA ISTO PRIMEIRO

`project-backend/node_modules` **não existe** (verificado: `ls -d node_modules` → "No such file or
directory"; `project-mobile` e `project-design` têm o seu, o backend não, e não há `node_modules`
na raiz do repo). Sem instalar, `npm run lint:fix` morre com `Cannot find package '@eslint/js'` e
`npx tsc --noEmit` cai no "This is not the tsc command you are looking for" — **e sai com exit 0**.
Instalar é pré-requisito dos portões, não escopo novo.

```bash
cd /root/so/repos/ben-prototype/project-backend && npm ci
echo "npm ci exit=$?"
```

- `npm ci` (não `npm install`): o `package-lock.json` existe e fixa as versões que este plano
  verificou (`@openrouter/ai-sdk-provider@2.9.0`, `ai@6.0.193`, `zod@4.4.3`, `typescript@5.9.3`,
  `eslint@9.39.4`). `npm install` poderia mexer no lock e sujar o diff.
- O `postinstall` do projeto roda `prisma generate`. É esperado. `prisma/schema.prisma` existe.
- **Se `npm ci` falhar** (rede, registry, `prisma generate`): pare, não tente contornar com
  `--ignore-scripts` nem com instalação parcial, e reporte ao orquestrador. Sem `node_modules` os
  portões da seção 5 não valem nada.
- **Não commite `node_modules`.** Confirme na seção 5 que o `git status` só mostra `models.ts`.

---

## 2. O diff — um arquivo, uma linha

### `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/models.ts`

**Linha 15.**

ANTES (texto exato):

```ts
export const openRouterModel = openrouter('openai/gpt-oss-120b', {
```

DEPOIS (texto exato):

```ts
export const openRouterModel = openrouter('openai/gpt-5.6-luna', {
```

É o diff inteiro. Não mudam: os imports (1-3), o client `google` (5-7), `geminiModel` (9), o client
`openrouter` (11-13), o bloco `extraBody` (16-22), os comentários inline. Aspas simples e sem ponto
e vírgula, como o resto do arquivo (o ESLint do backend exige `singleQuote: true`, `semi: false`).

**Nenhum outro arquivo é tocado.** Não criar, não renomear, não mover, não dividir o serviço em
pasta, não reformatar nada.

Estado esperado do arquivo depois da edição (linhas 11-23):

```ts
const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
})

export const openRouterModel = openrouter('openai/gpt-5.6-luna', {
  extraBody: {
    provider: {
      sort: 'throughput', // uses the provider with the highest throughput
      ignore: ['cerebras'],
      require_parameters: true, // only use providers that support the parameters we want to use
    },
  },
})
```

---

## 3. Por que este id e por que o `extraBody` fica como está

Tudo abaixo foi verificado contra o catálogo do OpenRouter em 2026-09-19, e conferido de forma
independente pelo revisor. Está aqui como contexto — **não é trabalho a fazer**.

**O slug está certo, sem divergência.** `curl https://openrouter.ai/api/v1/models` (HTTP 200)
traz `openai/gpt-5.6-luna` com esse texto exato. Irmãos que **não** devem ser usados:
`openai/gpt-5.6-luna-pro`, `openai/gpt-5.6-luna:batch`, e o snapshot datado
`openai/gpt-5.6-luna-20260709` (`canonical_slug`). Usa-se o alias, que é o padrão que a linha 15
já seguia.

**Ficha do modelo:** contexto 1.050.000 · máx. saída 128.000 · cutoff 2026-02-16 ·
US$ 0,20/M prompt, US$ 1,20/M completion, US$ 0,02/M cache read (override de 2x/1,5x acima de 272K
tokens de prompt) · `reasoning` não mandatório, habilitado por padrão, effort `medium` ·
`supported_parameters` inclui `tools`, `tool_choice`, `structured_outputs`, `response_format`,
`reasoning_effort`, `max_tokens`, `max_completion_tokens`, `seed`.

**Os 7 endpoints do modelo** (`GET /api/v1/models/openai/gpt-5.6-luna/endpoints`, HTTP 200):

| provider | tags | `tools` | `response_format` / `structured_outputs` |
|---|---|---|---|
| OpenAI | `openai`, `openai/fast`, `openai/flex` | sim | sim |
| Azure | `azure`, `azure/us`, `azure/eu` | sim | sim |
| Amazon Bedrock | `amazon-bedrock/us-east-1` | sim | **não** |

**O bloco `extraBody` fica intacto**, linha por linha:

- `require_parameters: true` — manter, e ficou **mais** importante: é o que impede o roteamento de
  cair no endpoint da Bedrock, que não suporta structured outputs, sendo que as duas operações do
  agente usam `Output.object`.
- `ignore: ['cerebras']` — manter. Fato registrado, não corrigido em silêncio: a Cerebras servia o
  `gpt-oss-120b` (tag `cerebras/fp16`) e **não** serve o `gpt-5.6-luna`, então a entrada virou
  no-op inofensivo. Removê-la é escopo que o usuário não pediu, com ganho zero.
- `sort: 'throughput'` — ortogonal ao modelo. Manter.

---

## 4. Contingência de saída estruturada em modo `strict` — CONDICIONAL

**Leia inteiro antes de agir. A regra número um desta seção é: não aplique nada aqui
preventivamente.**

### 4.1 O risco, em três frases

O `@openrouter/ai-sdk-provider@2.9.0` manda `response_format.json_schema.strict: true` **por
padrão** (`strict: this.settings.structuredOutputs?.strict ?? true`, em `dist/index.js`). O esquema
que o `Output.object` do AI SDK gera a partir dos zod do repo tem `required` incompleto em três
objetos — consequência de `z.optional()`: `newReminders.items` (falta `remindAt`, `notes`),
`newTasks.items` (falta `textContent`, `todoItems`) e `proposedChanges → items.items` (falta `id`)
— e o modo `strict` da OpenAI exige que `required` liste **todas** as chaves de `properties`. O
`gpt-oss-120b` roteava para provedores que engolem esquema não conforme; o `gpt-5.6-luna` só roteia
para OpenAI, Azure e Bedrock, que validam à moda da OpenAI — a troca de modelo troca o validador.

**Isto é risco, não certeza.** Ninguém conseguiu fechar o laço em runtime porque não há
`OPENROUTER_API_KEY` neste ambiente (seção 6). Não está confirmado se o OpenRouter repassa o esquema
cru ou o normaliza antes. **Por isso a correção é condicional.**

### 4.2 A ordem de execução

1. **Aplique só o diff da seção 2.** Nada de `structuredOutputs` agora.
2. Rode os portões da seção 5.
3. Rode o teste de browser da seção 7.
4. **Só se o gatilho de 4.3 aparecer**, aplique 4.4.

Motivo de não aplicar preventivamente: `strict: false` afrouxa a validação da saída para toda
chamada do agente, e o código pode estar funcionando perfeitamente sem isso. Uma propriedade a mais
"por precaução" num arquivo cuja task é trocar uma string é exatamente o inflar de escopo que o
usuário proibiu. Se o erro não acontecer, esta seção inteira não existe.

### 4.3 O gatilho exato

Aplique 4.4 **se, e somente se**, uma chamada real ao agente (`POST /chat` ou
`POST /tasks/:id/messages/create`) falhar com um erro **400 de esquema inválido** vindo do
OpenRouter/OpenAI. A assinatura a procurar, no log do backend ou no corpo da resposta:

- `Invalid schema for response_format`, e/ou
- `'required' is required to be supplied and to be an array including every key in properties`

**Não** dispara com: `401`/`403` (chave — vai para a seção 6), `404`/"No endpoints found for model"
(slug errado — revise a linha 15 caractere a caractere), timeout, erro de rede, erro de parse do
lado do app mobile, ou qualquer 500 sem essa mensagem. Se o erro for outro, **não** aplique 4.4:
reporte ao orquestrador com a mensagem literal.

### 4.4 A mudança, se o gatilho aparecer

Uma propriedade nova, **no mesmo objeto de opções do `openrouter(...)`, como irmã de `extraBody`**
— não dentro de `extraBody`, não dentro de `provider`, não em `index.ts`, não nos schemas zod.
Linha a inserir, imediatamente **depois** da linha 15 (a que abre o objeto) e **antes** da linha
do `extraBody:`:

```ts
  structuredOutputs: { strict: false },
```

Arquivo resultante (linhas 15-24):

```ts
export const openRouterModel = openrouter('openai/gpt-5.6-luna', {
  structuredOutputs: { strict: false },
  extraBody: {
    provider: {
      sort: 'throughput', // uses the provider with the highest throughput
      ignore: ['cerebras'],
      require_parameters: true, // only use providers that support the parameters we want to use
    },
  },
})
```

A opção é tipada e existe nessa posição — verificado no `index.d.ts` do pacote instalado:
`OpenRouterChatSettings` declara `structuredOutputs?: { strict?: boolean }` e faz interseção com
`OpenRouterSharedSettings`, que é quem declara `extraBody`. As duas são irmãs no mesmo objeto, e o
`tsc` aceita. A doc da própria opção diz, literalmente, que serve para "opt out of strict mode".

Depois de aplicar 4.4: rode os portões da seção 5 de novo e repita o teste de browser.

**O que NÃO fazer nesta contingência**, mesmo que pareça mais "correto":

- não trocar `z.optional()` por `z.nullable()` nos schemas do agente;
- não mexer em `index.ts`, em `generate-reply/` nem em `generate-task-turn/`;
- não tirar o `Output.object`;
- não trocar o modelo por outro;
- não mexer no `extraBody`.

---

## 5. Portões: lint e typecheck — com exit code conferido, não presumido

Só depois do `npm ci` da seção 1. Rode **um comando por vez** e leia o exit code de cada um.

```bash
cd /root/so/repos/ben-prototype/project-backend

# sanidade: o tsc tem que ser o do projeto (5.9.3), não um baixado na hora
npx tsc --version
# esperado: "Version 5.9.3"
# se sair "This is not the tsc command you are looking for" -> node_modules faltando, volte à seção 1

npm run lint:fix
echo "lint exit=$?"      # tem que imprimir: lint exit=0

npx tsc --noEmit
echo "tsc exit=$?"       # tem que imprimir: tsc exit=0
```

**Não relate "portão verde" sem ter visto os dois `exit=0` impressos** e o `Version 5.9.3`. Este é
o ponto em que a v1 do plano falhava: sem `node_modules`, os dois comandos erram e ainda assim saem
com 0, e um relato desatento marca o critério 2 da definição de pronto como cumprido sem ter
compilado nada.

Se `tsc` acusar erro: compare com `git stash && npx tsc --noEmit` para saber se é pré-existente.
Se for erro novo, ele só pode vir de edição acidental — o diff é uma string literal.

Conferência do diff, antes de qualquer commit:

```bash
cd /root/so/repos/ben-prototype
git status --short          # só models.ts modificado; nada de node_modules, nada de .env
git diff --stat             # esperado: 1 file changed, 1 insertion(+), 1 deletion(-)
git diff                    # leia: a única linha alterada é a 15
```

(Se a contingência 4.4 tiver sido aplicada, o esperado vira `2 insertions(+), 1 deletion(-)`, e o
commit menciona isso.)

---

## 6. Credenciais ausentes — o que fazer, e o que jamais fazer

**`project-backend` não tem `.env` nem `.env.development`. Só `.env.example`** (verificado).
`npm run dev` roda com `NODE_ENV=development`; `src/infra/services/env.ts:6-7` carrega
`.env.development`; o schema Zod exige `API_PORT`, `FIREBASE_*`, `JWT_*`,
`GOOGLE_GENERATIVE_AI_API_KEY`, `OPENROUTER_API_KEY` e `ASSEMBLYAI_API_KEY` sem default. Sem o
arquivo, o processo lança `Invalid environment variables!` **antes** de o servidor subir.

Consequência honesta: **sem `OPENROUTER_API_KEY` real, o critério 4 da definição de pronto (browser)
e a verificação da seção 4 não fecham de jeito nenhum.** Os critérios 1, 2 e 5 (diff, portões,
commit) fecham normalmente.

Procedimento quando faltar `.env` ou a chave:

1. **Pare o passo de browser.** Não é falha da troca de modelo.
2. **Reporte ao orquestrador** com esta frase, para ele levar ao usuário: "`project-backend` não tem
   `.env.development`; preciso de `OPENROUTER_API_KEY` (e das demais chaves do `.env.example`) para
   validar o `gpt-5.6-luna` em runtime."
3. **Registre no relato** que os portões 1, 2 e 5 foram cumpridos e que o 4 ficou bloqueado por
   falta de credencial — não marque como cumprido o que não foi observado.

**Proibido, sem exceção:** inventar chave; criar `.env.development` com valores falsos só para o
servidor subir; desligar ou contornar o `authMiddleware`; criar rota de teste sem auth; comitar
qualquer `.env`; pegar chave de outro projeto do repo ou do ambiente.

---

## 7. Teste de browser

Pré-requisitos: seção 1 feita, seção 5 verde, e `.env.development` existindo com chaves reais
(seção 6). Se o último faltar, não execute esta seção — reporte.

```bash
cd /root/so/repos/ben-prototype/project-backend && npm run dev   # porta = API_PORT
cd /root/so/repos/ben-prototype/project-mobile  && npm start     # expo, web em :8081
```

O que o tester tem que **ver**, e nada além:

1. O app abre em `http://localhost:8081` sem erro de bundle.
2. Na tela de chat, enviar uma mensagem curta (ex.: "oi, tudo bem?") pelo composer.
3. **Chega uma resposta do Ben na tela**, sem banner de erro e sem 500 no `POST /chat`. Essa bolha
   é a prova dupla que interessa: o `openai/gpt-5.6-luna` respondeu pelo OpenRouter **e** o
   `Output.object` passou pela validação de esquema do provedor (seção 4).
4. No terminal do backend, a requisição não derruba o processo nem loga erro de provider. **Leia o
   log inteiro da requisição** — é ali que o 400 de esquema da seção 4.3 aparece.

Mapa de falhas:

| o que aparece | o que é | o que fazer |
|---|---|---|
| 400 `Invalid schema for response_format` / `'required' ... every key in properties` | modo strict | aplicar 4.4 e repetir |
| 404 / "No endpoints found for model" | slug errado | revisar a linha 15 contra `openai/gpt-5.6-luna` |
| 401 / 403 | chave | seção 6 — escalar, não contornar |
| erro de schema mas sem as mensagens acima | desconhecido | reportar a mensagem literal, não adivinhar |

**Risco conhecido, não confirmado:** o login do mobile é Google Sign-In via Firebase, e os dois
endpoints de LLM exigem `authMiddleware` com JWT. Não existe atalho de login de desenvolvimento no
repo (busca por `DEV_`, `bypass`, `fake auth` em `project-mobile/src/pages/login`,
`project-mobile/src/core` e nos middlewares do backend: nada). Não está confirmado que o Google
Sign-In completa em browser headless. Se travar no login, é obstáculo de ambiente, não falha da
troca: reportar ao orquestrador, sem inventar credencial, sem criar rota de teste, sem desligar o
middleware.

---

## 8. Varredura por `gpt-oss-120b`

Duas buscas independentes, excluindo `node_modules`, `.git`, `dist`, `.expo` e `.claude/tmp`:
`grep -rn -i -e 'gpt-oss' -e 'gpt_oss' -e '120b'` na árvore e `git grep` nos versionados. Resultado
idêntico e único nas duas, e confirmado pelo revisor por conta própria:

```
project-backend/src/infra/services/ben-agent-provider/models.ts:15
```

**Não há nenhuma outra ocorrência no repositório.** Nada em `project-mobile`, nada em
`project-design`, nada em `.env.example`, nada em doc, nada em teste (o backend não tem teste
algum). Os dois consumidores do símbolo — `src/infra/http/routes/chat.ts:18,39` e
`src/infra/http/routes/tasks/create-task-message.ts:5,12` — importam `openRouterModel`, não a
string, e **não mudam**.

Depois da edição, confirme com:

```bash
cd /root/so/repos/ben-prototype && git grep -n -i -e 'gpt-oss' -e '120b' -- . ':!*.claude/tmp/*'
# esperado: nenhuma saída
```

---

## 9. Riscos e o que NÃO fazer

**Fora do escopo (do briefing) — não faça, mesmo que pareça uma boa ideia:**

- Não adicionar log, telemetria, nem o nome do modelo em log — **apesar do nome da branch**
  (`feat/update-model-and-add-logs`).
- Não migrar para o provider OpenAI direto; não criar `OPENAI_API_KEY`.
- Não remover nem mexer no `geminiModel` (código morto, linha 9).
- Não criar teste automatizado.
- Não transformar o model id em variável de ambiente.
- Não abrir PR — commit e push na branch atual `feat/update-model-and-add-logs`, só isso.

**Acrescentado pela investigação:**

- Não usar o snapshot `openai/gpt-5.6-luna-20260709`, nem `-pro`, nem `:batch`.
- Não adicionar `reasoning_effort`, `temperature`, `maxOutputTokens` nem qualquer parâmetro de
  geração: hoje o código não passa nenhum e o default do modelo já é `medium`.
- Não mexer no `extraBody`, incluindo o `ignore: ['cerebras']` que virou no-op.
- Não aplicar `structuredOutputs: { strict: false }` preventivamente (seção 4.2).
- Não dividir `ben-agent-provider` em mais arquivos nem "aproveitar para" refatorar. O design
  *Service Structure* não pede nada aqui: `index.ts` já é fino, a pasta já está dividida por
  operação, e `models.ts` é o "shared setup" que o design manda deixar na raiz.
- Não reformatar o arquivo: o `lint:fix` roda, mas o diff final tem que ser de uma linha (duas, se
  4.4 for acionada).
- Não commitar `node_modules` nem `.env`.

**Riscos reais da mudança:**

- **Custo e latência mudam de patamar** (modelo proprietário pago vs. OSS). Fora do escopo agir;
  registrado para o usuário saber.
- **`reasoning` vem habilitado por padrão** (effort `medium`), o que pode deixar a resposta mais
  lenta que a do `gpt-oss-120b`. Não é erro; não tratar.
- **Roteamento restrito a 3 provedores** (OpenAI, Azure, Bedrock) e, com `require_parameters: true`
  mais structured outputs, na prática OpenAI e Azure. `sort: 'throughput'` tem menos margem de
  escolha do que tinha. Esperado.
- **Validação de esquema mais rígida** — é a seção 4, o risco principal desta troca.

---

## 10. Commit

Só depois de: seção 5 verde com os exit codes vistos, seção 8 sem saída, e o teste da seção 7
executado ou formalmente bloqueado por falta de credencial (seção 6).

```bash
cd /root/so/repos/ben-prototype
git add project-backend/src/infra/services/ben-agent-provider/models.ts
git commit   # mensagem: troca do modelo do agente Ben para openai/gpt-5.6-luna via OpenRouter
git push origin feat/update-model-and-add-logs
```

Se a contingência 4.4 tiver sido aplicada, a mensagem de commit deve dizer, em uma linha do corpo,
que o `structuredOutputs: { strict: false }` entrou porque o provedor rejeitou o esquema em modo
strict. Só `models.ts` entra no commit.

---

## Premissas assumidas (nenhuma pergunta foi feita, conforme a regra da rodada)

1. "Trocar o modelo" = trocar só o `openRouterModel`; `geminiModel` fica intacto.
2. O alias `openai/gpt-5.6-luna` é o id correto, não o snapshot datado — é o padrão que a linha 15
   já seguia.
3. Manter o `ignore: ['cerebras']` apesar de virar no-op: o briefing manda manter e não há motivo
   forte para contrariar; a divergência está registrada, não corrigida em silêncio.
4. A contingência de `strict` fica condicional em vez de entrar no diff: sem chave de API ninguém
   conseguiu confirmar o erro em runtime, e afrouxar a validação sem evidência é mudança de
   comportamento que o usuário não pediu. O revisor aceitou as duas formas; escolhi a que mantém o
   diff mínimo.
5. O teste de browser usa o fluxo de chat (`POST /chat`), não o de task workspace: é o caminho mais
   curto que exercita o mesmo `openRouterModel`.
6. `npm ci` (e não `npm install`) para não alterar o `package-lock.json`.
