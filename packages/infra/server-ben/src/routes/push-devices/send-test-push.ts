import { SendUserPushNotificationUseCase } from '@ben/domain-notification/application/use-cases/push-notifications/send-user-push-notification'
import { ExpoPushSender } from '@ben/infra-adapters'
import { env } from '@ben/modules-env'
import { pushDeviceRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'

const pushSender = new ExpoPushSender({ accessToken: env.EXPO_ACCESS_TOKEN })
const sendUserPushNotificationUseCase = new SendUserPushNotificationUseCase(
  pushDeviceRepository,
  pushSender,
)

export async function sendTestPush(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const item = await sendUserPushNotificationUseCase.execute({
      userId: request.userId,
      title: 'Ben',
      body: 'Test notification: remote push is working.',
      data: { type: 'test' },
      channelId: 'alarmes',
    })

    return response.status(HttpStatus.OK).json({ item })
  } catch (error) {
    next(error)
  }
}
