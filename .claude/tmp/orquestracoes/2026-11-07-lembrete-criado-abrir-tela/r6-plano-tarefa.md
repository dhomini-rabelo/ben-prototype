# Tarefa r6 — planejador (passo 4.3 da skill decidir-especificar-e-planejar)

Task em uma frase: tocar no card de lembrete que o agente criou no chat abre a lista de lembretes com o detalhe daquele lembrete aberto, e card, lista e detalhe deixam claro se o lembrete é único ou recorrente.

## Seu papel
Leia e siga: /home/fael/so/repos/ben-prototype/.claude/skills/decidir-especificar-e-planejar/prompts/planejador.md

## Delta (P = /home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/)
- P/spec.md
- P/projeto.md
- P/reconhecimento.md (comece por ele)
- P/roteiro.md — **contrato fechado**, aprovado pelo usuário: prova acrescentada ou dispensada aparece no resumo. Leia o cabeçalho `Estado:` e `Decisões do gate 4.2:` no topo.
- /home/fael/so/repos/ben-prototype/.claude/skills/decidir-especificar-e-planejar/formats/plano.md
- P/prototipo.md — `## Escolha` = V2; a base final (ponto de partida visual) está em `## Base final` no fim do arquivo; o último passo do plano remove `packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/` e `packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/` (e só essas: as pastas irmãs em `prototipo/` são de outras runs).
- Saída: P/plano.md. Onda: decida pelo formato (onda única se couber).

## Respostas do usuário às dúvidas técnicas (vencem o reconhecimento)
1. Sessão e dados das provas de tela: **misto**. Server local (:3333) com `BACKEND_URL` do app apontando para ele, JWT local gerado para um usuário do `dev.db` e gravado em `localStorage` (`ben.jwttoken`), lembretes da Ana inseridos no banco, para S21–S24, S42–S48 e S45; interceptação da API no Playwright (`page.route`) com token falso para a matriz S08–S20 e as bordas S25–S32. O resto escolha o que for mais estável e diga no plano.
2. PR-009: **predicado puro** ("este card abre o detalhe?") extraído e testado em Vitest node (T15). Sem testing-library, sem mudar a infra de teste.
3. S41 (aviso do alarme): **lane `codigo`** — o revisor confere no diff que o caminho do aviso de alarme não foi tocado. Declare em `## Desvios da spec` como desvio aprovado pelo usuário no gate 4.2.

## Premissas já travadas
- A galeria `packages/infra/mobile/design` fica fora (defasada; o protótipo aprovado está no app Expo).
- Trocar `BACKEND_URL` no `.env.development` para as provas é preparação de ambiente da validação: o plano diz como fazer e como restaurar, sem commitar a troca.
- A memória que diz "recorrente não é v1" está desatualizada; vale o código (goal com daily/weekdays).
- Prints: uma tela inteira por print, 390x844, escala 1x, `playwright-core` + Chrome local (o Playwright MCP não conectou para subagentes).
- O Expo web já roda na porta 8081.

## Skills
Carregue `code-write-code` e `code-get-coding-designs` (e `code-get-project-context` se precisar de arquitetura) antes de decidir estrutura: o plano tem de respeitar as convenções do repo, e o revisor vai conferir isso. Você não edita código do projeto.

## Regras extras do orquestrador
- Não sub-delegue (não chame Agent), não chame `AskUserQuestion`; toda ambiguidade vira premissa assumida e documentada no plano ("Decisões que travei sozinho").
- Retorno no formato do seu prompt (até 12 linhas + o bloco `## Resumo do plano` literal).

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "lembrete-criado-abrir-tela-r6-plano"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em P/plano.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
(Este bloco substitui o `--self` do seu prompt de papel: meça pelo description acima.)
