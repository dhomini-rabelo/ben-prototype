# Handoff O2 → O3

Briefing: .claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/briefing.md
Ledger: .claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/log.md
Ledger da Etapa 4 (formato da skill): .claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/log-planejamento.md

P = .claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/

## Próxima rodada
Rodada r7: um filho `opus`, `subagent_type: general-purpose`, description `lembrete-criado-abrir-tela-r6-plano-c1`. É a continuação do planejador (passo 4.3), que voltou `parcial`.
- Escreva a tarefa em P/r6-plano-c1-tarefa.md, copiando P/r6-plano-tarefa.md: o delta, as respostas do usuário, as premissas e o bloco de teto. Troque o description do bloco de teto por `lembrete-criado-abrir-tela-r6-plano-c1`.
- Acrescente ao topo da tarefa:
  - "Continue a partir da seção `## Parcial` de P/plano.md. Ela já registra os fatos do código, com arquivo e linha, e o desenho por camada; não reabra o que ela registra."
  - "O antecessor estourou o teto só com a leitura, então economize:"
    - "leia o prompts/planejador.md e o formats/plano.md;"
    - "do `code-write-code`, leia só o SKILL.md, mais o subarquivo de que uma decisão precisar; não carregue `code-get-project-context` nem `code-get-coding-designs` inteiros;"
    - "do reconhecimento.md e do roteiro.md, leia só as seções que o plano cita;"
    - "das duas conferências pendentes, faça só estas: como o `InMemoryReminderRepository` grava uma alteração (T07) e o `_layout` de `app/(protected)` (AC-009, posição preservada na volta ao chat);"
    - "escreva o plano.md por seções, salvando cada seção no disco assim que ela estiver pronta, para que um novo estouro não perca nada."
  - "Ao terminar, substitua a seção `## Parcial` pelo plano completo. Se estourar de novo, atualize a `## Parcial`, marcando o que já está escrito."
  - "Lembrete: o campo novo da view quebra 28 `toEqual` de shape exato em `persist-captures.test.ts` e `resolve-capture.test.ts`; o plano tem que prever essa atualização."
- Retorno: até 12 linhas, mais o `## Resumo do plano` literal.
Depois dele vem a revisão do plano (r8, `opus`, description `lembrete-criado-abrir-tela-r8-revisao-plano-1`, prompt de papel `prompts/revisor-plano.md`, saída P/revisao-plano-1.md). Os insumos e a tabela de voltas estão no passo 4.3 do SKILL.md da skill.

## Pendências, em ordem
1. r7: continuação do planejador (acima). Se ela voltar `parcial` de novo sem a lista do que falta encurtar, a frente está em laço: veja a regra "Não gire em falso" do orquestrador.md.
2. Revisão do plano, passo 4.3: no máximo 3 rodadas do revisor e 2 voltas ao planejador (`lembrete-criado-abrir-tela-r{n}-plano-c{k}`, com o mesmo modelo, `opus`). Antes, leia em .claude/skills/decidir-especificar-e-planejar/SKILL.md as seções "Passo 4.3", "4.4" e "4.5" (linhas ~943-1025).
3. Passo 4.4: gate do plano via `bloco: perguntas`. O conteúdo vai na pergunta e aponta P/plano.md. Cobertura abaixo de N/N sem desvio volta ao planejador. O S41 em lane `codigo` é desvio já aprovado.
4. Passo 4.5: feche o log-planejamento.md (as seções abaixo da tabela, listadas logo a seguir), escreva o relatorio-final.md e devolva `bloco: fim` com a linha `/implementar-e-validar .claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/`.
   Conteúdo das seções que faltam no log-planejamento.md:
   - Dúvidas técnicas (4.2). Levantadas: sessão e dados das provas de tela; como provar a PR-009. Perguntadas: as duas, mais o S41. Respostas: misto; predicado puro (T15); S41 em lane codigo. Assumidas: nenhuma.
   - Roteiro (4.2). Proposto: 63 provas, 48 S e 15 T. Ambiente: `pnpm dev` na raiz, com `BACKEND_URL` local. Fechado: aprovado como proposto, com o S41 passado para a lane codigo. Arquivo: roteiro.md.
   - Atualize também o cabeçalho, nas linhas Projeto e Roteiro, que ficaram como "a definir".

## Já fechado
- Etapas 1 a 3 e o gate da spec: ver handoff-1.md, linhas de "Já fechado".
- r4, base do protótipo: P/r4-proto-base.md. Ficou só a V2, listada em P/prototipo.md, seção `## Base final`. Typecheck e eslint passaram.
- r5, reconhecimento (4.1): P/projeto.md e P/reconhecimento.md. Resultado:
  - veredito `complexa`, estado `confirma`, fixtures `sem mecanismo`;
  - lanes: 6 teste, 7 browser e 1 codigo;
  - roteiro de 48 S e 15 T.
- Gate 4.2: P/roteiro.md, com o `Estado: APROVADO` e as decisões no topo.
- r6, planejador (4.3): `parcial`, só com a seção `## Parcial` em P/plano.md.

## Armadilhas
- O planejador `opus` estourou 124k no turn 25 só lendo: prompt, formato, cinco arquivos da run, duas skills inteiras e código. A continuação tem de ler menos, como diz a "Próxima rodada", e gravar o plano por seções.
- O filho r4 rodou `git rm --cached -r .` em `packages/infra/mobile/ben` por engano e desfez com `git reset`. Conferi depois: `git status --short` mostra só as duas pastas `prototipo/` como não rastreadas, e o índice está limpo. Todo filho que mexer em git precisa de uma ordem explícita contra isso.
- Os prints seguem o formato de uma tela inteira por print, 390x844, escala 1x. O Playwright MCP não conecta para filhos: use `playwright-core` com o Chrome local.
- `app/prototipo/` e `src/prototipo/` guardam protótipos de outras runs (alarme-tela-cheia, header-menu-footer). Não toque neles.
- O O2 abriu o roteiro.md com o estado PROPOSTO, copiado por `awk` do reconhecimento.md, e o marcou APROVADO no gate. O conteúdo das provas é o do reconhecimento, sem edição.

## Premissas
- Todas as do briefing.md e do handoff-1.md seguem valendo.
- A galeria `packages/infra/mobile/design` fica fora do plano: está defasada, e o protótipo aprovado está no app Expo.
- Trocar o `BACKEND_URL` no `.env.development` para as provas é preparação de ambiente da validação. O plano diz como fazer e como restaurar, e a troca não entra em commit.
- No log-planejamento.md, as linhas da tabela vão sendo acrescentadas ao fim, e as seções finais saem só no 4.5.

## Estado do mundo
- Sem commit, de propósito: ficam fora do git as pastas de protótipo das três runs, entre elas `packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/` e `src/prototipo/lembrete-criado-abrir-tela/`, só com a V2.
- O Expo web segue rodando na porta 8081. Nenhum filho subiu ou parou serviço.
- Branch main, índice limpo.

## Janela
Fechei em ~92k, teto 140k, 24 turns de 50. O handoff veio da projeção, que deu 144k.
