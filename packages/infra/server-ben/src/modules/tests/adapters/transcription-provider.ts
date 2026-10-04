import {
  TranscribePayload,
  TranscribeResponse,
  TranscriptionProvider,
} from '@ben/adapters'

export class FakeTranscriptionProvider implements TranscriptionProvider {
  public receivedPayloads: TranscribePayload[] = []
  private text = ''

  respondWith(text: string) {
    this.text = text
  }

  async transcribe(payload: TranscribePayload): Promise<TranscribeResponse> {
    this.receivedPayloads.push(payload)
    return { text: this.text }
  }
}
