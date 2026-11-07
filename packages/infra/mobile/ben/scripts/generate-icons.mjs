import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BALLOON_BOUNDS,
  BALLOON_PATH,
  BAR_SHAPES,
  FOLD_PATH,
  LOGO_VIEW_BOX_SIZE,
  SILHOUETTE_COLORS,
  variantPalettes,
} from '../src/layout/utils/ben-logo-geometry.ts'
import { background } from '../src/layout/utils/colors.ts'

const BALLOON_WIDTH = BALLOON_BOUNDS.maxX - BALLOON_BOUNDS.minX
const BALLOON_HEIGHT = BALLOON_BOUNDS.maxY - BALLOON_BOUNDS.minY
const CENTER_X = (BALLOON_BOUNDS.minX + BALLOON_BOUNDS.maxX) / 2
const CENTER_Y = (BALLOON_BOUNDS.minY + BALLOON_BOUNDS.maxY) / 2

function scaleToExtent(size, ratio) {
  return (size * ratio) / Math.max(BALLOON_WIDTH, BALLOON_HEIGHT)
}

function scaleToDiagonal(size, ratio) {
  return (size * ratio) / Math.hypot(BALLOON_WIDTH, BALLOON_HEIGHT)
}

function barRect(bar, fill) {
  return `<rect x="${bar.x}" y="${bar.y}" width="${bar.width}" height="${bar.height}" rx="${bar.radius}" fill="${fill}"/>`
}

function brandLayer() {
  const palette = variantPalettes.brand
  return [
    `<path d="${BALLOON_PATH}" fill="${palette.body}"/>`,
    `<path d="${FOLD_PATH}" fill="${palette.fold}"/>`,
    ...BAR_SHAPES.map((bar) => barRect(bar, palette.bars)),
  ].join('')
}

function silhouetteLayer(color) {
  const mask = [
    `<mask id="bars">`,
    `<rect width="${LOGO_VIEW_BOX_SIZE}" height="${LOGO_VIEW_BOX_SIZE}" fill="white"/>`,
    ...BAR_SHAPES.map((bar) => barRect(bar, 'black')),
    `</mask>`,
  ].join('')
  return `${mask}<g mask="url(#bars)" fill="${color}"><path d="${BALLOON_PATH}"/><path d="${FOLD_PATH}"/></g>`
}

function buildSvg({ size, scale, layer, backgroundColor }) {
  const backgroundRect = backgroundColor
    ? `<rect width="${size}" height="${size}" fill="${backgroundColor}"/>`
    : ''
  const transform = `translate(${size / 2} ${size / 2}) scale(${scale}) translate(${-CENTER_X} ${-CENTER_Y})`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${backgroundRect}<g transform="${transform}">${layer}</g></svg>`
}

const assets = [
  {
    file: 'icon.png',
    size: 1024,
    scale: scaleToExtent(1024, 0.6),
    backgroundColor: background,
    layer: brandLayer(),
  },
  {
    file: 'adaptive-icon-foreground.png',
    size: 1024,
    scale: scaleToDiagonal(1024, 0.6),
    layer: brandLayer(),
  },
  {
    file: 'adaptive-icon-monochrome.png',
    size: 1024,
    scale: scaleToDiagonal(1024, 0.6),
    layer: silhouetteLayer(SILHOUETTE_COLORS.themed),
  },
  {
    file: 'splash-icon.png',
    size: 1024,
    scale: scaleToExtent(1024, 0.64),
    layer: brandLayer(),
  },
  {
    file: 'notification-icon.png',
    size: 96,
    scale: scaleToExtent(96, 0.86),
    layer: silhouetteLayer(SILHOUETTE_COLORS.notification),
  },
  {
    file: 'favicon.png',
    size: 64,
    scale: scaleToExtent(64, 0.8),
    backgroundColor: background,
    layer: brandLayer(),
  },
]

async function main() {
  const here = dirname(fileURLToPath(import.meta.url))
  const out = join(here, '..', 'assets')
  let stage = 'load rasterizer'
  try {
    const rasterizer = await import('@resvg/resvg-js')
    const { Resvg } = rasterizer.default ?? rasterizer
    await mkdir(out, { recursive: true })
    for (const asset of assets) {
      stage = `render assets/${asset.file}`
      const svg = buildSvg(asset)
      const png = new Resvg(svg, { font: { loadSystemFonts: false } })
        .render()
        .asPng()
      await writeFile(join(out, asset.file), png)
      console.log(`assets/${asset.file} ${asset.size}x${asset.size}`)
    }
  } catch (error) {
    console.error(`icons: failed at ${stage}: ${error.message}`)
    console.error('Run `pnpm install` at the repository root and try again.')
    process.exitCode = 1
  }
}

await main()
