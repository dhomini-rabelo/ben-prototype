import type { AgentCallTrace } from '@/api/models/message-trace'
import { WarningCircle } from 'phosphor-react-native'
import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { textError } from '@/layout/utils/colors'
import { messageTraceStrings } from '@/pages/chat/strings/message-trace-strings'

type MessageTraceMetaStripProps = { trace: AgentCallTrace }

export function MessageTraceMetaStrip({ trace }: MessageTraceMetaStripProps) {
  const strings = useStrings(messageTraceStrings)
  const isError = trace.status === 'error'

  return (
    <View className="flex-row flex-wrap gap-2 px-5 pb-3">
      <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2 py-1">
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant"
        >
          {trace.modelSlug ?? trace.modelId ?? strings.unknownModel}
        </Typography>
      </View>

      {trace.effort && (
        <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2 py-1">
          <Typography
            variant="label-caps"
            className="normal-case text-on-surface-variant"
          >
            {strings.effort(trace.effort)}
          </Typography>
        </View>
      )}

      <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2 py-1">
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant"
        >
          {`${(trace.latencyMs / 1000).toFixed(1)}s`}
        </Typography>
      </View>

      <View
        className={
          isError
            ? 'flex-row items-center gap-1 rounded-full bg-surface-error px-2 py-1'
            : 'flex-row items-center gap-1 rounded-full bg-surface-container px-2 py-1'
        }
      >
        {isError && <WarningCircle size={12} color={textError} />}
        <Typography
          variant="label-caps"
          className={
            isError
              ? 'normal-case text-text-error'
              : 'normal-case text-on-surface-variant'
          }
        >
          {trace.status}
        </Typography>
      </View>
    </View>
  )
}
