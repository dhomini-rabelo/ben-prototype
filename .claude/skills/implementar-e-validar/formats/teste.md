# O formato do relatório de teste

As quatro lanes — `curl`, `browser`, `teste` e `codigo` — escrevem o mesmo relatório, em
`{pasta-da-run}/teste-{n}-{lane}.md`. Este arquivo é o contrato dos quatro.

---

## A unidade do relatório é o requisito, não o caso

Requisito com veredito é todo `RT-00N` e toda `PR-00N` da spec. O `## Plano de teste` do plano traz
uma seção por requisito das lanes `curl` e `codigo`, com o título `### RT-00N — lane {lane}` ou
`### PR-00N — lane {lane}`. **Cada uma dessas seções vira uma entrada do seu relatório, com o mesmo
id.** Você não inventa caso, não junta dois requisitos numa entrada e não renomeia nada.

Nas lanes `browser` e `teste` o plano vem organizado de outra forma, porque a prova é uma lista
numerada que o dev aprovou: as seções são `### Roteiro — lane browser` e `### Roteiro — lane teste`,
e cada linha é uma prova com id próprio (`S01`, `T01`) e o requisito que ela serve entre parênteses,
como em `S02 (PR-003; AC-002, CB-005) [final] ação → visível` ou `S01 (RT-003) [marco 1] ...`.
O requisito é o que vem antes do `;`, ou o único id entre parênteses; uma prova pode servir mais de
um (`(RT-003, PR-004; AC-001)`) e então conta para cada um. Os ids de `AC` e `CB` depois do `;` são
informação para você e não mudam a conta.
**A entrada do relatório continua sendo o requisito**: você agrupa as provas dele numa entrada só e
cita cada id.

O id é o que faz a validação dizer `PR-003 reprovada` em vez de "o terceiro caso falhou". Sem ele
o implementador vai ter que adivinhar o que consertar, e o dev não descobre qual expectativa dele
não foi entregue.

**Todo requisito da sua lane sai com veredito.** Requisito que você não conseguiu exercitar sai
`n/d` com o motivo, nunca PASS. A lista dos requisitos da sua lane são as linhas `RT-00N →` e
`PR-00N →` do `## Cobertura` do plano que apontam a sua lane. Linhas `CB-00N → PR-00N → ...` não
são trabalho seu.

## Provas do roteiro por requisito

- O requisito fecha `PASS` só quando **todas** as provas que o citam, na rodada em curso, deram PASS.
  Uma prova FAIL derruba o requisito, e o motivo nomeia o id dela (`S05`, `T02`).
- Prova que você não conseguiu produzir não some. Ela aparece na entrada do requisito com o motivo,
  e o requisito sai `n/d` se a falta impede o veredito. Se a causa for ação inexecutável ou
  ambiente fora do ar, é BLOCKER. O dev aprovou aquela lista uma por uma, e prova que evaporou entre
  o gate e o relatório é a única coisa que ele não tem como descobrir sozinho.
- **Vídeo é sequência de screenshots.** Uma `PR` de vídeo chega como vários `S0n` na ordem da
  interação, todos com a mesma `PR`, o primeiro marcado `(era vídeo)`. Execute a sequência em ordem,
  um PNG por `S0n` (`screenshots/r{n}-s0X-{slug}.png`); o veredito é o da `PR`. Não grave vídeo.

### Rodada de marco: o escopo vem no delta

A validação roda em dois momentos, e o delta que te disparou diz qual é o seu.

- **Rodada final** — o plano inteiro está implementado. Sua lista é todo requisito da sua lane, e é o
  caso comum.
- **Rodada de marco** — o delta diz `marco {m}` e nomeia os requisitos do escopo. A implementação está
  na metade do plano de propósito: o nível 0 parou num checkpoint onde alguns requisitos já são
  observáveis, para pegar erro antes de ele virar alicerce.

Nas lanes `browser` e `teste` o roteiro já diz isso em cada linha: prova marcada `[marco {m}]`
sai nessa rodada, e `[final]` sai só na última. O delta nomeia os requisitos e a marca confirma quais
provas deles entram.

**Numa rodada de marco, prove só os requisitos que o delta nomeou.** Os outros ficam de fora do
relatório — não os marque `n/d`, porque `n/d` significa "tentei e não consegui" e aqui não é o
caso: o código deles ainda não existe, e isso é o plano funcionando. Reportar FAIL num requisito fora do
escopo dispara uma rodada de correção contra nada.

