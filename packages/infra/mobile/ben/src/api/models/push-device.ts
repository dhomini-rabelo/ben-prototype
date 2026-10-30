export interface PushDevice {
  id: string
  token: string
  createdAt: string
  updatedAt: string
}

export interface TestPushResult {
  sentCount: number
  removedCount: number
}
