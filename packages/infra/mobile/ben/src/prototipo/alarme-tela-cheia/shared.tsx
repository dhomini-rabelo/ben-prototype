import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { RemindersSettingsSection } from '@/layout/components/menu-settings/reminders-settings-section'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { useLanguageStore } from '@/layout/stores/language-store'
import { settingsStrings } from '@/layout/strings/settings-strings'
import { MessageBubble } from '@/pages/chat/components/message-bubble/message-bubble'
import {
  LONG_TITLE,
  PICK_UP_LEO,
  QUEUE,
  SNOOZE_CHOICES,
} from '@/prototipo/alarme-tela-cheia/data'
import { SettingsRow } from '@/prototipo/alarme-tela-cheia/settings-row'
import type { AlarmVariation } from '@/prototipo/alarme-tela-cheia/variation-types'

type Scenario = 'main' | 'snooze' | 'long' | 'queue' | 'permission' | 'settings'
type Step = 'alarm' | 'snooze'

function useProtoLanguage(language: string | undefined) {
  useEffect(() => {
    useLanguageStore.setState({ language: language === 'en' ? 'en' : 'pt-BR' })
  }, [language])
}

export function AppBackdrop() {
  return (
    <View className="flex-1 justify-start gap-3 bg-background p-4 pt-24">
      <MessageBubble from="user">
        Me lembra hoje às 15h de buscar o Leo na escola
      </MessageBubble>
      <MessageBubble from="ben">Pronto, hoje às 15h eu te aviso.</MessageBubble>
    </View>
  )
}

function SettingsScene({ variation }: { variation: AlarmVariation }) {
  const strings = useStrings(settingsStrings)

  return (
    <ScrollView className="flex-1 bg-surface-container-lowest">
      <View className="px-5 pt-12 pb-3">
        <Typography variant="headline-lg" className="text-on-surface">
          {strings.title}
        </Typography>
      </View>
      <RemindersSettingsSection
        hasError={false}
        onChangeSummaryEnabled={() => undefined}
        onChangeSummaryTime={() => undefined}
        onChangeMorningTime={() => undefined}
      />
      <View className="border-t border-outline-variant/40 px-5 py-5">
        <SettingsRow variant={variation.settingsRowVariant} />
      </View>
    </ScrollView>
  )
}

type AlarmProtoPageProps = {
  variation: AlarmVariation
}

export function AlarmProtoPage({ variation }: AlarmProtoPageProps) {
  const params = useLocalSearchParams<{ s?: Scenario; lang?: string }>()
  const scenario: Scenario = params.s ?? 'main'
  useProtoLanguage(params.lang)
  const [step, setStep] = useState<Step>(
    scenario === 'snooze' ? 'snooze' : 'alarm',
  )
  const [queueIndex, setQueueIndex] = useState(0)
  const { AlarmScreen, SnoozeScreen, PermissionScreen } = variation

  if (scenario === 'permission') {
    return (
      <PermissionScreen onAllow={() => undefined} onLater={() => undefined} />
    )
  }

  if (scenario === 'settings') {
    return <SettingsScene variation={variation} />
  }

  const isQueue = scenario === 'queue'
  const alarm =
    scenario === 'long' ? LONG_TITLE : isQueue ? QUEUE[queueIndex] : PICK_UP_LEO
  const total = isQueue ? QUEUE.length : 1

  function closeCurrent() {
    setStep('alarm')
    setQueueIndex((value) => (isQueue ? (value + 1) % QUEUE.length : value))
  }

  if (step === 'snooze') {
    return (
      <SnoozeScreen
        alarm={alarm}
        choices={SNOOZE_CHOICES}
        onPick={closeCurrent}
        onBack={() => setStep('alarm')}
      />
    )
  }

  return (
    <AlarmScreen
      alarm={alarm}
      queueIndex={queueIndex + 1}
      queueTotal={total}
      onStop={closeCurrent}
      onSnooze={() => setStep('snooze')}
      onComplete={closeCurrent}
    />
  )
}
