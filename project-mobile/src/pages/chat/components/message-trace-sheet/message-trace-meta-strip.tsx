import type { AgentCallTrace } from '@/api/models/message-trace'
import { CircleAlert } from 'lucide-react-native'
import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { textError } from '@/layout/utils/colors'

type MessageTraceMetaStripProps = { trace: AgentCallTrace }

export function MessageTraceMetaStrip({ trace }: MessageTraceMetaStripProps) {
  const isError = trace.status === 'error'

  return (
    <View className="flex-row flex-wrap gap-2 px-5 pb-3">
      <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2 py-1">
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant"
        >
          {trace.modelSlug ?? trace.modelId ?? 'unknown model'}
        </Typography>
      </View>

      {trace.effort && (
        <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2 py-1">
          <Typography
            variant="label-caps"
            className="normal-case text-on-surface-variant"
          >
            {`effort · ${trace.effort}`}
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
        {isError && <CircleAlert size={12} color={textError} />}
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
