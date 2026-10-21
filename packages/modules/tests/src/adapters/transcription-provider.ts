import {
  TranscribePayload,
  TranscribeResponse,
  TranscriptionProvider,
} from '@ben/adapters'

export class FakeTranscriptionProvider implements TranscriptionProvider {
  public receivedPayloads: TranscribePayload[] = []
  private text = ''
  private costUsd: number | null = null

  respondWith(text: string, costUsd: number | null = null) {
    this.text = text
    this.costUsd = costUsd
  }

  async transcribe(payload: TranscribePayload): Promise<TranscribeResponse> {
    this.receivedPayloads.push(payload)
    return { text: this.text, costUsd: this.costUsd }
  }
}
