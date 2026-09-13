// Regenerates every launcher/splash asset in `assets/` from the BenLogo geometry
// in `src/layout/components/icons/ben-logo.tsx`. Run: npm run icons -w project-mobile.
// Kept dependency-free (no sharp) so a fresh clone can rebuild the icons offline.
import { deflateSync } from 'node:zlib'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SURFACE = [0xf9, 0xf9, 0xf9]
const PRIMARY = [0x12, 0x12, 0x13]

const MARK = {
  circles: [
    { x: 9, y: 9, r: 5 },
    { x: 22, y: 14, r: 6 },
    { x: 13, y: 22, r: 4 },
  ],
  width: 24,
  height: 22,
  centerX: 16,
  centerY: 15,
}

const MARK_DIAGONAL = Math.hypot(MARK.width, MARK.height)

function crcTable() {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
}

const CRC_TABLE = crcTable()

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function encodePng(size, rgba) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8
  header[9] = 6
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1)
    raw[rowStart] = 0
    rgba.copy(raw, rowStart + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function coverage(px, py, circle, scale) {
  const edgeDistanceInPixels =
    (Math.hypot(px - circle.x, py - circle.y) - circle.r) * scale
  return Math.min(Math.max(0.5 - edgeDistanceInPixels, 0), 1)
}

function renderMark({ size, scale, background, foreground }) {
  const rgba = Buffer.alloc(size * size * 4)
  const half = size / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const markX = (x + 0.5 - half) / scale + MARK.centerX
      const markY = (y + 0.5 - half) / scale + MARK.centerY
      let alpha = 0
      for (const circle of MARK.circles) {
        alpha = Math.max(alpha, coverage(markX, markY, circle, scale))
      }
      const offset = (y * size + x) * 4
      if (background) {
        rgba[offset] = Math.round(
          background[0] * (1 - alpha) + foreground[0] * alpha,
        )
        rgba[offset + 1] = Math.round(
          background[1] * (1 - alpha) + foreground[1] * alpha,
        )
        rgba[offset + 2] = Math.round(
          background[2] * (1 - alpha) + foreground[2] * alpha,
        )
        rgba[offset + 3] = 255
      } else {
        rgba[offset] = foreground[0]
        rgba[offset + 1] = foreground[1]
        rgba[offset + 2] = foreground[2]
        rgba[offset + 3] = Math.round(alpha * 255)
      }
    }
  }
  return encodePng(size, rgba)
}

function scaleToWidth(size, ratio) {
  return (size * ratio) / MARK.width
}

function scaleToDiagonal(size, ratio) {
  return (size * ratio) / MARK_DIAGONAL
}

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', 'assets')
await mkdir(out, { recursive: true })

const assets = [
  {
    file: 'icon.png',
    size: 1024,
    scale: scaleToWidth(1024, 0.6),
    background: SURFACE,
    foreground: PRIMARY,
  },
  {
    file: 'adaptive-icon-foreground.png',
    size: 1024,
    scale: scaleToDiagonal(1024, 0.6),
    background: null,
    foreground: PRIMARY,
  },
  {
    file: 'adaptive-icon-monochrome.png',
    size: 1024,
    scale: scaleToDiagonal(1024, 0.6),
    background: null,
    foreground: [0, 0, 0],
  },
  {
    file: 'splash-icon.png',
    size: 1024,
    scale: scaleToWidth(1024, 0.72),
    background: null,
    foreground: PRIMARY,
  },
  {
    file: 'notification-icon.png',
    size: 96,
    scale: scaleToWidth(96, 0.86),
    background: null,
    foreground: [0xff, 0xff, 0xff],
  },
  {
    file: 'favicon.png',
    size: 64,
    scale: scaleToWidth(64, 0.7),
    background: SURFACE,
    foreground: PRIMARY,
  },
]

for (const { file, size, scale, background, foreground } of assets) {
  await writeFile(
    join(out, file),
    renderMark({ size, scale, background, foreground }),
  )
  console.log(`assets/${file} ${size}x${size}`)
}
