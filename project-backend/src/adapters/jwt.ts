export type ExpiredTokenState = {
  userId: null
  expired: true
}

export type ValidTokenState = {
  userId: string
  expired: false
}

export abstract class JwtService {
  abstract generateToken(userId: string): string
  abstract getState(token: string): ExpiredTokenState | ValidTokenState
}
