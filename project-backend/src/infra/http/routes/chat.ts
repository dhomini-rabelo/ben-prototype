import { PersistCapturesUseCase } from '@/domain/use-cases/captures/persist-captures'
import { PersistBenMessageUseCase } from '@/domain/use-cases/messages/persist-ben-message'
import { PersistUserMessageUseCase } from '@/domain/use-cases/messages/persist-user-message'
import { BuildTopicIndexUseCase } from '@/domain/use-cases/topics/build-topic-index'
import { GetHistoryContextUseCase } from '@/domain/use-cases/topics/get-history-context'
import { PersistTopicSummariesUseCase } from '@/domain/use-cases/topics/persist-topic-summaries'
import {
  messageRepository,
  noteRepository,
  reminderRepository,
  taskRepository,
  topicRepository,
  topicSummaryRepository,
} from '@/infra/http/repositories'
import { AgentReplyPresenter } from '@/infra/http/presenters/agent-reply-presenter'
import { BenAgentProviderService } from '@/infra/services/ben-agent-provider'
import { createID } from '@/modules/domain/entity/id'
import { openRouterModel } from '@/infra/services/ben-agent-provider/models'
import { HttpStatus } from '@/modules/utils/http'
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
})

const agentService = new BenAgentProviderService(openRouterModel)
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

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const body = chatBodySchema.parse(req.body)
    const message = extractLatestUserMessageText(body.messages)

    if (!message) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'No user message provided.' })
    }

    await persistUserMessageUseCase.execute({
      userId: req.userId,
      content: message,
    })

    const topicIndex = await buildTopicIndexUseCase.execute({
      userId: req.userId,
    })

    const reply = await agentService.generateReply({
      userId: req.userId,
      message,
      topicIndex,
      resolveHistoryContext: ({ topics }) =>
        getHistoryContextUseCase.execute({ userId: req.userId, topics }),
    })

    const capturesResult = await persistCapturesUseCase.execute({
      userId: req.userId,
      newReminders: reply.newReminders,
      newNotes: reply.newNotes,
      newTasks: reply.newTasks,
    })

    const primaryCapture = capturesResult.items[0] ?? null

    const benMessageResult = await persistBenMessageUseCase.execute({
      userId: req.userId,
      content: reply.message,
      capture: primaryCapture
        ? { kind: primaryCapture.kind, itemId: createID(primaryCapture.itemId) }
        : null,
    })

    await persistTopicSummariesUseCase.execute({
      userId: req.userId,
      topics: reply.historyTopics,
      messageId: benMessageResult.item.id.toValue(),
    })

    return res
      .status(HttpStatus.OK)
      .json(AgentReplyPresenter.toHttp(reply, primaryCapture))
  } catch (err) {
    next(err)
  }
}
