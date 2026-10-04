import {
  TranscribePayload,
  TranscribeResponse,
  TranscriptionProvider,
} from '@/adapters/transcription-provider'
import { AssemblyAI } from 'assemblyai'
import { env } from './env'

const client = new AssemblyAI({ apiKey: env.ASSEMBLYAI_API_KEY })

export class AssemblyAITranscriptionProvider implements TranscriptionProvider {
  async transcribe(payload: TranscribePayload): Promise<TranscribeResponse> {
    const transcript = await client.transcripts.transcribe({
      audio: payload.audio,
    })

    if (transcript.status === 'error') {
      throw new Error(transcript.error ?? 'AssemblyAI transcription failed')
    }

    return { text: transcript.text ?? '' }
  }
}
