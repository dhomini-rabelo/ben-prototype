# Tarefa r1 — decisao.md + spec.md (alarme em tela cheia)

Pasta da run: .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/ (chamada abaixo de PASTA)
Entrega: PASTA/r1-spec.md (ponteiro + veredito + `## Perguntas do gate` + `## Premissas`)

## Leia, nesta ordem
1. PASTA/briefing.md — o contrato. As respostas do usuário estão lá (rodada 1).
2. PASTA/gate-r1.md — ideia principal e rascunho do brief.
3. PASTA/r0-mobile.md — estado atual de lembretes/notificações no app mobile.
4. PASTA/r0-pesquisa.md — pesquisa web (FSI Android 14+, notify-kit, AlarmKit, web/autoplay).
5. PASTA/referencia-alarmy.png — print do Alarmy que o usuário mandou.
6. .claude/skills/decidir-especificar-e-planejar/SKILL.md — Etapa 1: "Registro de decisão",
   "Passo 4 — as três lentes", "Passo 5 — veredito"; Etapa 2 inteira (linhas ~303-633).
   Não leia Etapa 3 nem 4.
7. Carregue a skill code-get-project-context antes de abrir código do projeto. Abra código só
   para conferir algo que a spec afirma (ids de rota, nomes de canal, endpoints); não reconstrua
   o r0.

## Escreva
1. PASTA/decisao.md, no formato "Registro de decisão" da skill:
   - Pedido verbatim (copie do briefing).
   - Ideia principal confirmada (a do briefing, que o usuário aprovou).
   - Brief com as respostas do usuário no lugar das inferências do agente.
   - Pesquisa: fontes do r0-pesquisa.md.
   - Três lentes e veredito. Esperado `vai menor`: Android/APK, só lembretes de horário (kind
     alarm); versão completa = iOS (AlarmKit), missão, Play Store. Se as lentes disserem outra
     coisa, escreva o que elas dizem e justifique.
   - Decisão do usuário = "pendente: vai junto do gate da spec".
   - Complementos (até 5), Menor versão, Como medir (sinal: ação parar/soneca/concluir em até
     5 min do disparo, lida pelo acknowledge do backend — ver briefing › Premissas).
2. PASTA/spec.md, Etapa 2 da skill, SEM a seção `## Gate` (o orquestrador escreve depois):
   - Cabeçalho, Fora de escopo (do briefing).
   - [Specs] com `Continua como hoje` (lembretes meta e condicional seguem no painel atual;
     notificação comum quando a permissão de tela cheia é negada).
   - [Requisitos técnicos]: canal/som de alarme em loop (USAGE_ALARM, toca no silencioso),
     USE_FULL_SCREEN_INTENT com pedido ao usuário e fallback, dev build/APK, sem iOS, e o que
     mais a pesquisa e o código exigirem.
   - [Casos de borda]: permissão negada; celular em uso (heads-up); soneca; app morto; sem rede
     ao parar/adiar; vários alarmes juntos; e outros que você achar.
   - [Prova]: web (foto/vídeo da tela no Expo web :8081, som depende de clique prévio); Android:
     teste unitário + `(sem captura)` onde o agente não consegue rodar device.
   - [Visual]: Telas, Plataforma Android 390x844, Referências (Alarmy), Manter, Livre, Dados.
   - Com o app aberto (inclusive web), o lembrete de horário abre a mesma tela de alarme no
     lugar do painel atual (premissa do briefing).
3. PASTA/r1-spec.md:
   - Linha 1: `veredito: ok | parcial | preso`.
   - Caminhos de decisao.md e spec.md; contagem de AC/RT/CB/PR.
   - `## Resumo para o gate`: no máximo 12 linhas, para o usuário — veredito da decisão em uma
     linha, e a spec em linhas curtas (o que acontece quando o alarme toca, o que fica igual, o
     que exige do celular).
   - `## Perguntas do gate`: só as que a regra 7 de [Requisitos técnicos] exige (ex.: lib nova
     recusável como react-native-notify-kit vs alternativa) e a quebra em partes se você
     propuser uma (critério e teto em "A quebra em partes" da Etapa 4 — leia só essa subseção).
     Cada pergunta: texto, header até 12 caracteres, 2 a 4 opções com label curto e descrição
     de até 2 linhas, a recomendada marcada "(recomendada)" no label. Sem opção "Outro".
     NÃO pergunte sobre protótipo (já decidido: sim) nem sobre a aprovação da spec (o
     orquestrador acrescenta).
   - `## Premissas`: o que você decidiu sozinho.

## Regras
- Não edite código do projeto. Escreva só em PASTA.
- Não sub-delegue (não dispare agente). Não chame `AskUserQuestion`; toda ambiguidade vira
  premissa assumida e documentada no seu arquivo.
- Retorne no máximo 10 linhas: caminho de r1-spec.md e o veredito.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "alarme-tela-cheia-r1-spec"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em PASTA/r1-spec.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
