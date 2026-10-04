import { beforeEach, describe, expect, it } from 'vitest'

import {
  FakeAuthProviderService,
  FakeJwtService,
  expectError,
  some,
} from '@ben/modules-tests'
import { DangerErrors, DomainError } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'

import { InMemoryUserRepository } from '@/domain/__tests__/repositories/user'
import { UserFactory } from '@/domain/__tests__/factories/user'
import { VerifyAuthenticationUseCase } from '@/domain/use-cases/auth/verify-authentication'

describe('VerifyAuthenticationUseCase', () => {
  let userRepository: InMemoryUserRepository
  let userFactory: UserFactory
  let authProviderService: FakeAuthProviderService
  let jwtService: FakeJwtService
  let sut: VerifyAuthenticationUseCase

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    userFactory = new UserFactory(userRepository)
    authProviderService = new FakeAuthProviderService()
    jwtService = new FakeJwtService()
    sut = new VerifyAuthenticationUseCase(
      userRepository,
      authProviderService,
      jwtService,
    )
  })

  it('returns the same jwt and user id when the jwt is not expired', async () => {
    const user = await userFactory.create()
    jwtService.allow('valid-jwt', user.id.toValue())

    const response = await sut.execute({
      jwtToken: 'valid-jwt',
      providerToken: 'provider-token',
    })

    expect(response).toEqual({
      jwtToken: 'valid-jwt',
      userId: user.id.toValue(),
    })
    expect(authProviderService.calls).toBe(0)
    expect(jwtService.generatedFor).toEqual([])
  })

  it('reissues a jwt from the provider token when the jwt is expired', async () => {
    const providerId = some.uuid()
    const user = await userFactory.create({ providerId })
    authProviderService.register('provider-token', {
      id: providerId,
      name: some.text(),
      email: some.email(),
      avatarUrl: some.text(),
    })

    const response = await sut.execute({
      jwtToken: 'expired-jwt',
      providerToken: 'provider-token',
    })

    expect(response).toEqual({
      jwtToken: `jwt-${user.id.toValue()}`,
      userId: user.id.toValue(),
    })
    expect(jwtService.generatedFor).toEqual([user.id.toValue()])
  })

  it('rejects an invalid provider token when the jwt is expired', async () => {
    await userFactory.create()

    const error = await expectError(async () => {
      await sut.execute({
        jwtToken: 'expired-jwt',
        providerToken: 'unknown-token',
      })
    }, DomainError)

    expect(error.response.code).toBe('INVALID_PROVIDER_TOKEN')
    expect(error.response.errorType).toBe(DangerErrors.UNAUTHORIZED)
    expect(jwtService.generatedFor).toEqual([])
  })

  it('rejects when the provider user is not registered', async () => {
    await userFactory.create()
    authProviderService.register('provider-token', {
      id: some.uuid(),
      name: some.text(),
      email: some.email(),
      avatarUrl: some.text(),
    })

    await expectError(async () => {
      await sut.execute({
        jwtToken: 'expired-jwt',
        providerToken: 'provider-token',
      })
    }, ResourceNotFoundError)

    expect(jwtService.generatedFor).toEqual([])
  })
})
