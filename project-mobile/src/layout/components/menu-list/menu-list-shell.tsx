import { ChevronLeft } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IconButton } from '@/layout/components/ui/icon-button'
import { Typography } from '@/layout/components/ui/typography'
import { onSurfaceVariant } from '@/layout/utils/colors'

type MenuListShellProps = {
  title: string
  onBack: () => void
  children: ReactNode
}

export function MenuListShell({ title, onBack, children }: MenuListShellProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="h-full w-full bg-surface"
    >
      <View className="h-16 flex-row items-center gap-2 px-3">
        <IconButton label="Back to menu" onPress={onBack}>
          <ChevronLeft size={20} strokeWidth={2} color={onSurfaceVariant} />
        </IconButton>
        <Typography variant="body-md" className="font-semibold text-on-surface">
          {title}
        </Typography>
      </View>

      <ScrollView
        className="flex-1 px-3"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {children}
      </ScrollView>
    </View>
  )
}
