# Spec — Alarme em tela cheia com som para lembretes de horário

Decisão:   .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/decisao.md
Versão:    menor — Android por APK, só lembretes de horário: tela cheia sobre o bloqueio + som de alarme em loop até Parar, Soneca ou Concluir; app aberto (Android e web) mostra a mesma tela
Para quem: P1 usuário ocupado do Ben que cria lembretes por voz e confia no Ben para lembrar na hora

## Fora de escopo
- iOS (nem AlarmKit) e qualquer mudança de comportamento no iPhone.
- Play Store e declarações de política do Google Play.
- Missão para dispensar o alarme e limite de sonecas (o "3" do Alarmy).
- Lembretes do tipo meta e condicional (continuam com o painel atual).
- Criação de lembrete por voz e resumo diário.
- Alarme com a aba do navegador fechada (web só com o app aberto).
- Alarme depois de "Forçar parada" do app nas configurações do Android (o sistema cancela os alarmes do app).

## [Specs]

### Quando chega a hora de um lembrete de horário, com o celular bloqueado ou o app fechado (Android)
AC-001  Espera que a tela do celular acenda no minuto marcado e mostre a tela de alarme
        ocupando a tela toda, por cima da tela de bloqueio, sem precisar desbloquear.
AC-002  Espera ouvir um som de alarme que se repete sem parar, no volume de alarme, mesmo com
        o celular no silencioso, até tocar em Parar, Soneca ou Concluir, por até 10 minutos.
AC-003  Espera ver na tela de alarme a hora atual em destaque, a data e o título do lembrete,
        só o título, sem repetir o horário do compromisso (pedido do usuário na escolha do
        protótipo).
AC-004  Espera que só o aviso da hora marcada toque como alarme em tela cheia; os avisos
        antecipados (minutos antes, na manhã do dia, na véspera) seguem como a notificação
        comum de hoje.

### Quando chega a hora com o app aberto (Android ou web)
AC-005  Espera ver a mesma tela de alarme, em tela cheia e com o som, no lugar do painel pequeno
        de hoje: no Android no minuto marcado; na web em até 15 segundos.

### Na tela de alarme
AC-006  Espera tocar em Parar para silenciar e fechar a tela; esse aviso não toca de novo.
AC-007  Espera tocar em Soneca, escolher uma das opções de hoje (10 min, 30 min, 1 h, 2 h,
        amanhã de manhã) e o alarme tocar de novo, em tela cheia e com som, no horário escolhido.
AC-016  Espera ver, no topo da escolha da Soneca, um slider para escolher um tempo próprio
        (de 5 min a 2 h, de 5 em 5 min), acima das opções de hoje, e o alarme tocar
        de novo depois do tempo escolhido.
AC-008  Espera tocar em Concluir para silenciar, fechar e marcar o lembrete como feito, sem que
        ele toque de novo.
AC-009  Espera que, depois de agir com o celular bloqueado, o celular volte para a tela de
        bloqueio, sem ficar desbloqueado (agente).

### Ao abrir o app no Android 14 ou mais novo sem a tela cheia liberada
AC-010  Espera ver, uma vez, um aviso que explica que sem liberar a tela cheia o alarme chega só
        como notificação, com um botão que leva direto à configuração do sistema e um "Agora não".
AC-011  Espera ver nas configurações de lembretes do app se a tela cheia está liberada e, quando
        não está, um botão para liberar (agente).

### Continua como hoje
AC-012  Espera que, quando chega a hora de um lembrete de meta ou condicional, continue
        abrindo o painel de hoje, com as mesmas opções, como hoje.
AC-013  Espera que, sem a tela cheia liberada, o lembrete de horário continue chegando como a
        notificação comum de hoje, com o mesmo som e aparência, como hoje.
AC-014  Espera que o resumo diário continue chegando como hoje, na notificação e no painel.
AC-015  Espera que criar, editar e ver lembretes no menu e no detalhe continue como hoje.

## [Requisitos técnicos]

