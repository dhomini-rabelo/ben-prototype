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
  | 'code'

const variantClasses: Record<TypographyVariant, string> = {
  wordmark: 'font-sans-bold text-wordmark',
  tagline: 'font-sans text-tagline',
  'headline-lg': 'font-sans-semibold text-headline-lg',
  'body-md': 'font-sans text-body-md',
  'button-text': 'font-sans-semibold text-button',
  'label-caps': 'text-label-caps font-mono uppercase',
  code: 'text-code font-mono',
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
