import type { Localized } from '@/core/languages'

export type AppVersion = {
  version: string
  date: string
  title: Localized<string>
  description: Localized<string>
}

export const APP_VERSIONS = [
  {
    version: '1.1.0',
    date: '2026-10-11',
    title: {
      en: 'App versions in settings',
      'pt-BR': 'Versões do app nas configurações',
    },
    description: {
      en: "Settings now lists recent app versions so you can tell which build you're testing. Tap a version to read what changed.",
      'pt-BR':
        'As configurações agora listam as versões recentes do app para você saber qual build está testando. Toque em uma versão para ler o que mudou.',
    },
  },
  {
    version: '1.0.0',
    date: '2026-05-23',
    title: {
      en: 'First prototype',
      'pt-BR': 'Primeiro protótipo',
    },
    description: {
      en: "Sign in with Google, talk or type to Ben in the chat, open task workspaces, and pick Ben's model and effort in settings.",
      'pt-BR':
        'Entre com o Google, fale ou escreva para o Ben no chat, abra espaços de tarefas e escolha o modelo e o esforço do Ben nas configurações.',
    },
  },
] as const satisfies readonly [AppVersion, ...AppVersion[]]

export const CURRENT_APP_VERSION = APP_VERSIONS[0].version
