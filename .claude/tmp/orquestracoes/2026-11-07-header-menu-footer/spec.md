# Spec — Topo centralizado e menu no footer do chat

Decisão:   .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/decisao.md
Versão:    completa — topo centralizado (logo + Ben | data), botão do menu à esquerda do campo abrindo um sheet com as 4 opções atuais, e campo de texto e gravação de voz com layout e design melhorados
Para quem: P1 quem usa o Ben com uma mão, no meio do dia corrido (persona "busy-day") — persona única; nenhuma linha usa marca de persona

## Fora de escopo
- Mudar as opções do menu (Tasks, Notes, Reminders, Settings) ou o conteúdo de cada uma delas.
- Navegação por abas no rodapé.
- Botão de menu no workspace de tarefa: o botão novo existe só no rodapé do chat (agente).
- Atualizar a data do topo na virada da meia-noite com o app aberto (hoje também não atualiza) (agente).
- Implementar nesta run: a implementação é da /implementar-e-validar.

## [Specs]

### Ao abrir o chat
AC-001  Espera ver no topo, centralizados na largura da tela, a logo, o nome "Ben", um divisor
        vertical e a data de hoje no formato curto de hoje: "Sat, Nov 7" em inglês e
        "sáb., 7 de nov." em português.
AC-002  Espera que o topo não tenha mais o botão do menu nem outro botão no lugar dele.
AC-003  Espera ver o botão do menu no rodapé, à esquerda do campo de texto e na mesma linha
        dele, com o botão do microfone (ou de enviar, quando há texto) à direita do campo.

### Ao tocar no botão do menu
AC-004  Espera ver subir de baixo, sobre o chat, um sheet com as 4 opções de hoje, na ordem de
        hoje: Tasks, Notes, Reminders e Settings.
AC-005  Espera ver nas opções as mesmas contagens de hoje: "N active" em Tasks e o total em
        Notes e em Reminders; Settings sem contagem (agente).

### Ao escolher uma opção no sheet
AC-006  Espera que Tasks, Notes e Reminders abram a mesma tela de hoje, com o mesmo conteúdo.
AC-007  Espera que Settings abra a mesma folha de Settings de hoje.
AC-008  Espera que voltar de Tasks, Notes ou Reminders, ou fechar Settings, leve de volta ao
        chat, sem passar de novo pelo sheet (agente).

### Ao escrever ou gravar no rodapé
AC-009  Espera continuar digitando no campo e enviando pelo botão à direita, que vira enviar
        quando há texto.
AC-010  Espera começar a gravar pelo microfone à direita, ver que está gravando com o tempo
        correndo, e poder parar para enviar ou cancelar sem enviar.
AC-011  Espera ver o campo de texto e a gravação de voz no desenho escolhido entre as
        variações do protótipo, e não no desenho de hoje.

### Ao abrir a galeria de design
AC-012  Espera ver as telas de chat, de seleção de tarefa e de detalhe com o mesmo topo
        centralizado do app (logo, "Ben", divisor e data) (agente: a galeria hoje não mostra a
        data).
AC-013  Espera ver na galeria o chat com o botão do menu à esquerda do campo, o chat com o
        sheet do menu aberto e o chat gravando, todos no desenho escolhido no protótipo
        (agente).

### Continua como hoje
AC-014  Espera que enviar uma mensagem de texto pelo chat continue como hoje: ela aparece no
        chat e o Ben responde.
AC-015  Espera que gravar uma mensagem de voz no chat continue como hoje: ao parar, a fala é
        transcrita e enviada; ao cancelar, nada é enviado.
AC-016  Espera que as telas de Tasks, Notes e Reminders continuem como hoje: listas, contagens,
        detalhe de nota e de lembrete, e tocar numa tarefa abre o workspace dela.
AC-017  Espera que Settings continue como hoje: perfil, idioma e sair.
AC-018  Espera que o resto do chat continue como hoje: mensagens encostadas no rodapé, seletor
        de tarefa ativa logo abaixo do topo, aviso do topo, ações de uma mensagem, detalhes de
        uma resposta e a tela de chat vazio.
AC-019  Espera que no workspace de tarefa o topo continue como hoje e que anexar, digitar,
        enviar e gravar continuem funcionando como hoje, agora com o mesmo desenho novo do
        campo e da gravação do chat (agente, RT-004).

## [Requisitos técnicos]

RT-001 (AC-004)  O sheet do menu segue o padrão de sheet que o app já tem (Settings, seleção de
                 tarefa): sobe de baixo com fundo escurecido e fecha arrastando para baixo, sem
                 biblioteca nova, para ter o mesmo comportamento das outras folhas e nenhuma
                 dependência a mais.
