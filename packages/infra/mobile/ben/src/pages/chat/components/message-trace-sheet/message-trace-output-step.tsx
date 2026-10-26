import {
  BracketsCurly,
  ChatCenteredText,
  Wrench,
  WarningCircle,
} from 'phosphor-react-native'
import { View } from 'react-native'
import type { AgentCallStep } from '@/api/models/message-trace'
import { CodeBlock } from '@/layout/components/ui/code-block'
import { CollapsibleSection } from '@/layout/components/ui/collapsible-section'
import { Typography } from '@/layout/components/ui/typography'
import { absoluteDateTime } from '@/layout/utils/format-time'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { messageTraceStrings } from '@/pages/chat/strings/message-trace-strings'

type MessageTraceOutputStepProps = { step: AgentCallStep }

export function MessageTraceOutputStep({ step }: MessageTraceOutputStepProps) {
  const language = useLanguage()
  const strings = useStrings(messageTraceStrings)
  const { usage } = step

  const summaryRows: [string, string][] = [
    [strings.finishReason, step.output.finishReason],
    [
      strings.tokens,
      `${usage.inputTokens ?? '—'} / ${usage.outputTokens ?? '—'} / ${usage.totalTokens ?? '—'}`,
    ],
    [strings.started, absoluteDateTime(step.startedAt, language)],
    [strings.finished, absoluteDateTime(step.finishedAt, language)],
    [strings.latency, `${(step.latencyMs / 1000).toFixed(1)}s`],
  ]

  return (
    <View>
      <Typography variant="label-caps" className="pt-2 text-on-surface-variant">
        {strings.step(step.stepNumber + 1, strings.phases[step.phase])}
      </Typography>

      <View className="gap-1 py-2">
        {summaryRows.map(([label, value]) => (
          <View key={label} className="flex-row justify-between gap-3">
            <Typography variant="code" className="text-on-surface-variant">
              {label}
            </Typography>
            <Typography variant="code" className="text-on-surface">
              {value}
            </Typography>
          </View>
        ))}
      </View>

      <CollapsibleSection
        title={strings.textResponse}
        icon={ChatCenteredText}
        defaultOpen
        copyValue={step.output.text}
      >
        <Typography variant="body-md" selectable className="text-on-surface">
          {step.output.text}
        </Typography>
      </CollapsibleSection>

      {step.output.object != null && (
        <CollapsibleSection
          title={strings.object}
          icon={BracketsCurly}
          defaultOpen
        >
          <CodeBlock value={step.output.object} />
        </CollapsibleSection>
      )}

      {step.output.toolCalls.length > 0 && (
        <CollapsibleSection
          title={strings.toolCalls}
          icon={Wrench}
          defaultOpen
          meta={String(step.output.toolCalls.length)}
        >
          {step.output.toolCalls.map((toolCall) => {
            const toolResult = step.output.toolResults.find(
              (result) => result.toolCallId === toolCall.toolCallId,
            )
            return (
              <CollapsibleSection
                key={toolCall.toolCallId}
                title={toolCall.toolName}
              >
                <CodeBlock value={toolCall.input} />
                {toolResult && <CodeBlock value={toolResult.output} />}
              </CollapsibleSection>
            )
          })}
        </CollapsibleSection>
      )}

      {step.output.warnings.length > 0 && (
        <CollapsibleSection title={strings.warnings} icon={WarningCircle}>
          <CodeBlock value={step.output.warnings} />
        </CollapsibleSection>
      )}

      <CollapsibleSection title={strings.rawResponse} icon={BracketsCurly}>
        <CodeBlock value={step.output} />
      </CollapsibleSection>
    </View>
  )
}
