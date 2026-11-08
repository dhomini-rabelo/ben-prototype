---
name: decidir-especificar-e-planejar
description: Método para levar uma issue ou feature da decisão ao plano aprovado. O agente decide se ela vale a pena (como PM, fundador e tech lead), especifica o que o usuário espera, opcionalmente mostra três ou mais protótipos visuais da tela para o usuário escolher, e planeja com reconhecimento, roteiro de prova e plano próprios, com o plano revisado contra as convenções de código do projeto, terminando na linha que entrega a pasta à /implementar-e-validar. Use quando o usuário pedir /decidir-especificar-e-planejar.
disable-model-invocation: true
---

# Decidir, especificar, prototipar e planejar uma issue ou feature

A maioria dos projetos gasta anos em features que ninguém usa. Esta skill existe para que o
agente diga, com motivo, **se vale fazer** antes de dizer **como fazer**, e para que a tela seja
vista e escolhida antes de qualquer linha de código de verdade. A Etapa 4 planeja com os prompts
e formatos que estão nesta pasta (`prompts/`, `formats/`, `scripts/`), e a entrega final é a linha
que chama `/implementar-e-validar`. Nenhuma etapa depende de outra skill de planejamento.

| Etapa | Nome | Quando roda |
|---|---|---|
| 1 | Questionamento e análise + entrevista | sempre |
| 2 | Especificar: `[Specs]`, `[Requisitos técnicos]`, `[Casos de borda]`, `[Prova]` e, com tela de design não óbvio, `[Visual]` | com decisão `vai` ou `vai menor` |
| 3 | Protótipo visual | **opcional**: só com `[Visual]` e se o usuário escolher no gate da Etapa 2 |
| 4 | Planejar: reconhecimento, dúvidas técnicas e roteiro de prova, plano e revisão do plano, gate do plano, entrega | sempre depois da 2, ou da 3 quando ela rodou |

## A pasta da run

Tudo que a skill escreve fica numa pasta, criada quando o registro de decisão é escrito (fim da
Etapa 1). A `/implementar-e-validar` abre a mesma pasta depois e procura `spec.md`,
`projeto.md`, `reconhecimento.md`, `roteiro.md` e `plano.md` por esses nomes; não os renomeie:

```text
.claude/tmp/orquestracoes/{YYYY-MM-DD}-{slug}/
├── decisao.md          ← Etapa 1, o registro de decisão
├── spec.md             ← Etapa 2, a spec que o usuário aprovou, com o bloco `## Gate` no fim
├── prototipo.md        ← Etapa 3, só quando ela rodou: variações, escolha, prints e o caminho da base
├── prototipo/          ← Etapa 3, os prints de cada variação (v1.png, v2.png, ...)
├── corte.md            ← Etapa 4, só numa pasta de parte, quando a task foi quebrada
├── log-planejamento.md ← Etapa 4, o ledger; só o nível 0 escreve
├── projeto.md          ← passo 4.1, o cartão do projeto
├── reconhecimento.md   ← passo 4.1
├── roteiro.md          ← passo 4.2, o roteiro de prova aprovado
├── plano.md            ← passo 4.3
├── revisao-plano-{n}.md ← passo 4.3, uma por rodada do revisor do plano
└── ondas.md            ← passo 4.3, só quando o plano declarou onda pendente
```

A pasta fica fora do git (`.claude/tmp/` está no `.gitignore`), prints inclusive.

**Entrada por pasta.** `/decidir-especificar-e-planejar {pasta}` retoma uma run. Um `ls` decide onde:

| A pasta tem | Comece em |
|---|---|
| `ondas.md` | a primeira onda não `implementada`: `pendente` começa no passo 4.1; `planejada` não se replaneja, a linha é a da `/implementar-e-validar` |
| `plano.md` e o `revisao-plano-{n}.md` de `n` mais alto com `## Veredito` `corrigir` | passo 4.3, revisão do plano: com `n` ≤ 2, a volta ao planejador; com `n` = 3, o gate do plano (4.4) com os achados abertos |
| `plano.md`, sem `ondas.md` | nada a planejar: entregue a linha da `/implementar-e-validar` |
| `corte.md` e `spec.md` | passo 4.1, para esta parte |
| `spec.md` sem `## Gate` no fim | gate da Etapa 2 |
| `spec.md` com `Protótipo: sim` e sem `## Escolha` em `prototipo.md` | Etapa 3 |
| `spec.md` com o gate fechado | Etapa 4, passo 4.1 |
| `decisao.md` com `## Encerramento` | nada a fazer: a run terminou em `não vai aceito`. Diga isso ao usuário e não escreva spec; só um pedido novo dele, para reabrir a decisão, muda isso |
| `decisao.md` com veredito `falta informação` | Etapa 1, passo 5: o usuário traz o dado que faltava, e você incorpora e emite o veredito de novo |
| só `decisao.md`, com veredito `vai`, `vai menor` ou `faça [x]` aceito | Etapa 2 |

## Etapa 1 — questionamento e análise + entrevista

### O que ela entrega

Um **registro de decisão** (formato no fim desta etapa) com um destes vereditos:

- **vai** — a ideia resolve um problema real de alguém que o produto atende, e o custo cabe.
- **vai menor** — vale, mas a primeira versão deve ser a menor que permita medir; a versão
  completa fica descrita, e o usuário pode escolhê-la (com IA o custo de fazer é baixo; o
  custo de manter e de confundir o usuário do produto não é).
- **faça [x] no lugar** — outra coisa traria mais resultado, ou o produto precisa de [x] antes
  desta.
- **não vai** — não tem valor ou não será usado; dito como um tech lead ou fundador diria.
- **falta informação** — a entrevista não fechou e nenhuma premissa deixa a decisão útil.

O usuário tem a última palavra. Se ele passar por cima de um `não vai` ou `faça [x]`, o
registro guarda o veredito do agente e a decisão do usuário, lado a lado.

### Passo 0 — ideia principal (gate 1)

O erro mais caro desta etapa é entender o problema errado: tudo que vem depois herda o erro
com aparência de qualidade — brief bem escrito, spec detalhada, código limpo, para o problema
errado. Por isso o agente não preenche nada antes de provar que entendeu.

