import { InMemoryUserRepository } from '@/adapters/repositories/in-memory-user-repository'
import { LoginOrRegisterUseCase } from '@/domain/use-cases/auth/login-or-register'
import { UserPresenter } from '@/infra/http/presenters/user-presenter'
import { FirebaseAuthProviderService } from '@/infra/services/firebase-auth-provider'
import { env } from '@/infra/services/env'
import { JsonWebTokenJwtService } from '@/infra/services/jwt'
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

    return res.status(200).json({
      process: result.process,
      user: UserPresenter.toHttp(result.user),
      accessToken: result.accessToken,
    })
  } catch (err) {
    next(err)
  }
}
