import type { Localized } from '@/core/languages'

const en = {
  title: 'Settings',
  closeLabel: 'Close',
  profileUnavailable: "couldn't load full profile",
  modelTitle: "Ben's model",
  languageTitle: 'Language',
  signOut: 'Sign out',
  signingOut: 'signing out…',
  signOutFailed: "didn't sign you out — try again?",
  retry: 'retry',
  effort: 'Effort',
  effortSaving: 'Effort · saving…',
  saveFailed: "didn't save that — try again?",
  modelSettingsFailed: "couldn't load your model settings",
  appVersions: 'App versions',
  costTitle: 'Cost',
  showUsdCost: 'Show cost in USD',
  preferenceSaveFailed: "Couldn't save. Try again.",
  remindersTitle: 'Reminders',
  dailySummary: 'Daily summary',
  dailySummaryTime: 'Summary time',
  morningTime: 'Morning time',
  morningTimeHint:
    'Applies to "in the morning" alerts created or edited from now on.',
  sendTestNotification: 'Send test notification',
  testNotificationSent: (count: number) => `Sent to ${count} device(s)`,
  testNotificationFailed: "Couldn't send the test notification. Try again.",
}

export const settingsStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    title: 'Configurações',
    closeLabel: 'Fechar',
    profileUnavailable: 'não deu para carregar o perfil completo',
    modelTitle: 'Modelo do Ben',
    languageTitle: 'Idioma',
    signOut: 'Sair',
    signingOut: 'saindo…',
    signOutFailed: 'não conseguimos te desconectar — tentar de novo?',
    retry: 'tentar de novo',
    effort: 'Esforço',
    effortSaving: 'Esforço · salvando…',
    saveFailed: 'não salvamos isso — tentar de novo?',
    modelSettingsFailed: 'não deu para carregar as configurações do seu modelo',
    appVersions: 'Versões do app',
    costTitle: 'Custo',
    showUsdCost: 'Mostrar gasto em dólar',
    preferenceSaveFailed: 'Não foi possível salvar. Tente de novo.',
    remindersTitle: 'Lembretes',
    dailySummary: 'Resumo diário',
    dailySummaryTime: 'Horário do resumo',
    morningTime: 'Horário da manhã',
    morningTimeHint:
      'Vale para os avisos "pela manhã" criados ou editados a partir de agora.',
    sendTestNotification: 'Enviar notificação de teste',
    testNotificationSent: (count: number) =>
      `Enviada para ${count} aparelho(s)`,
    testNotificationFailed:
      'Não foi possível enviar a notificação de teste. Tente de novo.',
  },
}
