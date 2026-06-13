import type { ComponentType } from 'react'

export type CaptureKind = 'note' | 'reminder' | 'task'
export type TaskShape = 'text' | 'list'
export type CaptureCardState =
  | 'default'
  | 'pending'
  | 'error'
  | 'active'
  | 'finished'
  | 'fired'

export type CaptureCardIconComponent = ComponentType<{
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}>
