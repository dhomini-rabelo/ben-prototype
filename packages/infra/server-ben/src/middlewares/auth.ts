import { VerifyAuthenticationUseCase } from '@ben/domain-user/application/use-cases/auth/verify-authentication'
import { userRepository } from '@ben/server-ben/repositories'
import { env } from '@ben/modules-env'
import {
  FirebaseAuthProviderService,
  JsonWebTokenJwtService,
} from '@ben/infra-adapters'
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
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const headers = headersSchema.parse(request.headers)
    const result = await verifyAuthenticationUseCase.execute({
      jwtToken: headers.jwtauthenticationtoken,
      providerToken: headers.providerauthenticationtoken,
    })

    request.userId = result.userId

    if (result.jwtToken !== headers.jwtauthenticationtoken) {
      response.setHeader('updatedjwtauthenticationtoken', result.jwtToken)
    }

    next()
  } catch (error) {
    next(error)
  }
}
