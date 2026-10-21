import type { Localized } from '@/core/languages'

export type AppVersion = {
  version: string
  date: string
  title: Localized<string>
  description: Localized<string>
}

export const APP_VERSIONS = [
  {
    version: '1.2.0',
    date: '2026-10-21',
    title: {
      en: 'Alarms, goals and daily summary',
      'pt-BR': 'Alarmes, goals e resumo diário',
    },
    description: {
      en: 'Alarms now have alerts (at the time, a day before, in the morning, minutes before) and a popup with dynamic snooze. Goals repeat and carry your saved messages, conditional reminders ask how often you choose, and a daily summary shows your day.',
      'pt-BR':
        'Os alarmes agora têm avisos (no horário, um dia antes, pela manhã, minutos antes) e um popup com adiar dinâmico. Goals se repetem e trazem suas mensagens salvas, lembretes condicionais perguntam na frequência que você escolher e um resumo diário mostra o seu dia.',
    },
  },
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
