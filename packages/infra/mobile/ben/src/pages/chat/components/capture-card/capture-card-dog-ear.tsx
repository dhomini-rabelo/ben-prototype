import Svg, { Path } from 'react-native-svg'
import { dogEar } from '@/layout/utils/colors'

const DOG_EAR_SIZE = 12
const DOG_EAR_PATH = 'M0 0V9Q0 12 3 12H12Z'

export function CaptureCardDogEar() {
  return (
    <Svg
      width={DOG_EAR_SIZE}
      height={DOG_EAR_SIZE}
      viewBox="0 0 12 12"
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, right: 0 }}
    >
      <Path d={DOG_EAR_PATH} fill={dogEar} />
    </Svg>
  )
}
