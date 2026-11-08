import { View } from 'react-native'

const GLOW_LAYERS = [
  { size: 760, opacity: 0.05 },
  { size: 620, opacity: 0.07 },
  { size: 480, opacity: 0.09 },
  { size: 340, opacity: 0.12 },
  { size: 200, opacity: 0.16 },
]

type GlowProps = {
  top: number
}

export function Glow({ top }: GlowProps) {
  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 items-center"
      style={{ top }}
    >
      {GLOW_LAYERS.map((layer) => (
        <View
          key={layer.size}
          className="absolute rounded-full bg-primary"
          style={{
            width: layer.size,
            height: layer.size,
            opacity: layer.opacity,
            top: -layer.size / 2,
          }}
        />
      ))}
    </View>
  )
}
