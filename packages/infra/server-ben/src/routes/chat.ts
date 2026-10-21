import { PersistCapturesUseCase } from '@ben/domain-chat/application/use-cases/captures/persist-captures'
import { GetAgentPreferencesUseCase } from '@ben/domain-user/application/use-cases/agent-preferences/get-agent-preferences'
import { PersistBenMessageUseCase } from '@ben/domain-chat/application/use-cases/messages/persist-ben-message'
import { PersistUserMessageUseCase } from '@ben/domain-chat/application/use-cases/messages/persist-user-message'
import { BuildTopicIndexUseCase } from '@ben/domain-topic/application/use-cases/topics/build-topic-index'
import { GetHistoryContextUseCase } from '@ben/domain-topic/application/use-cases/topics/get-history-context'
import { PersistTopicSummariesUseCase } from '@ben/domain-topic/application/use-cases/topics/persist-topic-summaries'
import {
  messageRepository,
  noteRepository,
  reminderRepository,
  taskRepository,
  topicRepository,
  topicSummaryRepository,
  userRepository,
} from '@ben/server-ben/repositories'
import { AgentReplyPresenter } from '@ben/server-ben/presenters/agent-reply-presenter'
import { BenAgentProviderService } from '@ben/infra-adapters'
import { createID } from '@ben/domain-base'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        parts: z.array(
          z.object({
            type: z.string(),
            text: z.string().optional(),
          }),
        ),
      }),
    )
    .min(1),
  transcriptionCostUsd: z.number().finite().nonnegative().nullable().optional(),
})

const agentService = new BenAgentProviderService()
const getAgentPreferencesUseCase = new GetAgentPreferencesUseCase(
  userRepository,
)
const persistUserMessageUseCase = new PersistUserMessageUseCase(
  messageRepository,
)
const persistBenMessageUseCase = new PersistBenMessageUseCase(messageRepository)
const buildTopicIndexUseCase = new BuildTopicIndexUseCase(topicRepository)
const getHistoryContextUseCase = new GetHistoryContextUseCase(
  topicSummaryRepository,
)
const persistTopicSummariesUseCase = new PersistTopicSummariesUseCase(
  topicRepository,
  topicSummaryRepository,
)
const persistCapturesUseCase = new PersistCapturesUseCase(
  noteRepository,
  reminderRepository,
  taskRepository,
)

function extractLatestUserMessageText(
  messages: z.infer<typeof chatBodySchema>['messages'],
): string | null {
  const userMessages = messages.filter((message) => message.role === 'user')
  const latestUserMessage = userMessages[userMessages.length - 1]

  if (!latestUserMessage) {
    return null
  }

  const text = latestUserMessage.parts
    .filter((part) => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('')
    .trim()

  return text.length > 0 ? text : null
}

export async function chat(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const body = chatBodySchema.parse(request.body)
    const message = extractLatestUserMessageText(body.messages)

    if (!message) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'No user message provided.' })
    }

    const userMessageResult = await persistUserMessageUseCase.execute({
      userId: request.userId,
      content: message,
      costUsd: body.transcriptionCostUsd,
    })

    const topicIndex = await buildTopicIndexUseCase.execute({
      userId: request.userId,
    })

    const preferences = await getAgentPreferencesUseCase.execute({
      userId: request.userId,
    })

    const { reply, trace } = await agentService.generateReply({
      userId: request.userId,
      message,
      topicIndex,
      resolveHistoryContext: ({ topics }) =>
        getHistoryContextUseCase.execute({ userId: request.userId, topics }),
      model: preferences.item,
    })

    const capturesResult = await persistCapturesUseCase.execute({
      userId: request.userId,
      newReminders: reply.newReminders,
      newNotes: reply.newNotes,
      newTasks: reply.newTasks,
    })

    const primaryCapture = capturesResult.items[0] ?? null

    const benMessageResult = await persistBenMessageUseCase.execute({
      userId: request.userId,
      content: reply.message,
      capture: primaryCapture
        ? { kind: primaryCapture.kind, itemId: createID(primaryCapture.itemId) }
        : null,
      trace,
      triggerCostUsd: userMessageResult.item.props.costUsd,
    })

    await persistTopicSummariesUseCase.execute({
      userId: request.userId,
      topics: reply.historyTopics,
      messageId: benMessageResult.item.id.toValue(),
    })

    return response
      .status(HttpStatus.OK)
      .json(
        AgentReplyPresenter.toHttp(
          reply,
          primaryCapture,
          benMessageResult.item.id.toValue(),
          benMessageResult.item.props.interactionCostUsd,
        ),
      )
  } catch (error) {
    next(error)
  }
}
