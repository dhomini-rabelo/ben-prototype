import { create } from 'zustand'

export type MenuView = 'menu' | 'tasks' | 'notes' | 'reminders'

export type MenuEntryId = 'tasks' | 'notes' | 'reminders' | 'settings'

export type MenuDetailTarget =
  { kind: 'note'; id: string } | { kind: 'reminder'; id: string } | null

export type MenuOrigin = 'menu' | 'chat'

interface MenuStore {
  view: MenuView
  detailTarget: MenuDetailTarget
  isSettingsOpen: boolean
  origin: MenuOrigin
  selectEntry: (id: MenuEntryId) => void
  goBackToMenu: () => void
  openDetail: (target: NonNullable<MenuDetailTarget>) => void
  closeDetail: () => void
  closeSettings: () => void
  openReminderFromChat: (reminderId: string) => void
  reset: () => void
}

const INITIAL_STATE = {
  view: 'menu' as MenuView,
  detailTarget: null as MenuDetailTarget,
  isSettingsOpen: false,
  origin: 'menu' as MenuOrigin,
}

export const useMenuStore = create<MenuStore>((set) => ({
  ...INITIAL_STATE,
  selectEntry: (id) => {
    if (id === 'settings') {
      set({ isSettingsOpen: true })
      return
    }
    set({ view: id })
  },
  goBackToMenu: () => set({ view: 'menu' }),
  openDetail: (target) => set({ detailTarget: target }),
  closeDetail: () => set({ detailTarget: null }),
  closeSettings: () => set({ isSettingsOpen: false }),
  openReminderFromChat: (reminderId) =>
    set({
      view: 'reminders',
      detailTarget: { kind: 'reminder', id: reminderId },
      origin: 'chat',
    }),
  reset: () => set(INITIAL_STATE),
}))
