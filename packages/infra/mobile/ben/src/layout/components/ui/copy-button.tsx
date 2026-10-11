import { Check, Copy } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { IconButton } from '@/layout/components/ui/icon-button'
import { useStrings } from '@/layout/hooks/use-strings'
import { uiStrings } from '@/layout/strings/ui-strings'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { copyTextToClipboard } from '@/services/clipboard-service'

type CopyButtonProps = { value: string }

const COPIED_FEEDBACK_MS = 1500

export function CopyButton({ value }: CopyButtonProps) {
  const strings = useStrings(uiStrings)
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function handlePress() {
    void copyTextToClipboard(value).catch(() => {})
    setIsCopied(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(
      () => setIsCopied(false),
      COPIED_FEEDBACK_MS,
    )
  }

  return (
    <IconButton
      label={isCopied ? strings.copied : strings.copy}
      className="size-11"
      onPress={handlePress}
    >
      {isCopied ? (
        <Check size={16} color={onSurfaceVariant} />
      ) : (
        <Copy size={16} color={onSurfaceVariant} />
      )}
    </IconButton>
  )
}
