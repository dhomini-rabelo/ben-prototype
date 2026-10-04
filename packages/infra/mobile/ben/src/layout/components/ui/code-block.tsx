import { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { CopyButton } from '@/layout/components/ui/copy-button'
import { Typography } from '@/layout/components/ui/typography'

type CodeBlockProps = { value: unknown; showCopy?: boolean }

const MAX_LINES = 16

export function CodeBlock({ value, showCopy = true }: CodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const text = useMemo(() => JSON.stringify(value ?? null, null, 2), [value])
  const canCollapse = text.split('\n').length > MAX_LINES

  return (
    <View className="gap-2 rounded-lg bg-surface-container-low p-3">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Typography
            variant="code"
            className="text-on-surface"
            selectable
            numberOfLines={isExpanded ? undefined : MAX_LINES}
          >
            {text}
          </Typography>
        </View>
        {showCopy && <CopyButton value={text} />}
      </View>
      {canCollapse && (
        <Pressable
          className="h-11 self-start justify-center"
          onPress={() => setIsExpanded((current) => !current)}
        >
          <Typography variant="label-caps" className="text-on-surface-variant">
            {isExpanded ? 'Show less' : 'Show more'}
          </Typography>
        </Pressable>
      )}
    </View>
  )
}
