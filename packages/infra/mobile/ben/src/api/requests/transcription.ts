import { Platform } from 'react-native'
import { authClient } from '@/api/client'
import type { TranscriptionResponse } from '@/api/responses/transcription'
import { API_ROUTES } from '@/api/routes'

const AUDIO_FIELD_NAME = 'audio'
const AUDIO_FILE_NAME = 'recording.m4a'
const WEB_AUDIO_FILE_NAME = 'recording.webm'
const AUDIO_MIME_TYPE = 'audio/m4a'

async function appendAudio(formData: FormData, audioUri: string) {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(audioUri)).blob()
    formData.append(AUDIO_FIELD_NAME, blob, WEB_AUDIO_FILE_NAME)
    return
  }
  formData.append(AUDIO_FIELD_NAME, {
    uri: audioUri,
    name: AUDIO_FILE_NAME,
    type: AUDIO_MIME_TYPE,
  } as unknown as Blob)
}

export async function requestTranscribeAudio(
  audioUri: string,
): Promise<TranscriptionResponse> {
  const formData = new FormData()
  await appendAudio(formData, audioUri)

  const response = await authClient.post<TranscriptionResponse>(
    API_ROUTES.transcription.create,
    formData,
  )

  return {
    text: response.data.text,
    costUsd: response.data.costUsd ?? null,
  }
}
