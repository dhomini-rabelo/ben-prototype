import type { Icon } from 'phosphor-react-native'

export type CaptureKind = 'note' | 'reminder' | 'task'
export type TaskShape = 'text' | 'list'
export type CaptureCardState =
  'default' | 'pending' | 'error' | 'active' | 'finished' | 'fired'

export type CaptureCardIconComponent = Icon
