# Spec — card de lembrete no chat abre o detalhe; único/recorrente claro

Decisão:   .claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/decisao.md
Versão:    menor — card de lembrete inteiro tocável abre a lista de lembretes com o detalhe dele aberto; voltar leva ao chat; rótulo de repetição ("Único" / "Todo dia" / "Dias úteis") no card, na lista e no detalhe
Para quem: P1 a pessoa ocupada que captura lembretes falando com o Ben ("say it, Ben files it")

## Fora de escopo
- Mudar como o Ben decide se um lembrete repete; criar tipos novos de lembrete.
- Dar card a mais de um item por resposta (hoje só o primeiro item criado numa resposta vira card).
- Tornar o card de nota tocável.
- Destacar a linha do lembrete na lista (o "selecionado" é o detalhe aberto).
- Endereço próprio (link) para um lembrete.
- Atualizar ao vivo o card da conversa quando o lembrete é editado no detalhe (ver CB-010).
- Mudar o editor de repetição do detalhe (opções Não / Diária / Dias úteis).

## [Specs]

### Ao ver, na conversa, um lembrete que o Ben criou
AC-001  Espera ver no card, junto do horário, se o lembrete toca uma vez ou se repete, com
        o rótulo de repetição: "Único", "Todo dia", "Dias úteis" (en: "One-time", "Every
        day", "Weekdays") (en: agente)
AC-002  Espera que um alarme, e um goal sem repetição, apareçam como "Único" (en "One-time")
AC-003  Espera que um goal que repete apareça pelo padrão: todos os dias "Todo dia" (en
        "Every day"); segunda a sexta "Dias úteis" (en "Weekdays"); os sete dias marcados
        também "Todo dia"; qualquer outro conjunto de dias, os dias abreviados na ordem da
        semana, como "Seg, Qua" (en "Mon, Wed") (agente)
AC-004  Espera que o lembrete "quando acontecer" (sem horário fixo) mostre no card "Quando
        acontecer" (en "When it happens") no lugar do rótulo de repetição (agente)
AC-005  Espera ver o rótulo em qualquer card de lembrete do histórico da conversa, não só no
        mais recente

### Ao tocar no card de lembrete
AC-006  Espera que tocar em qualquer parte do card, sem botão novo, abra a tela de lembretes
        com o detalhe daquele lembrete já aberto por cima da lista
AC-007  Espera ver um retorno visual no card ao tocar, como nos outros elementos tocáveis do
        app (agente)

### Ao fechar o detalhe aberto pelo card
AC-008  Espera ficar na lista de lembretes, com o lembrete que acabou de ver nela

### Ao voltar da lista de lembretes, tendo vindo do card
AC-009  Espera voltar direto para a conversa, no mesmo ponto em que estava, sem passar pela
        lista do menu (mesmo ponto: agente)

### Na lista de lembretes
AC-010  Espera ver em cada lembrete, ativo ou concluído, o mesmo rótulo de repetição do card
        (AC-002 a AC-004); no lembrete "quando acontecer", o tipo "Quando acontecer" que a
        linha já mostra basta, sem repetir o texto (agente)

### No detalhe do lembrete
AC-011  Espera ver o mesmo rótulo de repetição junto das informações do lembrete (horário,
        estado e tipo); no "quando acontecer", o tipo já mostrado basta (agente)
AC-012  Espera que, ao mudar a repetição no editor e salvar, o detalhe e a lista passem a
        mostrar o rótulo da nova repetição (agente)

### Continua como hoje
AC-013  Espera que o botão do card de task, ao ser tocado, continue abrindo a task como hoje
AC-014  Espera que o card de nota, ao ser tocado, continue sem abrir nada, como hoje (agente)
AC-015  Espera que pressionar e segurar a bolha de texto do Ben continue abrindo o menu de
        ações da mensagem como hoje
AC-016  Espera que abrir o menu pelo botão do topo da conversa continue abrindo na lista do
        menu, e que voltar da tela de lembretes aberta por ali continue levando à lista do
        menu, como hoje, inclusive depois de já ter vindo uma vez pelo card
AC-017  Espera que, na tela de lembretes, tocar num lembrete da lista continue abrindo o
        detalhe e fechar continue voltando à lista, como hoje
AC-018  Espera que o editor do detalhe (horário, avisos e "Repetir": Não / Diária / Dias
        úteis) continue funcionando como hoje
AC-019  Espera que o horário no card (só a hora para hoje, "amanhã 09:00", data para outros
        dias) e o tipo do lembrete (Alarme / Goal / Quando acontecer) na lista e no detalhe
        continuem como hoje
AC-020  Espera que o aviso do alarme na tela e as notificações, ao tocar, continuem como hoje

## [Requisitos técnicos]

RT-001 (AC-001)  A repetição do lembrete chega ao app junto com o card, tanto na resposta que
                 cria o lembrete quanto ao carregar o histórico, para cada card não precisar
                 de uma busca extra ao servidor.
RT-002 (AC-005)  Card de mensagem antiga mostra a repetição atual do lembrete, não a do
                 momento em que foi criado, a mesma regra que o título do card já segue hoje.
RT-003 (AC-006)  Abrir pelo card reaproveita a tela de lembretes e o detalhe que já existem,
                 sem rota nova; por isso não há link direto para um lembrete nesta versão.
RT-004 (AC-009)  O "veio do chat" vale só para aquela abertura e é esquecido ao sair da tela
                 de lembretes, para o caminho normal do menu continuar como hoje (AC-016).

## [Casos de borda]

### Ao tocar no card de lembrete
CB-001  Espera, se o lembrete já foi concluído, ver o detalhe com o estado "concluído" e sem
        o editor, e ao fechar vê-lo entre os concluídos da lista (AC-006, AC-008)
CB-002  Espera, se o lembrete não existe mais, ver no detalhe "este item sumiu — deve ter
        sido apagado em outro lugar." (en "this one's gone — must've been cleared
        elsewhere."), fechar e cair na lista, e voltar dali para a conversa (AC-006, AC-009)
CB-003  Espera ver o carregando do detalhe por cima da lista enquanto o lembrete é buscado
        (AC-006)
CB-004  Espera, com falha no servidor ou sem conexão, ver no detalhe "não deu para carregar
        — toque para tentar de novo" (en "couldn't load this one — tap to retry"), poder
        tentar de novo ali mesmo, ou fechar e voltar à conversa (AC-006, AC-009)
CB-005  Espera que tocar duas vezes rápido no card abra uma tela só, e que voltar uma vez
        leve à conversa (AC-006, AC-009) (agente)
CB-006  Espera que o card em estado de erro ("não deu para salvar este lembrete — tentar de
        novo") continue como hoje e não abra detalhe, porque não há lembrete salvo
        (AC-006) (agente)

### Ao ver o card na conversa
CB-007  Espera, quando o Ben cria dois ou mais lembretes numa resposta, ver card só do
        primeiro, como hoje, e achar os outros na lista de lembretes com o mesmo rótulo
        (AC-005, AC-010)
CB-008  Espera que o card de uma mensagem antiga mostre a repetição que o lembrete tem
        agora (AC-005, RT-002)
CB-009  Espera que, se o lembrete não existe mais ao recarregar a conversa, a mensagem
        apareça sem card, como hoje (AC-005)
CB-010  Espera, depois de mudar a repetição no detalhe e voltar à conversa, ver o card com a
        nova repetição quando a conversa for carregada de novo, como o título já se comporta
        hoje; até lá, tocar no card mostra a repetição atual no detalhe (AC-001, AC-012)
        (agente)

### Ao voltar da tela de lembretes aberta pelo card
CB-011  Espera que o voltar do sistema ou do navegador, com o detalhe aberto ou na lista,
        leve à conversa (AC-009) (agente)

### Se a lista falha com o detalhe aberto pelo card
CB-012  Espera que o detalhe continue funcionando e que, ao fechá-lo, a lista mostre o aviso
        de falha com "tentar de novo" (AC-008) (agente)

## [Prova]

PR-001  Teste unitário do domínio: o lembrete criado pela conversa chega ao card com a
        repetição certa (alarme; goal sem repetição, com "nenhuma" e sem valor; todo dia;
        segunda a sexta; dias quaisquer; quando acontecer), na criação e ao recarregar o
        histórico, neste caso com a repetição atual (AC-001, AC-002, AC-003, AC-004, AC-005,
        CB-008)
PR-002  Teste unitário no app: o rótulo de cada caso em en e pt-BR, incluindo seg a sex =
        "Dias úteis", sete dias = "Todo dia" e "Seg, Qua" (AC-002, AC-003, AC-004)
PR-003  Vídeo: na conversa, tocar num card antigo e no mais recente; o detalhe certo abre
        com retorno visual no toque; fechar leva à lista; voltar leva à conversa no mesmo
        ponto; tocar duas vezes rápido abre uma tela só; voltar pelo navegador leva à
        conversa (AC-005, AC-006, AC-007, AC-008, AC-009, CB-005, CB-011)
PR-004  Fotos em en e pt-BR: card, linha da lista e detalhe de um lembrete de cada rótulo
        (Único de alarme, Único de goal, Todo dia, Dias úteis, Seg, Qua, Quando acontecer),
        ativo e concluído, com horário e tipo iguais aos de hoje (AC-001, AC-002, AC-003,
        AC-004, AC-010, AC-011, AC-019, CB-001)
PR-005  Vídeo: no detalhe aberto pelo card, mudar a repetição de "Não" para "Diária" e
        salvar; o rótulo muda no detalhe e na lista; voltar à conversa, recarregar e ver o
        card com "Todo dia" (AC-012, AC-018, CB-010)
PR-006  Fotos: detalhe carregando; lembrete que sumiu (removido no banco de teste antes do
        toque) e o voltar à conversa; falha do servidor e sem conexão, cada um com "tentar
        de novo"; falha da lista ao fechar o detalhe (CB-002, CB-003, CB-004, CB-012)
PR-007  Vídeo do que continua como hoje: botão do card de task abre a task; card de nota não
        abre nada; segurar a bolha do Ben abre o menu de ações; menu pelo botão do topo abre
        a lista do menu, entra em lembretes, abre e fecha um detalhe e volta à lista do
        menu, uma vez antes e outra depois de ter vindo pelo card; aviso do alarme na tela
        igual ao de hoje (AC-013, AC-014, AC-015, AC-016, AC-017, AC-020)
PR-008  Foto: resposta do Ben que cria dois lembretes, com um card só e os dois na lista;
        conversa recarregada sem o card do lembrete removido (CB-007, CB-009)
PR-009  Teste de componente: card de lembrete em estado de erro não abre o detalhe ao toque
        (CB-006) (sem captura: o estado de erro com card não é reproduzível pelo fluxo real)
PR-010  Teste de ponta a ponta no navegador (390x844): dizer ao Ben "me lembra de tomar o
        remédio todo dia às 8", ver o card com "Todo dia", tocar, ver o detalhe certo com
        "Todo dia", fechar, voltar à conversa (geral)

## [Visual]

Telas:        Card de lembrete na conversa, com o rótulo de repetição e o sinal de que é
              tocável (AC-001 a AC-007); linha da lista de lembretes com o rótulo (AC-010);
              sheet de detalhe com o rótulo junto do horário, estado e tipo (AC-011)
Plataforma:   mobile, 390x844 (agente)
Destaque:     o rótulo de repetição legível de relance, ao lado do horário, sem competir com
              o título; no card, perceber que ele abre algo
Referências:  a pílula de horário do card e o selo de tipo (Alarme / Goal / Quando acontecer)
              que a lista e o detalhe já mostram (agente)
Manter:       o card como é hoje (ícone, título, pílula de horário, sombra), o selo de tipo, a
              linha da lista (título, tempo à direita, texto de apoio), o sheet de detalhe e o
              editor (AC-018, AC-019)
Livre:        a forma do rótulo (pílula própria, dentro da pílula de horário, texto com ícone
              de repetição); o ícone; o sinal de toque no card (seta à direita, só o estado
              pressionado, texto de apoio); a posição do rótulo na linha da lista e no detalhe
Dados:        lembretes da Ana: "Tomar o remédio" 08:00 Todo dia; "Ligar pro dentista"
              amanhã 09:00 Único; "Academia" 07:00 Dias úteis; "Regar as plantas" 18:00 Seg,
              Qui; "Ver se a encomenda chegou" Quando acontecer; "Pagar o aluguel" concluído,
              Único (agente)

## Gate
Aprovada:   2026-11-07 — usuário aprovou como está; premissas CB-010 (card atualiza ao recarregar), AC-003 (listar dias soltos) e conditional (só o selo de tipo na lista e no detalhe) confirmadas
Protótipo:  sim — mudança de design não óbvia (rótulo novo em três telas, card ganha toque); usuário escolheu ver variações
Partes:     1
