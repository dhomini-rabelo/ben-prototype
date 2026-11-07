# Roteiro de comprovação — tocar no card de lembrete abre o detalhe; único/recorrente claro

Estado: APROVADO pelo usuário no gate 4.2 ("Aprovo como está"), com uma decisão: S41 sai da lane browser e vira lane `codigo` (o revisor confere no diff que o caminho do aviso de alarme não foi tocado), declarado como desvio da spec. O id S41 não é reaproveitado.
Decisões do gate 4.2: sessão e dados das provas = misto (server local + JWT local no dev.db + dados no banco para S21–S24, S42–S48 e S45; interceptação `page.route` no Playwright para S08–S20 e S25–S32); PR-009 = predicado puro testado em Vitest node (T15).
Origem: reconhecimento.md, seção `## Roteiro de comprovação`, copiada sem edição.

ambiente: `pnpm dev` na raiz (server :3333 + Expo web :8081), com `BACKEND_URL=http://localhost:3333` no `.env.development` do app (hoje aponta para um túnel ngrok; a linha localhost está comentada e :3333 está fora do ar). `pnpm dev:mobile` sozinho NÃO serve: sem o server o chat não carrega histórico nem lembretes. A galeria (`pnpm dev:design`) não participa. Prints: `playwright-core` + Chrome local, uma tela inteira por print, 390x844, escala 1x, nome do PNG com o id (como em `.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v1.png`).
estado: nenhum (sem mecanismo de fixtures; sessão e lembretes da Ana são montados num passo do plano, ver Dúvida 1)
url: http://localhost:8081/chat — chat do app em português (pt-BR), relógio do navegador fixo em 7/nov/2026, histórico com os lembretes da Ana (ver `[Visual] Dados` da spec), 390x844

