import { AgentReply } from '@ben/adapters'
import { CaptureView } from '@ben/domain-chat/application/types/capture-view'

export class AgentReplyPresenter {
  static toHttp(
    reply: AgentReply,
    capture: CaptureView | null,
    messageId: string,
    interactionCostUsd: number | null,
  ): AgentReply & {
    capture: CaptureView | null
    messageId: string
    interactionCostUsd: number | null
  } {
    return {
      message: reply.message,
      newReminders: reply.newReminders,
      newNotes: reply.newNotes,
      newTasks: reply.newTasks,
      historyTopics: reply.historyTopics,
      capture,
      messageId,
      interactionCostUsd,
    }
  }
}
