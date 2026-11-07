# Handoff O1 → O2

Briefing: .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/briefing.md
Ledger: .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/log.md

## Próxima rodada
Rodada r1, um filho `opus` (description `alarme-tela-cheia-r1-spec`, general-purpose), entrega em r1-spec.md (ponteiro + veredito). Ele lê: briefing.md, gate-r1.md (ideia principal e rascunho do brief), r0-mobile.md, r0-pesquisa.md, referencia-alarmy.png, e .claude/skills/decidir-especificar-e-planejar/SKILL.md (Etapa 1: "Registro de decisão", "Passo 4 — as três lentes", "Passo 5"; Etapa 2 inteira). Escreve:
1. decisao.md (formato do "Registro de decisão"): pedido verbatim, ideia principal confirmada, brief com as respostas do usuário no lugar de (agente), pesquisa (fontes do r0-pesquisa), três lentes, veredito (esperado `vai menor`: Android/APK, só kind alarm; versão completa = iOS AlarmKit, missão, Play Store), Decisão do usuário = "pendente: vai junto do gate da spec", complementos (até 5, para a persona), menor versão, como medir.
2. spec.md (Etapa 2): cabeçalho, Fora de escopo, [Specs] com `Continua como hoje` (meta/condicional, painel; notificação comum quando a permissão de tela cheia é negada), [Requisitos técnicos] (ex.: canal/som de alarme em loop USAGE_ALARM, USE_FULL_SCREEN_INTENT com pedido ao usuário e fallback, dev build/APK, sem iOS), [Casos de borda] (permissão negada, celular em uso → heads-up, soneca, app morto, sem rede ao parar/adiar, vários alarmes juntos), [Prova] (web: foto/vídeo da tela; Android: teste unitário + `(sem captura)` onde o agente não consegue rodar device), [Visual] (Telas, Plataforma Android 390x844, Referências Alarmy, Manter, Livre, Dados), SEM `## Gate`.
   RT que exige lib nova recusável (ex.: react-native-notify-kit) vira pergunta (regra 7 de RT): o filho escreve as perguntas em r1-spec.md, seção `## Perguntas do gate`, com opções e a recomendada.
   Carregar code-get-project-context antes; não editar código do projeto. Bloco de teto do orquestrador.md obrigatório.
Depois: rodada 2 de perguntas ao usuário = veredito (decisao.md) + gate da spec (resumo das partes + perguntas de RT + quebra, se o filho propôs). Protótipo já está decidido (sim); não perguntar de novo.

## Pendências, em ordem
1. r1: decisao.md + spec.md (filho opus).
2. bloco: perguntas rodada 2 — veredito + aprovação da spec; com a resposta, acrescentar `## Gate` (Protótipo: sim — escolhido na rodada 1; Partes conforme resposta).
3. Etapa 3: filho sonnet `proto-alarme-tela-cheia` (regras na SKILL.md, seção Etapa 3; rotas em app/prototipo/alarme-tela-cheia/v{n}.tsx no Expo web :8081, prints 390x844 em prototipo/). Depois bloco: perguntas com a escolha (prints linkados). Depois filho `proto-alarme-tela-cheia-base`.
4. Etapa 4: 4.1 recon (sonnet, prompts/reconhecimento.md), 4.2 roteiro fechado pelo orquestrador (sem gate do usuário), 4.3 plano (sonnet/opus conforme dificuldade) + revisão opus até 2 voltas, 4.4 sem gate do usuário (briefing), 4.5 entrega no relatorio-final.md com a linha /implementar-e-validar.

## Já fechado
- r0 mobile: r0-mobile.md (estado atual de lembretes/notificações; popup in-app; SDK 54 dev build; sem som/tela cheia).
- r0 pesquisa: r0-pesquisa.md (FSI Android 14+, Notifee arquivado → react-native-notify-kit, iOS só AlarmKit, web exige clique para som).
- Gate rodada 1 respondido: tudo nas recomendadas (ver briefing.md).

## Armadilhas
- A memória .claude/memory/business-rules/razao-de-negocio-e-casos-de-uso-v1.md diz "sem OS notification / alarmes mockados": está desatualizada frente ao código (r0-mobile §3).
- No web (:8081) o notifications-service é no-op; só o overlay in-app roda (polling 15 s). Som no web exige um clique antes (autoplay).
- O1 entrou em handoff por projeção no turn 13 (r0 retornou arquivos grandes lidos inteiros): O2 não leia r0-*.md, passe os caminhos aos filhos.

## Premissas
Ver briefing.md › Premissas (todas valem).

## Estado do mundo
Nada fora do git alterado. Pasta da run criada; nenhum serviço subido; nenhum arquivo do projeto editado.

## Janela
Fechei em 94k, teto 140k, 14 turns de 50 (status=handoff por projeção).