S01 (PR-003; AC-005, AC-007) [final] (era vídeo) o usuário encosta e segura o dedo num card antigo da conversa ("Ligar pro dentista") → o card aparece em estado pressionado (mais claro que os outros) e a conversa continua na tela
S02 (PR-003; AC-005, AC-006) [final] o usuário solta o toque no card antigo "Ligar pro dentista" → a lista de lembretes aparece com o detalhe de "Ligar pro dentista" aberto por cima
S03 (PR-003; AC-008) [final] o usuário fecha o detalhe → a lista de lembretes fica na tela com a linha "Ligar pro dentista" nela
S04 (PR-003; AC-009) [final] o usuário toca no voltar da lista → a conversa aparece no mesmo ponto de antes, sem passar pela lista do menu
S05 (PR-003; AC-006) [final] o usuário toca no card do lembrete mais recente → o detalhe aberto é o do lembrete mais recente, não o do card antigo
S06 (PR-003; CB-005) [final] o usuário toca duas vezes rápido num card → o detalhe aparece numa tela só (nada empilhado por baixo)
S07 (PR-003; CB-011, AC-009) [final] o usuário volta pelo botão voltar do navegador uma vez → a conversa aparece
S08 (PR-004; AC-001, AC-002, AC-003, AC-004, AC-005, AC-019) [final] o usuário olha a conversa em português com os sete lembretes → os cards mostram, junto do horário, "Único" (alarme), "Único" (goal), "Todo dia", "Dias úteis", "Seg, Qui" e, no sem horário, "Quando acontecer"
S09 (PR-004; AC-001, AC-002, AC-003, AC-004) [final] o usuário troca o idioma para inglês e olha a conversa → os cards mostram "One-time", "Every day", "Weekdays", "Mon, Thu" e "When it happens"
S10 (PR-004; AC-010, AC-019, CB-001) [final] o usuário abre a lista de lembretes em português → cada linha ativa e a concluída ("Pagar o aluguel") mostram o rótulo de repetição ("Todo dia · capturado há ...", "Único", "Seg, Qui") e o selo de tipo; a linha "quando acontecer" mostra só o selo "Quando acontecer"
S11 (PR-004; AC-010) [final] o usuário abre a lista de lembretes em inglês → as linhas mostram "Every day", "One-time", "Weekdays", "Mon, Thu"
S12 (PR-004; AC-011, AC-002) [final] o usuário abre o detalhe do alarme "Ligar pro dentista" → o box mostra horário, "ativo", "Alarme" e a linha "Único"
S13 (PR-004; AC-011, AC-002) [final] o usuário abre o detalhe de um goal sem repetição → o box mostra "Goal" e a linha "Único"
S14 (PR-004; AC-011, AC-003) [final] o usuário abre o detalhe de "Tomar o remédio" → o box mostra a linha "Todo dia"
S15 (PR-004; AC-011, AC-003) [final] o usuário abre o detalhe de "Academia" → o box mostra a linha "Dias úteis"
S16 (PR-004; AC-011, AC-003) [final] o usuário abre o detalhe de "Regar as plantas" → o box mostra a linha "Seg, Qui"
S17 (PR-004; AC-011, AC-004) [final] o usuário abre o detalhe de "Ver se a encomenda chegou" → o box mostra o selo "Quando acontecer" e nenhuma linha de repetição repetindo o texto
S18 (PR-004; AC-011, CB-001) [final] o usuário abre o detalhe de "Pagar o aluguel" → o box mostra "concluído", o rótulo "Único" e nenhum editor abaixo
S19 (PR-004; AC-011, AC-003) [final] em inglês, o usuário abre o detalhe de "Tomar o remédio" → o box mostra a linha "Every day"
S20 (PR-004; AC-011, AC-003) [final] em inglês, o usuário abre o detalhe de "Regar as plantas" → o box mostra a linha "Mon, Thu"
S21 (PR-005; AC-012, AC-018) [final] (era vídeo) o usuário toca no card de um goal sem repetição e olha o detalhe → o box mostra "Único" e o editor mostra "Repetir" com "Não" marcado
S22 (PR-005; AC-012, AC-018) [final] o usuário marca "Diária" e salva → o detalhe passa a mostrar a linha "Todo dia"
S23 (PR-005; AC-012) [final] o usuário fecha o detalhe → a linha desse lembrete na lista mostra "Todo dia"
S24 (PR-005; CB-010) [final] o usuário volta à conversa e recarrega a página → o card desse lembrete mostra "Todo dia"
S25 (PR-006; CB-003) [final] o usuário toca no card com o servidor respondendo devagar → o carregando do detalhe aparece por cima da lista
S26 (PR-006; CB-002) [final] o usuário toca num card cujo lembrete foi removido do banco antes → o detalhe mostra "este item sumiu — deve ter sido apagado em outro lugar."
S27 (PR-006; CB-002, AC-009) [final] o usuário fecha o detalhe que sumiu e toca no voltar da lista → a lista aparece ao fechar e, ao voltar, a conversa
S28 (PR-006; CB-004) [final] o usuário toca no card com o servidor falhando → o detalhe mostra "não deu para carregar — toque para tentar de novo"
S29 (PR-006; CB-004) [final] o usuário toca no card sem conexão → o detalhe mostra "não deu para carregar — toque para tentar de novo"
S30 (PR-006; CB-004) [final] o usuário toca em "tentar de novo" com o servidor de volta → o detalhe do lembrete aparece ali mesmo
S31 (PR-006; CB-004, AC-009) [final] o usuário fecha o detalhe com erro e volta pela lista → a conversa aparece
S32 (PR-006; CB-012, AC-008) [final] o usuário abre o detalhe pelo card com a lista falhando e fecha o detalhe → a lista mostra o aviso de falha com "tentar de novo"
S33 (PR-007; AC-013) [final] (era vídeo) o usuário toca no botão do card de task → a task abre como hoje
S34 (PR-007; AC-014) [final] o usuário toca no card de nota → nada abre e a conversa continua na tela
S35 (PR-007; AC-015) [final] o usuário pressiona e segura a bolha de texto do Ben → o menu de ações da mensagem abre
S36 (PR-007; AC-016) [final] o usuário toca no botão do topo da conversa → a lista do menu abre (Tarefas, Notas, Lembretes...)
S37 (PR-007; AC-017) [final] o usuário entra em Lembretes e toca num lembrete da lista → o detalhe abre por cima da lista
S38 (PR-007; AC-017) [final] o usuário fecha o detalhe → a lista de lembretes fica na tela
S39 (PR-007; AC-016) [final] o usuário toca no voltar da lista (aberta pelo menu) → a lista do menu aparece, não a conversa
S40 (PR-007; AC-016) [final] depois de já ter aberto um card pelo chat e voltado, o usuário abre o menu pelo botão do topo, entra em Lembretes e toca no voltar → a lista do menu aparece, não a conversa
S41 (PR-007; AC-020) [final] o alarme dispara com o app aberto → o aviso do alarme na tela aparece como hoje (alarme, título e horário)
S42 (PR-008; CB-007) [final] o Ben responde criando dois lembretes de uma vez → a resposta mostra um card só, o do primeiro
S43 (PR-008; CB-007, AC-010) [final] o usuário abre a lista de lembretes depois dessa resposta → os dois lembretes estão na lista, cada um com o rótulo de repetição
S44 (PR-008; CB-009, AC-005) [final] o usuário recarrega a conversa depois de o lembrete do card ter sido removido do banco → a mensagem aparece sem card
S45 (PR-010; AC-001, AC-003) [final] o usuário diz ao Ben "me lembra de tomar o remédio todo dia às 8" → a resposta traz o card com "Todo dia"
S46 (PR-010; AC-006, AC-011) [final] o usuário toca no card → o detalhe do lembrete certo abre com a linha "Todo dia"
S47 (PR-010; AC-008) [final] o usuário fecha o detalhe → a lista de lembretes mostra o lembrete criado com "Todo dia"
S48 (PR-010; AC-009) [final] o usuário toca no voltar da lista → a conversa aparece com a resposta do Ben e o card

