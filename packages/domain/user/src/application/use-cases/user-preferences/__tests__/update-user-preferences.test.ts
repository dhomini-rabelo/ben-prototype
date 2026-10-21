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
    expect(response).toEqual({
      item: {
        language: 'pt-BR',
        showUsdCost: true,
        morningTime: '08:00',
        dailySummaryEnabled: true,
        dailySummaryTime: '08:00',
      },
    })
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
    expect(response).toEqual({
      item: {
        language: 'en',
        showUsdCost: true,
        morningTime: '08:00',
        dailySummaryEnabled: true,
        dailySummaryTime: '08:00',
      },
    })
    expect(storedUser.props.language).toBe('en')
    expect(storedUser.props.showUsdCost).toBe(true)
  })

  it('returns the current preferences when the payload has no fields', async () => {
    const user = await userFactory.create({
      language: 'en',
      showUsdCost: true,
    })

    const response = await sut.execute({ userId: user.id.toValue() })

    expect(response).toEqual({
      item: {
        language: 'en',
        showUsdCost: true,
        morningTime: '08:00',
        dailySummaryEnabled: true,
        dailySummaryTime: '08:00',
      },
    })
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

  it('stores the three schedule preferences', async () => {
    const user = await userFactory.create()

    const response = await sut.execute({
      userId: user.id.toValue(),
      morningTime: '07:30',
      dailySummaryEnabled: false,
      dailySummaryTime: '21:00',
    })

    const storedUser = await userRepository.get({ id: user.id })
    expect(response.item).toMatchObject({
      morningTime: '07:30',
      dailySummaryEnabled: false,
      dailySummaryTime: '21:00',
    })
    expect(storedUser.props.morningTime).toBe('07:30')
    expect(storedUser.props.dailySummaryEnabled).toBe(false)
    expect(storedUser.props.dailySummaryTime).toBe('21:00')
  })

  it.each(['24:00', '8:00', '12:60', 'abc', ''])(
    'rejects the invalid time %j and stores nothing',
    async (time) => {
      const user = await userFactory.create()

      const error = await expectError(async () => {
        await sut.execute({
          userId: user.id.toValue(),
          dailySummaryTime: time,
        })
      }, ValidationError)

      const storedUser = await userRepository.get({ id: user.id })
      expect(error.response.errorField).toBe('dailySummaryTime')
      expect(error.response.code).toBe('INVALID_TIME_FORMAT')
      expect(storedUser.props.dailySummaryTime).toBeNull()
    },
  )

  it('accepts the 00:00 and 23:59 boundaries', async () => {
    const user = await userFactory.create()

    const response = await sut.execute({
      userId: user.id.toValue(),
      morningTime: '00:00',
      dailySummaryTime: '23:59',
    })

    expect(response.item).toMatchObject({
      morningTime: '00:00',
      dailySummaryTime: '23:59',
    })
  })
})
