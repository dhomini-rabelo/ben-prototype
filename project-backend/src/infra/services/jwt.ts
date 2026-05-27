import {
  ExpiredTokenState,
  JwtService,
  ValidTokenState,
} from '@/domain/services/jwt'

import jwt from 'jsonwebtoken'

type TokenPayload = {
  userId: string
}

const TOKEN_ALGORITHM = 'HS256' as const

export class JsonWebTokenJwtService extends JwtService {
  constructor(
    private readonly settings: {
      privateKey: string
      expirationTimeInSeconds: number
    },
  ) {
    super()
  }

  generateToken(userId: string): string {
    return jwt.sign({ userId }, this.settings.privateKey, {
      expiresIn: this.settings.expirationTimeInSeconds,
      algorithm: TOKEN_ALGORITHM,
    })
  }

  getState(token: string): ExpiredTokenState | ValidTokenState {
    try {
      const data = jwt.verify(token, this.settings.privateKey, {
        algorithms: [TOKEN_ALGORITHM],
      }) as TokenPayload
      return { userId: data.userId, expired: false }
    } catch {
      return { userId: null, expired: true }
    }
  }
}
