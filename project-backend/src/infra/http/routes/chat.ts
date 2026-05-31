import { PersistBenMessageUseCase } from '@/domain/use-cases/messages/persist-ben-message'
import { PersistUserMessageUseCase } from '@/domain/use-cases/messages/persist-user-message'
import { messageRepository } from '@/infra/http/repositories'
import { GeminiAgentProviderService } from '@/infra/services/gemini-agent-provider'
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

const agentService = new GeminiAgentProviderService()
const persistUserMessageUseCase = new PersistUserMessageUseCase(
  messageRepository,
)
const persistBenMessageUseCase = new PersistBenMessageUseCase(messageRepository)

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

    const result = agentService.streamReply({
      userId: req.userId,
      message,
      onFinish: async ({ text }) => {
        await persistBenMessageUseCase.execute({
          userId: req.userId,
          content: text,
        })
      },
    })

    result.pipeUIMessageStreamToResponse(res)
  } catch (err) {
    next(err)
  }
}
