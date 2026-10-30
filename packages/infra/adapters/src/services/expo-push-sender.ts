import type { PushDeliveryResult, PushMessage, PushSender } from '@ben/adapters'

export const EXPO_PUSH_SEND_URL = 'https://exp.host/--/api/v2/push/send'
export const EXPO_PUSH_CHUNK_SIZE = 100

type ExpoPushTicket =
  | { status: 'ok' }
  | { status: 'error'; message?: string; details?: { error?: string } }

type ExpoPushSenderOptions = {
  accessToken?: string
  fetchFn?: typeof fetch
}

export class ExpoPushSender implements PushSender {
  private readonly accessToken: string | undefined
  private readonly fetchFn: typeof fetch

  constructor(options: ExpoPushSenderOptions = {}) {
    this.accessToken = options.accessToken
    this.fetchFn = options.fetchFn ?? fetch
  }

  async send(messages: PushMessage[]): Promise<PushDeliveryResult[]> {
    const results: PushDeliveryResult[] = []

    for (
      let start = 0;
      start < messages.length;
      start += EXPO_PUSH_CHUNK_SIZE
    ) {
      const chunk = messages.slice(start, start + EXPO_PUSH_CHUNK_SIZE)
      results.push(...(await this.sendChunk(chunk)))
    }

    return results
  }

  private async sendChunk(
    messages: PushMessage[],
  ): Promise<PushDeliveryResult[]> {
    const response = await this.fetchFn(EXPO_PUSH_SEND_URL, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(
        messages.map((message) => this.toExpoMessage(message)),
      ),
    })

    if (!response.ok) {
      throw new Error(`expo push request failed with status ${response.status}`)
    }

    const body = (await response.json()) as { data?: ExpoPushTicket[] }

    if (!Array.isArray(body.data)) {
      throw new Error('expo push response has no data array')
    }

    const tickets = body.data

    return messages.map((message, index) =>
      this.toDeliveryResult(message.to, tickets[index]),
    )
  }

  private buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      ...(this.accessToken
        ? { Authorization: `Bearer ${this.accessToken}` }
        : {}),
    }
  }

  private toExpoMessage(message: PushMessage) {
    return {
      to: message.to,
      title: message.title,
      body: message.body,
      data: message.data,
      channelId: message.channelId,
      sound: 'default',
      priority: 'high',
    }
  }

  private toDeliveryResult(
    to: string,
    ticket: ExpoPushTicket | undefined,
  ): PushDeliveryResult {
    if (ticket?.status === 'ok') {
      return { to, status: 'delivered' }
    }

    if (
      ticket?.status === 'error' &&
      ticket.details?.error === 'DeviceNotRegistered'
    ) {
      return {
        to,
        status: 'failed',
        reason: 'unregistered-recipient',
        message: ticket.message,
      }
    }

    return {
      to,
      status: 'failed',
      reason: 'other',
      message:
        ticket?.status === 'error'
          ? ticket.message
          : 'missing ticket for message',
    }
  }
}
