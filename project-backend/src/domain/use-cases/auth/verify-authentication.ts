import { AuthProviderService } from '@/adapters/auth-provider'
import { JwtService } from '@/adapters/jwt'
import { UserRepository } from '@/adapters/repositories/user-repository'
import { UserIndexes } from '@/domain/entities/user'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'

interface Payload {
  jwtToken: string
  providerToken: string
}

interface Response {
  jwtToken: string
  userId: string
}

export class VerifyAuthenticationUseCase {
  constructor(
    private userRepository: UserRepository,
    private authProviderService: AuthProviderService,
    private jwtService: JwtService,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const jwtState = this.jwtService.getState(payload.jwtToken)

    if (!jwtState.expired) {
      return { jwtToken: payload.jwtToken, userId: jwtState.userId }
    }

    const userFromProvider = await this.authProviderService.getUserFromToken({
      token: payload.providerToken,
    })

    if (!userFromProvider) {
      throw new DomainError({
        code: 'INVALID_PROVIDER_TOKEN',
        errorType: DangerErrors.UNAUTHORIZED,
      })
    }

    const user = await this.userRepository.get(
      { providerId: userFromProvider.id },
      { index: UserIndexes.PROVIDER_ID },
    )

    const newJwtToken = this.jwtService.generateToken(user.id.toValue())

    return { jwtToken: newJwtToken, userId: user.id.toValue() }
  }
}
