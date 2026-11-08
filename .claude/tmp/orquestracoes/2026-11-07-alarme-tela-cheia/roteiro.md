# Roteiro de comprovação — alarme em tela cheia (fechado no 4.2)

Fechado pelo orquestrador O3, sem gate do usuário (briefing › Premissas: roteiro e plano fechados pelo
orquestrador). Proposto pelo reconhecimento (reconhecimento.md › `## Roteiro de comprovação`) e
aprovado como proposto. Nenhuma prova era vídeo. S18 tem espera real de 10 min (PR-008 sem harness e2e).

ambiente: `pnpm dev` na raiz (sobe a API em :3333 e o Expo web em http://localhost:8081; o :8081 já está de pé nesta máquina, a API precisa estar no ar com `.env` válido). Não serve `pnpm dev:mobile` sozinho, porque sem a API não há lembretes.
estado: nenhum (não há mecanismo; o estado é montado no passo do plano: um lembrete de horário que vence em 1 minuto, criado pelo chat do Ben, e dois lembretes para a fila; ver Armadilhas do reconhecimento.md)
url: http://localhost:8081/ — chat do Ben já logado pelo token de dev

S01 (PR-005; AC-003, AC-005, RT-007) [final] com um clique prévio na página, o lembrete "Buscar o Leo na escola" vence → em até 15 s a tela de alarme ocupa a tela toda, com a hora atual grande, a data, o título "Buscar o Leo na escola" num balão sem repetir o horário do compromisso, e os botões "Parar", "Soneca" e "Concluir" (referência: prototipo/v4.png)
S02 (PR-005; AC-007, AC-016) [final] o usuário toca em "Soneca" → abre a escolha da soneca em tela clara com o slider de tempo próprio no topo e, abaixo dele, as opções "10 min", "30 min", "1 h", "2 h" e "amanhã de manhã" (referência: prototipo/v4-2.png)
S03 (PR-005; AC-016) [final] o usuário arrasta o slider até o meio da faixa → o tempo mostrado muda em passos de 5 min, fica entre 5 min e 2 h, e o botão de confirmar repete a duração escolhida (referência: prototipo/v4-3.png)
S04 (PR-005; AC-007) [final] o usuário toca na opção "10 min" → a tela de alarme fecha e o chat reaparece
S05 (PR-005; AC-006) [final] outro lembrete vence e o usuário toca em "Parar" → a tela de alarme fecha e, depois de 15 s, o mesmo aviso não reabre
S06 (PR-005; AC-008) [final] outro lembrete vence e o usuário toca em "Concluir" → a tela fecha e o lembrete já não aparece na lista de lembretes do menu
S07 (PR-006; AC-003) [final] um lembrete com título longo de duas linhas vence → o balão mostra o título inteiro, sem cortar, e "Parar", "Soneca" e "Concluir" continuam visíveis (referência: prototipo/v4-4.png)
S08 (PR-006; CB-008) [final] dois lembretes vencem juntos → a tela mostra o mais antigo primeiro, com o contador "1 de 2" (referência: prototipo/v4-5.png)
S09 (PR-006; CB-008) [final] o usuário toca em "Parar" no primeiro dos dois → aparece o segundo alarme, "Call the dentist"
S10 (PR-006; AC-010) [final] com a permissão de tela cheia simulada como negada, o usuário abre o app → aparece o aviso que explica que sem liberar a tela cheia o alarme chega só como notificação, com um botão que leva à configuração e o botão "Agora não" (referência: prototipo/v4-6.png)
S11 (PR-006; CB-012, RT-007) [final] sem nenhum clique prévio na página, um lembrete vence → a tela de alarme aparece com o aviso "toque para ouvir"
S12 (PR-006; AC-011) [final] com a permissão simulada como negada, o usuário abre as configurações de lembretes → a linha da tela cheia aparece como desligada, com um botão para liberar (referência: prototipo/v4-7.png)
S13 (PR-006; CB-013) [final] com as notificações simuladas como sem permissão, o usuário abre as configurações de lembretes → aparece o aviso de que os alarmes não vão tocar com o app fechado, com um botão para liberar as notificações
S14 (PR-006; AC-012) [final] um lembrete de meta vence → abre o painel de hoje, com as mesmas opções de antes, e não a tela de alarme
S15 (PR-006; AC-012) [final] um lembrete condicional vence → abre o painel de hoje, com as mesmas opções de antes, e não a tela de alarme
S16 (PR-006; AC-015) [final] o usuário abre o menu de lembretes → a lista aparece igual à de hoje
S17 (PR-006; AC-015) [final] o usuário abre o detalhe de um lembrete → o detalhe aparece igual ao de hoje
S18 (PR-008; AC-007) [final] o usuário adia o alarme em 10 min e espera os 10 min → a tela de alarme de "Buscar o Leo na escola" volta, em tela cheia (espera real de 10 min)

comando: `pnpm test` (na raiz); por pacote `pnpm --filter @ben/mobile-ben test:unit` e `pnpm --filter @ben/domain-chat test:unit`
T01 (PR-001; AC-001, RT-002, RT-005) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-scheduling.test.ts — lembrete de horário com `nextFireAt === firesAt` e tela cheia liberada → é agendado no notify-kit com tela cheia, canal de alarme e alarme de despertador
T02 (PR-001; AC-013, CB-002, RT-002) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-scheduling.test.ts — mesmo lembrete com tela cheia negada → usa o canal `alarmes` e a notificação comum de hoje
T03 (PR-001; AC-004) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-scheduling.test.ts — lembrete cujo `nextFireAt` é um aviso antecipado (minutos antes, manhã, véspera) → fica como notificação comum
T04 (PR-001; AC-012, AC-014) [final] packages/infra/mobile/ben/src/services/__tests__/notifications-service.test.ts — meta, condicional e resumo diário → continuam no canal de hoje (`alarmes` e `resumos`)
T05 (PR-001; CB-010) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-scheduling.test.ts — lembrete apagado, concluído ou com horário mudado → o disparo antigo é desagendado
T06 (PR-002; AC-006, CB-007) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-actions.test.ts — Parar sem rede → o som é silenciado antes da chamada à rede, a ação fica guardada e é reenviada quando a rede volta, sem tocar de novo
T07 (PR-002; AC-007, CB-005, CB-006, RT-012) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-actions.test.ts — Soneca → o alarme local é reagendado na hora, cada nova soneca reagenda de novo, e sem rede a soneca é de 10 min
T08 (PR-002; AC-008, CB-007) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-actions.test.ts — Concluir sem rede → fecha e silencia na hora e a ação é reenviada depois
T09 (PR-003; CB-008) [final] packages/infra/mobile/ben/src/layout/stores/__tests__/alarm-store.test.ts — dois alarmes juntos → o mais antigo é o atual e, ao agir nele, o segundo aparece
T10 (PR-003; AC-005, RT-006) [final] packages/infra/mobile/ben/src/layout/stores/__tests__/alarm-store.test.ts — notificação recebida com o app aberto e a checagem de 15 s do mesmo disparo → o alarme entra uma vez só
T11 (PR-003; CB-011) [final] packages/infra/mobile/ben/src/layout/stores/__tests__/alarm-store.test.ts — alarme com o resumo diário aberto → o alarme fica à frente do resumo
T12 (PR-003; AC-002, CB-009, RT-011) [final] packages/infra/mobile/ben/src/layout/stores/__tests__/alarm-store.test.ts — alarme sem ação por 10 min → o som para e fica uma notificação de alarme perdido
T13 (PR-004; AC-006, AC-007, RT-009) [final] packages/domain/chat/src/application/use-cases/reminders/__tests__/acknowledge-reminder.test.ts — Parar e Soneca → o lembrete guarda o horário do disparo e o instante da ação
T14 (PR-004; AC-008, RT-009) [final] packages/domain/chat/src/application/use-cases/reminders/__tests__/update-reminder.test.ts — Concluir → o lembrete guarda o horário do disparo e o instante da ação, além de `completedAt`
T15 (PR-007; AC-001) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-native-config.test.ts — config gerada → declara `USE_FULL_SCREEN_INTENT` e o plugin da lib de alarme
T16 (PR-007; AC-001, AC-009) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-native-config.test.ts — config gerada → a atividade principal abre por cima do bloqueio e acende a tela
T17 (PR-007; AC-002, CB-003) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-native-config.test.ts — canal de alarme → importância alta, categoria alarme, som próprio embutido e uso de áudio de alarme
T18 (PR-007; CB-004) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-native-config.test.ts — config gerada → o reagendamento no reinício está declarado
T19 (PR-007; CB-001, RT-010) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-actions.test.ts — toque na notificação comum → a tela de alarme abre sem som, com título vindo da própria notificação

## Notas do fechamento (orquestrador)
- Checagem dos critérios de fechamento: ambiente/estado/url presentes; todo RT/PR de lane browser
  (RT-007, PR-005, PR-006, PR-008) tem S0n; todo RT/PR de lane teste tem T0n; as 13 CB aparecem.
- RT-003, RT-004 e RT-008 (lane teste no reconhecimento) não estão citados por id em nenhuma prova;
  a cobertura vem por AC: RT-003 por T16, RT-004 por T17, RT-008 por T06 e T08. O planejador acrescenta
  o id do RT nessas provas ou cria prova própria (próximo id livre), declarando em "Decisões que travei
  sozinho". Com a Dúvida 1 resolvida em (A), T17 cobre o canal; o som em loop com USAGE_ALARM do módulo
  próprio precisa de prova de lane `teste` ou `codigo` — o planejador decide e declara.
- S10, S12 e S13 dependem de simular permissão negada no web, que hoje não existe (reconhecimento ›
  RT problemáticos): o plano cria o mecanismo de simulação (dev-only) num passo próprio.
