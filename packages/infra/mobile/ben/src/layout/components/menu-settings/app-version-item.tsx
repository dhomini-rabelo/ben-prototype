import { ChevronDown, ChevronRight } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import type { AppVersion } from '@/core/app-versions'
import { Typography } from '@/layout/components/ui/typography'
import { onSurfaceVariant } from '@/layout/utils/colors'

type AppVersionItemProps = {
  version: AppVersion
  defaultOpen?: boolean
}

export function AppVersionItem({ version, defaultOpen }: AppVersionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false)

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        className="min-h-12 flex-row items-center gap-2 py-2"
        onPress={() => setIsOpen((current) => !current)}
      >
        {isOpen ? (
          <ChevronDown size={16} color={onSurfaceVariant} />
        ) : (
          <ChevronRight size={16} color={onSurfaceVariant} />
        )}
        <Typography
          variant="label-caps"
          className="font-mono normal-case text-on-surface-variant"
        >
          v{version.version}
        </Typography>
        <Typography
          variant="body-md"
          numberOfLines={1}
          className="flex-1 font-semibold text-on-surface"
        >
          {version.title}
        </Typography>
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant/70"
        >
          {version.date}
        </Typography>
      </Pressable>

      {isOpen && (
        <View className="pb-2">
          <Typography variant="body-md" className="text-on-surface-variant">
            {version.description}
          </Typography>
        </View>
      )}

      <View className="h-px bg-outline-variant/40" />
    </View>
  )
}
