import Svg, { Circle } from 'react-native-svg'

type BenLogoProps = {
  className?: string
  width?: number
  height?: number
  color?: string
}

export function BenLogo({
  className,
  width = 36,
  height = 28,
  color = 'currentColor',
}: BenLogoProps) {
  return (
    <Svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 36 28"
      fill="none"
    >
      <Circle cx={9} cy={9} r={5} fill={color} />
      <Circle cx={22} cy={14} r={6} fill={color} />
      <Circle cx={13} cy={22} r={4} fill={color} />
    </Svg>
  )
}
