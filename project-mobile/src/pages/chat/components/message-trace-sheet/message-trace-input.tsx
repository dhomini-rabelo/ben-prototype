import { ScrollView } from 'react-native'
import type { AgentCallTrace } from '@/api/models/message-trace'
import { MessageTraceInputStep } from '@/pages/chat/components/message-trace-sheet/message-trace-input-step'

type MessageTraceInputProps = { trace: AgentCallTrace }

export function MessageTraceInput({ trace }: MessageTraceInputProps) {
  return (
    <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8 gap-2">
      {trace.steps.map((step) => (
        <MessageTraceInputStep key={step.stepNumber} step={step} />
      ))}
    </ScrollView>
  )
}
