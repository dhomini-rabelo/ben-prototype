import { Response } from 'express'

export interface AgentStreamResult {
  pipeUIMessageStreamToResponse(res: Response): void
}

export type StreamReplyOnFinishPayload = {
  text: string
}

export type StreamReplyPayload = {
  userId: string
  message: string
  onFinish?: (payload: StreamReplyOnFinishPayload) => void | Promise<void>
}

export interface AgentService {
  streamReply(payload: StreamReplyPayload): AgentStreamResult
}
