import { describe, expect, it } from 'vitest'
import { isCaptureOpenable } from '@/pages/chat/utils/capture-openable'

describe('isCaptureOpenable', () => {
  it('does not open a reminder card in error', () => {
    expect(isCaptureOpenable({ kind: 'reminder' }, 'error')).toBe(false)
  })

  it('opens a reminder card in default state', () => {
    expect(isCaptureOpenable({ kind: 'reminder' }, 'default')).toBe(true)
  })

  it('does not open task or note cards', () => {
    expect(isCaptureOpenable({ kind: 'task' }, 'default')).toBe(false)
    expect(isCaptureOpenable({ kind: 'note' }, 'default')).toBe(false)
  })
})
