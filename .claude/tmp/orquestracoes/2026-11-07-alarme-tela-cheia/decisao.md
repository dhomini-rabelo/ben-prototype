# Decisão — Alarme em tela cheia com som para lembretes de horário

## Pedido
"Use a skill decidir-especificar-e-planejar para planejar: Conhece o app alarmy [Image #1] o lembrete/alarme deverá ter uma tela de alarme que faça um barulho e consuma a tela toda do celular, pq se for só uma notificação qualquer ninguem se importa"

[Image #1] = print do Alarmy tocando (data, hora grande 15:48, balão "WAKE UP", botão "Snooze" com contador 3, botão "Iniciar missão", foto de gato de fundo, tela cheia). Cópia: referencia-alarmy.png nesta pasta.

## Ideia principal
Problema: quando um lembrete com horário vence, o aviso é uma notificação comum (ou, com o app aberto, um painel pequeno embaixo); a pessoa ocupada não percebe ou ignora, e o compromisso passa.
Não é: mudar como o lembrete é criado por voz, o resumo diário, nem gamificar o despertar.
Exemplo: Ana pede "me lembra às 15h de buscar o filho"; às 15h o celular está bloqueado no silencioso, o aviso some entre outras notificações e ela só vê às 15h40.
Confirmado pelo usuário: o aviso tem de ser impossível de ignorar, com celular bloqueado e app fechado, até a pessoa parar ou adiar. ("Sim, é isso")

## Brief
- problema: o lembrete de horário vence e o aviso é notificação comum (som padrão de notificação, canal `alarmes`) ou, com o app aberto, um painel pequeno embaixo da tela; a pessoa ocupada ignora e o compromisso passa (ideia principal, confirmada pelo usuário).
- para quem: P1 — usuário ocupado do Ben que cria lembretes por voz e confia no Ben para lembrar na hora (agente, da memória business-rules v1).
- por que agora: o lembrete local já existe (task notificacoes-correcoes, 30/10) mas é fraco; é o que entrega o "say it, Ben files it" na hora certa. Fica sem fazer no lugar: iOS e publicação em loja (agente).
- sinal de sucesso: % de disparos de lembrete de horário com ação (parar, soneca ou concluir) em até 5 min do disparo, lido no servidor (briefing › Premissas). Correção do agente: hoje o acknowledge guarda só `acknowledgedUntil = firedAt`, sem a hora em que a pessoa agiu (lido em `packages/domain/chat/src/application/use-cases/reminders/acknowledge-reminder.ts`); a menor versão precisa registrar esse instante.
- menor versão (usuário): só Android, distribuído por APK direto; só lembretes de horário (kind `alarm`); tela cheia por cima do bloqueio + som de alarme em loop, no volume de alarme, mesmo no silencioso, até parar ou adiar; botões Parar, Soneca e Concluir, sem missão; o app pede para liberar a tela cheia nas configurações e, se não liberar, fica a notificação comum; com o app aberto (inclusive web) o lembrete de horário abre a mesma tela no lugar do painel atual.
- versão completa (agente, a partir do pedido e da pesquisa): + iOS (AlarmKit, iOS 26+), missão para dispensar (como o Alarmy), publicação na Play Store com declaração de app de alarme.

## Pesquisa
No projeto (r0-mobile.md): notificação local agendada em `packages/infra/mobile/ben/src/services/notifications-service.ts` (canal `alarmes`, HIGH, sem som próprio); popup in-app por checagem de 15 s (`use-alarm-scheduler.ts`) num bottom sheet (`alarm-popup-overlay.tsx`); soneca via `GET /reminders/:id/snooze-options`; ações via `POST /reminders/:id/acknowledge` e `/update`; app só roda em dev build/APK (Expo SDK 54, RN 0.81.5, New Architecture); `USE_EXACT_ALARM` já declarado; web com serviço de notificação no-op.
Fora do projeto (r0-pesquisa.md):
- USE_FULL_SCREEN_INTENT no Android 14+ e política Play: https://support.google.com/googleplay/android-developer/answer/13392821 e https://source.android.com/docs/core/permissions/fsi-limits
- Alarme exato e `setAlarmClock`: https://developer.android.com/develop/background-work/services/alarms/schedule
- FLAG_INSISTENT, CATEGORY_ALARM, USAGE_ALARM: https://developer.android.com/reference/android/app/Notification , https://developer.android.com/reference/android/media/AudioAttributes , https://developer.android.com/reference/android/app/NotificationChannel
- Política de `USE_EXACT_ALARM` (secundárias): https://medium.com/gravel-engineering/exact-alarm-permission-google-plays-ticking-time-bomb-for-android-developers-e29e4d20b572 , https://www.esper.io/blog/android-13-exact-alarm-api-restrictions
- Silencioso/DND com canal (relato): https://dev.library.kiwix.org/content/stackoverflow_en_nopic_2021-08/questions/63898265/android-play-custom-notification-sound-even-if-phone-is-muted-and-or-in-dnd-mo
- expo-notifications SDK 54 (sem full-screen intent): https://docs.expo.dev/versions/v54.0.0/sdk/notifications/
- Notifee arquivado e fork react-native-notify-kit: https://dev.to/marco_crupi/notifee-is-archived-heres-a-maintained-new-architecture-drop-in-replacement-3ib5 , https://notifee.app/react-native/docs/android/behaviour , https://github.com/marcocrupi/react-native-notify-kit
- Outras libs de alarme: https://www.pkgstats.com/pkg:react-native-alarm-scheduler , https://www.pkgstats.com/pkg:@asleep-ai/react-native-alarm
- iOS AlarmKit (fora desta versão): https://developer.apple.com/documentation/alarmkit , https://developer.apple.com/videos/play/wwdc2025/230/
- Web, autoplay e wake lock: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay , https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
- Alarmy (comportamento em background): https://apps.apple.com/us/app/id1668848747

## Lentes
- PM: problema real para P1 (o exemplo da Ana é o caso típico do lembrete de horário) e o sinal é observável, desde que o servidor passe a guardar a hora da ação, que hoje não guarda.
- Fundador: vale agora, porque lembrete que passa despercebido anula a promessa do Ben; adiar iOS e loja não custa nada a quem testa por APK, e a versão completa só se justifica depois do sinal medido no Android.
- Tech lead: metade existe (agendamento local, fila de alarmes, soneca, ações no servidor); o que falta é nativo Android (tela por cima do bloqueio, permissão de tela cheia, som em loop no volume de alarme), que exige lib nova ou módulo próprio e APK novo; iOS é outro projeto (AlarmKit, iOS 26, aparelho físico).

## Veredito
vai menor — custo muito maior que o ganho na versão completa: iOS (AlarmKit), missão e Play Store mais que dobram o trabalho sem mudar o que o sinal mede; a menor versão (Android por APK, só lembretes de horário) já testa se o alarme impossível de ignorar faz a pessoa agir na hora.

## Decisão do usuário
vai menor — aprovado em 2026-11-07, junto do gate da spec (rodada 2): só Android por APK, só lembretes de horário; parte nativa com react-native-notify-kit; teto de 10 min de som aceito; só o aviso da hora marcada vira alarme.

## Complementos
- Estado da tela cheia nas configurações de lembretes, com botão para liberar (AC-011 da spec) — para P1, atende "o aviso passa sem a pessoa ver" quando a liberação foi negada ou revogada — incluído na spec como (agente); aceito ou cortado no gate da spec.
- Teto de 10 min de som, depois "alarme perdido" na notificação (CB-010, RT-011) — para P1, atende o mesmo problema sem descarregar a bateria nem tocar por horas com o celular esquecido — incluído na spec como (agente); aceito ou cortado no gate da spec.
- Limite de sonecas (o "3" do Alarmy) — para P1, atende o adiamento sem fim — não incluído (agente): o usuário escolheu Parar sem missão; fica para depois do sinal medido.

## Menor versão
Android por dev build/APK; só lembretes de horário (kind `alarm`); tela cheia por cima da tela de bloqueio, acendendo a tela, com som de alarme em loop no volume de alarme até Parar, Soneca ou Concluir; pedido de liberação da tela cheia (Android 14+) com notificação comum como alternativa; com o app aberto (Android e web) a mesma tela no lugar do painel; registro no servidor da hora de cada ação, para medir.

## Como medir
Sinal: % de disparos de lembrete de horário com ação (parar, soneca ou concluir) em até 5 min do horário do disparo. Onde se lê: no servidor, pelo registro de cada ação com o horário do disparo e o instante da ação (RT-009 da spec; hoje o acknowledge só guarda até qual disparo foi visto, e o concluir guarda `completedAt` sem o disparo).
