import { Cpu, X } from 'lucide-react-native'
import { useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import type { MessageTraceTab } from '@/pages/chat/stores/message-trace-store'
import { IconButton } from '@/layout/components/ui/icon-button'
import { SegmentedControl } from '@/layout/components/ui/segmented-control'
import { Typography } from '@/layout/components/ui/typography'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { absoluteDateTime } from '@/layout/utils/format-time'
import { ItemDetailError } from '@/layout/components/menu-detail/item-detail-error'
import { ItemDetailGone } from '@/layout/components/menu-detail/item-detail-gone'
import { MenuSheet } from '@/layout/components/menu/menu-sheet'
import { useMessageTraceData } from '@/layout/hooks/api/use-message-trace-data'
import { MessageTraceInput } from '@/pages/chat/components/message-trace-sheet/message-trace-input'
import { MessageTraceLoading } from '@/pages/chat/components/message-trace-sheet/message-trace-loading'
import { MessageTraceMetaStrip } from '@/pages/chat/components/message-trace-sheet/message-trace-meta-strip'
import { MessageTraceOutput } from '@/pages/chat/components/message-trace-sheet/message-trace-output'

type MessageTraceSheetProps = {
  messageId: string
  createdAt: string | null
  initialTab: MessageTraceTab
  onClose: () => void
}

export function MessageTraceSheet({
  messageId,
  createdAt,
  initialTab,
  onClose,
}: MessageTraceSheetProps) {
  const { height } = useWindowDimensions()
  const [tab, setTab] = useState<MessageTraceTab>(initialTab)
  const { state, actions } = useMessageTraceData(messageId)
  const trace = state.data?.item.trace ?? null

  return (
    <View style={{ height: height * 0.9 }}>
      <MenuSheet className="flex-1">
        <View className="flex-1">
          <View className="flex-row items-center justify-between px-5 pt-1 pb-3">
            <View className="flex-row items-center gap-2">
              <View className="size-7 items-center justify-center rounded-lg bg-surface-container-high">
                <Cpu size={16} color={onSurfaceVariant} />
              </View>
              <Typography
                variant="label-caps"
                className="text-on-surface-variant"
              >
                Model call
              </Typography>
            </View>
            <IconButton label="Close" onPress={onClose} className="size-11">
              <X size={16} color={onSurfaceVariant} />
            </IconButton>
          </View>

          {trace && <MessageTraceMetaStrip trace={trace} />}
          {(state.isLoading || trace) && (
            <SegmentedControl
              className="mx-5 mb-3"
              disabled={state.isLoading}
              value={tab}
              onChange={setTab}
              options={[
                { value: 'input', label: 'Input' },
                { value: 'output', label: 'Output' },
              ]}
            />
          )}

          {state.isLoading ? (
            <MessageTraceLoading />
          ) : state.isError ? (
            <ItemDetailError
              message="couldn't load this trace — tap to retry"
              onRetry={() => actions.refetch()}
            />
          ) : trace ? (
            tab === 'input' ? (
              <MessageTraceInput trace={trace} />
            ) : (
              <MessageTraceOutput trace={trace} />
            )
          ) : (
            <View className="gap-2">
              <ItemDetailGone message="no trace for this one — it was sent before Ben started recording model calls." />
              <Typography
                variant="code"
                className="px-5 pb-4 text-on-surface-variant"
              >
                {`${messageId}${createdAt ? ` · ${absoluteDateTime(createdAt)}` : ''}`}
              </Typography>
            </View>
          )}
        </View>
      </MenuSheet>
    </View>
  )
}
