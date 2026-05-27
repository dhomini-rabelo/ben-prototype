import { UserRepository } from '@/adapters/repositories/user-repository'
import { User, UserIndexes } from '@/domain/entities/user'
import { AuthProviderService } from '@/domain/services/auth-provider'
import { JwtService } from '@/domain/services/jwt'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'

interface Payload {
  token: string
}

interface Response {
  process: 'login' | 'register'
  user: User
  accessToken: string
}

export class LoginOrRegisterUseCase {
  constructor(
    private userRepository: UserRepository,
    private authProviderService: AuthProviderService,
    private jwtService: JwtService,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const userFromProvider = await this.authProviderService.getUserFromToken({
      token: payload.token,
    })

    if (!userFromProvider) {
      throw new DomainError({
        code: 'INVALID_PROVIDER_TOKEN',
        errorType: DangerErrors.UNAUTHORIZED,
      })
    }

    const existingUser = await this.userRepository.findUnique(
      { providerId: userFromProvider.id },
      { index: UserIndexes.PROVIDER_ID },
    )

    if (existingUser) {
      return {
        process: 'login',
        user: existingUser,
        accessToken: this.jwtService.generateToken(existingUser.id.toValue()),
      }
    }

    const newUser = await this.userRepository.create({
      name: userFromProvider.name,
      username: userFromProvider.email.split('@')[0],
      email: userFromProvider.email,
      photoUrl: userFromProvider.photoURL,
      providerId: userFromProvider.id,
    })

    return {
      process: 'register',
      user: newUser,
      accessToken: this.jwtService.generateToken(newUser.id.toValue()),
    }
  }
}
