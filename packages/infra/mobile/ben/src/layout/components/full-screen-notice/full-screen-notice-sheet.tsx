import { BellRinging } from 'phosphor-react-native'
import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { MenuSheet } from '@/layout/components/menu/menu-sheet'
import { SettingsSheetOverlay } from '@/layout/components/menu-settings/settings-sheet-overlay'
import { Button } from '@/layout/components/ui/button'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { useAlarmPermissionStore } from '@/layout/stores/alarm-permission-store'
import { alarmStrings } from '@/layout/strings/alarm-strings'
import { brandDeep, onSurface } from '@/layout/utils/colors'
import { openFullScreenSettings } from '@/services/alarm-service'
import {
  markFullScreenNoticeSeen,
  wasFullScreenNoticeSeen,
} from '@/storage/full-screen-notice-storage'

export function FullScreenNoticeSheet() {
  const strings = useStrings(alarmStrings)
  const fullScreen = useAlarmPermissionStore((store) => store.fullScreen)
  const [wasSeen, setWasSeen] = useState(true)

  useEffect(() => {
    if (fullScreen !== 'denied') {
      return
    }
    let isActive = true
    void wasFullScreenNoticeSeen().then((seen) => {
      if (isActive) setWasSeen(seen)
    })
    return () => {
      isActive = false
    }
  }, [fullScreen])

  function dismiss() {
    setWasSeen(true)
    void markFullScreenNoticeSeen()
  }

  function allow() {
    dismiss()
    void openFullScreenSettings()
  }

  return (
    <SettingsSheetOverlay
      isOpen={fullScreen === 'denied' && !wasSeen}
      onClose={dismiss}
    >
      <MenuSheet>
        <View className="items-center gap-4 px-5 pt-3 pb-4">
          <View className="size-14 items-center justify-center rounded-full bg-primary-container">
            <BellRinging size={28} weight="fill" color={brandDeep} />
          </View>
          <Typography
            variant="headline-lg"
            className="text-center text-on-surface"
          >
            {strings.fullScreenNoticeTitle}
          </Typography>
          <Typography
            variant="body-md"
            className="text-center text-on-surface-variant"
          >
            {strings.fullScreenNoticeBody}
          </Typography>
          <View className="w-full gap-1 pt-2">
            <Button onPress={allow}>{strings.fullScreenNoticeAllow}</Button>
            <Pressable
              accessibilityRole="button"
              onPress={dismiss}
              className="min-h-11 items-center justify-center"
            >
              <Typography variant="button-text" style={{ color: onSurface }}>
                {strings.fullScreenNoticeLater}
              </Typography>
            </Pressable>
          </View>
        </View>
      </MenuSheet>
    </SettingsSheetOverlay>
  )
}
