import { Pressable, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { cn } from '@/layout/utils/styles'

type SegmentedControlOption<Value extends string> = {
  value: Value
  label: string
}

type SegmentedControlProps<Value extends string> = {
  value: Value
  options: SegmentedControlOption<Value>[]
  onChange: (value: Value) => void
  disabled?: boolean
  className?: string
}

export function SegmentedControl<Value extends string>({
  value,
  options,
  onChange,
  disabled,
  className,
}: SegmentedControlProps<Value>) {
  return (
    <View
      className={cn(
        'flex-row rounded-lg bg-surface-container p-1',
        disabled && 'opacity-60',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isActive, disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            className={cn(
              'h-11 flex-1 items-center justify-center rounded-md',
              isActive && 'bg-surface-container-lowest',
            )}
          >
            <Typography
              variant="button-text"
              className={
                isActive ? 'text-on-surface' : 'text-on-surface-variant'
              }
            >
              {option.label}
            </Typography>
          </Pressable>
        )
      })}
    </View>
  )
}
