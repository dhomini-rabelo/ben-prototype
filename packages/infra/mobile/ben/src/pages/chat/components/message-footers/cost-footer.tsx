import { Text } from 'react-native'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { useUserPreferencesStore } from '@/layout/stores/user-preferences-store'
import { cn } from '@/layout/utils/styles'
import { chatStrings } from '@/pages/chat/strings/chat-strings'
import { formatUsdCost } from '@/pages/chat/utils/format-usd-cost'

type CostFooterProps = { costUsd?: number | null; className?: string }

export function CostFooter({ costUsd, className }: CostFooterProps) {
  const strings = useStrings(chatStrings)
  const language = useLanguage()
  const showUsdCost = useUserPreferencesStore((store) => store.showUsdCost)

  if (!showUsdCost || typeof costUsd !== 'number') return null

  const formatted = formatUsdCost(costUsd, language)

  return (
    <Text
      accessibilityLabel={strings.costLabel(formatted)}
      className={cn(
        'mt-1 text-[11px] leading-4 text-on-surface-variant',
        className,
      )}
    >
      {formatted}
    </Text>
  )
}
