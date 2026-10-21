import { beforeEach, describe, expect, it } from 'vitest'

import { expectError, some } from '@ben/modules-tests'
import { ValidationError } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'

import { InMemoryUserRepository } from '@ben/domain-user/application/__tests__/repositories/user'
import { UserFactory } from '@ben/domain-user/application/__tests__/factories/user'
import { UpdateUserPreferencesUseCase } from '@ben/domain-user/application/use-cases/user-preferences/update-user-preferences'

describe('UpdateUserPreferencesUseCase', () => {
  let userRepository: InMemoryUserRepository
  let userFactory: UserFactory
  let sut: UpdateUserPreferencesUseCase

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    userFactory = new UserFactory(userRepository)
    sut = new UpdateUserPreferencesUseCase(userRepository)
  })

  it('stores the language without touching showUsdCost', async () => {
    const user = await userFactory.create({
      language: null,
      showUsdCost: true,
    })

    const response = await sut.execute({
      userId: user.id.toValue(),
      language: 'pt-BR',
    })

    const storedUser = await userRepository.get({ id: user.id })
    expect(response).toEqual({ item: { language: 'pt-BR', showUsdCost: true } })
    expect(storedUser.props.language).toBe('pt-BR')
    expect(storedUser.props.showUsdCost).toBe(true)
  })

  it('stores showUsdCost without touching the language', async () => {
    const user = await userFactory.create({
      language: 'en',
      showUsdCost: false,
    })

    const response = await sut.execute({
      userId: user.id.toValue(),
      showUsdCost: true,
    })

    const storedUser = await userRepository.get({ id: user.id })
    expect(response).toEqual({ item: { language: 'en', showUsdCost: true } })
    expect(storedUser.props.language).toBe('en')
    expect(storedUser.props.showUsdCost).toBe(true)
  })

  it('returns the current preferences when the payload has no fields', async () => {
    const user = await userFactory.create({
      language: 'en',
      showUsdCost: true,
    })

    const response = await sut.execute({ userId: user.id.toValue() })

    expect(response).toEqual({ item: { language: 'en', showUsdCost: true } })
  })

  it('rejects an unsupported language and stores nothing', async () => {
    const user = await userFactory.create({
      language: 'en',
      showUsdCost: false,
    })

    const error = await expectError(async () => {
      await sut.execute({
        userId: user.id.toValue(),
        language: 'fr',
        showUsdCost: true,
      })
    }, ValidationError)

    const storedUser = await userRepository.get({ id: user.id })
    expect(error.response.errorField).toBe('language')
    expect(error.response.code).toBe('UNSUPPORTED_USER_LANGUAGE')
    expect(storedUser.props.language).toBe('en')
    expect(storedUser.props.showUsdCost).toBe(false)
  })

  it('rejects an unknown user', async () => {
    await userFactory.create()

    await expectError(async () => {
      await sut.execute({ userId: some.uuid(), language: 'en' })
    }, ResourceNotFoundError)
  })
})
