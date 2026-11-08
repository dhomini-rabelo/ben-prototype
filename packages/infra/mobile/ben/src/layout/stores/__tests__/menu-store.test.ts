import { beforeEach, describe, expect, it } from 'vitest'
import { useMenuStore } from '@/layout/stores/menu-store'

describe('useMenuStore openReminderFromChat', () => {
  beforeEach(() => {
    useMenuStore.getState().reset()
  })

  it('opens the reminder detail from chat and reset clears the origin', () => {
    useMenuStore.getState().openReminderFromChat('r1')
    const opened = useMenuStore.getState()
    expect(opened.view).toBe('reminders')
    expect(opened.detailTarget).toEqual({ kind: 'reminder', id: 'r1' })
    expect(opened.origin).toBe('chat')

    useMenuStore.getState().reset()
    const cleared = useMenuStore.getState()
    expect(cleared.origin).toBe('menu')
    expect(cleared.view).toBe('menu')
    expect(cleared.detailTarget).toBeNull()
  })
})
