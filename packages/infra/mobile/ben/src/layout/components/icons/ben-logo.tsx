import Svg, { Path, Rect } from 'react-native-svg'
import {
  brandLight,
  dogEar,
  ink,
  primary,
  surfaceLowest,
} from '@/layout/utils/colors'

export type BenLogoVariant = 'brand' | 'avatar'

type BenLogoPalette = {
  body: string
  fold: string
  stroke?: string
  bars: string
}

const variantPalettes: Record<BenLogoVariant, BenLogoPalette> = {
  brand: { body: primary, fold: brandLight, bars: ink },
  avatar: {
    body: surfaceLowest,
    fold: brandLight,
    stroke: dogEar,
    bars: primary,
  },
}

const BALLOON_PATH =
  'M7 3h12l8 8v9a7 7 0 0 1-7 7H11l-6 3v-5.5A7 7 0 0 1 3 20V10a7 7 0 0 1 4-7Z'
const FOLD_PATH = 'M19 3v5a3 3 0 0 0 3 3h5Z'
const STROKE_WIDTH = 1.2

type BenLogoProps = {
  variant?: BenLogoVariant
  size?: number
}

export function BenLogo({ variant = 'brand', size = 30 }: BenLogoProps) {
  const palette = variantPalettes[variant]
  const strokeProps = palette.stroke
    ? {
        stroke: palette.stroke,
        strokeWidth: STROKE_WIDTH,
        strokeLinejoin: 'round' as const,
      }
    : {}

  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Path d={BALLOON_PATH} fill={palette.body} {...strokeProps} />
      <Path d={FOLD_PATH} fill={palette.fold} {...strokeProps} />
      <Rect x={9} y={13} width={2.4} height={6} rx={1.2} fill={palette.bars} />
      <Rect
        x={13.8}
        y={10.5}
        width={2.4}
        height={11}
        rx={1.2}
        fill={palette.bars}
      />
      <Rect
        x={18.6}
        y={14}
        width={2.4}
        height={4}
        rx={1.2}
        fill={palette.bars}
      />
    </Svg>
  )
}
