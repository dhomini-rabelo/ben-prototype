# Tarefa r6-plano: passo 4.3 (plano) da skill decidir-especificar-e-planejar

Pasta da run: .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/

Task em uma frase: no chat Ben, centralizar no topo a logo + "Ben | {data de hoje}", levar o menu
hambúrguer para o footer, à esquerda do campo (ele abre um sheet com as 4 opções atuais), e
redesenhar o input e a gravação de voz no sandbox de design, no mobile e na doc.

O seu papel está em `.claude/skills/decidir-especificar-e-planejar/prompts/planejador.md`. Leia e siga.

Leia também:
- .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/briefing.md
- .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/spec.md
- .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/projeto.md
- .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/reconhecimento.md
- .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/roteiro.md
- .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo.md (a Etapa 3 rodou. `## Escolha` = V4; os prints ficam em prototipo/v4*.png; `Base:` aponta os arquivos que viram o ponto de partida visual)
- .claude/skills/decidir-especificar-e-planejar/formats/plano.md

O `roteiro.md` é contrato fechado e foi aprovado pelo usuário. Prova acrescentada ou dispensada
aparece no `## Resumo do plano`.

Respostas às dúvidas técnicas (gate 4.2):
- Pergunta ao usuário, sobre sessão e dados das provas do app real. A resposta foi **misto**: backend
  real no caminho feliz (server local :3333 via `pnpm dev`, `BACKEND_URL` apontando para ele e JWT
  local de um usuário do `dev.db` gravado em `localStorage` `ben.jwttoken`, com os dados semeados por
  chamadas à API) e interceptação Playwright (`page.route`) nos estados de borda (S19, S20, S37 e
  S40, mais qualquer outro que só se fabrique de forma estável assim). O plano precisa de um passo
  que monte isso, com o comando de estado.
- Premissa assumida: RT-006 pede 44px de toque, e os botões de 32px da V4 ficam com `hitSlop` até
  44px. O tamanho visual aprovado não muda.
- Premissa assumida: CB-003 (voltar do aparelho) é provada no web com Escape.
- Premissa assumida: CB-005 e CB-006 (teclado aberto) são provadas no web com o campo focado.

Pontos que o plano tem que resolver (o reconhecimento já os levantou; confirme lá):
- O `WaveBar` real não desenha no web. O protótipo usou a cópia `ProtoWaveBar`.
- O auto-crescimento do campo usa `scrollHeight` (só web). No nativo, `onContentSizeChange`.
- A captura é por `playwright` do Node + google-chrome do sistema, porque o Playwright MCP deu
  CONNECT_TIMEOUT.
- Na remoção da rota de protótipo, não apagar `alarme-tela-cheia` nem `lembrete-criado-abrir-tela`.

Carregue antes de planejar: `code-get-project-context`, `code-get-coding-designs` e `code-write-code`.
Você não edita código do projeto. Escreve só o plano.

Entrega: `.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/plano.md`. Se parar no teto, a
seção `## Parcial` vai no fim dele.

Regras:
- Não sub-delegue (não dispare agentes).
- Não chame `AskUserQuestion`. Toda ambiguidade vira premissa assumida e fica documentada no plano.
- Retorno: ponteiro de até 12 linhas, com passos, checkpoints, lanes, a cobertura
  (`{N}/{N} RT · {N}/{N} PR · {N}/{N} CB`), a onda e o que ficou pendente, os marcos de validação,
  fixtures e comando de estado, a linha `ambiente`, as provas acrescentadas ou dispensadas e as seções
  novas. Mais o bloco `## Resumo do plano` inteiro.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "header-menu-footer-r6-plano"
(rode a partir da raiz do repo, /home/fael/so/repos/ben-prototype)
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/plano.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
