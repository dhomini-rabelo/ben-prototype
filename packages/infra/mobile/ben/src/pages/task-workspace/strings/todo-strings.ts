import type { Localized } from '@/core/languages'

const en = {
  addItem: 'add item',
  markDone: 'Mark done',
  markNotDone: 'Mark not done',
  reject: 'Reject',
  approve: 'Approve',
  revisedDraft: 'Ben revised the draft',
  suggestedChanges: (count: number) =>
    `Ben suggested ${count} change${count === 1 ? '' : 's'}`,
}

export const todoStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    addItem: 'adicionar item',
    markDone: 'Marcar como feito',
    markNotDone: 'Desmarcar como feito',
    reject: 'Rejeitar',
    approve: 'Aprovar',
    revisedDraft: 'O Ben revisou o rascunho',
    suggestedChanges: (count) =>
      `O Ben sugeriu ${count} ${count === 1 ? 'mudança' : 'mudanças'}`,
  },
}
