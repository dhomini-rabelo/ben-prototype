# Tarefa — reconhecimento (Etapa 4, Passo 4.1) — alarme-tela-cheia

Task em uma frase: lembrete de horário do Ben vira alarme em tela cheia no Android (som de alarme em
loop, mesmo no silencioso e com o celular bloqueado), com Parar, Soneca (slider) e Concluir; no app
aberto (inclusive web) a mesma tela substitui o painel atual.

## Seu papel
Siga, inteiro, `.claude/skills/decidir-especificar-e-planejar/prompts/reconhecimento.md`.
Substituições ao que ele diz:
- A medição de teto é a do bloco TETO abaixo (com o seu description), não o `--self` do prompt.
- Retorno: no máximo 10 linhas fora dos dois blocos que viajam inteiros (`## Dúvidas` e
  `## Roteiro de comprovação`, copiados literalmente do seu arquivo).

## Caminhos
- Pasta da run: .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/
- Saída: .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/reconhecimento.md
- spec.md (com `## Gate`): .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/spec.md
- decisao.md: .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/decisao.md
- prototipo.md (`## Escolha` com `Base:`): .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/prototipo.md
- formats/roteiro.md: .claude/skills/decidir-especificar-e-planejar/formats/roteiro.md
- briefing.md (contexto e premissas): .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/briefing.md
- **projeto.md NÃO existe**: levante-o e escreva-o em
  .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/projeto.md antes de tudo, seguindo
  .claude/skills/decidir-especificar-e-planejar/formats/projeto.md.

Não leia r0-*.md, r1-*.md nem os prints um a um além do necessário; a spec e o prototipo.md bastam.

## Skills
Carregue `code-get-project-context` (só os documentos do app mobile e do server que a task toca) e
`code-get-coding-designs`; consulte `code-write-code` para as convenções que o plano terá de seguir.
Você não edita nenhum arquivo do projeto.

## Pontos que o reconhecimento precisa fechar (vêm da spec e de r1-spec.md › Premissas)
1. Compatibilidade de `react-native-notify-kit` (RT-013) com Expo SDK 54 + `expo-notifications`
   coexistindo no mesmo app (config plugin, prebuild, conflito de canais/permissões). Pode usar
   pesquisa web e o node_modules/registry para confirmar versões.
2. Som com USAGE_ALARM tocando no modo silencioso (RT-004) — como o notify-kit (ou o caminho que
   recomendar) faz isso.
3. Loop de som no notify-kit (ou alternativa nativa), até Parar/Soneca/Concluir.
4. Se o endpoint de soneca do servidor aceita duração livre (AC-016, slider 5 min–2 h, passo 5) ou
   precisa mudar (rota, Zod, use case, teste) — e se isso torna a task cross-unidade.
5. Onde registrar o instante da ação (RT-009) — acknowledge existente no backend?
Notas: RT-010 fala em "título e horário" vindos da notificação, mas AC-003 mostra só o título; trate
o horário como dado de agendamento. No web (:8081) o notifications-service é no-op e só o overlay
in-app roda (polling 15 s); som no web exige um clique antes (autoplay). Para prova de tela, o
ambiente é o Expo web em :8081 (já roda); Playwright MCP pode não existir: use a lib `playwright`
com o Chrome local em 390x844. Memória business-rules/razao-de-negocio-e-casos-de-uso-v1.md ("sem OS
notification / alarmes mockados") está desatualizada frente ao código.

## Regras
- Não sub-delegue (não dispare agentes). Não chame `AskUserQuestion`; toda ambiguidade vira premissa
  assumida e documentada no seu arquivo.
- Escreva reconhecimento.md (e projeto.md) ANTES de retornar.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "alarme-tela-cheia-r5-recon"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/reconhecimento.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
