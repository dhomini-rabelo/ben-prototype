import { authClient } from '@/api/client'
import type { PushDevice, TestPushResult } from '@/api/models/push-device'
import { API_ROUTES } from '@/api/routes'
import type { ItemResponse } from '@/api/types'

export async function requestRegisterPushDevice(
  token: string,
): Promise<PushDevice> {
  const response = await authClient.post<ItemResponse<PushDevice>>(
    API_ROUTES.pushDevices.register,
    { token },
  )

  return response.data.item
}

export async function requestSendTestPush(): Promise<TestPushResult> {
  const response = await authClient.post<ItemResponse<TestPushResult>>(
    API_ROUTES.pushDevices.test,
  )

  return response.data.item
}
