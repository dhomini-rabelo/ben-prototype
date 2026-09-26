# Trocar o modelo do agente Ben para gpt-5.6-luna

## Veredito
entregue com ressalvas — o codigo esta trocado, commitado e no remoto; a prova de ponta a ponta
no browser nao rodou porque a maquina nao tem credenciais nem navegador para isso.

## O que mudou
- [project-backend/src/infra/services/ben-agent-provider/models.ts](project-backend/src/infra/services/ben-agent-provider/models.ts) — linha 15:
  `openrouter('openai/gpt-oss-120b', ...)` virou `openrouter('openai/gpt-5.6-luna', ...)`.
  Uma linha, um arquivo. O bloco `extraBody` ficou intacto.

Commit `255bd80` na branch `feat/update-model-and-add-logs`, com push feito (upstream criado).

## Como foi provado
- O slug `openai/gpt-5.6-luna` existe no catalogo do OpenRouter: confirmado duas vezes, de forma
  independente, pelo planejador e pelo revisor, via `https://openrouter.ai/api/v1/models`.
- `npm ci`, `npm run lint:fix` e `npx tsc --noEmit` em `project-backend`: exit 0 nos tres, com o
  exit code conferido e nao presumido (o revisor tinha flagrado que, sem `node_modules`, os dois
  portoes falhavam saindo com exit 0 — verde falso).
- `git grep` por `gpt-oss-120b` no repo: zero ocorrencias restantes.
- O revisor compilou, num projeto scratch com as versoes exatas do lock, a linha de contingencia
  de `strict` — ela nao foi aplicada, mas esta pronta caso precise.
- Nao provado: a conversa real com o Ben. Detalhes na ressalva abaixo.

## Premissas assumidas
- `extraBody.provider` do OpenRouter mantido como estava. `require_parameters: true` ficou mais
  necessario com o luna (evita rotear para o Amazon Bedrock, unico endpoint do modelo que nao
  suporta `response_format`); `ignore: ['cerebras']` virou um no-op inofensivo, porque a Cerebras
  serve o gpt-oss mas nao o luna. Registrado em vez de mexido.
- Nenhum parametro de geracao novo, inclusive `reasoning_effort`: o codigo nao passava nenhum
  antes, e o default do modelo e `medium`.
- Logs nao foram tocados, apesar do nome da branch. O pedido foi so a troca do modelo.
- Usado o slug movel `openai/gpt-5.6-luna`, nao o `canonical_slug` datado
  `openai/gpt-5.6-luna-20260709`, para nao congelar o snapshot.
- Commit e push feitos mesmo com o criterio de browser em aberto, porque o bloqueio e de ambiente
  e os dois portoes de codigo passaram.

## O que ficou de fora
- **A prova de ponta a ponta no browser.** O backend nao sobe: nao existe `.env` em
  `project-backend`, so `.env.example`, e nao ha nenhuma `OPENROUTER_API_KEY` nesta maquina — o
  `env.ts` valida com Zod e derruba o processo. O Expo web subiu em `localhost:8081` (HTTP 200),
  mas o navegador do Playwright nao esta instalado e a instalacao deu timeout. O tester foi
  instruido a nao contornar o bloqueio com chave falsa ou mock, e nao contornou. Falta, para
  fechar: uma `OPENROUTER_API_KEY` valida e o browser instalado.
- **Um risco conhecido, com contingencia pronta e nao aplicada.** O provider do OpenRouter manda
  `structuredOutputs.strict: true` por padrao, e o esquema que o AI SDK gera a partir dos zod do
  repo tem `required` incompleto em tres objetos. Isso nunca apareceu porque o gpt-oss roteava
  para Groq/DeepInfra; o luna so roteia para OpenAI, Azure e Bedrock, que validam `strict` a moda
  da OpenAI. Se a primeira chamada real voltar 400 com `Invalid schema for response_format`, a
  correcao esta escrita, linha por linha, na secao 4 do
  `.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/r3-plano-v2.md`.
- Nao foram feitos: log do nome do modelo, teste automatizado, env var para o model id, remocao
  do `geminiModel` morto, PR.

## A cadeia
Um orquestrador, 7 rodadas, 8 filhos (2 recon sonnet, planejador opus em 2 passadas, revisor opus
em 2 passadas, implementador sonnet, browser tester sonnet, commit sonnet). O plano foi recusado
na primeira revisao e aprovado na segunda. Pasta da run:
`.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/`

## Checagem pos-entrega (pergunta do usuario)
- `git status` **limpo**: nada modificado, nada nao rastreado, branch em sincronia com o remoto.
  Nenhum commit local pendente de push.
- A pasta da run **nao foi commitada**, por desenho: `.claude/tmp/` e a linha 1 do `.gitignore`, e
  o proprio skill `sem-nivel-0` manda que nada da run vaze para o commit. O commit `255bd80` tem
  exatamente um arquivo.
- **Nao existe screenshot nenhum** na pasta da run: o tester foi bloqueado antes de conseguir um,
  porque o navegador do Playwright nao esta instalado nesta maquina.
- **Decisao do usuario, apos a pergunta acima**: commitar a pasta desta run, em commit separado do
  commit de codigo. Feito com `git add -f`, que versiona os arquivos ignorados sem abrir excecao no
  `.gitignore` — a politica do repo e do skill `sem-nivel-0` continua "run nao vai para o git", e
  esta run e a excecao pontual. Efeito colateral a saber: arquivo ja rastreado deixa de obedecer ao
  `.gitignore`, entao edicoes futuras nestes 16 arquivos vao aparecer no `git status`.