RT-002 (AC-006, AC-007)  As telas de Tasks, Notes, Reminders e Settings são reaproveitadas como
                 estão; muda só por onde se entra nelas e para onde se volta, porque o
                 conteúdo está fora de escopo e reescrevê-las só traz risco.
RT-003 (AC-012, AC-013)  A galeria é atualizada antes do app, e o app segue o desenho aprovado
                 nela, porque é o fluxo do projeto (a tela é desenhada na galeria antes do
                 mobile) e porque o topo das duas já divergiu (só o app tem a data).
RT-004 (AC-011, AC-019)  O campo de texto e a barra de gravação são as mesmas peças no chat e no
                 workspace de tarefa; o desenho novo vale para as duas telas, e só o botão do
                 menu é exclusivo do chat, para não manter dois desenhos de rodapé (agente).
RT-005 (geral)   A doc de UX do projeto (`ux-philosophy.md`) é atualizada no mesmo trabalho: o
                 menu passa a abrir do rodapé, em sheet, e não mais do topo pela lateral; "sem
                 abas no rodapé" continua. Motivo: a doc é fonte da verdade do design e hoje
                 diria o contrário da tela.
RT-006 (AC-003)  O botão do menu tem área de toque de pelo menos 44px e rótulo de leitura de
                 tela "Menu" nos dois idiomas, porque é o alvo mínimo de toque do guia de design
                 do projeto e a ação principal de navegação (agente).
RT-007 (AC-012, AC-013)  Na galeria, o estado do menu lateral que lista as 4 opções dá lugar ao
                 estado do chat com o sheet aberto; os estados das telas de Tasks, Notes e
                 Reminders ficam, para a galeria não mostrar dois menus diferentes (agente).

## [Casos de borda]

### Com o sheet do menu aberto
CB-001  Espera fechar o sheet arrastando-o para baixo e voltar ao chat como estava, com o
        rascunho do campo preservado (AC-004, RT-001)
CB-002  Espera fechar o sheet tocando no fundo escurecido, com o mesmo resultado (AC-004)
CB-003  Espera que o voltar do aparelho feche o sheet sem sair do chat (AC-004) (agente)
CB-004  Espera que tocar duas vezes rápido no botão do menu abra um sheet só (AC-004) (agente)

### Com o teclado aberto
CB-005  Espera ver o botão do menu acima do teclado, à esquerda do campo, junto com o campo
        (AC-003)
CB-006  Espera que tocar no menu com o teclado aberto feche o teclado e abra o sheet, com o
        rascunho preservado ao voltar (AC-004) (agente)

### Com texto longo no campo
CB-007  Espera que um texto longo continue inteiro e editável no campo, sem empurrar o botão do
        menu nem o de enviar para fora da tela de 390px de largura (AC-003, AC-009)

### Durante a gravação
CB-008  Espera que o rodapé inteiro vire a gravação, sem o botão do menu, e que o botão volte à
        esquerda do campo ao parar ou cancelar (AC-003, AC-010)
CB-009  Espera poder abrir o menu enquanto a fala é transcrita e encontrar a mensagem no chat
        ao voltar (AC-004, AC-015) (agente)

### Quando o microfone não está liberado
CB-010  Espera ver o microfone desabilitado como hoje, com o botão do menu e o campo de texto
        funcionando (AC-003, AC-009)

### Enquanto o chat carrega ou está vazio
CB-011  Espera poder abrir o menu enquanto o histórico carrega e com o chat vazio (AC-004)
        (agente)

### Em português
CB-012  Espera ver a data como "sáb., 7 de nov." e as opções do sheet como Tarefas, Notas,
        Lembretes e Configurações, com "Menu" como rótulo do botão (AC-001, AC-004, RT-006)

## [Prova]

PR-001  Foto do app em 390x844, em inglês: chat com o topo centralizado (logo, "Ben", divisor,
        "Sat, Nov 7"), sem botão no topo, e o rodapé com o menu à esquerda do campo e o
        microfone à direita; com texto no campo, o botão de enviar (AC-001, AC-002, AC-003,
        AC-009, AC-011)
PR-002  Vídeo do app: tocar no menu, ver o sheet subir com as 4 opções e as contagens; abrir
        Tasks e voltar ao chat; o mesmo com Notes e Reminders; abrir Settings e fechar; dentro
        de Tasks, tocar numa tarefa e chegar ao workspace dela (AC-004, AC-005, AC-006, AC-007,
        AC-008, AC-016, AC-017)
PR-003  Vídeo do app: fechar o sheet arrastando, tocando no fundo e pelo voltar; tocar duas
        vezes rápido no menu e ver um sheet só; abrir o menu com o chat carregando (CB-001,
        CB-002, CB-003, CB-004, CB-011)
