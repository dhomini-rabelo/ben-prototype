import { AgentReply } from '@/adapters/agent-provider'

export class AgentReplyPresenter {
  static toHttp(reply: AgentReply) {
    return {
      message: reply.message,
      newReminders: reply.newReminders,
      newNotes: reply.newNotes,
      newTasks: reply.newTasks,
      historyTopics: reply.historyTopics,
    }
  }
}
