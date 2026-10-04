import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'

type MenuListEmptyProps = {
  title: string
  description: ReactNode
}

export function MenuListEmpty({ title, description }: MenuListEmptyProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Typography variant="body-md" className="text-center text-on-surface">
        {title}
      </Typography>
      <Typography
        variant="body-md"
        className="mt-1 text-center text-on-surface-variant"
      >
        {description}
      </Typography>
    </View>
  )
}
