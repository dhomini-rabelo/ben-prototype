import type { Localized } from '@/core/languages'

const en = {
  title: 'Active tasks',
  countSummary: (count: number) => `${count} · most recent first`,
  emptyTitle: "nothing active — you're all clear",
  emptyHint: 'tap outside to head back to chat',
  error: "couldn't load your tasks",
  retry: 'retry',
  activeAgo: (relative: string) => `active · ${relative}`,
}

export const taskPickerStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    title: 'Tarefas ativas',
    countSummary: (count) => `${count} · mais recentes primeiro`,
    emptyTitle: 'nada ativo — tudo em dia',
    emptyHint: 'toque fora para voltar ao chat',
    error: 'não deu para carregar suas tarefas',
    retry: 'tentar de novo',
    activeAgo: (relative) => `ativa · ${relative}`,
  },
}
