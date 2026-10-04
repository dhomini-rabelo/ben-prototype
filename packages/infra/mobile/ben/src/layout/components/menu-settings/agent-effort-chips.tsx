import { Pressable, View } from 'react-native'
import type { AgentEffort } from '@/api/models/agent-preferences'
import { Typography } from '@/layout/components/ui/typography'
import { cn } from '@/layout/utils/styles'

type AgentEffortChipsProps = {
  efforts: AgentEffort[]
  value: AgentEffort
  disabled: boolean
  onChange: (effort: AgentEffort) => void
}

export function AgentEffortChips({
  efforts,
  value,
  disabled,
  onChange,
}: AgentEffortChipsProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {efforts.map((effort) => {
        const isSelected = effort === value

        return (
          <Pressable
            key={effort}
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => onChange(effort)}
            className={cn(
              'rounded-full px-3 py-1.5',
              isSelected ? 'bg-primary' : 'bg-surface-container',
              disabled && 'opacity-60',
            )}
          >
            <Typography
              variant="label-caps"
              className={cn(
                'normal-case',
                isSelected ? 'text-on-primary' : 'text-on-surface-variant',
              )}
            >
              {effort}
            </Typography>
          </Pressable>
        )
      })}
    </View>
  )
}
