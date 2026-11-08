import {
  brandLight,
  dogEar,
  ink,
  primary,
  silhouetteNotification,
  silhouetteThemed,
  surfaceLowest,
} from './colors.ts'

export type BenLogoVariant = 'brand' | 'avatar'

export type BenLogoPalette = {
  body: string
  fold: string
  stroke?: string
  bars: string
}

export type BenLogoBar = {
  x: number
  y: number
  width: number
  height: number
  radius: number
}

export const LOGO_VIEW_BOX_SIZE = 30

export const BALLOON_PATH =
  'M7 3h12l8 8v9a7 7 0 0 1-7 7H11l-6 3v-5.5A7 7 0 0 1 3 20V10a7 7 0 0 1 4-7Z'
export const FOLD_PATH = 'M19 3v5a3 3 0 0 0 3 3h5Z'
export const STROKE_WIDTH = 1.2

export const BAR_SHAPES: BenLogoBar[] = [
  { x: 9, y: 13, width: 2.4, height: 6, radius: 1.2 },
  { x: 13.8, y: 10.5, width: 2.4, height: 11, radius: 1.2 },
  { x: 18.6, y: 14, width: 2.4, height: 4, radius: 1.2 },
]

export const BALLOON_BOUNDS = { minX: 3, minY: 3, maxX: 27, maxY: 30 }

export const variantPalettes: Record<BenLogoVariant, BenLogoPalette> = {
  brand: { body: primary, fold: brandLight, bars: ink },
  avatar: {
    body: surfaceLowest,
    fold: brandLight,
    stroke: dogEar,
    bars: primary,
  },
}

export const SILHOUETTE_COLORS = {
  themed: silhouetteThemed,
  notification: silhouetteNotification,
}
