import { AgentReply } from '@/adapters/agent-provider'
import { CaptureView } from '@/adapters/capture-view'

export class AgentReplyPresenter {
  static toHttp(
    reply: AgentReply,
    capture: CaptureView | null,
  ): AgentReply & { capture: CaptureView | null } {
    return {
      message: reply.message,
      newReminders: reply.newReminders,
      newNotes: reply.newNotes,
      newTasks: reply.newTasks,
      historyTopics: reply.historyTopics,
      capture,
    }
  }
}
