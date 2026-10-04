import { AuthProviderService } from '@ben/adapters'
import { DangerErrors, DomainError } from '@ben/domain-base'

export async function getUserFromProviderTokenOrThrow(
  authProviderService: AuthProviderService,
  providerToken: string,
) {
  const userFromProvider = await authProviderService.getUserFromToken({
    token: providerToken,
  })

  if (!userFromProvider) {
    throw new DomainError({
      code: 'INVALID_PROVIDER_TOKEN',
      errorType: DangerErrors.UNAUTHORIZED,
    })
  }

  return userFromProvider
}
