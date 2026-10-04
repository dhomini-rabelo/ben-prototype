import {
  AgentService,
  GenerateReplyPayload,
  GenerateReplyResult,
  GenerateTaskTurnPayload,
  TaskTurnReply,
} from '@/adapters/agent-provider'

export class FakeAgentService implements AgentService {
  public receivedPayloads: GenerateTaskTurnPayload[] = []
  private replies: TaskTurnReply[] = []
  private failure: Error | null = null

  respondWith(reply: TaskTurnReply) {
    this.replies.push(reply)
  }

  failWith(error: Error) {
    this.failure = error
  }

  async generateReply(
    _payload: GenerateReplyPayload,
  ): Promise<GenerateReplyResult> {
    throw new Error('not used')
  }

  async generateTaskTurn(
    payload: GenerateTaskTurnPayload,
  ): Promise<TaskTurnReply> {
    this.receivedPayloads.push(payload)

    if (this.failure) {
      throw this.failure
    }

    const reply = this.replies.shift()

    if (!reply) {
      throw new Error('no reply configured')
    }

    return reply
  }
}
