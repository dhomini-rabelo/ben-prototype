import { TranscriptionProvider } from '@/adapters/transcription-provider'
import { ValidationError } from '@/modules/domain/domain-errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  audio: Buffer
  mimeType?: string
}

interface Response {
  text: string
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

    const { text } = await this.transcriptionProvider.transcribe({
      audio: payload.audio,
      mimeType: payload.mimeType,
    })

    return { text }
  }
}
