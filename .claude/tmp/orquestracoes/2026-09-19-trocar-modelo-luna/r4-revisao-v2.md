VEREDITO: APROVADO

# Revisão independente do plano v2 — rodada 4

Revisor: opus, o mesmo da `r2-revisao.md`, sem participação no plano. Nada foi editado no projeto;
o único arquivo escrito é este. A `r2-revisao.md` fica intacta.

Objeto da revisão: `r3-plano-v2.md`, que se declara autossuficiente e substitui o `r1-plano.md`.
Li o v2 inteiro e reverifiquei por conta própria as afirmações que sustentam as duas correções —
inclusive compilando a linha de contingência com o TypeScript e as versões travadas do repo.

Os dois pontos da recusa anterior foram resolvidos. Não encontrei defeito novo, fato errado nem
escopo inflado. **Pode ir para implementação.**

---

## Ponto 1 da recusa — o modo `strict`: RESOLVIDO

O v2 não repete a frase que reprovou a v1 ("a troca não exige mudança nenhuma"). A seção 4 trata o
assunto como risco explícito, com a evidência correta (`strict: this.settings.structuredOutputs
?.strict ?? true` no `dist/index.js`, os três objetos com `required` incompleto, a troca de
validador ao sair de Groq/DeepInfra para OpenAI/Azure) e diz, com todas as letras, que não está
confirmado em runtime. É exatamente o que eu pedi.

A forma escolhida — condicional em vez de preventiva — é uma das duas que eu declarei aceitáveis, e
é a de menor escopo. A justificativa do planejador em 4.2 (`strict: false` afrouxa a validação de
toda chamada do agente; não cabe "por precaução" numa task de trocar uma string) é boa e eu a
subscrevo.

O gatilho de 4.3 é literal e falseável: as duas mensagens (`Invalid schema for response_format` e
`'required' is required to be supplied and to be an array including every key in properties`), mais
a lista do que **não** dispara (401/403, 404, timeout, erro de parse no mobile, 500 sem a
mensagem). Um implementador não tem como aplicar 4.4 por engano.

### A afirmação sobre o `index.d.ts`: VERIFIQUEI, e é verdadeira

O orquestrador pediu que eu checasse isto por mim, e checei em dois níveis.

**Nível dos tipos.** No `@openrouter/ai-sdk-provider@2.9.0` (tarball da versão travada no
`package-lock.json`), `index.d.ts`: `OpenRouterChatSettings` abre na linha 58, declara
`structuredOutputs?: { strict?: boolean }` nas linhas 199-205 e fecha na 258 com
`} & OpenRouterSharedSettings;`. `OpenRouterSharedSettings` abre na 402 e declara
`extraBody?: Record<string, unknown>` na 407. A interseção torna as duas **irmãs no mesmo objeto de
opções**, como o plano afirma. O comentário da própria opção diz "Use this to opt out of strict
mode... When `strict` is left unset, the SDK defaults to `true`".

**Nível do compilador — o teste que decide.** Não me contentei com a leitura do `.d.ts`: instalei
`@openrouter/ai-sdk-provider@2.9.0`, `ai@6.0.193`, `zod@4.4.3`, `typescript@5.9.3` e
`@tsconfig/node24@24.0.0` num diretório de scratch, montei um `tsconfig.json` com as mesmas opções
do `project-backend/tsconfig.json` (extends `@tsconfig/node24`, `target: ES2024`, `module: ESNext`,
`moduleResolution: bundler`, `strict: true`, `skipLibCheck: true`) e compilei os dois estados:

- o estado da seção 2 (só `extraBody`), e
- o estado da seção 4.4 (`structuredOutputs: { strict: false },` como irmã de `extraBody`),

cada um atribuído a `LanguageModel` do pacote `ai` — que é o tipo que o construtor de
`BenAgentProviderService` recebe. **`tsc --noEmit` saiu com exit 0 nos dois.** A posição prescrita
compila.

**Observação, não defeito.** Há um detalhe de tipagem que o plano não menciona e que não muda nada:
as sobrecargas do provider (`index.d.ts:738-739`) listam a de *completion* antes da de *chat*, então
hoje `openrouter('...', { extraBody })` resolve estaticamente para
`OpenRouterCompletionLanguageModel`, e com `structuredOutputs` presente passa a resolver para
`OpenRouterChatLanguageModel` (confirmei os dois com um probe de tipo). Em runtime não muda nada:
`createLanguageModel` (`dist/index.js:5352-5364`) devolve **sempre** o chat model, exceto para o id
`openai/gpt-3.5-turbo-instruct`. E os dois tipos satisfazem `LanguageModel`, como o compilador
confirmou. Registro para ninguém se assustar se olhar o tipo inferido; nada a fazer.

## Ponto 2 da recusa — ambiente e portões: RESOLVIDO

- **`npm ci` como passo 1** (seção 1), com a justificativa certa para preferir `ci` a `install` (não
  sujar o `package-lock.json`) e com uma saída de emergência explícita: se falhar, parar e reportar,
  sem `--ignore-scripts` nem instalação parcial.
- **O falso-verde está coberto** com as duas defesas que faltavam: o `npx tsc --version` esperando
  `Version 5.9.3` antes de qualquer portão, e o `echo "... exit=$?"` depois de cada comando, com a
  ordem de não relatar portão verde sem ter visto os dois `exit=0` impressos. Conferi as versões
  travadas no `package-lock.json`: `typescript@5.9.3` e `eslint@9.39.4` — o número esperado no plano
  está certo, não é chute.
