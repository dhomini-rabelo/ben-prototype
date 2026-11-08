# Roteiro de comprovação — header-menu-footer

Estado: APROVADO pelo usuário no gate 4.2 (como proposto). Sessão e dados: misto — backend real (server local :3333 + JWT local de um usuário do dev.db em localStorage `ben.jwttoken`) no caminho feliz; interceptação Playwright (`page.route`) para os estados de borda (S19, S20, S37, S40).
Provas que eram vídeo e viraram sequência de screenshots: PR-002 (S04–S14) e PR-011 (S51–S55).

ambiente: app com backend real, `pnpm dev` na raiz (server :3333 + Expo web :8081; `BACKEND_URL=http://localhost:3333` no `.env.development` do app); galeria, `pnpm dev:design` (:3002). `pnpm dev:mobile` sozinho NÃO serve para as provas do app real: sem server o chat não carrega histórico, contagens nem tarefas.
estado: nenhum (sessão e dados do app real montados num passo do plano: misto real + interceptação, decidido no gate 4.2)
url: http://localhost:8081/chat — chat do app em inglês, relógio do navegador fixo em 7/nov/2026, 390x844

S01 (PR-001; AC-001, AC-002) [final] o usuário abre o chat → o topo mostra, centralizados na largura, a logo, "Ben", um divisor vertical e "Sat, Nov 7", sem nenhum botão no topo
S02 (PR-001; AC-003, AC-011) [final] o usuário olha o rodapé do chat → o botão do menu está à esquerda do campo e o microfone à direita, os três na mesma linha, no desenho da V4 (`prototipo/v4.png`)
S03 (PR-001; AC-009, AC-011) [final] o usuário digita uma mensagem no campo → o botão à direita vira enviar (seta) e o botão do menu continua à esquerda
S04 (PR-002; AC-004) [final] (era vídeo) o usuário toca no botão do menu → sobe de baixo um sheet sobre o chat com Tasks, Notes, Reminders e Settings, nessa ordem
S05 (PR-002; AC-005) [final] o sheet está aberto → Tasks mostra "N active", Notes e Reminders mostram o total, e Settings não mostra contagem
S06 (PR-002; AC-006, AC-016) [final] o usuário toca em Tasks → abre a tela Tasks de hoje, com a lista e as contagens de hoje
S07 (PR-002; AC-008) [final] o usuário volta de Tasks → está no chat, sem o sheet na frente
S08 (PR-002; AC-006, AC-016) [final] o usuário abre o menu e toca em Notes → abre a tela Notes de hoje
S09 (PR-002; AC-008) [final] o usuário volta de Notes → está no chat, sem o sheet na frente
S10 (PR-002; AC-006, AC-016) [final] o usuário abre o menu e toca em Reminders → abre a tela Reminders de hoje
S11 (PR-002; AC-008) [final] o usuário volta de Reminders → está no chat, sem o sheet na frente
S12 (PR-002; AC-007, AC-017) [final] o usuário abre o menu e toca em Settings → abre a folha de Settings de hoje, com perfil, idioma e sair
S13 (PR-002; AC-008) [final] o usuário fecha Settings → está no chat, sem o sheet na frente
S14 (PR-002; AC-016) [final] o usuário abre o menu, toca em Tasks e toca numa tarefa → chega ao workspace dessa tarefa
S15 (PR-003; CB-001) [final] o usuário digita um rascunho, abre o menu e arrasta o sheet para baixo → o sheet fecha e o chat volta como estava, com o rascunho no campo
S16 (PR-003; CB-002) [final] o usuário abre o menu e toca no fundo escurecido → o sheet fecha e o chat volta como estava
S17 (PR-003; CB-003) [final] o usuário abre o menu e aperta Escape (equivalente web do voltar do aparelho) → o sheet fecha e o chat continua aberto
S18 (PR-003; CB-004) [final] o usuário toca duas vezes rápido no botão do menu → há um sheet só aberto, e um único gesto de fechar volta ao chat
S19 (PR-003; CB-011) [final] o usuário toca no menu com o histórico ainda carregando → o sheet abre com as 4 opções sobre o chat em carregamento
S20 (PR-003; CB-011) [final] o usuário toca no menu com o chat vazio → o sheet abre com as 4 opções sobre a tela de chat vazio
url: http://localhost:8081/chat — de volta ao chat com histórico
S21 (PR-004; CB-005, CB-007) [final] o usuário toca no campo para escrever → o campo fica focado e o botão do menu continua à esquerda dele, na mesma linha
S22 (PR-004; CB-006) [final] o usuário, com o campo focado e um rascunho, toca no menu → o campo perde o foco e o sheet abre
S23 (PR-004; CB-001, CB-006) [final] o usuário fecha o sheet → o chat volta com o rascunho preservado no campo
S24 (PR-004; CB-007) [final] o usuário cola um texto longo no campo → o texto continua inteiro e editável no campo (que cresce até 5 linhas e rola por dentro depois, `prototipo/v4-5.png`), e o botão do menu e o de enviar continuam dentro dos 390px
S25 (PR-004; AC-014) [final] o usuário envia a mensagem → ela aparece no chat e o Ben responde
S26 (PR-005; AC-010, CB-008) [final] o usuário toca no microfone → o rodapé inteiro vira a gravação (cancelar, onda, tempo correndo e enviar), sem o botão do menu (`prototipo/v4-3.png`)
S27 (PR-005; AC-015, CB-008) [final] o usuário cancela a gravação → o rodapé volta ao normal, com o menu à esquerda do campo, e nenhuma mensagem nova aparece no chat
S28 (PR-005; AC-010, AC-015) [final] o usuário grava de novo e toca para parar e enviar → a fala aparece como em transcrição no chat
S29 (PR-005; CB-009) [final] o usuário abre o menu enquanto a fala é transcrita → o sheet abre sobre o chat
S30 (PR-005; AC-015, CB-009) [final] o usuário fecha o sheet depois da transcrição → a mensagem da fala está no chat
S31 (PR-006; CB-010) [final] o usuário abre o chat com o microfone sem permissão → o botão do microfone aparece desabilitado e o botão do menu e o campo aparecem ativos
S32 (PR-006; CB-010) [final] o usuário, sem permissão de microfone, digita no campo → o botão à direita vira enviar e o menu abre o sheet
url: http://localhost:8081/chat — idioma pt-BR (`@ben/language` = `pt-BR`), relógio fixo em 7/nov/2026
S33 (PR-007; AC-001, CB-012) [final] o usuário abre o chat em português → o topo mostra "sáb., 7 de nov." ao lado do divisor, centralizado
S34 (PR-007; CB-012) [final] o usuário toca no botão "Menu" → o sheet mostra Tarefas, Notas, Lembretes e Configurações
url: http://localhost:8081/chat — inglês
S35 (PR-008; AC-018) [final] o usuário abre o chat com mensagens → a última mensagem fica encostada no rodapé, sem vão grande acima do campo
S36 (PR-008; AC-018) [final] o usuário abre o chat com tarefa ativa → o seletor de tarefa ativa aparece logo abaixo do topo
S37 (PR-008; AC-018) [final] o usuário abre o chat com um aviso no topo (ex.: sem conexão) → o aviso aparece abaixo do topo
S38 (PR-008; AC-018) [final] o usuário segura uma mensagem → aparece o menu de ações da mensagem
S39 (PR-008; AC-018) [final] o usuário abre os detalhes de uma resposta do Ben → aparece a folha de detalhes
S40 (PR-008; AC-018) [final] o usuário abre o chat sem nenhuma mensagem → aparece a tela de chat vazio, com o botão do menu no rodapé
url: http://localhost:8081/tasks/{id de uma tarefa} — workspace de tarefa
S41 (PR-009; AC-019) [final] o usuário abre o workspace → o topo é o de hoje, sem logo centralizada nem data
S42 (PR-009; AC-019, AC-011) [final] o usuário olha o rodapé do workspace → o botão de anexar está à esquerda do campo e o microfone à direita, no mesmo desenho do chat (pílula da V4)
S43 (PR-009; AC-019) [final] o usuário digita no campo e envia → o botão vira enviar e a mensagem aparece no workspace
S44 (PR-009; AC-019) [final] o usuário toca no microfone → o rodapé vira a mesma barra de gravação do chat
url: http://localhost:3002/app/chat-populated — galeria
S45 (PR-010; AC-012) [final] o usuário abre a tela de chat → o topo mostra logo, "Ben", divisor e "Sat, Nov 7" centralizados, sem botão
url: http://localhost:3002/app/task-picker-populated
S46 (PR-010; AC-012) [final] o usuário abre a seleção de tarefa → o topo é o mesmo topo centralizado, com a data
url: http://localhost:3002/app/item-detail-note
S47 (PR-010; AC-012) [final] o usuário abre o detalhe → o topo é o mesmo topo centralizado, com a data
url: http://localhost:3002/app/chat-populated
S48 (PR-010; AC-013, AC-011) [final] o usuário olha o rodapé do chat → o botão do menu está à esquerda do campo, igual a `prototipo/v4.png`
url: a rota nova do chat com o sheet aberto (nome definido no plano, p.ex. `/app/chat-menu-open`)
S49 (PR-010; AC-013, AC-004) [final] o usuário abre o estado do sheet → o chat com o sheet de Tasks, Notes, Reminders e Settings aberto, igual a `prototipo/v4-4.png`
url: http://localhost:3002/app/chat-recording
S50 (PR-010; AC-013, AC-011) [final] o usuário abre o estado gravando → o rodapé vira a gravação sem o botão do menu, igual a `prototipo/v4-3.png`
url: http://localhost:8081/chat — inglês
S51 (PR-011) [final] (era vídeo) o usuário abre o chat e envia um texto → o topo está centralizado e o Ben responde ao texto
S52 (PR-011) [final] o usuário grava e envia uma fala → a fala transcrita aparece no chat
S53 (PR-011) [final] o usuário abre o menu pelo rodapé e entra em Tasks → aparece a tela Tasks
S54 (PR-011) [final] o usuário volta de Tasks e abre Settings → está no chat e a folha de Settings aparece sobre ele
S55 (PR-011) [final] o usuário fecha Settings → está de volta ao chat

comando: n/a
T01: n/a (nenhuma RT ou PR de lane teste)
