export type TranscribePayload = {
  audio: Buffer
  mimeType?: string
}

export type TranscribeResponse = {
  text: string
  costUsd: number | null
}

export interface TranscriptionProvider {
  transcribe(payload: TranscribePayload): Promise<TranscribeResponse>
}
