import { LoginOrRegisterUseCase } from '@/domain/use-cases/auth/login-or-register'
import { UserPresenter } from '@/infra/http/presenters/user-presenter'
import { env } from '@/infra/services/env'
import { FirebaseAuthProviderService } from '@/infra/services/firebase-auth-provider'
import { JsonWebTokenJwtService } from '@/infra/services/jwt'
import { InMemoryUserRepository } from '@/infra/services/repositories/in-memory-user-repository'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const bodySchema = z.object({
  token: z.string(),
})

const userRepository = new InMemoryUserRepository()
const authProviderService = new FirebaseAuthProviderService()
const jwtService = new JsonWebTokenJwtService({
  privateKey: env.JWT_PRIVATE_KEY,
  expirationTimeInSeconds: env.JWT_EXPIRATION_TIME_IN_SECONDS,
})

const loginOrRegisterUseCase = new LoginOrRegisterUseCase(
  userRepository,
  authProviderService,
  jwtService,
)

export async function loginOrRegister(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = bodySchema.parse(req.body)
    const result = await loginOrRegisterUseCase.execute({ token: body.token })

    return res.status(HttpStatus.OK).json({
      process: result.process,
      user: UserPresenter.toHttp(result.user),
      accessToken: result.accessToken,
    })
  } catch (err) {
    next(err)
  }
}
