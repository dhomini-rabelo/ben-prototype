import { ScrollView, View } from 'react-native'
import type { Reminder } from '@/api/models/reminder'
import { formatClock } from '@/layout/components/alarm-popup/format-clock'
import { MenuSheet } from '@/layout/components/menu/menu-sheet'
import { SettingsSheetOverlay } from '@/layout/components/menu-settings/settings-sheet-overlay'
import { Button } from '@/layout/components/ui/button'
import { Typography } from '@/layout/components/ui/typography'
import {
  useDailySummary,
  useDailySummaryStore,
} from '@/layout/hooks/use-daily-summary'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { alarmStrings } from '@/layout/strings/alarm-strings'

type SummarySectionProps = {
  title: string
  items: Reminder[]
  showTime: boolean
}

function SummarySection({ title, items, showTime }: SummarySectionProps) {
  const language = useLanguage()

  if (items.length === 0) {
    return null
  }

  return (
    <View className="gap-2">
      <Typography variant="label-caps" className="text-on-surface-variant">
        {title}
      </Typography>
      {items.map((item) => {
        const at = item.nextFireAt ?? item.firesAt
        return (
          <View
            key={item.id}
            className="flex-row items-center justify-between gap-3 rounded-lg bg-surface-container px-4 py-3"
          >
            <Typography
              variant="body-md"
              className="flex-1 text-on-surface"
              numberOfLines={2}
            >
              {item.title}
            </Typography>
            {showTime && at ? (
              <Typography variant="body-md" className="text-on-surface-variant">
                {formatClock(at, language)}
              </Typography>
            ) : null}
          </View>
        )
      })}
    </View>
  )
}

export function DailySummaryPopup() {
  useDailySummary()
  const strings = useStrings(alarmStrings)
  const summary = useDailySummaryStore((store) => store.summary)
  const dismiss = useDailySummaryStore((store) => store.dismiss)
  const isEmpty =
    summary !== null &&
    summary.alarms.length === 0 &&
    summary.goals.length === 0 &&
    summary.conditionals.length === 0

  return (
    <SettingsSheetOverlay isOpen={summary !== null} onClose={dismiss}>
      {summary ? (
        <MenuSheet>
          <View className="gap-4 px-5 pt-2 pb-4">
            <Typography variant="headline-lg" className="text-on-surface">
              {strings.summaryTitle}
            </Typography>
            <ScrollView
              style={{ maxHeight: 360 }}
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-4"
            >
              {isEmpty ? (
                <Typography
                  variant="body-md"
                  className="text-on-surface-variant"
                >
                  {strings.summaryEmpty}
                </Typography>
              ) : null}
              <SummarySection
                title={strings.summaryAlarms}
                items={summary.alarms}
                showTime
              />
              <SummarySection
                title={strings.summaryGoals}
                items={summary.goals}
                showTime
              />
              <SummarySection
                title={strings.summaryQuestions}
                items={summary.conditionals}
                showTime={false}
              />
            </ScrollView>
            <Button onPress={dismiss}>{strings.summaryClose}</Button>
          </View>
        </MenuSheet>
      ) : null}
    </SettingsSheetOverlay>
  )
}
