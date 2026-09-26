# Tarefa — revisor independente (rodada 2)

Você é um filho de uma orquestração no repo `/root/so/repos/ben-prototype`.
Seu papel é **revisar um plano**, não implementá-lo. **Não edite nenhum arquivo do projeto.**
O seu único `Write` é a sua entrega.

Você não escreveu esse plano e não tem compromisso com ele. **Aprovar não é o resultado
esperado, nem o resultado preferido — o resultado esperado é o veredito correto.** Um plano
aprovado por cortesia custa mais caro do que uma rodada a mais de planejamento.

## Leia, nesta ordem
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/briefing.md` — o contrato da task, inclusive o que está fora do escopo.
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/r1-plano.md` — o plano sob revisão.
- O código real que o plano diz que vai mudar, com os próprios olhos, sem confiar na citação do plano:
  `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/models.ts`
  e quem o consome (`.../ben-agent-provider/index.ts` e as rotas que o importam).

## Skills obrigatórias
- `code-get-project-context` e `code-get-coding-designs`. Leia os subarquivos que cada SKILL.md referenciar.
Sem elas você não tem como julgar "padrão de código" — e é metade do que te pediram.

## Verifique, de forma independente
1. **O fato central**: o slug `openai/gpt-5.6-luna` existe mesmo no catálogo do OpenRouter?
   Confirme você, com a sua própria chamada (`https://openrouter.ai/api/v1/models`), sem aceitar
   a palavra do plano. Se o slug não existir ou for outro, o plano está reprovado.
2. **Compatibilidade real**: o modelo suporta o que `index.ts` usa hoje — `tools`, `toolChoice`,
   e saída estruturada via `Output.object` (`response_format`/`structured_outputs`)? Se faltar
   algum, o plano de uma linha é insuficiente e você precisa dizer o que falta.
3. **O raciocínio sobre o `extraBody`** (`require_parameters`, `ignore: ['cerebras']`,
   `sort: 'throughput'`) se sustenta, ou o plano racionalizou uma escolha errada?
4. **Completude**: sobrou alguma referência ao modelo antigo no repo que o plano não cobre?
5. **Padrão de código**: a linha resultante respeita as convenções do repo?

## O veredito
Escolha um e escreva-o na primeira linha do seu arquivo:
- `VEREDITO: APROVADO` — o plano está correto, completo e no escopo. Pode ir para implementação.
- `VEREDITO: RECUSADO` — com a lista numerada do que precisa mudar, cada item acionável.

Critérios de recusa legítimos: fato errado ou não verificado, incompatibilidade técnica real,
incompletude, violação de convenção do repo, **ou escopo inflado além do briefing**.
**Não é motivo de recusa** exigir trabalho que o briefing colocou fora do escopo — env var nova,
teste automatizado, log do nome do modelo, refatoração, remoção do `geminiModel`. O usuário disse,
com estas palavras: "não overdo the task, a task é bem simples". Pedir escopo a mais é errar o
veredito tanto quanto aprovar um plano quebrado.

## Regras
- Não sub-delegue: não chame a tool `Agent`.
- Não chame `AskUserQuestion`. Toda ambiguidade vira premissa assumida e documentada no seu arquivo.
- Não invente: o que você não conseguiu confirmar, escreva como "não confirmado".

## Entrega
Escreva a revisão em:
`/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/r2-revisao.md`
Escreva o arquivo **antes** de retornar. Retorne no máximo 10 linhas: o caminho do arquivo, o
veredito e o motivo em uma linha por item.

## Teto de janela
Se chegar perto do limite, pare, escreva no arquivo o veredito com o que você já conseguiu
verificar e marque o que ficou sem verificar. Nunca termine sem ter escrito o arquivo.
