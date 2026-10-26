import {
  BracketsCurly,
  ChatCenteredText,
  Scroll,
  Wrench,
} from 'phosphor-react-native'
import { View } from 'react-native'
import type { AgentCallStep } from '@/api/models/message-trace'
import { CodeBlock } from '@/layout/components/ui/code-block'
import { CollapsibleSection } from '@/layout/components/ui/collapsible-section'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { messageTraceStrings } from '@/pages/chat/strings/message-trace-strings'

type MessageTraceInputStepProps = { step: AgentCallStep }

export function MessageTraceInputStep({ step }: MessageTraceInputStepProps) {
  const strings = useStrings(messageTraceStrings)
  const totalChars =
    step.input.systemPrompt.length +
    step.input.messages.reduce((sum, message) => sum + message.text.length, 0)

  return (
    <View>
      <Typography variant="label-caps" className="pt-2 text-on-surface-variant">
        {strings.step(step.stepNumber + 1, strings.phases[step.phase])}
      </Typography>

      <Typography variant="code" className="py-2 text-on-surface-variant">
        {strings.inputSummary(
          step.input.messages.length,
          step.input.tools.length,
          totalChars,
        )}
      </Typography>

      <CollapsibleSection
        title={strings.messages}
        icon={ChatCenteredText}
        defaultOpen
        meta={String(step.input.messages.length)}
      >
        {step.input.messages.map((message, index) => (
          <CollapsibleSection
            key={index}
            title={message.role}
            meta={strings.chars(message.text.length)}
            preview={message.text}
            copyValue={message.text}
          >
            <Typography
              variant="body-md"
              selectable
              className="text-on-surface"
            >
              {message.text}
            </Typography>
            {typeof message.content !== 'string' && (
              <CodeBlock value={message.content} />
            )}
          </CollapsibleSection>
        ))}
      </CollapsibleSection>

      <CollapsibleSection
        title={strings.systemPrompt}
        icon={Scroll}
        meta={strings.chars(step.input.systemPrompt.length)}
        copyValue={step.input.systemPrompt}
      >
        <Typography variant="body-md" selectable className="text-on-surface">
          {step.input.systemPrompt}
        </Typography>
      </CollapsibleSection>

      {step.input.tools.length > 0 && (
        <CollapsibleSection
          title={strings.tools}
          icon={Wrench}
          meta={String(step.input.tools.length)}
        >
          {step.input.tools.map((tool) => (
            <CollapsibleSection
              key={tool.name}
              title={tool.name}
              preview={tool.description}
            >
              <CodeBlock value={tool.inputSchema} />
            </CollapsibleSection>
          ))}
        </CollapsibleSection>
      )}

      {step.input.outputSchema != null && (
        <CollapsibleSection title={strings.outputSchema} icon={BracketsCurly}>
          <CodeBlock value={step.input.outputSchema} />
        </CollapsibleSection>
      )}

      <CollapsibleSection title={strings.rawRequest} icon={BracketsCurly}>
        <CodeBlock value={step.input.requestBody ?? step.input} />
      </CollapsibleSection>
    </View>
  )
}
