import { CaretDown, CaretUp } from 'phosphor-react-native'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import type { AppVersion } from '@/core/app-versions'
import { Typography } from '@/layout/components/ui/typography'
import { useLanguage } from '@/layout/hooks/use-strings'
import { onSurfaceVariant } from '@/layout/utils/colors'

type AppVersionItemProps = {
  version: AppVersion
  defaultOpen?: boolean
}

export function AppVersionItem({ version, defaultOpen }: AppVersionItemProps) {
  const language = useLanguage()
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false)

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        className="min-h-12 flex-row items-start gap-3 py-3"
        onPress={() => setIsOpen((current) => !current)}
      >
        <Typography
          variant="body-md"
          className="min-w-0 flex-1 font-sans-semibold text-on-surface"
        >
          {version.title[language]}
        </Typography>
        <View className="flex-row items-center gap-2 pt-0.5">
          <Typography
            variant="label-caps"
            className="font-mono normal-case text-on-surface-variant"
          >
            v{version.version}
          </Typography>
          {isOpen ? (
            <CaretUp size={16} color={onSurfaceVariant} />
          ) : (
            <CaretDown size={16} color={onSurfaceVariant} />
          )}
        </View>
      </Pressable>

      {isOpen && (
        <View className="gap-1 pb-3">
          <Typography
            variant="label-caps"
            className="normal-case text-on-surface-variant/70"
          >
            {version.date}
          </Typography>
          <Typography variant="body-md" className="text-on-surface-variant">
            {version.description[language]}
          </Typography>
        </View>
      )}

      <View className="h-px bg-outline-variant/40" />
    </View>
  )
}
