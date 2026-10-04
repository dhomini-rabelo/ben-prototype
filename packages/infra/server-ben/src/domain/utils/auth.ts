import { AuthProviderService } from '@/adapters/auth-provider'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'

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
