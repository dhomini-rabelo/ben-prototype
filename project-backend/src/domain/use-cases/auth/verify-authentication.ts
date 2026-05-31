import { AuthProviderService } from '@/adapters/auth-provider'
import { JwtService } from '@/adapters/jwt'
import { UserRepository } from '@/adapters/repositories/user-repository'
import { getUserFromProviderTokenOrThrow } from '@/domain/utils/auth'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  jwtToken: string
  providerToken: string
}

interface Response {
  jwtToken: string
  userId: string
}

export class VerifyAuthenticationUseCase implements UseCase<Response> {
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

    const userFromProvider = await getUserFromProviderTokenOrThrow(
      this.authProviderService,
      payload.providerToken,
    )

    const user = await this.userRepository.get({
      providerId: userFromProvider.id,
    })

    const newJwtToken = this.jwtService.generateToken(user.id.toValue())

    return { jwtToken: newJwtToken, userId: user.id.toValue() }
  }
}
