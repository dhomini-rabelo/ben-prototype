export type TranscriptionStatus = "idle" | "pending" | "error";
export type VoiceStatus = "idle" | "recording" | "transcribing" | "error";
export type MicPermission = "granted" | "denied" | "prompt";

export interface VoiceStore {
  transcription: TranscriptionStatus;
  isRecording: boolean;
  recorderError: string | null;
  micPermission: MicPermission;
  recordingSeconds: number;

  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  cancelTranscribing: () => void;
  retryVoice: () => void;
  dismissError: () => void;
  subscribeMicPermission: () => () => void;
}
