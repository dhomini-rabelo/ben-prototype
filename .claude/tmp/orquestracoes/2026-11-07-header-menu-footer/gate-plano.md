# Gate do plano (4.4) — header-menu-footer

Plano completo: [plano.md](plano.md)

## Resumo do plano

### O que muda

#### Checkpoint 1 — Galeria no desenho V4
- **Topo único nas shells.** Chat, seleção de tarefa e detalhe passam a mostrar logo, "Ben", divisor e "Sat, Nov 7" centralizados, sem botão.
- **Rodapé V4.** O campo vira a pílula de 44px com o botão do menu à esquerda e o microfone/enviar à direita; nas telas de workspace o botão da esquerda é o anexar. A gravação vira componente próprio (X, ponto, tempo, onda, enviar), usado no chat e no workspace.
- **Estado novo `/app/chat-menu-open`.** O chat com o sheet das 4 opções aberto entra; os estados do menu lateral (`menu-sidebar-*`) saem; Tasks, Notes e Reminders ficam. Nos estados de Settings, o fundo atrás da folha passa de menu lateral para chat.

#### Checkpoint 2 — Topo, campo e gravação novos no app
- **Topo centralizado.** O topo do chat fica só com logo, "Ben", divisor e data, sem o botão do menu.
- **Campo V4 compartilhado.** O campo de chat e o do workspace são a mesma pílula de 44px, que cresce até 5 linhas e depois rola. O envio passa a ser só pelo botão.
- **Gravação V4 compartilhada.** O cartão alto e o gesto de deslizar saem; ficam o X para cancelar, o tempo correndo, a onda (que passa a aparecer no navegador) e o enviar.
- **Botão do menu no rodapé.** Por enquanto ele abre o menu de tela cheia de hoje. O sheet chega no checkpoint 3.

#### Checkpoint 3 — Sheet do menu e caminho de volta
- **Sheet do menu no chat.** Ele sobe de baixo com fundo escurecido e fecha arrastando, tocando no fundo ou com voltar/Escape.
- **Entrada e volta.** Tasks, Notes e Reminders abrem a tela de hoje direto, e voltar delas cai no chat. Settings abre sobre o chat. O conteúdo das quatro não muda.

#### Checkpoint 4 — Doc e limpeza
- **`ux-philosophy.md`** passa a dizer que o menu abre do rodapé, em sheet. A regra "sem abas no rodapé" continua.
- **Remoção da rota de protótipo** `header-menu-footer`. Os protótipos `alarme-tela-cheia` e `lembrete-criado-abrir-tela` ficam.

### Decisões que travei sozinho
- **Envio só pelo botão.** Com o campo de várias linhas, o Enter quebra linha e não envia mais (hoje envia). O AC-009 fala em "enviando pelo botão".
- **Gravação sem deslizar para cancelar.** Cancelar passa a ser só o X da V4. As strings "Slide up to cancel" e "Recording" saem.
- **Botão do menu com 32px visuais e toque de 44px.** O botão tem 32px na tela e `hitSlop` até 44px, para cumprir o RT-006 sem mudar a V4. O microfone, o enviar, o X e o anexar seguem a mesma regra.
- **Settings abre sobre o próprio chat**, como a folha de detalhes de uma resposta. Tasks, Notes e Reminders continuam na rota `/menu`, que agora abre direto na tela escolhida e volta ao chat.
- **Sheet com peça reutilizável nova.** O sheet do menu usa uma peça nova, `DraggableSheetOverlay` (Modal, fundo escurecido e arrastar para fechar). A seleção de tarefa continua com a cópia própria dela.
- **Ordem do botão no rodapé.** No checkpoint 2 o botão do menu já fica no rodapé, mas abre o menu de tela cheia de hoje. Assim o app nunca fica sem menu entre os checkpoints.
- **Estado das provas.** O server das provas sobe com `PERSISTENCE_DRIVER=sqlite` (o padrão de dev guarda tudo em memória). Um script em `.claude/tmp/` cria dois usuários no `dev.db` (que hoje está vazio): um com dados semeados pela API e outro sem mensagens. S20 e S40 usam o usuário vazio com backend real. Só S19 (histórico carregando) usa interceptação (`page.route`), e S37 usa `context.setOffline`.
- **Nenhuma prova acrescentada nem dispensada.** As provas S01 a S55 entram como aprovadas, com a rodada marcada.

