# Tarefa — r8: testar no browser "configurar modelo e effort do agente Ben"

Você é filho de um orquestrador (O2) numa cadeia de subagentes. A implementação já foi feita e
lint/tsc já saíram limpos nos dois projetos. Sua tarefa é executar o roteiro de teste do plano,
ao pé da letra, provando a Definição de Pronto do briefing.

## Leia, nesta ordem
1. `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/briefing.md` (relativo a
   `/root/so/repos/ben-prototype`) — o contrato: pedido original e Definição de Pronto (6 itens).
2. `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r3-plano-v2.md`, seção
   `## Plano de teste` (linha 748 até o fim da seção, antes de `## Premissas`) — o roteiro
   completo: como subir o ambiente, autenticar no browser, e os 8 passos numerados do roteiro do
   browser-tester, incluindo os comandos `curl` exatos e o script `seed-task.ts` a criar.

Não leia `r1-plano.md`, `r2-revisao.md`, `r4-revisao-v2.md`, `r6-revisao-v3.md` nem
`r7-implementacao.md` — não são necessários para o teste; o roteiro do plano já é a fonte
completa e a implementação já está pronta no working tree.

## O que fazer
Siga o roteiro da seção `## Plano de teste` do `r3-plano-v2.md` na ordem: subir/checar o
ambiente, autenticar via `localStorage.setItem('ben.jwttoken', ...)`, e executar os 8 passos
numerados (DoD 1 a 8 do roteiro), incluindo:
- Criar `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/seed-task.ts` exatamente como o
  passo 4 do roteiro especifica, e rodá-lo para popular a tabela `tasks`.
- Todos os `curl` do roteiro (persistência, rejeição de par inválido, corpo enviado ao
  OpenRouter via log do backend, sonda de `resolveOpenRouterModel`/`buildAgentCallTrace`).
- Os estados de erro do passo 6 (derrubar o backend com
  `pkill -f "tsx watch ./src/infra/http/server.ts"` e testar erro de carga e erro de save).
- Screenshots em cada ponto que o roteiro marca **Screenshot** — salve-os na sua pasta de
  scratchpad e cite os caminhos na sua entrega.

Use sua própria pasta de scratchpad para logs (`backend.log`, `mobile.log`) e para os scripts de
sonda temporários que o passo 5(b) pede — só o `seed-task.ts` vai na pasta da run, porque o plano
manda especificamente colocá-lo lá (não entra no commit da feature).

O app está na porta 8081 (viewport de celular). Se backend/mobile não estiverem de pé, suba-os
como o roteiro descreve na seção "Subir o ambiente".

## Escreva sua entrega em
`.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r8-teste.md`:
- Passo a passo do roteiro: o que foi feito, o resultado (saída de curl resumida, comportamento
  observado na UI), passou ou falhou.
- Para cada Definição de Pronto do briefing (1 a 4; 5 e 6 não são seus — são lint/tsc e
  commit/push, já ou ainda por fazer): se foi provada e como.
- Lista de screenshots, por caminho, com uma legenda de uma linha cada.
- Se algo falhar: o que exatamente falhou, com evidência (log, resposta HTTP, screenshot), para
  o implementador poder corrigir.

## Regras obrigatórias
- Não sub-delegue (não use a tool `Agent`).
- Não chame `AskUserQuestion`. Ambiguidade vira premissa documentada no seu arquivo.
- Não faça commit nem push.
- Escreva o arquivo de entrega **antes** de retornar.
- Retorno final em até 10 linhas: caminho do arquivo, quantos dos 8 passos passaram, e se alguma
  Definição de Pronto (1-4) não foi provada.
- Teto de janela: ~140k de contexto e 50 turns.
