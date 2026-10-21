import {
  AgentService,
  GenerateReplyPayload,
  GenerateReplyResult,
  GenerateTaskTurnPayload,
  GenerateTaskTurnResult,
  TaskTurnReply,
} from '@ben/adapters'

export class FakeAgentService implements AgentService {
  public receivedPayloads: GenerateTaskTurnPayload[] = []
  private replies: GenerateTaskTurnResult[] = []
  private failure: Error | null = null

  respondWith(reply: TaskTurnReply, costUsd: number | null = null) {
    this.replies.push({ reply, costUsd })
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
  ): Promise<GenerateTaskTurnResult> {
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