### O que fica de fora
- Migrar a seleção de tarefa para a peça de sheet nova.
- Atualizar as docs de `code-get-project-context` que citam o menu lateral (é da `task-update-project-context`).
- O teste do voltar físico do Android e do teclado virtual real (só no aparelho).

### Como se prova
- AC-001 — o topo mostra logo, "Ben", divisor e "Sat, Nov 7" / "sáb., 7 de nov." centralizados (S01, S33)
- AC-002 — não há botão no topo (S01)
- AC-003 — o menu fica à esquerda do campo e o microfone à direita, na mesma linha (S02, S21; RT-006 na lane codigo)
- AC-004 — tocar no menu sobe o sheet com as 4 opções na ordem (S04, S34, S49)
- AC-005 — as contagens são "N active" e os totais, e Settings não tem contagem (S05)
- AC-006 — Tasks, Notes e Reminders abrem as telas de hoje (S06, S08, S10)
- AC-007 — Settings abre a folha de hoje (S12)
- AC-008 — voltar ou fechar leva ao chat sem o sheet (S07, S09, S11, S13)
- AC-009 — o botão da direita vira enviar com texto (S03, S32)
- AC-010 — a gravação mostra o tempo correndo, cancela e envia (S26, S28)
- AC-011 — o campo e a gravação estão no desenho V4 (S02, S03, S42, S48, S50)
- AC-012 — o topo centralizado aparece nas telas da galeria (S45, S46, S47)
- AC-013 — a galeria mostra o menu no rodapé, o sheet aberto e a gravação (S48, S49, S50)
- AC-014 — o texto enviado aparece e o Ben responde (S25, S51)
- AC-015 — a fala parada é transcrita e enviada; a cancelada não envia nada (S27, S28, S30, S52)
- AC-016 — as telas de Tasks, Notes e Reminders e o workspace de uma tarefa funcionam como hoje (S06, S08, S10, S14)
- AC-017 — Settings mostra perfil, idioma e sair (S12)
- AC-018 — o resto do chat continua igual (S35 a S40)
- AC-019 — o workspace mantém o topo e ganha o campo e a gravação novos (S41 a S44)


## Cobertura e desvios da spec
7/7 RT · 11/11 PR · 12/12 CB. Desvios da spec: nenhum. CB-003, CB-005 e CB-006 são provadas pelo equivalente no web (Escape e campo focado), como decidido no gate 4.2.

## Roteiro
Marco 1 (checkpoint 2): S01, S02, S03, S21, S24, S25, S26, S27, S42, S43, S44. Marco 2 (checkpoint 3): S04 a S18. Rodada final: S01 a S55.
Nenhuma prova foi acrescentada ou dispensada. S20 e S40 passam a usar um usuário vazio de verdade em vez de interceptação, e a asserção continua a mesma.

## Onda
Onda única, sem nada pendente.

## Seção nova
"Estado das provas — passo E1": o script que cria os dois usuários de teste no dev.db e imprime os tokens. Ela existe porque o projeto não tem mecanismo de fixtures, e a decisão do gate 4.2 (backend real misturado com mock) precisa de um passo que monte esse estado.

## Revisão do plano
Aprovado na rodada 3, depois de duas voltas ao planejador: 5 bloqueios na r1 e 1 na r2, todos consertados. Revisões: [r1](revisao-plano-1.md), [r2](revisao-plano-2.md), [r3](revisao-plano-3.md).
Desvios de padrão declarados e aceitos pelo revisor:
- Passos 8 e 13: o `WaveBar` e o ponto da gravação recebem estilo por `style`, porque o `Animated.View` ignora `className` no Expo web.
- Passos 1, 3, 11 e 17: o texto usa `text-[13px]` e `text-[15px]`, porque o token de 15px é semibold e feito para botão, e o de 13px não existe. O app já usa os dois tamanhos.
- Passo 20: a peça nova `DraggableSheetOverlay` convive com a cópia própria do `task-picker-sheet`, porque migrar a seleção de tarefa ficou fora do escopo.
