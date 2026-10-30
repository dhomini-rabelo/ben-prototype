import type { PushDeliveryResult, PushMessage, PushSender } from '@ben/adapters'

export class FakePushSender implements PushSender {
  public sent: PushMessage[] = []
  public unregisteredTokens = new Set<string>()
  public failure: Error | null = null

  async send(messages: PushMessage[]): Promise<PushDeliveryResult[]> {
    if (this.failure) {
      throw this.failure
    }

    this.sent.push(...messages)

    return messages.map((message): PushDeliveryResult => {
      if (this.unregisteredTokens.has(message.to)) {
        return {
          to: message.to,
          status: 'failed',
          reason: 'unregistered-recipient',
        }
      }

      return { to: message.to, status: 'delivered' }
    })
  }
}
