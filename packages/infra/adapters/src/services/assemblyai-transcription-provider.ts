import {
  TranscribePayload,
  TranscribeResponse,
  TranscriptionProvider,
} from '@ben/adapters'
import { AssemblyAI } from 'assemblyai'
import { env } from '@ben/modules-env'

const PRICE_PER_HOUR_USD_BY_MODEL: Record<string, number> = {
  'universal-3-5-pro': 0.21,
  'universal-2': 0.15,
}

const SECONDS_PER_HOUR = 3600

function calculateCostUsd(
  durationSeconds: number | null | undefined,
  speechModel: string | null | undefined,
): number | null {
  if (typeof durationSeconds !== 'number' || !speechModel) return null
  const pricePerHour = PRICE_PER_HOUR_USD_BY_MODEL[speechModel]
  if (pricePerHour === undefined) return null
  return (durationSeconds / SECONDS_PER_HOUR) * pricePerHour
}

const client = new AssemblyAI({ apiKey: env.ASSEMBLYAI_API_KEY })

export class AssemblyAITranscriptionProvider implements TranscriptionProvider {
  async transcribe(payload: TranscribePayload): Promise<TranscribeResponse> {
    const transcript = await client.transcripts.transcribe({
      audio: payload.audio,
    })

    if (transcript.status === 'error') {
      throw new Error(transcript.error ?? 'AssemblyAI transcription failed')
    }

    return {
      text: transcript.text ?? '',
      costUsd: calculateCostUsd(
        transcript.audio_duration,
        transcript.speech_model_used,
      ),
    }
  }
}