A causa comum é **ancoragem na solução**: o usuário descreve a solução ("tela nova de
dashboard") e o agente engenharia-reversa um problema que a justifique. A regra que corrige
isso é dura: **o entendimento é escrito sem nomear a solução.** A solução só pode aparecer
depois, no campo `versão completa` do brief.

Entender não é reformular. O agente sempre reformula bem, e isso não prova nada. O que prova
entendimento é afirmar coisas que podem estar erradas. O agente entrega um parágrafo com quatro
afirmações, lendo o pedido e o projeto (personas, ICP, quem de fato usa o sistema):

```md
## Ideia principal
Problema: {uma frase: o que dói, para quem, quando}
Não é: {o que este pedido explicitamente NÃO está tentando resolver}
Exemplo: {a situação acontecendo com a persona, concreta, com nome e momento}
Confirma? {uma afirmação que o usuário valida com "sim" ou corrige}
```

O usuário confirma ou corrige. Para quem não tem tempo, confirmar um parágrafo custa menos
que responder cinco perguntas; para quem tem, cada frase é um ponto de correção. **Nada do
Passo 1 em diante começa antes da confirmação.** Se o usuário corrigir, o agente reescreve o
parágrafo e pede confirmação de novo; se a correção trocar o problema por outro, o pedido
original vira `versão completa` de um brief que ainda não existe, e o agente recomeça daqui.

### O brief: o que o agente precisa saber

Com a ideia principal confirmada, o agente tenta preencher o brief sozinho antes de perguntar
qualquer coisa. São seis campos; cada um recebe um valor ou a marca `lacuna`:

```md
problema:       o que dói hoje, para quem, com que frequência (copiado da ideia principal)
para quem:      a persona, o ICP ou a pessoa que usa o sistema e sente esse problema
por que agora:  o que muda se for feito agora e não depois; o que fica sem fazer no lugar
sinal de sucesso: como saberemos que deu certo, e como medir (registro no banco, visita,
                evento, contagem — depende do produto)
menor versão:   a menor entrega que já permite medir o sinal de sucesso
versão completa: o que o usuário descreveu ou imagina, quando difere da menor
```

Um pedido longo pode preencher `versão completa` e deixar `problema` e `para quem` em branco.
**A quantidade de detalhe não decide nada; as lacunas decidem.**

### Passo 1 — análise: preencher o brief sem perguntar

Fontes, nesta ordem, parando quando o brief fecha:

1. **O pedido** como o usuário escreveu, verbatim.
2. **O projeto**: o repositório atual (o que já existe, o que a ideia duplica ou toca), as
   personas e objetivos do produto quando estiverem registrados, issues e decisões anteriores
   sobre o mesmo tema.
3. **Pesquisa externa**, quando a ideia tem equivalente no mercado: como produtos
   consolidados do mesmo nicho fazem isso (um app de transcrição tem dezenas de concorrentes;
   a forma como os grandes resolvem é evidência). Registre a fonte. Pesquisa não prova que a
   feature "dará resultado"; prova que o problema existe e mostra formas de atacá-lo.

Tudo que o agente preencher sem o usuário dizer é **premissa**, marcada `(agente)` ao lado.
Premissa não é lacuna: ela fecha o campo e vai para a entrevista só se for arriscada.

### Passo 2 — desvio: entrevistar ou seguir

Conte as lacunas e as premissas arriscadas (as que, se erradas, mudam o veredito).

- **Nenhuma ou uma** → siga para o Passo 4 (as três lentes) sem entrevista. A premissa
  restante e os complementos (regra 7 do Passo 3) vão embutidos no registro de decisão, e o
  usuário confirma, aceita ou recusa ao ler.
- **Duas ou mais** → Passo 3 (entrevista) antes das lentes.

### Passo 3 — entrevista: só sobre o que falta

Regras:

1. **Rascunho primeiro.** O usuário recebe o brief já preenchido, com `lacuna` e `(agente)`
   visíveis, e reage. Ninguém responde questionário em branco.
2. **Só o que muda o veredito, e nada de pergunta óbvia.** Pergunta que não altera
   `vai`/`não vai`/`menor versão` não é feita. Também não se pergunta o que o código do
   repositório já responde, o que o usuário já disse no pedido ou no brief, nem o que tem uma
   resposta padrão que ninguém recusaria. Em todos esses casos o agente assume, marca
   `(agente)` e lista a premissa no registro de decisão.
3. **Opções, com uma recomendada.** Cada pergunta traz duas a quatro opções e a que o agente
   recomenda, com o motivo em uma linha. Resposta livre sempre é possível.
4. **Teto de quinze perguntas na entrevista inteira, sem teto de rodadas.** O teto vale para a
   entrevista, não para cada rodada, e a pergunta "aceita o rascunho como está?" conta nele e
   vem primeiro. Nova rodada é legítima quando a resposta do usuário pede mais detalhe ou o
   agente tem dúvida real. O agente para de perguntar quando tem confiança para fazer a task:
   decidir o veredito e, depois, escrever a spec. Quinze é teto, não meta: o ideal é perguntar
   pouco, e a regra 2 continua valendo. Se chegar a quinze sem essa confiança, siga o fluxo do
   veredito `falta informação` em "Depois do veredito".
5. **Orçamento do usuário.** Quem não quer gastar tempo aprova o rascunho e as premissas de
   uma vez; quem quer, abre cada premissa. A entrevista precisa funcionar nos dois casos, e por
   isso a pergunta "aceita tudo como está?" vem primeiro, sozinha.
6. **O agente pode discordar na entrevista.** "Por que você acha que isso traria resultado?"
   é pergunta legítima quando `problema` ou `para quem` ficaram em `(agente)`.
7. **O time complementa a ideia.** O fundador chega com a ideia; o resto do time a completa
   até o melhor formato. Depois das lacunas, o agente propõe **complementos**: especificações
   que o pedido não cobriu (estado vazio, erro, permissão, o que acontece na segunda vez) e
   melhorias que tornam a feature mais completa para a persona. Regras do complemento:
   - cada um nomeia **para quem** serve e **qual problema** da ideia principal ele atende;
     complemento sem persona é gosto do agente e não entra;
   - o usuário aceita ou recusa **um a um**; aceitos vão para `versão completa` (ou para
     `menor versão`, se o usuário escolher); recusados ficam registrados com o motivo dele;
   - complemento não muda o veredito: ele enriquece o que vai ser feito, não decide se vai.
   - teto de cinco complementos; o agente ordena do que mais serve à persona ao que menos.

### Passo 4 — as três lentes

Com o brief fechado, o agente julga a ideia três vezes, com perguntas diferentes. Cada lente
escreve uma linha de parecer; as três entram no registro.

| Lente | A pergunta que ela faz |
|---|---|
| PM | O problema é real para a persona nomeada? O sinal de sucesso é observável? |
| Fundador | Vale agora? O que deixa de ser feito? Isso move o produto ou só o ocupa? |
| Tech lead | Quanto custa, o que quebra, o que já existe que resolve metade? Há caminho mais simples? |

Uma lente pode discordar das outras; o veredito sai do conjunto, e a divergência fica escrita.

### Passo 5 — veredito (gate 2)

Escolha um dos cinco vereditos. O usuário decide se vai; é o segundo e último gate da etapa.
Regras:

- `não vai` e `faça [x] no lugar` exigem **motivo nomeado**: nenhuma persona precisa; duplica
  algo que existe; custo muito maior que o ganho; momento errado; [x] traz mais resultado;
  [x] é pré-requisito. Sem motivo nomeado, o veredito é `falta informação`.
- `faça [x] no lugar` só vale se [x] for mais barato **ou** atacar o mesmo problema. Trocar a
  ideia por uma reformulação maior é redesign, não alternativa.
- `vai menor` descreve as duas versões e deixa a escolha com o usuário.
- Um agente que sempre diz `vai` é inútil; um que diz `não vai` sem motivo é ignorado. O
  motivo é a calibração.

### Depois do veredito

O que vem a seguir depende do veredito e da resposta do usuário.

**`falta informação`: pergunte o dado, não assuma.** Neste veredito nenhuma premissa deixa a
decisão útil, então não siga adiante com uma.

1. Nomeie o dado que falta: uma frase por dado, dizendo por que sem ele o veredito não sai
   ("não sei quem usaria o CSV nem para quê").
2. Faça **uma rodada** de perguntas objetivas ao usuário, uma por dado, até cinco, com opções
   quando o dado tem candidatas. Esta rodada é à parte do teto da entrevista do Passo 3.
3. Incorpore a resposta: complete o brief, com a resposta do usuário no lugar do `(agente)`, e
   refaça só as lentes que ela mudou.
4. **Emita o veredito de novo**, agora entre os cinco, e siga as regras do passo 5.
5. Se o veredito continuar `falta informação`, não faça outra rodada. Escreva o `decisao.md`
   com o que ainda falta no motivo, diga ao usuário o dado de que você precisa e pare. A run
   reabre pela pasta (ver "Entrada por pasta") quando ele trouxer o dado.

**`não vai`: o usuário concorda ou discorda.** Apresente o veredito com o motivo nomeado.

- Se ele **concorda**, a skill encerra com **não vai aceito**: acrescente `## Encerramento` ao
  `decisao.md` (formato abaixo), entregue só esse arquivo, sem spec, e diga que a run terminou.
- Se ele **discorda**, a conversa segue: leve o argumento dele às lentes e emita um novo
  veredito. Se ele mantém a decisão dele sobre a sua, vale "Se o usuário passar por cima".

**`faça [x] no lugar`: a mesma pasta continua.** Se o usuário aceita [x], a skill não abre uma
run nova nem volta ao passo 1. Registre a troca em `## Troca` do `decisao.md` (pedido original →
[x], com o motivo) e siga para a Etapa 2, cuja spec passa a ser a de [x].

### Registro de decisão

Um arquivo por issue ou feature, escrito antes de qualquer plano, em `{pasta-da-run}/decisao.md`
(crie a pasta agora; ver "A pasta da run"). Formato:

```md
# Decisão — {título curto da issue ou feature}

## Pedido
{verbatim}

## Ideia principal
{o parágrafo do Passo 0, na versão que o usuário confirmou}

## Brief
{os seis campos, com (agente) onde for premissa e a resposta do usuário onde houve entrevista}

## Pesquisa
{o que foi lido no projeto e fora dele, com fonte; "nenhuma" se não houve}

## Lentes
- PM: {parecer em uma linha}
- Fundador: {parecer em uma linha}
- Tech lead: {parecer em uma linha}

## Veredito
{vai | vai menor | faça [x] no lugar | não vai | falta informação} — {motivo nomeado}

## Decisão do usuário
{igual ao veredito, ou o que ele escolheu no lugar, verbatim}

## Complementos
- {complemento} — para {persona}, atende {problema} — aceito | recusado: {motivo do usuário}
{ou "nenhum proposto"}

## Menor versão
{o que entra; "não se aplica" se o veredito for não vai}

## Como medir
{o sinal de sucesso e onde ele é lido}

## Troca
{só em `faça [x] no lugar` aceito: pedido original → [x], com o motivo; senão, omita}

## Encerramento
{só em `não vai` com o usuário de acordo: `não vai aceito — {data}`; senão, omita}
```

### Issue e feature não passam pelas mesmas perguntas

A estrutura é a mesma (ideia principal → brief → desvio → lentes → veredito), mas o conteúdo
muda:

- **Feature**: a pergunta central é de valor (`problema`, `para quem`, `por que agora`). A
  pesquisa externa é comum.
- **Issue**: a pergunta central é de impacto. `problema` vira "o que acontece e como
  reproduzir"; `para quem` vira "quem é atingido e com que gravidade"; `sinal de sucesso` vira
  "como provar que não acontece mais". `não vai` em issue significa "não é um defeito" ou
  "não vale corrigir" e precisa do mesmo motivo nomeado.

## Etapa 2 — especificar

Começa só com o registro de decisão fechado e a decisão do usuário em `vai` ou `vai menor`
(com a versão escolhida), ou em `faça [x] no lugar` aceito, caso em que a spec é a de [x] (ver
"Depois do veredito"). A spec cobre **exatamente** essa versão mais os complementos aceitos:
nem o que ficou em `versão completa` quando o usuário escolheu a menor, nem o que foi recusado.

A spec tem quatro partes, nesta ordem: **`[Specs]`**, o que o usuário espera, na língua dele,
sem nada técnico; **`[Requisitos técnicos]`**, o que o tech lead acrescenta; **`[Casos de
borda]`**, o que o usuário espera quando a situação sai do caminho feliz; e **`[Prova]`**,
como cada expectativa vai ser mostrada. O usuário lê `[Specs]` sem precisar entender a
técnica, mas a aprovação é **um gate só, sobre as quatro partes**: um requisito técnico pode
ajustar ou cortar uma AC (regra 7 de `[Requisitos técnicos]`), então `[Specs]` só fecha
depois da segunda parte. Quem não tem tempo pula `[Prova]`; quem tem, veta o que não quer.

Teste que separa spec do resto: *você decide sem abrir o repositório? Então é spec.* Nome de
arquivo, função, classe, pasta ou desenho de código não entra em `[Specs]`.

Quando a feature tem tela nova ou muda a aparência de uma que existe, a spec ganha uma quinta
parte, **`[Visual]`**, depois de `[Prova]`: o que o usuário quer ver e as referências que ele
tem. Ela não é contrato nem é provada; é o insumo do protótipo da Etapa 3. Sem tela, ela não
existe e a Etapa 3 não roda. O mesmo vale quando o design é óbvio (ver "Design óbvio", no gate
da Etapa 2).

A spec abre com um **cabeçalho** de quatro linhas, antes de `Fora de escopo` e das quatro
partes. Ele liga a spec ao registro de decisão e nomeia as personas que as marcas `(P2)` vão
usar; nada além disso.

```md
# Spec — {título curto, o mesmo do registro de decisão}

Decisão:   {caminho do registro de decisão}
Versão:    {menor | completa} — {uma linha do que entra}
Para quem: P1 {persona}; P2 {persona} — as do campo `para quem` do registro

## Fora de escopo
- {o que o usuário recusou nos complementos}
- {o que ficou em `versão completa` sem entrar nesta versão}
```

### `[Specs]` — o que o usuário espera, por situação

As expectativas são agrupadas pela **situação** em que acontecem, lidas de cima a baixo como
um passo a passo pela feature. O grupo carrega o contexto uma vez; cada linha dentro dele é o
que o usuário espera naquele momento.

```md
## [Specs]

### Ao abrir a página de registros
AC-001  Espera ver um seletor de período acima da listagem, já com o mês atual.

### Ao pedir o CSV
AC-002  Espera baixar um arquivo com exatamente os registros do período escolhido, na
        ordem que já vê na listagem, até 10 mil linhas.
AC-003  (P2) Espera que o arquivo traga só os registros da própria equipe.

### Continua como hoje
AC-004  Espera que a listagem, ao abrir a página, continue igual à de hoje enquanto não
        mexer no período.
```

Casos de borda (período vazio, listagem vazia, sem permissão) **não** entram como AC: a AC é a
capacidade que o usuário espera ter. `AC-00N  Espera ser avisado quando o período está vazio`
não é uma AC neste modelo; é um caso de borda, e fica na terceira parte, `[Casos de borda]`.

Regras:

1. **Grupo é uma situação**, escrita como o usuário a viveria: "Ao abrir...", "Ao clicar
   em...", "Quando ... está vazio", "Na segunda vez que...". Um grupo por momento; a ordem dos
   grupos é a ordem em que a pessoa passa por eles. Grupo não tem id.
2. **Toda linha começa com `AC-00N  Espera`**, como o usuário descreveria. Nada de verbo de
   sistema ("o sistema valida", "a API retorna"): isso é requisito técnico.
3. **Numeração contínua** entre grupos e personas, e **id estável**: linha cortada deixa buraco,
   nunca renumera. O buraco é informação, não erro.
4. **Tudo em `[Specs]` é obrigatório.** Não existe marca de prioridade nem de "desejável":
   expectativa opcional é expectativa que não devia ter sido escrita. Se algo precisa de
   alternativa, a alternativa é escrita como expectativa.
5. **Personas.** Situação primeiro; a persona entra como marca na linha — `(P2)` — só quando a
   expectativa muda de uma persona para outra. Sem marca, vale para todas. Só inverta (persona
   como grupo, situação dentro) quando as jornadas são diferentes de verdade, como admin e
   cliente final. As personas são as do registro de decisão (`para quem`).
6. **Fora de escopo** vem antes de `[Specs]`, como lista curta: tudo que o usuário recusou nos
   complementos e o que ficou em `versão completa` sem entrar nesta versão.
7. **Issue:** o primeiro grupo é a reprodução ("Ao fazer X com Y") e a AC é o que o usuário
   consegue fazer depois da correção, visto por ele, não o campo interno que muda. Toda issue
   tem a seção `Continua como hoje` (regra 11) com pelo menos uma linha.
8. **Nada técnico aqui.** Restrição e regra de implementação ficam para a segunda parte, a
   prova para a quarta; `[Specs]` não as menciona.
9. **Premissa marcada na linha.** Quando o agente decidiu algo que o usuário não disse, a
   marca `(agente)` vai no fim da própria AC — `AC-001  Espera ver o seletor já com o mês
   atual (agente)`. Quem lê aprova ou corrige na linha; nada de premissa escondida em lista
   separada.
10. **Valor concreto na AC.** Se a expectativa depende de um número, formato ou limite que o
    usuário percebe ("até 500 linhas", "vírgula como separador", "os 10 mais recentes"), o
    valor aparece na AC. Não fica para a segunda parte descobrir.
11. **`Continua como hoje` é a última seção de `[Specs]`.** É a única seção que não é uma
    situação: ela reúne, para ficar claro na revisão, o que a mudança **não pode** alterar.
    Toda linha é `AC-00N  Espera que ... continue como hoje`, na mesma numeração contínua
    das outras, e nomeia a situação dentro da própria linha ("ao abrir a página"), porque
    sem o onde ela vira "o resto continua funcionando", que ninguém prova. Obrigatória em
    toda issue e em toda feature que mexe em tela ou fluxo que já existe (AC-004 do
    exemplo): é o que impede o novo de quebrar o antigo que era fundamental. Feature que
    não toca nada existente não tem a seção.

### `[Requisitos técnicos]` — o que o tech lead acrescenta

`[Specs]` é a task como o PM ou o fundador a entrega. `[Requisitos técnicos]` é o que o
desenvolvedor ou tech lead **acrescenta** a ela: as decisões técnicas que mudam custo, risco
ou experiência e que ele levaria ao PM antes de começar. Ele não reescreve a AC; ele diz o que
a AC não diz.

```md
## [Requisitos técnicos]

RT-001 (geral)   Usar Mongo para este fluxo, para lidar com o excesso de leitura e escrita.
RT-002 (AC-002)  Índice por período e equipe, para o CSV sair em segundos com milhares de
                 registros.
RT-003 (AC-001)  O período é interpretado no fuso do usuário, não em UTC.
RT-004 (geral)   Histórico carregado localmente, para a listagem abrir sem esperar a rede.
RT-005 (AC-002)  CSV limitado a 10 mil linhas nesta versão, porque acima disso a geração
                 trava e o arquivo não abre na planilha do usuário.
```

Regras:

1. **Todo RT leva o motivo**, em uma frase. É o motivo que permite ao PM ou fundador vetar
   sem entender a técnica.
2. **Aponta a AC que afeta ou `geral`** quando vale para a task inteira. Uma marca; o texto
   da AC não se repete.
3. **Sem marca de prioridade.** Não existe MUST, SHOULD nem MAY: RT escrito é RT que vale.
4. **Zero RT é resultado válido.** Não existe "toda AC tem RT": task sem decisão técnica a
   levar ao PM fica sem esta parte. RT inventado para preencher a seção é a origem da
   repetição entre AC e RT, e não entra.
5. **RT é decisão, não detalhe.** O que o tech lead decidiria sozinho sem avisar ninguém
   (arquivo, função, nome de índice) não é RT; fica para o plano. O teste "decido sem abrir
   o repositório" vale aqui também.
6. **Numeração própria** (`RT-00N`), contínua, com buraco no corte, como as ACs.
7. **RT que exige algo recusável vira pergunta, não decisão.** Quando a decisão técnica
   depende de algo que o usuário pode recusar — serviço novo, provider de e-mail, custo
   recorrente, dependência pesada —, o agente não escreve o RT: escreve uma pergunta com as
   opções reais (aceitar o custo / versão sem isso / cortar a AC), a recomendada primeiro,
   com o motivo em uma linha. Conforme a resposta, a AC afetada é ajustada ou cortada,
   deixando o buraco na numeração. Esse retorno de `[Requisitos técnicos]` para `[Specs]` é
   regra, não exceção; é por ele que a aprovação é um gate só, sobre as quatro partes.
8. **RT pode ser um limite que fecha um buraco de risco**, não só uma escolha de tecnologia.
   O tech lead nomeia a parte arriscada (volume, tempo, tamanho, concorrência) e a limita
   nesta versão, com o motivo (RT-005). O limite volta para as outras partes: vira valor
   concreto na AC (regra 10 de `[Specs]`, "até 10 mil linhas") e uma borda em
   `[Casos de borda]` ("ao passar de 10 mil, espera ser avisado").

### `[Casos de borda]` — o que o usuário espera fora do caminho feliz

`[Specs]` diz a capacidade que o usuário espera ter. `[Casos de borda]` diz o que ele espera
quando a situação sai do caminho feliz: sem filtro escolhido, listagem vazia, período sem
registro, limite atingido, segunda vez — e quando algo dá errado: sem conexão, servidor
fora, falha no servidor, processamento que demora ou fica pendente. Mesmos grupos por
situação e mesma língua "Espera..." das ACs; cada linha aponta a AC que completa.

```md
## [Casos de borda]

### Ao abrir a página de registros
CB-001  Espera ver os registros mais recentes se limpar o período (AC-001)
CB-002  Espera ver um botão de adicionar o primeiro registro quando a listagem está vazia
        (AC-004)

### Ao pedir o CSV
CB-003  Espera ser avisado quando o período não tem registro, em vez de baixar um arquivo
        vazio (AC-002)
CB-004  Espera que um período que cruza a meia-noite seja contado no fuso dele, não em UTC
        (AC-002, RT-003)

### Enquanto o CSV é gerado
CB-005  Espera ver que o arquivo está sendo preparado e poder continuar usando a página
        enquanto espera (AC-002)
CB-006  Espera ser avisado se a geração passar de 30 segundos, com a opção de receber o
        arquivo quando ficar pronto (AC-002) (agente)

### Se o pedido do CSV falha
CB-007  Espera ser avisado que o servidor falhou e poder tentar de novo sem escolher o
        período outra vez (AC-002)
CB-008  Espera ser avisado que está sem conexão, com o período escolhido preservado até a
        conexão voltar (AC-002)
CB-009  Espera ser avisado quando o período passa de 10 mil linhas e poder reduzi-lo ali
        mesmo (AC-002, RT-005)
```

Regras:

1. **Grupo é uma situação**, como em `[Specs]`: pode repetir um grupo de lá ou abrir um novo
   ("Quando ... está vazio", "Na segunda vez que..."). Grupo não tem id.
2. **Toda linha começa com `CB-00N  Espera`** e termina apontando a AC que completa. Caso de
   borda que não completa nenhuma AC é uma AC que falta ou escopo novo: volta para `[Specs]`
   ou para `Fora de escopo`, nunca fica aqui sem dono.
3. **Vem depois de `[Requisitos técnicos]`** porque parte das bordas nasce das decisões
   técnicas (fuso do usuário → período que cruza a meia-noite). Quando é o caso, a linha
   aponta também o RT.
4. **Nada técnico aqui.** Mesma regra de `[Specs]`: sem verbo de sistema, sem nome de código.
   O valor concreto que o usuário percebe (regra 10 de `[Specs]`) vale também na borda.
5. **Numeração própria** (`CB-00N`), contínua, com buraco no corte.
6. **Premissa marcada na linha**, `(agente)`, como nas ACs: borda que o usuário não descreveu e
   o agente decidiu fica visível para ele aprovar ou cortar.
7. **Nada genérico.** "Espera que os erros sejam tratados" ou "espera uma mensagem amigável"
   não é borda: cada linha nomeia a situação e diz **o que o usuário vê** e **o que consegue
   fazer em seguida** (tentar de novo, manter o que escolheu, receber depois, reduzir o
   período). Borda que não cabe nessa forma ainda não foi pensada.

### `[Prova]` — como cada expectativa vai ser mostrada

As três partes anteriores dizem o que o usuário espera. `[Prova]` diz como o agente vai
mostrar que cada expectativa vale: com **teste** (unitário, de integração, de ponta a ponta,
mais de um quando for o caso), **foto** (mudança de aparência, posição de um elemento, tela
vazia, um aviso) ou **vídeo** (uma interação, um carregamento, a ação que causava o problema
e não causa mais). Os três se combinam, e uma prova só costuma cobrir várias linhas.

```md
## [Prova]

PR-001  Teste unitário: o período é lido no fuso do usuário, inclusive quando cruza a
        meia-noite (AC-001, CB-004)
PR-002  Teste de integração: o CSV traz exatamente os registros do período, na ordem da
        listagem e só da própria equipe; 10 mil linhas passa, 10.001 avisa (AC-002, AC-003,
        CB-009)
PR-003  Vídeo: escolher o período, pedir o CSV, ver que está sendo preparado sem a página
        travar e receber o arquivo (AC-001, AC-002, CB-005)
PR-004  Foto: página aberta com o seletor no mês atual e a listagem igual à de hoje; com o
        período limpo, os mais recentes (AC-001, AC-004, CB-001)
PR-005  Foto: listagem vazia com o botão de adicionar; período sem registro com o aviso;
        geração passando de 30 segundos, servidor fora e sem conexão, cada um com o que o
        usuário pode fazer em seguida (CB-002, CB-003, CB-006, CB-007, CB-008)
PR-006  Teste de ponta a ponta: abrir a página, filtrar o período e baixar o CSV (geral)
```

Regras:

1. **O tipo é escolha do agente, linha a linha.** Ele analisa o que cada expectativa pede e
   escolhe teste, foto, vídeo ou uma combinação. Nada obriga teste em toda linha: uma
   correção pode ter só uma foto ou só um vídeo como prova, se é isso que mostra o
   resultado.
2. **Uma prova cobre várias linhas.** A linha `PR-00N` termina listando todas as ACs e
   bordas que ela mostra. Toda AC e toda borda aparece em pelo menos uma prova; linha sem
   prova é expectativa que ninguém vai conferir.
3. **Vídeo é o normal em app web e mobile** quando há interação com um elemento,
   carregamento ou uma experiência a mostrar; foto quando a imagem sozinha já diz tudo.
   Vídeo como prova principal com fotos de apoio é uma combinação comum.
4. **A prova é algo que o agente roda ou produz sozinho.** "Peça ao usuário para testar"
   não é prova. Quando o agente não consegue rodar ou capturar o produto, a prova cai para
   teste e a linha ganha a marca `(sem captura)`, visível para o usuário, nunca escondida.
5. **Toda feature tem uma verificação de ponta a ponta**, marcada `(geral)`: o fluxo inteiro,
   uma vez, além das provas por linha (PR-006).
6. **Issue:** a prova mostra o problema acontecendo antes e não acontecendo depois — o teste
   que falhava e passa, ou o vídeo ou a foto de antes e de depois.
7. **Nada de nome de código.** A linha diz o tipo e o que a prova mostra, não o arquivo de
   teste nem a ferramenta de captura; isso é do plano.
8. **Numeração própria** (`PR-00N`), contínua, com buraco no corte.

### `[Visual]` — o que alimenta o protótipo (só com tela)

`[Specs]` diz o que o usuário espera ter. `[Visual]` diz como ele imagina ver isso no estado
ativo: a tela cheia de dados reais, sem vazio, erro nem carregando. O agente rascunha a parte
com o que já sabe do pedido, do registro de decisão e das telas vizinhas do app; o usuário
corrige, acrescenta referências ou deixa como está.

```md
## [Visual]

Telas:        Página de registros, com o seletor de período e o botão do CSV (AC-001, AC-002)
Plataforma:   web, largura de notebook (agente)
Destaque:     o período escolhido e o botão do CSV; a listagem continua o centro da página
Referências:  "o filtro de data do Google Analytics" (usuário); a barra de filtros da página de
              equipes, que já existe no app (agente)
Manter:       cabeçalho, menu e estilo da listagem atuais (AC-004)
Livre:        posição do seletor, formato do botão (ícone, texto ou menu de exportação)
Dados:        um mês com 40 registros de 3 equipes, nomes realistas (agente)
```

Regras:

1. **Só o que muda a aparência.** Cada campo responde uma pergunta que o protótipo precisa
   para ser desenhado: que telas, em que plataforma, o que se destaca, o que o usuário já viu e
   gostou, o que não pode mudar, o que está livre para variar, com que dados.
2. **`Livre` é o que as variações exploram.** Quanto mais o usuário deixa livre, mais as
   variações da Etapa 3 diferem entre si; `Manter` é o que todas respeitam.
3. **Expectativa não mora aqui.** "Espera ver o total do período no topo" é uma AC e vai para
   `[Specs]`. `[Visual]` guarda preferência e referência, que não se provam.
4. **Premissa marcada na linha**, `(agente)`, como nas outras partes.
5. **Telas apontam as ACs** que aparecem nelas, para o protótipo não desenhar o que a spec não
   pede.

### O gate da Etapa 2

Escreva a spec em `{pasta-da-run}/spec.md` e entregue as partes ao usuário, com as
perguntas da regra 7 de `[Requisitos técnicos]` quando houver. No mesmo gate, e só nele, o
usuário decide mais duas coisas:

- **Protótipo ou direto ao planejamento.** Com `[Visual]`, pergunte se ele quer ver as
  variações da tela antes do plano (Etapa 3) ou ir direto ao planejamento (Etapa 4). A
  recomendada é o protótipo; o planejamento direto serve a quem já sabe o que quer ver. Sem
  `[Visual]`, não pergunte.
- **Design óbvio.** Quando a mudança segue um componente ou padrão que já existe na tela, sem
  decisão de disposição, hierarquia ou interação a tomar, o agente não escreve `[Visual]`, não
  pergunta sobre o protótipo e não cria variações. Exemplos: adicionar opções num select, um
  item novo numa lista igual aos vizinhos, trocar um texto ou rótulo, uma coluna a mais numa
  tabela que já existe. Tela nova ou mudança de disposição não é óbvia. O agente diz em uma
  linha que o design é óbvio e por quê; se o usuário discordar no gate, `[Visual]` é escrito e
  a pergunta volta.
- **A quebra, quando o agente a propôs.** Ver "A quebra em partes" na Etapa 4: o critério e o
  teto são de lá, mas a proposta aparece aqui, porque é a única hora em que o usuário olha a
  spec inteira.

**Se o usuário reprova a spec**, o feedback dele é a instrução de edição. Altere a `spec.md`
conforme ele pediu: acrescente, remova ou ajuste AC, RT, CB, PR e `[Visual]`, com as regras de
cada parte (id novo é o próximo livre, linha cortada deixa buraco, nunca renumera). Reapresente
as partes e as três decisões do gate com a spec já alterada, dizendo em uma linha o que mudou.
Repita até a aprovação; não há teto de rodadas, porque a spec é o que o usuário vai receber
implementado. Se a mudança afeta a quebra ou a necessidade de `[Visual]`, reavalie as duas na
reapresentação. Só a aprovação escreve o `## Gate`.

Com a aprovação, acrescente ao fim da `spec.md` o que foi decidido:

```md
## Gate
Aprovada:   {data}
Protótipo:  sim | não — {motivo em poucas palavras} | não — design óbvio: {motivo}
Partes:     1 | 1 — quebra recusada pelo usuário | {N}: {slug-1}, {slug-2} — ordem escolhida pelo usuário
```

O que o usuário recebe depois da implementação (saída dos testes, fotos, vídeo) pertence à
skill de implementação.

## Etapa 3 — protótipo visual (opcional)

Roda só quando a spec tem `[Visual]` e o usuário escolheu o protótipo no gate. Sem isso, siga
para a Etapa 4 sem `prototipo.md`.

O objetivo é que o usuário escolha a tela vendo-a, antes que o plano a fixe. Por isso o
protótipo é feito para ser olhado, e a escolhida sobrevive como **base** visual. Ficam os
prints, a descrição e os arquivos da variação escolhida, que viram o ponto de partida da
implementação.

### Quem faz o quê

O código das variações, os prints e a limpeza que deixa só a base são de **subagentes**, para que o
código do protótipo não entre no seu contexto. Você fica com a conversa: mostra os prints ao
usuário, conduz o gate da escolha, escreve `## Escolha` e leva requisito novo à `spec.md`.

| Momento | Subagente (`description`) | Faz | Retorna |
|---|---|---|---|
| Antes do gate | `proto-{slug}` | escolhe o número de variações, escreve `## Variações` em `prototipo.md`, cria a pasta de protótipo na árvore da feature (sem worktree), escreve o código, sobe o app, tira e confere os prints | caminho de `prototipo.md`, a pasta do protótipo, a lista dos prints |
| O usuário combina partes no gate | `proto-{slug}-v{n+1}` | monta `V{n+1}` na pasta de protótipo existente, tira e confere os prints | caminho dos prints |
| O usuário recusa todas as variações, ou rejeita a combinação | `proto-{slug}-r{n}` | lê os comentários do usuário e o `[Visual]` refinado, refaz as variações (ou a combinação) na pasta de protótipo existente, tira e confere os prints | caminho dos prints |
| Escolha registrada | `proto-{slug}-base` | apaga as variações recusadas, mantém a escolhida e roda o comando de "A base" | os caminhos da base e o `git status --short` da árvore da feature |

A linha da combinação só existe quando o usuário combinou partes, e a de refazer, quando ele
recusou. O ciclo de "A escolha" diz quando cada uma roda.

**O disparo** segue o padrão de "Regras do nível 0" (Etapa 4): `subagent_type: 'general-purpose'`,
`model: 'sonnet'`, `run_in_background: false`, e você encerra o turn até a notificação chegar.
Valem também o retorno em ponteiro (caminho, veredito, até 12 linhas), a proibição de
sub-delegar e a de chamar `AskUserQuestion`. O prompt do subagente leva:

- o caminho do `spec.md` e o do `prototipo.md` (que no primeiro disparo ainda não existe: o
  subagente o cria) e a pasta da run;
- o caminho deste `SKILL.md`, com a ordem de ler "O que se prototipa", "Variações diferentes de
  verdade", "Onde roda", "Como monta", "Os prints" e "A base" (as regras do que ele faz moram aí);
- o caminho da pasta do protótipo, nos disparos de combinação, de refazer e de base;
- a task em uma frase;
- o bloco de teto, o mesmo `## Tetos: 140k de janela e 50 turns` de
  [`prompts/reconhecimento.md`](prompts/reconhecimento.md), com `prototipo.md` no lugar do
  arquivo do passo. Não o remova. Com `handoff`, dispare um subagente fresco do mesmo passo com
  o caminho de `prototipo.md`, onde o anterior deixou o que já fez e o que falta; com `preso`,
  leia o motivo e decida como em "Regras do nível 0".

### O que se prototipa

- **Só o estado ativo**: a tela com os dados de exemplo de `[Visual]` › `Dados`, escritos fixos
  no código do protótipo. Sem vazio, erro, carregando, permissão nem chamada à API: essas
  situações estão em `[Casos de borda]` e são do plano.
- **Só as telas de `[Visual]` › `Telas`**, e nelas só o que as ACs apontadas pedem.
- **Três ou mais variações**, quantas o caso pede. Três é o padrão; passe disso quando
  `[Visual]` › `Livre` deixa abertos eixos independentes (disposição e navegação, por exemplo)
  que três variações não cobririam. Variações demais cansam a escolha: cada uma a mais precisa
  mostrar um caminho que nenhuma outra mostra.

### Variações diferentes de verdade

Antes de escrever código, o subagente lista as variações em `prototipo.md`, uma linha cada, com
o eixo em que ela difere das outras:

```md
## Variações
V1 — seletor de período em barra fixa acima da listagem; CSV como botão ao lado
V2 — período e exportação num painel lateral recolhível; listagem ocupa a largura
V3 — período como chips de atalho (este mês, mês passado, personalizado); CSV num menu "..."
```

Duas variações diferem quando muda pelo menos uma decisão de **estrutura**: disposição, onde
fica a ação principal, hierarquia do que se destaca, padrão de navegação ou de interação (lista,
cards, tabela, abas, painel, menu). Trocar cor, espaçamento, ícone ou texto não cria variação;
se duas linhas só diferem nisso, junte-as e pense outra. Todas respeitam `[Visual]` › `Manter`
e o estilo que o app já tem.

### Onde roda

No stack do próprio app, aberto no navegador: o servidor de desenvolvimento web do app, ou o
Expo web quando o app é mobile (o script de web do `package.json` do app). Nada de HTML solto
nem ferramenta de design fora do projeto: a variação precisa usar os componentes e o tema que a
implementação vai usar, senão a escolha é feita sobre uma tela que não vai existir. Task só de
backend não tem protótipo.

### Como monta

- Cada variação é uma **rota nova numa pasta própria de protótipo**, na convenção do framework
  do app. No Expo Router, por exemplo: `app/prototipo/{slug}/v1.tsx`.
- A tela monta os **componentes reais do app**, com os dados fixos de `[Visual]` › `Dados` e sem
  hook de API.
- Não edita arquivo existente. Se um componente compartilhado precisar mudar, vira uma cópia
  local dentro da pasta do protótipo.
- Sem worktree e sem commit: os arquivos ficam sem commit, na árvore da feature.

### Os prints

A evidência visual de cada variação é **print ou vídeo**, o que mostrar melhor a variação: o
print basta para disposição e hierarquia; o vídeo serve quando a variação depende de interação
que uma imagem não mostra (menu que abre, painel que recolhe). "Print", no resto desta skill,
vale para os dois.

O subagente reaproveita o alvo web que já estiver rodando ou sobe um numa porta livre. Pelo
Playwright MCP, usa `browser_resize` para 390x844 no mobile, abre a rota da variação e **espera
o texto da tela aparecer** antes do print: as fontes deixam a tela vazia até carregar. Captura a
tela inteira; quando a tela rola, um print por altura. Salva em
`{pasta-da-run}/prototipo/v{n}.png` (`v{n}-2.png` para o segundo da mesma variação, `v{n}.webm`
para o vídeo). Confere cada captura aberta antes de retornar.

Se o app tem um gate antes das rotas (no Shiplog, o `McpSetupGate`), ele já está resolvido no
ambiente do dev. Se não estiver, o subagente prepara o estado antes de capturar.

**Captura quebrada** (tela em branco, erro de compilação, dado faltando): a variação é inválida,
e o subagente conserta o código e captura de novo **sozinho, sem avisar o usuário**, até a
captura sair boa. Só com `handoff` ou `preso` o problema chega a você. Você só mostra ao usuário
o que o subagente retornou conferido.

### A escolha (gate da Etapa 3)

Mostre ao usuário, por variação, a linha de `## Variações` e o link do print, e pergunte qual
ele escolhe, uma opção por variação mais a de combinar (até quatro opções por pergunta; com
mais variações que isso, pergunte em texto livre). Ele escolhe uma, combina partes
("a barra da V1 com os chips da V3") ou recusa todas. O gate é um **ciclo**: repete até o
usuário aprovar um design, **sem teto de rodadas**, porque o protótipo existe para o usuário ver
o que quer antes do plano.

- **Escolheu uma:** registre a `## Escolha` abaixo.
- **Combinou partes:** a combinação vira uma variação nova, `V{n+1}`, montada e fotografada pelo
  subagente de combinação e mostrada por você ao usuário. Se ele a aprova, é a escolha. Se não
  gosta ou a rejeita, o comentário dele volta ao subagente `proto-{slug}-r{n}` como ajuste da
  combinação, e você mostra o resultado de novo; ou ele escolhe uma variação que já existe.
- **Recusou todas:** a spec ainda não diz o que ele quer ver. Anote os comentários dele em
  `prototipo.md` sob cada variação (`recusada: {comentário}`), refine `[Visual]` no `spec.md`
  com esses comentários (`Livre`, `Manter`, `Referências`; expectativa de comportamento vira AC,
  CB ou PR pela regra "Requisito novo", abaixo), diga ao usuário em uma linha o que mudou no
  `[Visual]` e dispare `proto-{slug}-r{n}` para refazer as variações a partir dele. As novas
  continuam a numeração (depois de V3, vêm V4, V5, ...), cada uma diferindo das anteriores em
  estrutura, e voltam ao mesmo gate. Refinar `[Visual]` não reabre o gate da Etapa 2: ele não
  é contrato.

Registre em `prototipo.md`:

```md
## Escolha
Variação:   V3 (ou V4 = V1 + chips da V3)
Prints:     prototipo/v3.png, prototipo/v3-2.png
Base:       {arquivos da escolhida na pasta do protótipo}
Descrição:  {três a cinco linhas: disposição, ação principal, o que se destaca, componentes
            do app que a tela usa}
Comentários do usuário: {verbatim}
```

**Requisito novo volta para a spec.** Se a escolha ou os comentários revelam uma expectativa
que a spec não tem ("quero ver o total do período no topo"), ela vira AC, CB ou PR na
`spec.md`, com o próximo id livre, e o usuário aprova só essas linhas antes da Etapa 4. Numa
quebra em partes, o destino do requisito é o de "A quebra em partes" (a parte do mesmo assunto,
ou a última), sem parte nova.
O protótipo nunca é o único lugar de um requisito: o plano lê a spec, e o que ficou só na
imagem não é implementado nem provado.

### A base

Com a escolha registrada, dispare o subagente `proto-{slug}-base`. Ele apaga os arquivos das
variações recusadas, mantém os da escolhida na pasta do protótipo e confere o que sobrou na
árvore da feature:

```bash
git status --short
```

O `git status --short` mostra só a pasta da base como arquivo novo (sem commit). O plano nomeia
esses arquivos como **ponto de partida visual**: o implementador transforma a base na tela real,
liga os dados e apaga a rota de protótipo no fim, sem mexer no layout aprovado.

## Etapa 4 — planejar

A Etapa 4 transforma a spec aprovada num plano que a `/implementar-e-validar` executa sem
fazer pergunta. Você é o **nível 0**: dispara três papéis de subagente, o reconhecimento, o
planejador e o revisor do plano, para com o usuário em dois gates (o do roteiro e o do plano) e entrega a pasta. Antes de planejar,
a quebra e o protótipo já estão decididos; o planejamento só os consome.

Os contratos estão nesta skill. Passe o caminho ao filho, nunca o conteúdo, e leia cada formato
antes do passo que o usa:

| Arquivo | O que define | Quem lê |
|---|---|---|
| [`prompts/reconhecimento.md`](prompts/reconhecimento.md) | o papel do reconhecimento | o filho do passo 4.1 |
| [`prompts/planejador.md`](prompts/planejador.md) | o papel do planejador | o filho do passo 4.3 |
| [`prompts/revisor-plano.md`](prompts/revisor-plano.md) | o papel do revisor do plano: implementabilidade e convenções de código | o filho da revisão, no passo 4.3 |
| [`formats/projeto.md`](formats/projeto.md) | o cartão do projeto: como levantar, template, degradação | o reconhecimento |
| [`formats/log-planejamento.md`](formats/log-planejamento.md) | o ledger da etapa | você, antes do 4.1 |
| [`formats/roteiro.md`](formats/roteiro.md) | a anatomia de cada prova | você antes do 4.2, e os dois filhos |
| [`formats/plano.md`](formats/plano.md) | o plano: lanes, checkpoints, marcos, ondas, seções obrigatórias e opcionais, critérios | o planejador |

### A quebra em partes

Uma task grande pode virar duas ou três partes, cada uma planejada e implementada sozinha. A
quebra é proposta pelo agente e decidida **uma vez**, no gate da Etapa 2; o planejamento não a
reabre.

- **Critério:** duas partes são separadas só quando nenhuma AC é compartilhada e nenhum RT de
  uma precisa do código da outra existir. Parte que depende de outra não é parte: é checkpoint,
  ou onda, e quem declara onda é o planejador. "Criar o endpoint e testá-lo" é uma parte só.
- **Teto de três partes; o padrão é uma.** Cada parte paga um reconhecimento, um roteiro, um
  plano, dois gates e uma implementação inteira. Se o critério separa mais de três grupos, junte
  os menores pelo fluxo que o usuário percorre. Na dúvida, não quebre.
- **Proposta:** uma tabela de partes, cada uma com uma linha do que entrega e as ACs que leva; o
  usuário aceita, junta ou recusa, e escolhe a ordem.
- **Se o usuário recusa a quebra**, a task vira **uma parte só**: nenhuma pasta de parte é criada,
  o `## Gate` registra `Partes: 1 — quebra recusada pelo usuário` e a quebra não é proposta de
  novo, nem quando a spec mudar depois.
- **Requisito novo depois da quebra** (por exemplo, ao ver o protótipo) não cria parte nem reabre
  a divisão. Ele entra no `spec.md` da parte do mesmo assunto e, se nenhuma serve, no da última
  parte da ordem, com o próximo id livre da spec inteira. Se for grande demais para caber numa
  parte (ele precisaria de AC, RT e prova próprias, sem relação com as ACs de nenhuma parte),
  avise o usuário e sugira uma task separada, fora desta run; ele não entra na spec.
- **Os ids não renumeram.** Cada parte leva as suas AC, CB, RT e PR com os ids da spec aprovada, e
  o buraco mostra o que ficou na outra. Um RT `(geral)` vai para todas as partes; a PR `(geral)`
  vai para a última da ordem, e cada outra parte ganha uma PR `(geral)` do seu fluxo, marcada
  `(agente)` e mostrada no gate.
- **Pastas:** uma por parte, `{YYYY-MM-DD}-{slug}-{parte}`, cada uma com o seu `spec.md` (o
  cabeçalho, `## Fora de escopo` com as ACs das outras partes, e as linhas da parte) e um
  `corte.md`. A pasta original guarda `decisao.md`, a spec inteira e o protótipo.

```md
# Corte — {título da spec}

Esta parte: {i} de {N} — {slug}

| # | Parte | ACs | Pasta |
|---|---|---|---|
| 1 | {uma linha} | AC-001, AC-002 | {caminho} |

Ordem escolhida pelo usuário: {1, 3, 2}
Spec inteira e protótipo: {caminho da pasta original}
```

Planeje uma parte por vez, a primeira da ordem; as outras saem na entrega.

### O protótipo como insumo

Quando a Etapa 3 rodou, o caminho de `prototipo.md` (o da pasta original, numa quebra) vai no
delta do reconhecimento e no do planejador. Os dois prompts já dizem o que fazer com ele: a seção
`## Escolha` é a tela aprovada, os prints são a referência, e o `Base:` aponta os arquivos que
viram o ponto de partida visual da implementação.

### Regras do nível 0

- **Você não lê código** nem `reconhecimento.md`, `plano.md` ou `projeto.md`: o que precisa chega
  no retorno dos filhos. Não edita arquivo do projeto, não roda build, teste nem `git`, e não chama
  `Grep`, `Glob` ou `Explore` para "dar uma olhada". Escreve só o ledger, o `roteiro.md`, o
  `corte.md` e o `ondas.md`. O `spec.md` você lê uma vez, quando entrou pela pasta e ele não está
  no seu contexto.
- **Modelos.** Reconhecimento em `sonnet`; plano em `sonnet` com veredito `simples` e `opus` com
  `complexa`; revisor do plano sempre em `opus`. Todo disparo leva `model` explícito, porque sem ele o filho herda o modelo do pai.
  Quem decide a dificuldade é o reconhecimento, que leu o código, nunca você.
- **Disparo.** `subagent_type: 'general-purpose'` e `run_in_background: false`; a tool retorna na
  hora e você encerra o turn, porque a notificação de conclusão chega sozinha. Não sonde com
  `TaskOutput` ou `Monitor`, não durma, não crie agente de espera nem fork. Nenhum filho
  sub-delega. Um `@caminho` dentro do `prompt` não é expandido: passe o caminho em texto.
- **Retorno.** Todo filho escreve o arquivo do passo antes de retornar, e o retorno é ponteiro:
  caminho, veredito, até 12 linhas. Só furam o teto os blocos que chegam ao usuário sem edição:
  `## Dúvidas` e `## Roteiro de comprovação` do reconhecimento, `## Resumo do plano` do planejador.
- **Tetos de 140k de janela e 50 turns por filho**, o primeiro que chegar. Os dois prompts trazem
  o bloco de medição com [`scripts/medir-janela.sh`](scripts/medir-janela.sh); não o remova. O
  `description` de cada disparo é único e estável, porque é o endereço da medição. Retorno com
  `handoff`: dispare um filho fresco do mesmo passo com o caminho do arquivo que o anterior deixou,
  nunca `SendMessage` no estourado. Retorno com `preso`: leia o motivo; progresso real e só longo
  ganha sucessor fresco, laço de verdade (busca que não acha) vai ao usuário, que costuma
  destravar em uma linha.
- **Fixtures.** O estado de partida das provas vem do mecanismo de fixtures do projeto, se houver.
  O reconhecimento responde `sincronizar`, `estender`, `sem mudança` ou `sem mecanismo`; o
  planejador executa; você só anota no ledger.
- **Ondas.** Quando os passos da segunda metade dependem do formato de um código que a primeira
  ainda vai criar, o planejador cobre uma onda e declara a próxima pendente. Você escreve
  `{pasta}/ondas.md` (`| # | Onda | RT e PR | Plano | Estado |`, estados `pendente`, `planejada`,
  `implementada`; quem marca `implementada` é a implementação). Uma onda por vez: a onda `k > 1`
  começa no passo 4.1 depois de a anterior estar implementada, e os arquivos dela levam o sufixo
  `-o{k}` (`reconhecimento-o2.md`, `roteiro-o2.md`, `plano-o2.md`, `revisao-plano-{n}-o2.md`,
  `log-planejamento-o2.md`).

### Passo 4.1 — reconhecimento

Rode `ls {pasta}/`, leia `formats/log-planejamento.md` e escreva o cabeçalho do ledger. Dispare
com `model: 'sonnet'` e `description: 'recon-{slug}'`, passando os caminhos de
`prompts/reconhecimento.md`, da pasta, do `spec.md`, do `decisao.md`, do `projeto.md` e de
`formats/roteiro.md`, mais o de `prototipo.md` quando a Etapa 3 rodou, e a task em uma frase.
Quando o `ls` não achou `projeto.md`, o delta diz isso em uma linha: o reconhecimento levanta o
cartão antes de tudo. Numa onda `k > 1`, o delta nomeia a onda, os RT e PR dela, o plano e o
`implementacao.md` da anterior e o arquivo de saída.

O retorno traz o veredito do estado atual, a lane de cada RT e PR, o veredito de fixtures, os
blocos `## Dúvidas` e `## Roteiro de comprovação` e o veredito de dificuldade. **Estado atual
`contradiz` para a etapa:** leve a contradição e as ACs que ela põe em dúvida ao gate da Etapa 2,
corrija o `spec.md` com o usuário e redispare o 4.1. Anote no ledger dificuldade, estado atual,
fixtures, contagem por lane e quantas provas o roteiro propõe.

### Passo 4.2 — dúvidas técnicas e roteiro de prova

Leia `formats/roteiro.md` antes de abrir a boca. O gate faz duas coisas na mesma parada.

- **Dúvidas.** Dúvida de resposta óbvia vira premissa: assuma a recomendada, anote em `Assumidas`
  no ledger e mande no delta do planejador. Dúvida com duas candidatas defensáveis vai ao usuário
  numa chamada `AskUserQuestion` só, até quatro perguntas, a recomendada na frente.
- **Roteiro.** Repasse o bloco `## Roteiro de comprovação` como chegou, sem resumir asserção:
  o usuário aprova a lista que a implementação vai produzir. Antes, confira que as linhas
  `ambiente` e `url` existem; que todo RT e PR de lane `browser` ou `teste` tem prova; que toda CB
  aparece numa prova; e que nenhuma asserção diz só "a tela abriu". Avise quais provas eram vídeo
  e viraram sequência de screenshots. O usuário corrige em prosa; feche e escreva
  `{pasta}/roteiro.md`.

Sem RT nem PR de lane `browser` ou `teste` e sem dúvida sobrevivente, o gate não para: dispare o
4.3 no mesmo turn. Anote no ledger as dúvidas e o que o usuário mudou no roteiro.

### Passo 4.3 — plano

Dispare com `model` pelo veredito de dificuldade e `description: 'plano-{slug}'`, passando os
caminhos de `prompts/planejador.md`, `spec.md`, `projeto.md`, `reconhecimento.md`, `roteiro.md` e
`formats/plano.md`, o de `prototipo.md` quando houve, e as respostas às dúvidas. O delta diz em
uma linha que o `roteiro.md` é contrato fechado: prova acrescentada ou dispensada aparece no
resumo. O plano segue as seções obrigatórias de `formats/plano.md`; o planejador pode omitir
opcionais e criar seções novas, cada uma justificada numa linha.

O retorno traz passos, checkpoints, lanes, a cobertura (`{N}/{N} RT · {N}/{N} PR · {N}/{N} CB`),
a onda e o que ficou pendente, os marcos de validação, fixtures e comando de estado, a linha
`ambiente`, as provas acrescentadas ou dispensadas, as seções novas e o `## Resumo do plano`.
Anote no ledger. Se ele declarou onda pendente, escreva ou atualize o `ondas.md` agora.

**Revisão do plano.** Antes do gate, um revisor fresco confere o plano: cada passo executável sem
pergunta e o código que ele manda escrever dentro das convenções do projeto. Dispare com
`model: 'opus'` e `description: 'revisao-plano-{slug}-{n}'`, rodada `n` a partir de 1, passando os
caminhos de `prompts/revisor-plano.md`, `plano.md`, `spec.md`, `roteiro.md`, `reconhecimento.md`,
`projeto.md` e `formats/plano.md`, o de `prototipo.md` quando houve, o número da rodada, o arquivo
de saída `revisao-plano-{n}.md` e, a partir da rodada 2, o caminho do `revisao-plano-{n-1}.md`.

| O revisor retorna | Você |
|---|---|
| `aprovado` | segue para o 4.4 |
| `corrigir`, rodada 1 ou 2 | dispara um planejador fresco, `description: 'plano-{slug}-c{n}'`, com o modelo do plano original, os caminhos de sempre, o do `plano.md` e o do `revisao-plano-{n}.md`; quando ele volta, dispara a revisão `n + 1` |
| `corrigir`, rodada 3 | não volta mais ao planejador: os bloqueios abertos vão ao gate como premissa a confirmar |
| `## Spec em dúvida` preenchida | leva ao gate junto do resumo, como contestação de AC, CB, RT ou PR |

São no máximo duas voltas ao planejador por plano. Anote cada rodada e cada volta no ledger.

### Passo 4.4 — gate do plano

Repasse ao usuário e encerre o turn:

1. o `## Resumo do plano`, literal;
2. a linha de cobertura e os `## Desvios da spec`; cobertura abaixo de `N/N` sem desvio nem onda
   pendente é plano incompleto, e volta ao planejador antes de chegar ao usuário;
3. o roteiro em duas linhas: os ids por rodada (cada marco e a final) e as provas acrescentadas ou
   dispensadas;
4. a onda, quando há pendente: o que esta entrega, o que fica e por que planejar agora seria chute;
5. as seções novas, com a linha de justificativa de cada uma;
6. a revisão do plano: a rodada em que aprovou e os `## Desvios de padrão` declarados, ou, depois
   da segunda volta, cada bloqueio aberto em uma linha, com o link do `revisao-plano-{n}.md`, para
   o usuário aceitar como premissa ou pedir ajuste;
7. o link do `plano.md`.

| O usuário | Você |
|---|---|
| aprova | segue para o 4.5 |
| pede ajuste no plano | dispara um planejador fresco com `description` `plano-{slug}-r{n}`, o plano atual e o ajuste; ajuste em prova edita o `roteiro.md` antes. O plano reescrito passa pela revisão do 4.3 de novo, com rodadas e voltas contadas do zero, antes de voltar ao gate |
| contesta uma AC, CB, RT ou PR | volta ao gate da Etapa 2, corrige o `spec.md` e redispara o 4.1 |
| muda só a aparência | se a Etapa 3 rodou, volta a ela. Se foi pulada (`Protótipo: não`, design óbvio ou sem tela), **não rode protótipo**: ajuste o `[Visual]` da spec, quando ele existe, e dispare `plano-{slug}-r{n}` com a mudança de aparência, como num ajuste do plano. Só rode a Etapa 3 se o usuário pedir |
| invalida o mapa (unidade ou fluxo errado) | volta ao 4.1 com a correção no delta |
| aborta | fecha o ledger com `abortado` e para |

### Passo 4.5 — entrega

Feche o ledger e responda com:

- **Veredito**, `plano aprovado` ou `abortado`, e **o que o plano faz** em uma frase.
- **Cobertura** (`{N}/{N} RT · {N}/{N} PR · {N}/{N} CB`), lanes e checkpoints; numa onda, os
  cobertos agora e os pendentes.
- **Comprovação:** quantas provas, quantos screenshots e casos de suíte, o comando de ambiente, e
  as provas acrescentadas ou dispensadas.
- **Fixtures**, com o comando de estado; **marcos de validação**, quando há.
- **Arquivos que a implementação vai tocar** e **decisões que ninguém contestou** (as linhas
  `(agente)` da spec e as premissas dos filhos), em links markdown quando são arquivos.
- **Protótipo:** a variação escolhida com o link do print e o caminho da base na pasta do
  protótipo; ou "sem protótipo" e o motivo.
- **A pasta da run**, em link, e a linha que implementa:

  ```text
  /implementar-e-validar .claude/tmp/orquestracoes/{YYYY-MM-DD}-{slug}/
  ```

- **O que falta**, quando há: uma linha por parte da quebra, na ordem, ou a próxima onda, que só
  é planejada depois de esta estar implementada. As duas entram pela pasta:

  ```text
  /decidir-especificar-e-planejar .claude/tmp/orquestracoes/{YYYY-MM-DD}-{slug}[-{parte}]/
  ```

Diga em uma linha que dali em diante a implementação roda sozinha até o fim, sem perguntas.

## Premissas desta skill

Decisões tomadas sem o usuário dizer; ele confirma ou corrige.

1. O brief tem exatamente seis campos. Os nomes são os desta página.
2. O desvio para entrevista é "duas ou mais lacunas ou premissas arriscadas".
3. Teto de quinze perguntas na entrevista inteira, sem teto de rodadas; o agente para quando tem
   confiança para decidir e especificar, e sem essa confiança em quinze segue o fluxo de
   `falta informação`. Sem pergunta óbvia (o que o código, o pedido ou o brief já respondem, ou
   que tem resposta padrão, vira premissa), e a primeira pergunta é sempre "aceita o rascunho
   como está?".
4. Os cinco vereditos são `vai`, `vai menor`, `faça [x] no lugar`, `não vai`, `falta informação`.
5. O registro de decisão é `decisao.md` na pasta da run, e a spec aprovada é `spec.md`, o nome
   que a `/implementar-e-validar` procura.
6. Pesquisa externa é parte da análise, não da entrevista, e sempre registra fonte.
7. A skill é invocada só por pedido explícito (`disable-model-invocation: true`), porque coexiste
   com outras skills de tarefa e a escolha por inferência seria modo de falha.
8. A ideia principal tem exatamente quatro afirmações (problema, não é, exemplo, confirma?) e
   em issue o `exemplo` é a reprodução.
9. Complementos vêm depois das lacunas na mesma rodada de entrevista, com teto de cinco, e não
   alteram o veredito.
10. A Etapa 2 tem um gate só, sobre todas as partes da spec juntas, e é nele que o usuário
    escolhe protótipo ou planejamento direto e aceita ou recusa a quebra; todo caso de borda
    aponta uma AC, sem exceção.
11. `Continua como hoje` é seção própria no fim de `[Specs]`, e cada linha dela nomeia a
    situação dentro do texto para não virar linha genérica.
12. Em `[Prova]`, toda AC e toda borda aparece em pelo menos uma linha `PR-00N`; a marca
    `(sem captura)` quando o agente não consegue rodar ou capturar o produto; e a prova de uma
    issue mostra o antes e o depois. Ficaram de fora: teste escrito antes e visto falhando,
    valor exato da AC na asserção, proporcionalidade por tamanho da mudança.
13. `[Visual]` é parte da spec, escrita no mesmo gate, e não é contrato: preferência e
    referência não se provam; expectativa visual vira AC.
14. O protótipo vem depois da spec aprovada, nunca antes da Etapa 1, para não ancorar o
    entendimento do problema numa solução desenhada (Passo 0).
15. Três variações por padrão, mais quando `[Visual]` › `Livre` tem eixos independentes; não há
    teto fixo.
16. O código do protótipo é escrito por subagente, em rotas novas numa pasta de protótipo na
    árvore da feature, sem worktree nem commit; depois da escolha, outro subagente apaga as
    variações recusadas e a escolhida fica como base. Os prints ficam na pasta da run, fora do
    git. O agente principal só mostra os prints e conduz o gate da escolha.
17. A quebra separa partes só sem AC compartilhada nem RT que dependa do código da outra, é
    decidida uma vez no gate da Etapa 2, tem teto de três partes e preserva os ids da spec.
18. O planejamento lê a spec direto, sem adaptação: requisito provável é todo RT e toda PR, e
    toda CB chega à cobertura pela PR que a lista; vídeo vira sequência de screenshots, porque o
    roteiro não tem vídeo.
19. Prompts, formatos e o script de medição são desta skill e mudam só com ela; nenhuma etapa
    lê arquivo de outra skill de planejamento.
20. Design óbvio dispensa `[Visual]` e a pergunta do protótipo; quem decide que é óbvio é o
    agente, com o motivo em uma linha no gate, e o usuário pode discordar ali mesmo.
21. O plano tem seções obrigatórias, as que a `/implementar-e-validar` lê pelo nome e as
    que provam RT, PR e CB, e seções opcionais; o planejador omite a opcional que não se aplica e
    cria seção nova quando o caso pede, justificada em uma linha (`formats/plano.md`).
22. Os passos internos da Etapa 4 são numerados 4.1 a 4.5, e o nível 0 dela não lê código, mas as
    Etapas 1 a 3 leem: a restrição vale só na Etapa 4.
23. A revisão do plano faz parte do passo 4.3 (a numeração 4.1 a 4.5 não muda): revisor fresco em
    `opus`, que carrega as skills de contexto do cartão e, quando existem, `code-write-code` e
    `code-get-coding-designs`; desvio de padrão sem motivo no plano é bloqueio; no máximo duas
    voltas ao planejador, e o que sobra vai ao gate como premissa a confirmar.
