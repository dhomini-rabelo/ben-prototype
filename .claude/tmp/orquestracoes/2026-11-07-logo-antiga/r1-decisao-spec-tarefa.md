# Tarefa r1 — decisao.md e spec.md (Etapas 1 e 2 da skill decidir-especificar-e-planejar)

Pasta da run (P): /home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-logo-antiga/

## Leia
1. P/briefing.md — o contrato. As respostas do usuário ali são decisões fechadas.
2. P/r0-mapa-logo.md — o mapa do código já levantado (não refaça; confira só o que precisar).
3. /home/fael/so/repos/ben-prototype/.claude/skills/decidir-especificar-e-planejar/SKILL.md, linhas 61 a 633 (Etapa 1 e Etapa 2). Não leia as Etapas 3 e 4.
4. Skill code-get-project-context (SKILL.md e só o que toca mobile/ben). Você não edita código do projeto, então code-write-code não é necessária.

## Faça
1. Escreva P/decisao.md no formato "Registro de decisão" da skill. É uma ISSUE (ver "Issue e feature não passam pelas mesmas perguntas"). `## Ideia principal` = a do briefing, confirmada pelo usuário. Brief preenchido com `(agente)` onde for premissa; sem entrevista (as respostas do briefing já fecharam as lacunas). Três lentes e o veredito com motivo nomeado. `## Decisão do usuário`: escreva `pendente — vai ao gate junto da spec`. Complementos: até 5, cada um com persona e problema; marque `proposto` (o usuário aceita ou recusa no gate).
2. Escreva P/spec.md no formato da Etapa 2: cabeçalho, `## Fora de escopo` (inclua o sandbox de design e o que o briefing exclui), `[Specs]`, `[Requisitos técnicos]`, `[Casos de borda]`, `[Prova]`. Siga as regras de cada parte como a skill descreve (ids AC/RT/CB/PR, `Continua como hoje`, prova de issue com antes e depois, `(sem captura)` para o que não se observa no web: ícone do launcher, adaptive, splash nativo, notificação).
   - Decisões do usuário que viram AC/RT: fundo claro com balão âmbar no ícone, adaptive e splash; geração via dependência de dev que rasteriza o SVG do header (o script `generate-icons.mjs` continua rodando antes de dev/start/android/apk e passa a desenhar a logo nova); README do app atualizado.
   - "Fundo claro": confira em `packages/infra/mobile/ben/src/layout/utils/colors.ts` qual é a cor de fundo do tema atual do app e decida entre ela e o `#f9f9f9` atual do `app.config.ts`; registre a escolha como `(agente)`.
   - Fonte única: o RT deve evitar duas cópias da geometria divergindo (o SVG do header e o do script); proponha como, sem desenhar código.
   - Design óbvio: decida se cabe `[Visual]`. A logo e o fundo já estão decididos; se julgar óbvio, NÃO escreva `[Visual]` e registre em uma linha o motivo no fim do arquivo, numa seção `## Notas para o gate` (que o orquestrador remove ou mantém).
   - Quebra em partes: o padrão é uma; só proponha quebra se o critério da skill exigir.
3. Em P/spec.md, NÃO escreva `## Gate` (só o usuário fecha). Acrescente no fim `## Notas para o gate`: design óbvio sim/não com motivo, quebra sim/não, perguntas da regra 7 de `[Requisitos técnicos]` se houver (máx. 3, com opções e recomendada).

## Regras
- Não edite nada fora de P. Não chame AskUserQuestion; toda ambiguidade vira premissa assumida e documentada (marca `(agente)`). Não dispare agentes.
- Retorne no máximo 10 linhas: caminhos, veredito da decisão, contagem de AC/RT/CB/PR, design óbvio sim/não, perguntas para o gate (se houver), e `veredito: ok | parcial | preso`.

## TETO
TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "logo-antiga-r1-decisao-spec"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em P/spec.md (ou P/decisao.md, se a spec não começou) a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
