import { Switch as NativeSwitch } from 'react-native'
import { onPrimary, primary } from '@/layout/utils/colors'

type SwitchProps = {
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
  accessibilityLabel?: string
}

const TRACK_OFF = '#c4c7c7'

export function Switch({
  value,
  onValueChange,
  disabled,
  accessibilityLabel,
}: SwitchProps) {
  return (
    <NativeSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: TRACK_OFF, true: primary }}
      thumbColor={onPrimary}
    />
  )
}
