import { CaretLeft } from 'phosphor-react-native'
import type { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IconButton } from '@/layout/components/ui/icon-button'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { menuStrings } from '@/layout/strings/menu-strings'
import { onSurfaceVariant } from '@/layout/utils/colors'

type MenuListShellProps = {
  title: string
  onBack: () => void
  children: ReactNode
}

export function MenuListShell({ title, onBack, children }: MenuListShellProps) {
  const insets = useSafeAreaInsets()
  const strings = useStrings(menuStrings)

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="h-full w-full bg-surface"
    >
      <View className="h-16 flex-row items-center gap-2 px-3">
        <IconButton label={strings.backToMenu} onPress={onBack}>
          <CaretLeft size={20} color={onSurfaceVariant} />
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
