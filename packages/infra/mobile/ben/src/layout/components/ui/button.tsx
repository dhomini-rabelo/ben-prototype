import type { ReactNode } from 'react'
import { Children } from 'react'
import type { PressableProps } from 'react-native'
import { Pressable, Text } from 'react-native'
import { cn } from '@/layout/utils/styles'

type ButtonProps = Omit<PressableProps, 'children'> & {
  children: ReactNode
  className?: string
}

function renderChild(child: ReactNode, index: number) {
  if (typeof child === 'string' || typeof child === 'number') {
    return (
      <Text key={index} className="text-on-primary text-button font-semibold">
        {child}
      </Text>
    )
  }
  return child
}

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <Pressable
      className={cn(
        'flex-row items-center justify-center gap-3',
        'bg-primary rounded-lg px-6 py-3.5',
        'active:scale-[0.98] active:bg-inverse-surface',
        props.disabled && 'opacity-60',
        className,
      )}
      {...props}
    >
      {Children.map(children, renderChild)}
    </Pressable>
  )
}
