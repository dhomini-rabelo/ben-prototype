import { WarningCircle } from 'phosphor-react-native'
import { ScrollView, View } from 'react-native'
import type { AgentCallTrace } from '@/api/models/message-trace'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { textError } from '@/layout/utils/colors'
import { MessageTraceOutputStep } from '@/pages/chat/components/message-trace-sheet/message-trace-output-step'
import { messageTraceStrings } from '@/pages/chat/strings/message-trace-strings'

type MessageTraceOutputProps = { trace: AgentCallTrace }

export function MessageTraceOutput({ trace }: MessageTraceOutputProps) {
  const strings = useStrings(messageTraceStrings)
  return (
    <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8 gap-2">
      {trace.status === 'error' && (
        <View className="flex-row items-start gap-2 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-3">
          <WarningCircle size={16} color={textError} />
          <Typography variant="body-md" className="flex-1 text-text-error">
            {trace.error ?? strings.callFailed}
          </Typography>
        </View>
      )}

      {trace.steps.map((step) => (
        <MessageTraceOutputStep key={step.stepNumber} step={step} />
      ))}
    </ScrollView>
  )
}
