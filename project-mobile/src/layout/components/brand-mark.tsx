import { View } from 'react-native'
import { primary } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { BenLogo } from './icons/ben-logo'
import { Typography } from './ui/typography'

type BrandMarkProps = {
  orientation?: 'row' | 'column'
  logoWidth?: number
  logoHeight?: number
  className?: string
  itemClassName?: string
}

export function BrandMark({
  orientation = 'row',
  logoWidth,
  logoHeight,
  className,
  itemClassName,
}: BrandMarkProps) {
  return (
    <View
      className={cn(
        'items-center',
        orientation === 'row' ? 'flex-row gap-2.5' : 'flex-col',
        className,
      )}
    >
      <BenLogo
        className={cn('text-primary', itemClassName)}
        color={primary}
        width={logoWidth}
        height={logoHeight}
      />
      <Typography
        variant="wordmark"
        className={cn('text-primary', itemClassName)}
      >
        Ben
      </Typography>
    </View>
  )
}
