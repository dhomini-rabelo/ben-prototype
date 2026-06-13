import { authClient } from '@/api/client'
import type { TranscriptionResponse } from '@/api/responses/transcription'
import { API_ROUTES } from '@/api/routes'

const AUDIO_FIELD_NAME = 'audio'
const AUDIO_FILE_NAME = 'recording.m4a'
const AUDIO_MIME_TYPE = 'audio/m4a'

export async function requestTranscribeAudio(
  audioUri: string,
): Promise<TranscriptionResponse> {
  const formData = new FormData()
  formData.append(AUDIO_FIELD_NAME, {
    uri: audioUri,
    name: AUDIO_FILE_NAME,
    type: AUDIO_MIME_TYPE,
  } as unknown as Blob)

  const response = await authClient.post<TranscriptionResponse>(
    API_ROUTES.transcription.create,
    formData,
  )

  return { text: response.data.text }
}
