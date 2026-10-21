import { TranscriptionProvider } from '@ben/adapters'
import { ValidationError } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  audio: Buffer
  mimeType?: string
}

interface Response {
  text: string
  costUsd: number | null
}

export class TranscribeAudioUseCase implements UseCase<Response> {
  constructor(private transcriptionProvider: TranscriptionProvider) {}

  async execute(payload: Payload): Promise<Response> {
    if (!payload.audio || payload.audio.length === 0) {
      throw new ValidationError({
        errorField: 'audio',
        code: 'EMPTY_AUDIO',
      })
    }

    const { text, costUsd } = await this.transcriptionProvider.transcribe({
      audio: payload.audio,
      mimeType: payload.mimeType,
    })

    return { text, costUsd }
  }
}
