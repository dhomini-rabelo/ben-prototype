import type { ComponentType } from 'react'
import type {
  DemoAlarm,
  SnoozeChoice,
} from '@/prototipo/alarme-tela-cheia/data'

export type AlarmScreenProps = {
  alarm: DemoAlarm
  queueIndex: number
  queueTotal: number
  onStop: () => void
  onSnooze: () => void
  onComplete: () => void
}

export type SnoozeScreenProps = {
  alarm: DemoAlarm
  choices: SnoozeChoice[]
  onPick: () => void
  onBack: () => void
}

export type PermissionScreenProps = {
  onAllow: () => void
  onLater: () => void
}

export type SettingsRowVariant = 'inline' | 'card' | 'banner'

export type AlarmVariation = {
  settingsRowVariant: SettingsRowVariant
  AlarmScreen: ComponentType<AlarmScreenProps>
  SnoozeScreen: ComponentType<SnoozeScreenProps>
  PermissionScreen: ComponentType<PermissionScreenProps>
}
