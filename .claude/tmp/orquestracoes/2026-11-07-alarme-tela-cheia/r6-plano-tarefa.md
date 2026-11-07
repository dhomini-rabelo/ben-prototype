# Tarefa — planejador (Etapa 4, Passo 4.3) — alarme-tela-cheia

Task em uma frase: lembrete de horário do Ben vira alarme em tela cheia no Android (som de alarme em
loop, mesmo no silencioso e com o celular bloqueado), com Parar, Soneca (slider) e Concluir; no app
aberto (inclusive web) a mesma tela substitui o painel atual.

## Seu papel
Siga, inteiro, `.claude/skills/decidir-especificar-e-planejar/prompts/planejador.md`.
Substituição: a medição de teto é a do bloco TETO abaixo (com o seu description), não o `--self`.
O retorno segue o formato do prompt (≤10 linhas + `## Resumo do plano` literal).

## Caminhos (PASTA = .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/)
- Saída: PASTA/plano.md
- PASTA/spec.md, PASTA/projeto.md, PASTA/reconhecimento.md, PASTA/roteiro.md, PASTA/prototipo.md
  (`## Escolha`, `Base:` — os arquivos da base são o ponto de partida visual; o último passo do plano
  remove as rotas de protótipo desta task, e só desta task: app/prototipo/ e src/prototipo/ têm
  protótipos de outras tasks que não se tocam), PASTA/briefing.md (escopo e premissas).
- Formato: .claude/skills/decidir-especificar-e-planejar/formats/plano.md

## Contrato do roteiro
`roteiro.md` é contrato fechado: prova acrescentada ou dispensada aparece no resumo (e dispensa só via
`## Desvios da spec`). Leia a seção `## Notas do fechamento` dele: RT-003, RT-004 e RT-008 ganham id
nas provas que os cobrem ou prova própria; S10/S12/S13 pedem um passo que cria a simulação de
permissão negada no web (dev-only).

## Respostas às dúvidas técnicas (4.2, assumidas pelo orquestrador; usuário delegou)
- Dúvida 1 (som no silencioso, RT-004 vs RT-013): **(A)** notify-kit para agendar, tela cheia,
  reinício e ações + um módulo Expo pequeno, versionado no repositório, que toca o som em loop com
  `USAGE_ALARM` (iniciado pela tela de alarme, parado por Parar/Soneca/Concluir e pelo teto de 10 min).
  O plano dá a esse módulo prova de lane `teste` ou `codigo` e declara qual.
- Premissas do reconhecimento (`## Premissas`) valem; AC-004 prevalece sobre PR-001 (AC-004 foi
  reescrita pelo usuário no gate). RT-010: a tela mostra só o título (AC-003); horário é dado de
  agendamento.

## Skills
Carregue `code-get-coding-designs` e `code-write-code` (o plano manda escrever código dentro das
convenções), e `code-get-project-context` só nos documentos do mobile, domain-chat e server-ben.
Você não edita nenhum arquivo do projeto.

## Regras
- Não sub-delegue (não dispare agentes). Não chame `AskUserQuestion`; toda ambiguidade vira premissa
  assumida e documentada no seu arquivo.
- Escreva plano.md ANTES de retornar. Se o plano for grande, escreva-o em partes (Write e depois
  Edit/append) para não perder trabalho se o teto chegar.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "alarme-tela-cheia-r6-plano"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/plano.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