comando: `pnpm test` na raiz (ou `pnpm --filter @ben/domain-chat test:unit` e `pnpm --filter @ben/mobile-ben test:unit`)
T01 (PR-001; AC-001, AC-002) [final] `packages/domain/chat/src/application/use-cases/captures/__tests__/persist-captures.test.ts` — alarme criado pela conversa → a view traz tipo "alarme" e nenhuma repetição
T02 (PR-001; AC-002) [final] mesmo arquivo — goal com repetição "nenhuma" e goal sem valor de repetição → a view traz tipo "goal" e a mesma ausência de repetição nos dois
T03 (PR-001; AC-003) [final] mesmo arquivo — goal que repete todo dia → a view traz a repetição diária
T04 (PR-001; AC-003) [final] mesmo arquivo — goal de segunda a sexta → a view traz os dias 1 a 5
T05 (PR-001; AC-003) [final] mesmo arquivo — goal em dias quaisquer (segunda e quarta) → a view traz esses dias
T06 (PR-001; AC-004) [final] mesmo arquivo — lembrete "quando acontecer" → a view traz tipo "conditional", sem horário e sem repetição
T07 (PR-001; AC-005, CB-008, RT-002) [final] `packages/domain/chat/src/application/use-cases/captures/__tests__/resolve-capture.test.ts` — lembrete cuja repetição mudou depois da criação → a view resolvida traz a repetição atual
T08 (PR-002; AC-002) [final] `packages/infra/mobile/ben/src/layout/utils/__tests__/recurrence-label.test.ts` — alarme, goal "nenhuma" e goal sem valor → "Único" em pt-BR e "One-time" em en
T09 (PR-002; AC-003) [final] mesmo arquivo — repetição diária → "Todo dia" e "Every day"
T10 (PR-002; AC-003) [final] mesmo arquivo — segunda a sexta (1 a 5) → "Dias úteis" e "Weekdays"
T11 (PR-002; AC-003) [final] mesmo arquivo — os sete dias marcados → "Todo dia" e "Every day"
T12 (PR-002; AC-003) [final] mesmo arquivo — segunda e quarta → "Seg, Qua" e "Mon, Wed"
T13 (PR-002; AC-004) [final] mesmo arquivo — "quando acontecer" → "Quando acontecer" e "When it happens" no card, e sem rótulo de repetição na lista e no detalhe
T14 (RT-004; AC-016) [final] `packages/infra/mobile/ben/src/layout/stores/__tests__/menu-store.test.ts` — abre pelo chat e chama `reset()` → a origem "chat" some e a vista volta à do menu
T15 (PR-009; CB-006) [final] `packages/infra/mobile/ben/src/pages/chat/utils/__tests__/capture-openable.test.ts` — card de lembrete em estado de erro → o toque não abre o detalhe; em estado normal, abre

