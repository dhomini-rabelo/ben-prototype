import { ChevronDown, ChevronRight } from 'lucide-react-native'
import type { ComponentType, ReactNode } from 'react'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { CopyButton } from '@/layout/components/ui/copy-button'
import { Typography } from '@/layout/components/ui/typography'
import { onSurfaceVariant } from '@/layout/utils/colors'

type CollapsibleSectionProps = {
  title: string
  icon?: ComponentType<{ size?: number; color?: string }>
  meta?: string
  preview?: string
  defaultOpen?: boolean
  copyValue?: string
  children: ReactNode
  className?: string
}

export function CollapsibleSection({
  title,
  icon: Icon,
  meta,
  preview,
  defaultOpen,
  copyValue,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false)

  return (
    <View className={className}>
      {/*
        The copy button (its own `<button>` via IconButton/Pressable) must
        NOT be nested inside the expand/collapse `<button>` below — that is
        invalid HTML (`<button> cannot contain a nested <button>`), warns on
        hydration, and makes the click target ambiguous. They are siblings
        in this row instead.
      */}
      <View className="min-h-12 flex-row items-center gap-2 py-2">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          className="flex-1 flex-row items-center gap-2"
          onPress={() => setIsOpen((current) => !current)}
        >
          {isOpen ? (
            <ChevronDown size={16} color={onSurfaceVariant} />
          ) : (
            <ChevronRight size={16} color={onSurfaceVariant} />
          )}
          {Icon && <Icon size={16} color={onSurfaceVariant} />}
          <Typography
            variant="label-caps"
            className="flex-1 text-on-surface-variant"
          >
            {title}
          </Typography>
          {meta != null && (
            <Typography
              variant="label-caps"
              className="normal-case text-on-surface-variant/70"
            >
              {meta}
            </Typography>
          )}
        </Pressable>
        {copyValue != null && <CopyButton value={copyValue} />}
      </View>

      {!isOpen && preview != null && (
        <Typography
          variant="body-md"
          numberOfLines={2}
          className="text-on-surface-variant"
        >
          {preview}
        </Typography>
      )}

      {isOpen && <View className="gap-2 pb-2">{children}</View>}

      <View className="h-px bg-outline-variant/40" />
    </View>
  )
}
