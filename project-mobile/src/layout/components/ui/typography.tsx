import type { ReactNode } from 'react'
import type { TextProps } from 'react-native'
import { Text } from 'react-native'
import { cn } from '@/layout/utils/styles'

export type TypographyVariant =
  | 'wordmark'
  | 'tagline'
  | 'headline-lg'
  | 'body-md'
  | 'button-text'
  | 'label-caps'

const variantClasses: Record<TypographyVariant, string> = {
  wordmark: 'text-wordmark',
  tagline: 'text-tagline',
  'headline-lg': 'text-headline-lg',
  'body-md': 'text-body-md',
  'button-text': 'text-button',
  'label-caps': 'text-label-caps font-mono uppercase',
}

type TypographyProps = TextProps & {
  variant: TypographyVariant
  className?: string
  children: ReactNode
}

export function Typography({
  variant,
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Text className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </Text>
  )
}
