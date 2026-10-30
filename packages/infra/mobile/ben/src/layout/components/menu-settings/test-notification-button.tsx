import { useState } from 'react'
import { View } from 'react-native'
import { requestSendTestPush } from '@/api/requests/push-devices'
import { Button } from '@/layout/components/ui/button'
import { Typography } from '@/layout/components/ui/typography'
import { useAPIMutation } from '@/layout/hooks/use-api-mutation'
import { useStrings } from '@/layout/hooks/use-strings'
import { settingsStrings } from '@/layout/strings/settings-strings'
import { textError } from '@/layout/utils/colors'

export function TestNotificationButton() {
  const strings = useStrings(settingsStrings)
  const { actions, state } = useAPIMutation({
    mutationFn: () => requestSendTestPush(),
  })
  const [sentCount, setSentCount] = useState<number | null>(null)

  function sendTestNotification() {
    setSentCount(null)
    actions
      .mutate()
      .then((result) => setSentCount(result.sentCount))
      .catch(() => setSentCount(null))
  }

  return (
    <View className="gap-2">
      <Button onPress={sendTestNotification} disabled={state.isPending}>
        {strings.sendTestNotification}
      </Button>
      {sentCount !== null ? (
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant"
        >
          {strings.testNotificationSent(sentCount)}
        </Typography>
      ) : null}
      {state.isError ? (
        <Typography variant="button-text" style={{ color: textError }}>
          {strings.testNotificationFailed}
        </Typography>
      ) : null}
    </View>
  )
}
