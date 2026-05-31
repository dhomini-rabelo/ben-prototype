import { InMemoryUserRepository } from '@/adapters/repositories/in-memory-user-repository'
import { VerifyAuthenticationUseCase } from '@/domain/use-cases/auth/verify-authentication'
import { env } from '@/infra/services/env'
import { FirebaseAuthProviderService } from '@/infra/services/firebase-auth-provider'
import { JsonWebTokenJwtService } from '@/infra/services/jwt'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

declare global {
  namespace Express {
    interface Request {
      userId: string
    }
  }
}

const headersSchema = z.object({
  jwtauthenticationtoken: z.string(),
  providerauthenticationtoken: z.string(),
})

const userRepository = new InMemoryUserRepository()
const authProviderService = new FirebaseAuthProviderService()
const jwtService = new JsonWebTokenJwtService({
  privateKey: env.JWT_PRIVATE_KEY,
  expirationTimeInSeconds: env.JWT_EXPIRATION_TIME_IN_SECONDS,
})

const verifyAuthenticationUseCase = new VerifyAuthenticationUseCase(
  userRepository,
  authProviderService,
  jwtService,
)

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const headers = headersSchema.parse(req.headers)
    const result = await verifyAuthenticationUseCase.execute({
      jwtToken: headers.jwtauthenticationtoken,
      providerToken: headers.providerauthenticationtoken,
    })

    req.userId = result.userId

    if (result.jwtToken !== headers.jwtauthenticationtoken) {
      res.setHeader('updatedjwtauthenticationtoken', result.jwtToken)
    }

    next()
  } catch (err) {
    next(err)
  }
}