## Você reporta o requisito e copia o alvo dele

O `spec.md` traz `RT-004 (AC-002) ...` e `PR-003 (AC-001, AC-002, CB-005) ...`. Copie o alvo entre
parênteses, como está na linha do requisito, para a sua linha de veredito. Para `PR`, o alvo é a
lista inteira da linha `PR-00N` da spec, e não a lista de uma prova `S0n`. Requisito `(geral)` leva
`(geral)`.

Não julgue a `AC` nem a `CB`: uma `AC` costuma ser servida por vários requisitos, às vezes em lanes
diferentes, e quem soma o veredito dela é o nível 0, com os retornos das lanes na mão. Você prova o
requisito, que é concreto e binário.

## Todo requisito reprova igual

Não há prioridade entre requisitos. O que está escrito na spec vale, e o seu veredito tem quatro
valores: `PASS`, `FAIL`, `BLOCKER` e `n/d: {motivo}`.

- **Requisito que falha é FAIL da rodada.** Volta ao implementador. Não há meio-termo entre PASS e FAIL.
- **`n/d` só quando a checagem não pôde rodar por motivo que não é ambiente.** Ambiente fora do ar
  ou pré-requisito ausente é BLOCKER.

---

## Formato de `teste-{n}-{lane}.md`

```md
# Teste — lane {curl | browser | teste | codigo} — rodada {n} — {task}

## Veredito
{PASS | FAIL | BLOCKER}

## Ambiente
pré-requisito: {o que você conferiu do campo `pré-requisito de ambiente`, e se já estava de pé ou
foi você que o subiu — ou "nenhum"; na lane codigo, "não se aplica"}
ambiente: {o comando da linha `ambiente` do plano, e se você o subiu ou já estava no ar; na lane
codigo, "não se aplica"}
url: {a linha `url` do plano; fora da lane browser, "não se aplica"}
estado: {o comando da linha `estado` que você rodou e os identificadores que ele imprimiu, ou
"nenhum"; na lane codigo, "não se aplica"}
unidades: {uma linha por unidade que a prova exigiu no ar: nome, endereço, e "já estava no ar |
subida por mim"}

## Requisitos provados

### RT-004 (AC-002)
Requisito: {a linha do RT, copiada do spec.md}
Como provei: {o curl, a navegação ou o que procurei no diff}
Esperado: {o que a checagem do plano diz}
Observado: {o que aconteceu}
Resultado: {PASS | FAIL | BLOCKER | n/d: {motivo}}

### PR-003 (AC-001, AC-002, CB-005)
Requisito: {a linha da PR, copiada do spec.md}
Como provei: {a navegação ou a execução do roteiro}
Provas: {só nas lanes browser e teste: uma sublinha por prova, com o PNG ou o resultado}
- S04 PASS — screenshots/r1-s04-{slug}.png — visível: {o que está na imagem, com contagem quando ela
  importa}
- S05 FAIL — screenshots/r1-s05-{slug}.png — visível: {...}
Esperado: {o que a checagem do plano diz}
Observado: {o que aconteceu}
Resultado: {PASS | FAIL | BLOCKER | n/d: {motivo}}

### PR-006 (geral)
...

## Cobertura da lane
{N}/{N} requisitos desta lane exercitados (RT e PR). {os que ficaram `n/d`, com o motivo}
provas: {N} de {N} do roteiro produzidas. {as que faltaram, com o motivo. Nas lanes curl e codigo,
"não se aplica"}

## O que quebrou
{só em FAIL: por requisito, o observado versus o esperado e a evidência — a linha de log do servidor, o
screenshot ou o trecho do diff. Isto é o que o implementador vai ler para consertar, então seja
específico.}

## Registros tocados
{o que você escreveu no serviço local, e qualquer arquivo de configuração versionado que editou, ou
"nenhum"}
```

---

## O retorno

No máximo 10 linhas, e elas precisam bastar para o nível 0 somar as `AC` e as `CB` sem abrir o
arquivo:

```text
teste-{n}-{lane}.md
veredito: {PASS | FAIL | BLOCKER}
RT-003 (AC-001) PASS
PR-003 (AC-001, AC-002, CB-005) FAIL — S05: {o que quebrou, meia linha}
PR-006 (geral) PASS
cobertura: {N}/{N} requisitos
```

Uma linha por requisito, com o id, o alvo copiado da spec entre parênteses e o veredito. É a única
parte do relatório que viaja, e é dela que sai o veredito por `AC` e por `CB` no relatório final.
