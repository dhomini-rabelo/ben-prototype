import { ExpiredTokenState, JwtService, ValidTokenState } from '@/adapters/jwt'

export class FakeJwtService extends JwtService {
  public generatedFor: string[] = []
  private validTokens = new Map<string, string>()

  allow(token: string, userId: string) {
    this.validTokens.set(token, userId)
  }

  generateToken(userId: string) {
    this.generatedFor.push(userId)
    return `jwt-${userId}`
  }

  getState(token: string): ExpiredTokenState | ValidTokenState {
    const userId = this.validTokens.get(token)

    if (!userId) {
      return { userId: null, expired: true }
    }

    return { userId, expired: false }
  }
}
