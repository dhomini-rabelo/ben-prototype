# Handoff O1 → O2

Briefing: .claude/tmp/orquestracoes/2026-09-19-config-model-effort/briefing.md
Ledger: .claude/tmp/orquestracoes/2026-09-19-config-model-effort/log.md

Todos os caminhos abaixo são relativos a `/root/so/repos/ben-prototype`. A pasta da run é
`.claude/tmp/orquestracoes/2026-09-19-config-model-effort/` — daqui em diante chamada de "a pasta".

## Próxima rodada

**r6 — revisar as correções do plano.** Um filho, `opus`, read-only, `description`
`orq-config-model-effort-r6-review3`. Não é uma revisão nova do plano inteiro: é conferir se as duas
correções fecharam e se não quebraram nada em volta.

Ele lê: `briefing.md`, `r3-plano-v2.md` (1017 linhas, corrigido in loco — é a fonte única), e
`r4-revisao-v2.md` (a revisão que reprovou). Ele **não** lê `r1-plano.md` (morto) nem refaz os pontos
listados como verificados em `r2-revisao.md` e `r4-revisao-v2.md`.

Ele escreve `r6-revisao-v3.md` na pasta, no mesmo formato de `r4-revisao-v2.md` (Veredito
APROVADO|REPROVADO, Bloqueantes, Não bloqueantes, e uma seção dizendo, um a um, se os 2 bloqueantes da
r4 fecharam). O prompt precisa mandar: carregar `code-get-coding-designs` e `code-get-project-context`
para `project-backend` e `project-mobile`; conferir no código real toda afirmação do plano sobre arquivo
ou assinatura; não sub-delegar; não chamar `AskUserQuestion` (ambiguidade vira premissa documentada);
escrever o arquivo antes de retornar; retorno de no máximo 10 linhas; teto de ~140k de janela e 50 turns.
Diga a ele que reprovar por preferência de estilo, sem defeito real, trava a cadeia de graça — bloqueante
é o que faz a implementação sair errada, incompleta, fora do contrato ou fora do padrão documentado.

**Limite do laço de revisão, decidido por mim:** o plano já foi reprovado duas vezes e corrigido duas
vezes. Se a r6 reprovar com bloqueante real, mande o planejador corrigir **uma última vez** e siga para a
implementação depois disso, sem terceira revisão — registre isso como premissa no seu handoff ou no
relatório. Se a r6 reprovar só com achados de estilo, siga para a implementação e registre a discordância.

## Pendências, em ordem
1. r6: revisão das correções do plano (acima).
2. Implementação: um filho `sonnet`, `description` `orq-config-model-effort-r7-impl`, que lê **só**
   `briefing.md` e `r3-plano-v2.md` e executa as Etapas na ordem. O prompt tem de mandar carregar
   `code-write-code` antes de editar, mais `code-get-coding-designs` e `code-get-project-context` de
   `project-backend` e de `project-mobile` (a task cruza os dois apps), e terminar rodando, nos **dois**
   projetos, `npm run lint:fix` e `npx tsc --noEmit` — o baseline hoje é EXIT=0 nos dois, e o plano amarra
   o critério de pronto a manter isso. Entrega em `r7-implementacao.md`: o que foi feito por etapa, o que
   divergiu do plano e por quê, e a saída de lint/tsc.
3. Teste no browser: um filho do tipo `browser-mobile-tester` (`sonnet`), `description`
   `orq-config-model-effort-r8-test`, seguindo a seção `## Plano de teste` do `r3-plano-v2.md` ao pé da
   letra (app na porta 8081, viewport de celular, o `seed-task.ts` que o plano especifica, o roteiro de
   login). Entrega em `r8-teste.md`: passo a passo, o que passou, o que falhou, screenshots citados por
   caminho. Ele lê `briefing.md` e `r3-plano-v2.md`.
4. Se o teste falhar: devolva os achados ao implementador (`SendMessage` para o agente da r7, que mantém
   o contexto) e repita o teste. Duas voltas no máximo; depois disso, entregue com ressalvas.
5. Commit e push na branch `feat/config-model-and-effort` (autorizado explicitamente pelo usuário; **sem
   PR**). Faça por um filho `sonnet`, não você mesmo. Mensagem de commit em português, no padrão do repo
   (`git log --oneline -5`), com as linhas de atribuição que o ambiente exigir.
