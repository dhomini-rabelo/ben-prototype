import { Check } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { primary } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'

type AgentModelOptionProps = {
  label: string
  isSelected: boolean
  disabled: boolean
  onPress: () => void
}

export function AgentModelOption({
  label,
  isSelected,
  disabled,
  onPress,
}: AgentModelOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'w-full flex-row items-center justify-between gap-3 rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3',
        isSelected && 'border-primary',
        disabled && 'opacity-60',
      )}
    >
      <Typography variant="body-md" className="text-on-surface">
        {label}
      </Typography>
      {isSelected && <Check size={16} color={primary} />}
    </Pressable>
  )
}
