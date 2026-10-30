export type PushMessage = {
  to: string
  title: string
  body: string
  data: Record<string, string>
  channelId?: string
}

export type PushDeliveryFailureReason = 'unregistered-recipient' | 'other'

export type PushDeliveryResult =
  | { to: string; status: 'delivered' }
  | {
      to: string
      status: 'failed'
      reason: PushDeliveryFailureReason
      message?: string
    }

export interface PushSender {
  send(messages: PushMessage[]): Promise<PushDeliveryResult[]>
}
