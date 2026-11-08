# r1-spec — escrever a spec (Etapa 2 da skill decidir-especificar-e-planejar)

Pasta da run: /home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/

## Leia
1. `briefing.md` e `decisao.md` desta pasta (o pedido, as respostas do usuário, as premissas).
2. `r0-mobile.md` e `r0-design.md` desta pasta (o reconhecimento do código).
3. `.claude/skills/decidir-especificar-e-planejar/SKILL.md`, só a seção `## Etapa 2 — especificar`
   (linhas ~303-633): cabeçalho, `Fora de escopo`, `[Specs]`, `[Requisitos técnicos]`,
   `[Casos de borda]`, `[Prova]`, `[Visual]` e as regras de cada uma. Siga-as à risca.
4. Para confirmar um fato do código, abra só o arquivo apontado no r0 (não refaça o reconhecimento).
   Carregue `code-get-project-context` se precisar de regra de design; `.claude/agents-docs/project-context/`
   tem `ux-philosophy.md`, `design-rules.md` e o guia de padrões citados no r0-design.

## Escreva
`spec.md` nesta pasta, com as cinco partes (a mudança é de disposição, então tem `[Visual]`).
Pontos que a spec precisa cobrir:
- Topo centralizado: logo + "Ben" | data de hoje (formato atual, en e pt-BR), sem o botão de menu.
- Botão do menu à esquerda do campo de texto, mesma linha; o microfone/enviar à direita.
- Sheet com as 4 opções atuais (Tasks, Notes, Reminders, Settings); tocar abre a mesma view/folha de hoje.
- Melhoria do layout e design do campo de texto e da gravação de voz: o usuário pediu, sem dizer
  como. Escreva como AC só o que é verificável sem decidir a aparência (ex.: continua dando para
  digitar, enviar, gravar, cancelar); a aparência vai para `[Visual]` › `Livre`, que o protótipo explora.
- Sandbox (as 3 telas com header) e mobile; `ux-philosophy.md` atualizado (RT, com motivo).
- `Continua como hoje` obrigatório: envio de texto, gravação, as views do menu, Settings, o resto do chat.
- `[Casos de borda]`: sheet aberto e fechar (gesto, toque fora, voltar), gravação em curso, teclado
  aberto, idioma pt-BR, texto longo no campo, etc. Só os que completam uma AC.
- `[Prova]`: foto/vídeo pelo agente `browser-mobile-tester` em 390x844 no :8081 e captura do sandbox
  no :3002; sem nome de arquivo de teste. Uma PR `(geral)` de ponta a ponta.
- Marque `(agente)` toda decisão que o usuário não disse.
- No fim da spec, NÃO escreva `## Gate` (é o usuário quem aprova). Se achar que cabe quebra em
  partes, escreva a proposta numa seção `## Proposta de quebra`; o padrão é uma parte só.

## Retorno (máximo 10 linhas)
Caminho do `spec.md`, contagem de AC/RT/CB/PR, os eixos de `[Visual]` › `Livre`, e qualquer RT que
exija algo recusável (regra 7 de `[Requisitos técnicos]`), escrito como pergunta com opções.

## Regras
Não edite nada fora desta pasta. Não sub-delegue. Não chame `AskUserQuestion`; toda ambiguidade vira
premissa assumida, marcada `(agente)` na linha da spec.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "header-menu-footer-r1-spec"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/spec.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