RT-001 (geral)   Só Android, entregue em APK novo (dev build/`preview`); nada muda no iOS. Motivo:
                 tela por cima do bloqueio com o app fechado só existe por API nativa do Android,
                 e o app não roda em Expo Go nem tem atualização sem APK.
RT-002 (AC-001, AC-010, AC-011, AC-013)  Declarar `USE_FULL_SCREEN_INTENT`; no Android 14+
                 conferir se está liberada (`canUseFullScreenIntent`) ao abrir o app e ao voltar
                 para ele, levar o usuário à tela do sistema para liberar, e reagendar os alarmes
                 conforme a resposta: liberada usa a tela cheia, negada usa o canal e a
                 notificação de hoje. Motivo: no Android 14+ é acesso especial que vem desligado
                 para app que não é de alarme ou ligação, e o usuário pode revogar a qualquer hora.
RT-003 (AC-001, AC-009)  A tela do app abre por cima da tela de bloqueio e acende a tela
                 (`showWhenLocked`/`turnScreenOn`), configurado por config plugin, porque a pasta
                 `android/` é gerada e fica fora do git. Motivo: sem isso a tela cheia abre por
                 trás do bloqueio e o celular continua apagado.
RT-004 (AC-002)  Canal de notificação novo, só para o alarme, com som próprio embutido no app,
                 uso de áudio de alarme (`USAGE_ALARM`) e categoria alarme; o som repete até a
                 ação (`FLAG_INSISTENT` ou som tocado por serviço em primeiro plano com
                 `USAGE_ALARM`). Motivo: o canal `alarmes` de hoje usa o som padrão de notificação,
                 que o silencioso corta, e um canal Android não troca de som depois de criado.
                 Tocar no silencioso não está confirmado em doc oficial: o plano escolhe o
                 mecanismo que garante isso e diz como foi conferido.
RT-005 (AC-001, AC-004, AC-007)  Agendar com precisão de despertador (alarm clock), com o
                 `USE_EXACT_ALARM` que o app já declara, e reagendar depois de reiniciar o
                 celular. Motivo: o agendamento aproximado atrasa minutos com economia de
                 bateria, e o Android apaga os alarmes no reinício.
RT-006 (AC-005)  Com o app em primeiro plano no Android, a chegada da notificação abre a tela de
                 alarme na hora, sem esperar a checagem de 15 s, e só um som toca (a notificação
                 não toca junto com a tela). Motivo: evitar atraso e alarme duplicado.
RT-007 (AC-005)  Na web, a tela e o som vêm da checagem de 15 s com o app aberto; o som só toca se
                 a página já recebeu um clique ou toque (política de autoplay do navegador).
                 Motivo: o navegador bloqueia som sem gesto e não roda nada com a aba fechada.
RT-008 (AC-006, AC-007, AC-008)  Parar, Soneca e Concluir silenciam e fecham no aparelho antes
                 de falar com o servidor; a ação fica guardada e é reenviada até dar certo; a
                 soneca reagenda o alarme local na hora. Motivo: sem rede, o alarme não pode ficar
                 tocando nem voltar a tocar por um aviso já atendido.
RT-009 (AC-006, AC-007, AC-008)  O servidor registra, para cada ação (parar, soneca, concluir),
                 o horário do disparo e o instante da ação. Motivo: é o sinal de sucesso (ação em
                 até 5 min); hoje o acknowledge guarda só até qual disparo foi visto e o concluir
                 guarda só `completedAt`, sem o disparo.
RT-010 (AC-001, AC-003)  A tela de alarme aberta pela notificação mostra título e horário com os
                 dados da própria notificação, sem esperar a rede. Motivo: app frio e sem rede
                 precisa mostrar o alarme na hora; a lista do servidor chega depois.
RT-011 (AC-002)  Teto de 10 minutos de som por disparo; ao passar, o som para e fica uma
                 notificação de alarme perdido. Motivo: alarme esquecido tocando por horas
                 descarrega a bateria e incomoda quem está perto; é o padrão de relógios Android.
