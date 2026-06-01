export type TranscribePayload = {
  audio: Buffer
  mimeType?: string
}

export type TranscribeResponse = {
  text: string
}

export interface TranscriptionProvider {
  transcribe(payload: TranscribePayload): Promise<TranscribeResponse>
}
