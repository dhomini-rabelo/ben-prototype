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
  },
}