RT-012 (AC-007)  As opções de soneca vêm do servidor como hoje; sem rede, a soneca de 10 minutos
                 é calculada no aparelho. Motivo: a lista depende do servidor (amanhã de manhã usa
                 o horário configurado), e a soneca não pode falhar offline.
RT-013 (RT-002, RT-003, RT-004, RT-005)  A parte nativa do Android (tela cheia, canal e som em
                 loop, alarme exato, ações) usa a lib `react-native-notify-kit`, fork mantido do
                 Notifee. Motivo: escolha do usuário no gate (rodada 2); a compatibilidade com
                 Expo 54 e com o expo-notifications é conferida no reconhecimento (4.1).

## [Casos de borda]

### Quando a tela cheia não está liberada
CB-001  Espera receber a notificação comum de hoje no horário e, ao tocar nela, ver a tela de
        alarme sem som, com Parar, Soneca e Concluir (AC-013, AC-005) (agente)
CB-002  Espera que, se revogar a liberação depois, os próximos alarmes cheguem como notificação
        comum e as configurações de lembretes mostrem de novo o botão para liberar (AC-011,
        RT-002)

### Quando o celular está em uso na hora
CB-003  Espera ver um aviso no topo da tela, com o som de alarme e os botões Parar e Soneca, e
        que tocar no aviso abra a tela de alarme (AC-001, AC-002) (agente)

### Quando o app estava fechado
CB-004  Espera que o alarme toque e a tela abra mesmo com o app removido dos recentes ou depois
        de reiniciar o celular, sem abrir o app antes (AC-001, RT-005)

### Na soneca
CB-005  Espera que cada soneca, quantas vezes adiar, toque de novo em tela cheia e com som
        (AC-007) (agente)
CB-006  Espera, sem rede, adiar 10 minutos mesmo assim e o alarme tocar de novo em 10 minutos;
        a escolha chega ao servidor quando a rede voltar (AC-007, RT-012) (agente)

### Sem rede ao parar ou concluir
CB-007  Espera que o som pare e a tela feche na hora mesmo sem rede, sem tocar de novo por esse
        aviso, e que o lembrete apareça como feito ou visto quando a rede voltar (AC-006,
        AC-008, RT-008)

### Quando dois ou mais alarmes tocam juntos
CB-008  Espera ver um alarme por vez, o mais antigo primeiro; ao agir nele, o próximo aparece em
        seguida, com o som continuando até o último (AC-001, AC-005)

### Quando ninguém mexe no alarme
CB-009  Espera que o som pare depois de 10 minutos e fique uma notificação de alarme perdido,
        que ao ser tocada abre a tela de alarme sem som (AC-002, RT-011)

### Quando o lembrete mudou antes de tocar
CB-010  Espera que um lembrete apagado, concluído ou com horário mudado no app não toque no
        horário antigo (AC-001, AC-004)

### Quando outro painel do app está aberto
CB-011  Espera que a tela de alarme apareça por cima do resumo diário e de qualquer tela do app
        (AC-005) (agente)

### Na web, sem clique antes na página
CB-012  Espera ver a tela de alarme mesmo com o som bloqueado pelo navegador, com um aviso
        "toque para ouvir" que liga o som (AC-005, RT-007) (agente)

### Sem permissão de notificações
CB-013  Espera ver nas configurações de lembretes que os alarmes não vão tocar com o app
        fechado, com um botão para liberar as notificações (AC-011) (agente)

## [Prova]

PR-001  Teste unitário: o agendamento de um lembrete de horário usa tela cheia e o canal de
        alarme quando a tela cheia está liberada, e o canal e a notificação de hoje quando não
        está; cada aviso do lembrete vira um alarme; meta, condicional e resumo diário seguem o
        canal de hoje; lembrete apagado, concluído ou com horário mudado é desagendado (AC-001,
        AC-002, AC-004, AC-012, AC-013, AC-014, CB-002, CB-010) (sem captura no aparelho)
