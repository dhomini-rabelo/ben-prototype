import { beforeEach, describe, expect, it } from 'vitest'

import {
  FakeAuthProviderService,
  FakeJwtService,
  expectError,
  some,
} from '@ben/modules-tests'
import { DangerErrors, DomainError } from '@ben/domain-base'

import { InMemoryUserRepository } from '@ben/domain-user/application/__tests__/repositories/user'
import { UserFactory } from '@ben/domain-user/application/__tests__/factories/user'
import { LoginOrRegisterUseCase } from '@ben/domain-user/application/use-cases/auth/login-or-register'

describe('LoginOrRegisterUseCase', () => {
  let userRepository: InMemoryUserRepository
  let userFactory: UserFactory
  let authProviderService: FakeAuthProviderService
  let jwtService: FakeJwtService
  let sut: LoginOrRegisterUseCase

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    userFactory = new UserFactory(userRepository)
    authProviderService = new FakeAuthProviderService()
    jwtService = new FakeJwtService()
    sut = new LoginOrRegisterUseCase(
      userRepository,
      authProviderService,
      jwtService,
    )
  })

  it('logs in an existing user matched by provider id and issues a jwt for its id', async () => {
    const providerId = some.uuid()
    const existingUser = await userFactory.create({ providerId })
    authProviderService.register('provider-token', {
      id: providerId,
      name: some.text(),
      email: some.email(),
      avatarUrl: some.text(),
    })

    const response = await sut.execute({ token: 'provider-token' })

    expect(response.process).toBe('login')
    expect(response.user.id.toValue()).toBe(existingUser.id.toValue())
    expect(response.accessToken).toBe(`jwt-${existingUser.id.toValue()}`)
    expect(jwtService.generatedFor).toEqual([existingUser.id.toValue()])
    expect(await userRepository.count({})).toBe(1)
  })

  it('registers a new user when no user has the provider id', async () => {
    await userFactory.create()
    const providerUser = {
      id: some.uuid(),
      name: 'Ada Lovelace',
      email: 'ada.lovelace@example.com',
      avatarUrl: 'https://example.com/ada.png',
    }
    authProviderService.register('provider-token', providerUser)

    const response = await sut.execute({ token: 'provider-token' })

    expect(response.process).toBe('register')
    expect(response.user.props).toMatchObject({
      name: providerUser.name,
      username: 'ada.lovelace',
      email: providerUser.email,
      avatarUrl: providerUser.avatarUrl,
      providerId: providerUser.id,
      agentModelSlug: null,
      agentEffort: null,
    })
    expect(response.accessToken).toBe(`jwt-${response.user.id.toValue()}`)
    expect(jwtService.generatedFor).toEqual([response.user.id.toValue()])
    expect(await userRepository.count({})).toBe(2)
    const persistedUser = await userRepository.get({ id: response.user.id })
    expect(persistedUser.props.providerId).toBe(providerUser.id)
  })

  it('rejects an invalid provider token', async () => {
    const error = await expectError(async () => {
      await sut.execute({ token: 'unknown-token' })
    }, DomainError)

    expect(error.response.code).toBe('INVALID_PROVIDER_TOKEN')
    expect(error.response.errorType).toBe(DangerErrors.UNAUTHORIZED)
    expect(await userRepository.count({})).toBe(0)
    expect(jwtService.generatedFor).toEqual([])
  })
})
