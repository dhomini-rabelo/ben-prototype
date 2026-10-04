import {
  AuthProviderService,
  GetUserFromTokenPayload,
  GetUserFromTokenResponse,
} from '@ben/adapters'

export class FakeAuthProviderService implements AuthProviderService {
  public calls = 0
  private users = new Map<string, GetUserFromTokenResponse>()

  register(token: string, user: GetUserFromTokenResponse) {
    this.users.set(token, user)
  }

  async getUserFromToken({ token }: GetUserFromTokenPayload) {
    this.calls += 1
    return this.users.get(token) ?? null
  }
}
