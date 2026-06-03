import { authClient } from "../client";
import type { TranscriptionResponse } from "../responses/transcription";
import { API_ROUTES } from "../routes";

const AUDIO_FIELD_NAME = "audio";
const AUDIO_FILE_NAME = "recording.webm";

export async function requestTranscribeAudio(
  audioBlob: Blob,
): Promise<TranscriptionResponse> {
  const formData = new FormData();
  formData.append(AUDIO_FIELD_NAME, audioBlob, AUDIO_FILE_NAME);

  const response = await authClient.post<TranscriptionResponse>(
    API_ROUTES.transcription.create,
    formData,
  );

  return { text: response.data.text };
}