PR-004  Vídeo do app: digitar com o teclado aberto, ver o menu ao lado do campo, tocar no menu
        e voltar com o rascunho; colar um texto longo e enviar, ver a mensagem e a resposta
        (AC-014, CB-005, CB-006, CB-007)
PR-005  Vídeo do app: gravar, ver o rodapé virar a gravação sem o menu, cancelar e ver que nada
        foi enviado; gravar de novo, parar, abrir o menu durante a transcrição e encontrar a
        mensagem ao voltar. Se o navegador de teste não liberar o microfone, a gravação é
        mostrada em foto do estado gravando na galeria e a linha fica marcada (sem captura)
        para o app (AC-010, AC-011, AC-015, CB-008, CB-009)
PR-006  Foto do app: microfone desabilitado sem permissão, com menu e campo ativos (CB-010)
PR-007  Fotos do app em português: topo com "sáb., 7 de nov." e sheet com Tarefas, Notas,
        Lembretes e Configurações (CB-012)
PR-008  Foto do app: o resto do chat como hoje, com mensagens encostadas no rodapé, seletor de
        tarefa ativa abaixo do topo, aviso do topo, ações de uma mensagem, detalhes de uma
        resposta e o chat vazio (AC-018)
PR-009  Vídeo do app: workspace de tarefa com o topo de hoje; anexar, digitar, enviar e gravar
        com o desenho novo do campo e da gravação (AC-019)
PR-010  Fotos da galeria (:3002) em 390x844: chat, seleção de tarefa e detalhe com o topo
        centralizado; chat com o menu no rodapé, com o sheet aberto e gravando, comparados com
        a variação escolhida no protótipo (AC-011, AC-012, AC-013)
PR-011  Vídeo de ponta a ponta no app em 390x844: abrir o chat, ver o topo, enviar um texto,
        gravar e enviar uma fala, abrir o menu pelo rodapé, ir a Tasks, voltar ao chat, abrir
        Settings e fechar (geral)

## [Visual]

Telas:        Chat com topo centralizado e rodapé com o menu (AC-001, AC-002, AC-003, AC-009,
              AC-011); chat com o sheet do menu aberto (AC-004, AC-005); chat gravando
              (AC-010, AC-011); seleção de tarefa e detalhe na galeria, só o topo (AC-012);
              rodapé do workspace com o desenho novo (AC-019)
Plataforma:   celular, 390x844, na galeria e no app (agente)
Destaque:     o topo limpo, só marca e data, e o rodapé como a zona de ação do polegar: menu,
              campo e microfone na mesma linha
Referências:  o divisor vertical entre "Ben" e a data, que o topo do app já usa (agente); as
              folhas que o app já tem, Settings e seleção de tarefa (agente); apps de mensagem
              que ancoram as ações ao campo de escrever (agente)
Manter:       logo e "Ben" atuais; formato da data; cores e tipografia do tema; mensagens
              encostadas no rodapé; seletor de tarefa ativa abaixo do topo e aviso do topo; o
              conteúdo de Tasks, Notes, Reminders e Settings; menu à esquerda do campo e
              microfone/enviar à direita, na mesma linha; o rodapé inteiro vira a gravação
              enquanto grava (AC-003, AC-018, CB-008)
Livre:        (1) o campo de texto: altura, cantos, fundo, borda, texto de exemplo, uma linha ou
              crescer com o texto; (2) o botão do microfone/enviar: forma, tamanho, destaque;
              (3) o botão do menu: ícone, com ou sem fundo, solto ao lado do campo ou dentro da
              mesma pílula; (4) a gravação: onda, tempo, como parar e como cancelar (deslizar,
              botão ou os dois); (5) o sheet: cabeçalho com título, marca ou só a alça, e o
              desenho das linhas (ícone, contagem); (6) o espaço entre logo, divisor e data
Dados:        chat com 6 mensagens (uma nota, um lembrete para "amanhã 9h", um card de tarefa),
              3 tarefas ativas; contagens "3 active", 12 notas, 5 lembretes; data "Sat, Nov 7"
              e "sáb., 7 de nov."; um rascunho longo no campo para o estado escrevendo (agente)

## Gate
Aprovada:   2026-11-07
Protótipo:  sim — usuário escolheu ver variações; a melhoria do input e da gravação se define na escolha
Partes:     1
Respostas do gate: o desenho novo do campo e da gravação vale no chat e no workspace de tarefa (usuário); voltar de Tasks/Notes/Reminders ou fechar Settings leva direto ao chat (usuário)
