import { AuthProviderService } from '@/adapters/auth-provider'
import { JwtService } from '@/adapters/jwt'
import { UserRepository } from '@/adapters/repositories/user-repository'
import { User } from '@/domain/entities/user'
import { getUserFromProviderTokenOrThrow } from '@/domain/utils/auth'

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
    const userFromProvider = await getUserFromProviderTokenOrThrow(
      this.authProviderService,
      payload.token,
    )

    const existingUser = await this.userRepository.findUnique({
      providerId: userFromProvider.id,
    })

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
