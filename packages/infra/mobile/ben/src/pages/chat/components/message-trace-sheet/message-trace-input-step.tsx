import { Braces, MessageSquare, ScrollText, Wrench } from 'lucide-react-native'
import { View } from 'react-native'
import type { AgentCallStep } from '@/api/models/message-trace'
import { CodeBlock } from '@/layout/components/ui/code-block'
import { CollapsibleSection } from '@/layout/components/ui/collapsible-section'
import { Typography } from '@/layout/components/ui/typography'

type MessageTraceInputStepProps = { step: AgentCallStep }

export function MessageTraceInputStep({ step }: MessageTraceInputStepProps) {
  const totalChars =
    step.input.systemPrompt.length +
    step.input.messages.reduce((sum, message) => sum + message.text.length, 0)

  return (
    <View>
      <Typography variant="label-caps" className="pt-2 text-on-surface-variant">
        {`Step ${step.stepNumber + 1} · ${step.phase}`}
      </Typography>

      <Typography variant="code" className="py-2 text-on-surface-variant">
        {`${step.input.messages.length} messages · ${step.input.tools.length} tools · ${totalChars} chars`}
      </Typography>

      <CollapsibleSection
        title="Messages"
        icon={MessageSquare}
        defaultOpen
        meta={String(step.input.messages.length)}
      >
        {step.input.messages.map((message, index) => (
          <CollapsibleSection
            key={index}
            title={message.role}
            meta={`${message.text.length} chars`}
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
        title="System prompt"
        icon={ScrollText}
        meta={`${step.input.systemPrompt.length} chars`}
        copyValue={step.input.systemPrompt}
      >
        <Typography variant="body-md" selectable className="text-on-surface">
          {step.input.systemPrompt}
        </Typography>
      </CollapsibleSection>

      {step.input.tools.length > 0 && (
        <CollapsibleSection
          title="Tools"
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
        <CollapsibleSection title="Output schema" icon={Braces}>
          <CodeBlock value={step.input.outputSchema} />
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Raw request JSON" icon={Braces}>
        <CodeBlock value={step.input.requestBody ?? step.input} />
      </CollapsibleSection>
    </View>
  )
}
