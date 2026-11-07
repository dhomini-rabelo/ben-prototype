# Tarefa r5 — reconhecimento (passo 4.1 da skill decidir-especificar-e-planejar)

Task em uma frase: tocar no card de lembrete que o agente criou no chat abre a lista de lembretes com o detalhe daquele lembrete aberto, e card, lista e detalhe deixam claro se o lembrete é único ou recorrente.

## Seu papel
Leia e siga: /home/fael/so/repos/ben-prototype/.claude/skills/decidir-especificar-e-planejar/prompts/reconhecimento.md

## Delta (caminhos; P = /home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/)
- Pasta da run: P
- spec.md: P/spec.md (aprovado; `## Gate` fechado, 1 parte, sem quebra)
- decisao.md: P/decisao.md
- projeto.md: P/projeto.md — **NÃO existe**: você o levanta e escreve antes de tudo, pelo formato /home/fael/so/repos/ben-prototype/.claude/skills/decidir-especificar-e-planejar/formats/projeto.md
- formats/roteiro.md: /home/fael/so/repos/ben-prototype/.claude/skills/decidir-especificar-e-planejar/formats/roteiro.md
- prototipo.md: P/prototipo.md (Etapa 3 rodou; `## Escolha` = V2; a base final está na seção `## Base final` no fim do arquivo, que substitui a linha `Base:` da Escolha). Prints em P/prototipo/.
- Insumos da Etapa 0, para não refazer o mapa do zero: P/r0-mobile.md e P/r0-backend.md (confira contra o código antes de afirmar).
- Arquivo de saída: P/reconhecimento.md (e P/projeto.md).
- Onda única.

## Skills
Carregue `code-get-project-context` e `code-get-coding-designs` (e `code-write-code` para conhecer as convenções que o plano terá de seguir). Você não edita código do projeto.

## Armadilhas conhecidas
- Prints de prova seguem o formato: uma tela inteira por print, 390x844, escala 1x (como .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v1.png). O Playwright MCP não conectou para subagentes nesta run; os prints do protótipo saíram com `playwright-core` + Chrome local (documentado em P/prototipo.md). Use isso ao propor o `ambiente` do roteiro.
- `packages/infra/mobile/ben/app/prototipo/` e `src/prototipo/` têm protótipos de outras runs (alarme-tela-cheia, header-menu-footer); a rota a remover no fim é só `.../prototipo/lembrete-criado-abrir-tela/`.
- A memória `business-rules/razao-de-negocio-e-casos-de-uso-v1.md` diz que recorrente não é v1, mas o código já tem goal com daily/weekdays: vale o código.
- O protótipo foi feito no app Expo, não na galeria `packages/infra/mobile/design` (que está defasada, r0-mobile.md §4). Registre se o plano deve ou não tocar a galeria como dúvida ou premissa.
- O Expo web já roda na porta 8081; não suba nem pare.

## Regras extras do orquestrador
- Não sub-delegue (não chame Agent), não chame `AskUserQuestion`; toda ambiguidade vira premissa assumida e documentada no seu arquivo (ou linha de `## Dúvidas`, conforme o seu prompt).
- Retorno no formato do seu prompt (até 12 linhas + os blocos `## Dúvidas` e `## Roteiro de comprovação` copiados literalmente, veredito de dificuldade na última linha).

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "lembrete-criado-abrir-tela-r5-recon"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em P/reconhecimento.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
(Este bloco substitui o `--self` do seu prompt de papel: meça pelo description acima.)
