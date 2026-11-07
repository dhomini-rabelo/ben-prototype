import Svg, { Path, Rect } from 'react-native-svg'
import {
  BALLOON_PATH,
  BAR_SHAPES,
  FOLD_PATH,
  LOGO_VIEW_BOX_SIZE,
  STROKE_WIDTH,
  variantPalettes,
  type BenLogoVariant,
} from '@/layout/utils/ben-logo-geometry'

export type { BenLogoVariant }

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
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${LOGO_VIEW_BOX_SIZE} ${LOGO_VIEW_BOX_SIZE}`}
      fill="none"
    >
      <Path d={BALLOON_PATH} fill={palette.body} {...strokeProps} />
      <Path d={FOLD_PATH} fill={palette.fold} {...strokeProps} />
      {BAR_SHAPES.map((bar) => (
        <Rect
          key={bar.x}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          rx={bar.radius}
          fill={palette.bars}
        />
      ))}
    </Svg>
  )
}
