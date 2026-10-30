import { RegisterPushDeviceUseCase } from '@ben/domain-notification/application/use-cases/push-devices/register-push-device'
import { PushDevicePresenter } from '@ben/server-ben/presenters/push-device-presenter'
import { pushDeviceRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const bodySchema = z.object({ token: z.string().min(1) })

const registerPushDeviceUseCase = new RegisterPushDeviceUseCase(
  pushDeviceRepository,
)

export async function registerPushDevice(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const body = bodySchema.parse(request.body)

    const result = await registerPushDeviceUseCase.execute({
      userId: request.userId,
      token: body.token,
    })

    return response
      .status(result.created ? HttpStatus.CREATED : HttpStatus.OK)
      .json({ item: PushDevicePresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
