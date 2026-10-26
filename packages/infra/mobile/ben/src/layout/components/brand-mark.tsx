import { View } from 'react-native'
import { cn } from '@/layout/utils/styles'
import { BenLogo } from './icons/ben-logo'
import { Typography } from './ui/typography'

const LOGO_SIZE = 30

type BrandMarkProps = {
  orientation?: 'row' | 'column'
  className?: string
  itemClassName?: string
}

export function BrandMark({
  orientation = 'row',
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
      <BenLogo variant="brand" size={LOGO_SIZE} />
      <Typography
        variant="wordmark"
        className={cn(
          'font-sans-bold text-[23px] leading-7 text-ink',
          itemClassName,
        )}
      >
        Ben
      </Typography>
    </View>
  )
}
