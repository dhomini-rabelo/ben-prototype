import type { Localized } from '@/core/languages'

const en = {
  dateLabel: 'Saturday, November 7',
  alarmLabel: 'alarm',
  queueLabel: (index: number, total: number) => `${index} of ${total}`,
  eventAt: (time: string) => `at ${time}`,
  stop: 'Stop',
  snooze: 'Snooze',
  complete: 'Done',
  snoozeTitle: 'snooze until',
  snoozeTomorrow: (time: string) => `tomorrow ${time}`,
  back: 'Back',
  permissionTitle: 'Let Ben take over your screen',
  permissionBody:
    'Without full-screen access, reminders arrive as a regular notification and you can miss them.',
  permissionAllow: 'Allow full screen',
  permissionLater: 'Not now',
  permissionStepsTitle: 'how to allow it',
  permissionStepOpen: 'Open the system setting',
  permissionStepToggle: 'Turn on "Allow full-screen notifications" for Ben',
  permissionStepBack: 'Come back to Ben',
  settingsTitle: 'Reminders',
  settingsRowTitle: 'Full-screen alarm',
  settingsStatusOff: 'Off — alarms arrive as a notification',
  settingsStatusOn: 'On',
  settingsAllow: 'Allow',
}

export const alarmProtoStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    dateLabel: 'sábado, 7 de novembro',
    alarmLabel: 'alarme',
    queueLabel: (index, total) => `${index} de ${total}`,
    eventAt: (time) => `às ${time}`,
    stop: 'Parar',
    snooze: 'Soneca',
    complete: 'Concluir',
    snoozeTitle: 'adiar para',
    snoozeTomorrow: (time) => `amanhã ${time}`,
    back: 'Voltar',
    permissionTitle: 'Deixe o Ben ocupar a tela',
    permissionBody:
      'Sem a tela cheia liberada, o lembrete chega só como notificação e você pode perder a hora.',
    permissionAllow: 'Liberar tela cheia',
    permissionLater: 'Agora não',
    permissionStepsTitle: 'como liberar',
    permissionStepOpen: 'Abra a configuração do sistema',
    permissionStepToggle:
      'Ative "Permitir notificações em tela cheia" para o Ben',
    permissionStepBack: 'Volte para o Ben',
    settingsTitle: 'Lembretes',
    settingsRowTitle: 'Alarme em tela cheia',
    settingsStatusOff: 'Desligado — o alarme chega como notificação',
    settingsStatusOn: 'Ligado',
    settingsAllow: 'Liberar',
  },
}