PR-002  Teste unitário: Parar, Soneca e Concluir silenciam antes da rede, guardam a ação sem
        rede e reenviam quando volta; a soneca reagenda o alarme local; sem rede a soneca é de
        10 min; cada soneca reagenda de novo (AC-006, AC-007, AC-008, CB-005, CB-006, CB-007)
PR-003  Teste unitário: fila de alarmes um por vez, mais antigo primeiro; alarme por cima do
        resumo diário; a notificação recebida com o app aberto e a checagem de 15 s não abrem o
        mesmo alarme duas vezes; teto de 10 min vira alarme perdido (CB-008, CB-009, CB-011,
        AC-005, AC-002)
PR-004  Teste unitário do servidor: parar, soneca e concluir registram o horário do disparo e o
        instante da ação (AC-006, AC-007, AC-008)
PR-005  Vídeo no app web (:8081): com o app aberto e um clique prévio na página, um lembrete de
        horário vence e a tela de alarme abre em até 15 s com som; Soneca mostra as opções e
        fecha; outro alarme com Parar; outro com Concluir, que some da lista (AC-003, AC-005,
        AC-006, AC-007, AC-008)
PR-006  Foto no app web: tela de alarme com título longo; dois alarmes em fila; aviso de som
        bloqueado; aviso de liberar a tela cheia e o estado nas configurações de lembretes, com
        a permissão simulada como negada; painel de meta e de condicional iguais aos de hoje;
        lista de lembretes no menu e detalhe iguais aos de hoje (AC-003, AC-010, AC-011, AC-012,
        AC-015, CB-008, CB-012, CB-013)
PR-007  Teste unitário da configuração nativa gerada: permissão de tela cheia declarada, tela
        que abre por cima do bloqueio e acende, canal de alarme com uso de áudio de alarme, e
        reagendamento no reinício (AC-001, AC-002, AC-009, CB-001, CB-003, CB-004) (sem captura)
PR-008  Teste de ponta a ponta no app web, marcado (geral): login, lembrete de horário que vence
        em 1 minuto, tela de alarme com som, Soneca de 10 min, o alarme volta, Parar (geral)
        (sem captura no aparelho Android)

## [Visual]

Telas:        Tela de alarme tocando, com hora, data, título, horário e Parar, Soneca e Concluir
              (AC-003, AC-005, AC-006, AC-008); escolha da soneca (AC-007); aviso de liberar a
              tela cheia (AC-010); estado da tela cheia nas configurações de lembretes (AC-011)
Plataforma:   Android, 390x844, renderizado no app web (:8081) (agente)
Destaque:     a hora e o título do lembrete; Parar como ação principal (agente)
Referências:  print do Alarmy (referencia-alarmy.png): data no topo, hora enorme, balão com a
              mensagem, Soneca como pílula no meio, botão principal grande embaixo, imagem de fundo
              ocupando a tela (usuário); o painel de alarme atual do app, com rótulo, título e
              "evento às HH:MM" (agente)
Manter:       design system do Ben (cores, tipografia, raios e voz da marca de design.md); textos
              em inglês e pt-BR como o resto do app; as três ações Parar, Soneca e Concluir; as
              opções de soneca de hoje (AC-012, AC-015)
Livre:        fundo (cor sólida, gradiente, ilustração ou foto); disposição e tamanho dos três
              botões; soneca como lista ou toque único (briefing › Premissas); balão de mensagem
              ou título simples; animação ou pulso enquanto toca; forma do aviso de liberar
              (tela, cartão ou bottom sheet)
Dados:        "Pick up Leo from school" / "Buscar o Leo na escola", compromisso às 15:00, tocando
              às 15:00 de sábado, 7 de novembro; um título longo de duas linhas; dois alarmes na
              fila (o segundo "Call the dentist" às 15:00) (agente)

## Gate
Aprovada:   2026-11-07
Protótipo:  sim — escolhido na rodada 1 (3 variações no app web)
Partes:     1
