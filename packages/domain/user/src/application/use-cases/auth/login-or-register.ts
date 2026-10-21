import { AuthProviderService, GetUserFromTokenResponse } from '@ben/adapters'
import { JwtService } from '@ben/adapters'
import { UserRepository } from '@ben/domain-user/application/repositories/user'
import { User } from '@ben/domain-user/enterprise/entities/user'
import { getUserFromProviderTokenOrThrow } from '@ben/domain-user/application/utils/auth'
import { UseCase } from '@ben/domain-base'

interface Payload {
  token: string
}

interface Response {
  process: 'login' | 'register'
  user: User
  accessToken: string
}

export class LoginOrRegisterUseCase implements UseCase<Response> {
  constructor(
    private userRepository: UserRepository,
    private authProviderService: AuthProviderService,
    private jwtService: JwtService,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const userFromProvider = await getUserFromProviderTokenOrThrow(
      this.authProviderService,
      payload.token,
    )

    const existingUser = await this.userRepository.findUnique({
      providerId: userFromProvider.id,
    })

    if (existingUser) {
      return this.buildLoginResponse(existingUser)
    }

    return this.registerUser(userFromProvider)
  }

  private buildLoginResponse(existingUser: User): Response {
    return {
      process: 'login',
      user: existingUser,
      accessToken: this.jwtService.generateToken(existingUser.id.toValue()),
    }
  }

  private async registerUser(
    userFromProvider: GetUserFromTokenResponse,
  ): Promise<Response> {
    const newUser = await this.userRepository.create({
      name: userFromProvider.name,
      username: userFromProvider.email.split('@')[0],
      email: userFromProvider.email,
      avatarUrl: userFromProvider.avatarUrl,
      providerId: userFromProvider.id,
      createdAt: new Date(),
      agentModelSlug: null,
      agentEffort: null,
      language: null,
      morningTime: null,
      dailySummaryEnabled: null,
      dailySummaryTime: null,
      showUsdCost: false,
    })

    return {
      process: 'register',
      user: newUser,
      accessToken: this.jwtService.generateToken(newUser.id.toValue()),
    }
  }
}
