# Tarefa r5-recon — passo 4.1 (reconhecimento) da skill decidir-especificar-e-planejar

Pasta da run: .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/

Task em uma frase: no chat Ben, centralizar no topo a logo + "Ben | {data de hoje}", mover o menu
hambúrguer para o footer à esquerda do campo (abre um sheet com as 4 opções atuais) e redesenhar o
input e a gravação de voz, no sandbox de design, no mobile e na doc.

Seu papel está em `.claude/skills/decidir-especificar-e-planejar/prompts/reconhecimento.md`: leia e siga.

Leia também:
- .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/briefing.md
- .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/spec.md
- .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/decisao.md
- .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo.md (Etapa 3 rodou; `## Escolha` = V4, prints em prototipo/v4*.png, `Base:` aponta os arquivos da base)
- .claude/skills/decidir-especificar-e-planejar/formats/roteiro.md
- .claude/skills/decidir-especificar-e-planejar/formats/projeto.md

**`projeto.md` não existe; o reconhecimento levanta o cartão antes de tudo** (formato em
`formats/projeto.md` da skill).

Entregas (nesta pasta da run): `projeto.md` e `reconhecimento.md`. Se parar no teto, a seção
`## Parcial` vai no fim de `reconhecimento.md`.

Pontos já conhecidos que o reconhecimento deve confirmar no código e tratar (não presuma, verifique):
- `WaveBar` real não desenha no Expo web (Animated.View ignora className); o protótipo usou a cópia
  local `ProtoWaveBar`.
- O auto-crescimento do campo na V4 usa `scrollHeight` do textarea (só web); no nativo precisa de
  `onContentSizeChange`.
- O Playwright MCP (`browser-mobile-tester`, porta 8931) deu CONNECT_TIMEOUT nesta run; os prints
  saíram com o pacote `playwright` do Node em /tmp/pw + google-chrome do sistema (ver prototipo.md).
  O roteiro deve prever esse caminho de captura.
- Expo web já está de pé na :8081 (log em .claude/tmp/expo-r2.log).

Skills a carregar antes de ler o código: `code-get-project-context` (projeto Ben e regras de design),
`code-get-coding-designs` e `code-write-code` (convenções que o mapa e as lanes devem respeitar).
Você não edita código do projeto: só escreve as duas entregas.

Regras:
- Não sub-delegue (não dispare agentes).
- Não chame `AskUserQuestion`; toda ambiguidade vira premissa assumida e documentada no seu arquivo
  (ou dúvida no bloco `## Dúvidas`, como o prompt do papel manda).
- Retorno: ponteiro (caminhos, vereditos). Até 12 linhas, exceto os blocos `## Dúvidas` e
  `## Roteiro de comprovação`, que você repassa inteiros no retorno, como o prompt do papel manda.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "header-menu-footer-r5-recon"
(rode a partir da raiz do repo, /home/fael/so/repos/ben-prototype)
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/reconhecimento.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
