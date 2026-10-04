export type GetUserFromTokenPayload = {
  token: string
}

export type GetUserFromTokenResponse = {
  id: string
  name: string
  email: string
  avatarUrl: string
}

export interface AuthProviderService {
  getUserFromToken(
    payload: GetUserFromTokenPayload,
  ): Promise<GetUserFromTokenResponse | null>
}