6. `relatorio-final.md` na pasta e retorno `bloco: fim`.

## Já fechado
- r0 — recon do mobile: `r0-mobile-settings.md`. Recon do backend: `r0-backend-model.md`.
- r0b — catálogo do OpenRouter baixado por mim: `openrouter-models.json` na pasta (740 KB; consulte com
  `python3`/`jq`, nunca leia inteiro).
- Gate com o usuário: 4 perguntas respondidas, tudo registrado em `briefing.md`.
- r1 — plano v1: `r1-plano.md`. **Morto**, não leia, não cite.
- r2 — revisão v1: `r2-revisao.md`. REPROVADO, 3 bloqueantes.
- r3 — plano v2: `r3-plano-v2.md`. Os 3 bloqueantes corrigidos.
- r4 — revisão v2: `r4-revisao-v2.md`. REPROVADO, 2 bloqueantes; confirmou que os 3 da r2 fecharam.
- r5 — correção in loco do `r3-plano-v2.md` pelo planejador, com a seção `## Resposta à revisão v2` ao
  final. É este arquivo que a r6 revisa e que o implementador executa.

## Armadilhas
- **A `OPENROUTER_API_KEY` do `.env` e do `.env.development` é falsa** (`fake-openrouter-key-…`), e
  `npm run dev` lê o `.env.development`. Chamada real ao modelo devolve erro — eu cheguei a informar o
  contrário a um revisor e ele me corrigiu com a evidência. O plano já trabalha com provas substitutas
  para os itens 3 e 4 da Definição de Pronto; não mande ninguém "testar de verdade contra o OpenRouter".
- **A tabela `tasks` do `prisma/dev.db` está vazia e não existe rota de criação de task.** Sem o
  `seed-task.ts` que o plano especifica, o passo de "mensagem dentro de uma task" não tem como rodar.
- **Não peça revisão do plano inteiro de novo.** Duas rodadas de revisão completa já aconteceram e cada
  uma custou ~150k de janela. A r6 é focada nas correções.
- O planejador (agente da r1/r3/r5) ainda está vivo e com o plano inteiro no contexto (~60% do teto). Se
  precisar de mais uma correção de plano, retomá-lo por `SendMessage` custa muito menos que um planejador
  novo. O id está no `log.md` da run? Não: ele é `af5fe235fac843f54`. Se não resolver a partir do seu
  processo, dispare um planejador novo com `briefing.md` + `r3-plano-v2.md` + a revisão.
- Os pontos já conferidos contra o código estão listados nas seções "O que verifiquei e está correto" de
  `r2-revisao.md` e no fim de `r4-revisao-v2.md`. Reconferir isso é rodada perdida.

## Premissas
Valem as 6 do `briefing.md` (seção `Premissas`), mais as que travei depois do gate:
- "Effort disponível para cada modelo" vem de tabela estática no backend, não de consulta em runtime ao
  OpenRouter. Os dados vieram do catálogo real e estão no briefing.
- O laço de revisão do plano tem teto: no máximo mais uma correção depois da r6 (ver acima).
- A pasta da run é versionada no git como as runs anteriores fizeram (commits `6949afe`, `a544d65`), ainda
  que `.claude/tmp/` esteja no `.gitignore` — o precedente do repo é `git add -f` numa commit separada de
  `docs:`. Se preferir não versionar, é reversível e cabe a você.

## Estado do mundo
- Branch `feat/config-model-and-effort` **já criada** por mim a partir de `feat/update-model-and-add-logs`,
  e é a branch em que o repo está agora. Nada foi commitado nela ainda.
- A árvore de trabalho herdou uma modificação anterior à task, que **não é sua**:
  `.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/log.md` (M). Não a desfaça.
- Nenhum arquivo de `project-backend` ou `project-mobile` foi tocado até aqui: as 5 rodadas foram
  read-only. `git status` deve mostrar só a pasta da run como novidade.
- Nenhum serviço subido por mim: backend e app **não** estão rodando. Nada instalado, nenhuma migração
  aplicada, `prisma/dev.db` intocado.

## Janela
Fechei em 108k, teto 140k, 31 turns de 50, projeção de 140k no próximo ciclo. O handoff é por projeção de
janela, não por estouro.
