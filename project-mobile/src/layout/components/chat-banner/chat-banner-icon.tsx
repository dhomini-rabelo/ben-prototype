import type { ComponentType } from 'react'
import { onSurfaceVariant, textError } from '@/layout/utils/colors'
import { useChatBannerTone } from './contexts/tone'

type IconProps = { size?: number; color?: string; strokeWidth?: number }

type ChatBannerIconProps = {
  icon: ComponentType<IconProps>
}

export function ChatBannerIcon({ icon: Icon }: ChatBannerIconProps) {
  const tone = useChatBannerTone()

  return (
    <Icon
      size={16}
      strokeWidth={1.75}
      color={tone === 'error' ? textError : onSurfaceVariant}
    />
  )
}
