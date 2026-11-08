# Tarefa: planejador, volta 2 (corrigir)

P = /home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-logo-antiga/

Seu papel: .claude/skills/decidir-especificar-e-planejar/prompts/planejador.md (leia e siga).
Leia: P/plano.md (plano atual, a editar no lugar), P/revisao-plano-2.md (o que corrigir), P/spec.md, P/projeto.md, P/reconhecimento.md, P/roteiro.md (contrato fechado: prova acrescentada ou dispensada aparece no resumo), .claude/skills/decidir-especificar-e-planejar/formats/plano.md.

Faça:
1. Corrija o bloqueio da revisão 2: remova do plano a instrução de escrever comentário no colors.ts (plano.md:54 e :22); os nomes silhouetteThemed e silhouetteNotification bastam. Confira que nenhum outro trecho do plano manda escrever comentário em código.
2. Aplique as 3 notas: (a) máscara da silhueta com fill="white"/"black" em vez de hex; (b) o risco de plano.md:~235 não deixa decisão ao implementador: decida; (c) o passo 5 cita width, height, fill="none" e strokeProps de forma explícita.
3. Mantenha o resto do plano (já aprovado nos demais pontos); atualize o `## Resumo do plano` e a nota do topo com o que mudou nesta volta. Não refaça os testes em /tmp: já foram verificados pelo planejador anterior (resvg na raiz, mv da PR-011, import .mjs→.ts→.ts no Node 24).

Entrega: plano.md reescrito no lugar + P/r7-plano-c2.md (curto: o que mudou, cobertura RT/PR/CB, resumo). Retorno: no máximo 10 linhas.
Regras: não edite código do projeto; não sub-delegue; não chame AskUserQuestion, toda ambiguidade vira premissa assumida e documentada no seu arquivo. Antes de decidir convenção de código, carregue code-write-code e code-get-coding-designs.