- **Credenciais (seção 6)**: descreve o estado real (só `.env.example`; `env.ts:6-7` carrega
  `.env.development`; o Zod exige as chaves sem default), assume que os critérios 1, 2 e 5 fecham e
  o 4 não, dá a frase pronta para escalar e proíbe nominalmente os seis atalhos perigosos (inventar
  chave, `.env` falso, desligar o `authMiddleware`, rota de teste sem auth, comitar `.env`, pegar
  chave de outro projeto). É o comportamento certo.

### Outras verificações que fiz no v2

- **`prisma generate` no `postinstall` não vai quebrar por falta de `.env`.** Li o
  `prisma.config.ts`: a datasource é `process.env.DATABASE_URL ?? 'file:./prisma/dev.db'`, sem
  importar o `env.ts` que lança. `prisma/schema.prisma` existe. O risco que o plano deixou como
  ramo de falha é, na prática, baixo.
- **`npm ci` não vai sujar o `git status`.** O `.gitignore` do backend cobre `node_modules`, `dist`,
  `.env`, `.env.development` e `src/generated` (a saída do `prisma generate`). A conferência de
  diff da seção 5 continua valendo.
- **O comando de varredura da seção 8 funciona.** Rodei
  `git grep -n -i -e 'gpt-oss' -e '120b' -- . ':!*.claude/tmp/*'` no estado atual: devolve
  exatamente `project-backend/.../models.ts:15` e nada mais, logo depois da edição devolve vazio,
  como o plano espera. (A exclusão de `.claude/tmp/*` é redundante — o `.gitignore` da raiz já
  ignora `.claude/tmp/` — mas é inofensiva.)
- **O diff da seção 2 bate com o arquivo real**, linha 15, caractere a caractere, e o bloco
  "estado esperado depois da edição" (linhas 11-23) reproduz o arquivo fielmente.
- **As seções 3 e 8 continuam corretas**: são as mesmas que eu já tinha verificado de forma
  independente na `r2-revisao.md` (slug no catálogo, ficha, 7 endpoints, Bedrock sem structured
  outputs, Cerebras servindo o gpt-oss e não o luna, ocorrência única no repo, dois consumidores que
  importam o símbolo e não mudam).

## Escopo: dentro do briefing

Confirmo que nada do que o briefing excluiu voltou pela porta dos fundos. A seção 9 mantém as
proibições (log, `geminiModel`, env var para o id, teste automatizado, PR, provider OpenAI direto,
`reasoning_effort`, remoção do `ignore: ['cerebras']`, refatoração do serviço) e acrescenta a
proibição de aplicar `structuredOutputs` preventivamente. As duas seções novas — preparo do
ambiente e credenciais — não são escopo novo: são pré-requisitos dos critérios 2 e 4 da definição de
pronto, escritos no próprio briefing.

## O que continua em aberto, e está certo assim

Nada disso bloqueia a implementação; o plano já diz o que fazer em cada caso.

1. **O erro de `strict` segue não confirmado em runtime.** Sem `OPENROUTER_API_KEY` não há como
   fechar o laço. O plano trata como condicional, que é a postura correta diante de uma incerteza
   que ninguém consegue resolver agora.
2. **O critério 4 da definição de pronto (browser) provavelmente não fecha**, por falta de `.env`
   e, mesmo com ele, pelo Google Sign-In em browser headless. O plano manda escalar em vez de
   contornar, e manda não marcar como cumprido o que não foi observado. É o melhor disponível.
3. **Nota operacional para quem for comitar** (não é exigência de replanejamento): a seção 10 traz
   `git commit` sem `-m`; quem executar precisa passar a mensagem e as linhas de atribuição que o
   harness exigir. Detalhe de execução, não defeito de plano.

## Premissas assumidas (não perguntei nada, conforme a regra da rodada)

1. Meu teste de compilação num diretório de scratch com as versões travadas equivale ao `tsc` do
   `project-backend` — usei as mesmas opções do `tsconfig.json` dele e o mesmo `typescript@5.9.3`.
   O que não consegui reproduzir foi o alias de path `@/*`, irrelevante para a linha em questão.
2. `npm ci` terá rede e registry disponíveis na hora da implementação. Eu não rodei `npm ci` dentro
   do projeto para não criar `node_modules` num repo que eu não devia tocar; o download dos mesmos
   pacotes no scratch funcionou, o que é um bom sinal.

## Como reproduzir as minhas verificações desta rodada

```bash
# tipos: structuredOutputs (ChatSettings, l.199-205) e extraBody (SharedSettings, l.407) são irmãs
curl -s -o or.tgz https://registry.npmjs.org/@openrouter/ai-sdk-provider/-/ai-sdk-provider-2.9.0.tgz
tar xzf or.tgz && grep -n "structuredOutputs\|extraBody\|OpenRouterSharedSettings" package/dist/index.d.ts

# compilação: npm i @openrouter/ai-sdk-provider@2.9.0 ai@6.0.193 zod@4.4.3 typescript@5.9.3 @tsconfig/node24@24.0.0
# tsconfig igual ao do project-backend, arquivo com structuredOutputs irmã de extraBody
# atribuído a LanguageModel -> npx tsc --noEmit  => exit 0

# runtime sempre é chat model:
sed -n '5352,5364p' package/dist/index.js

# versões travadas e varredura
python3 -c "import json;d=json.load(open('project-backend/package-lock.json'));print([ (k,v['version']) for k,v in d['packages'].items() if k.split('/')[-1] in ('typescript','eslint')])"
git grep -n -i -e 'gpt-oss' -e '120b' -- . ':!*.claude/tmp/*'
```
