import { beforeEach, describe, expect, it } from 'vitest'

import { expectError, some } from '@/modules/tests'
import { ResourceNotFoundError } from '@ben/domain-base'

import { InMemoryUserRepository } from '@/domain/__tests__/repositories/user'
import { UserFactory } from '@/domain/__tests__/factories/user'
import { GetAgentPreferencesUseCase } from '@/domain/use-cases/agent-preferences/get-agent-preferences'
import { AgentModelSlug } from '@ben/adapters'

describe('GetAgentPreferencesUseCase', () => {
  let userRepository: InMemoryUserRepository
  let userFactory: UserFactory
  let sut: GetAgentPreferencesUseCase

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    userFactory = new UserFactory(userRepository)
    sut = new GetAgentPreferencesUseCase(userRepository)
  })

  it('returns the stored model and effort', async () => {
    const user = await userFactory.create({
      agentModelSlug: 'deepseek/deepseek-v4.1-flash',
      agentEffort: 'low',
    })

    const response = await sut.execute({ userId: user.id.toValue() })

    expect(response).toEqual({
      item: { modelSlug: 'deepseek/deepseek-v4.1-flash', effort: 'low' },
    })
  })

  it('returns the default model and its default effort when the user has no preference', async () => {
    const user = await userFactory.create({
      agentModelSlug: null,
      agentEffort: null,
    })

    const response = await sut.execute({ userId: user.id.toValue() })

    expect(response).toEqual({
      item: { modelSlug: 'openai/gpt-5.6-luna', effort: 'medium' },
    })
  })

  it('falls back to the model default effort when the stored effort is not supported by the stored model', async () => {
    const user = await userFactory.create({
      agentModelSlug: 'deepseek/deepseek-v4.1-flash',
      agentEffort: 'none',
    })

    const response = await sut.execute({ userId: user.id.toValue() })

    expect(response).toEqual({
      item: { modelSlug: 'deepseek/deepseek-v4.1-flash', effort: 'high' },
    })
  })

  it('falls back to the default model when the stored model slug is unknown', async () => {
    const user = await userFactory.create({
      agentModelSlug: 'unknown/model' as AgentModelSlug,
      agentEffort: 'low',
    })

    const response = await sut.execute({ userId: user.id.toValue() })

    expect(response).toEqual({
      item: { modelSlug: 'openai/gpt-5.6-luna', effort: 'low' },
    })
  })

  it('rejects an unknown user', async () => {
    await userFactory.create()

    await expectError(async () => {
      await sut.execute({ userId: some.uuid() })
    }, ResourceNotFoundError)
  })
})
