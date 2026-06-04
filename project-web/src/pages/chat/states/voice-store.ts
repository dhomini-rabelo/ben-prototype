import { create } from "zustand";
import { requestTranscribeAudio } from "../../../api/requests/transcription";
import { useConnectivityStore } from "./connectivity-store";
import { useMessagesStore } from "./messages-store";

export type TranscriptionStatus = "idle" | "pending" | "error";
export type VoiceStatus = "idle" | "recording" | "transcribing" | "error";
export type MicPermission = "granted" | "denied" | "prompt";

const PREFERRED_MIME_TYPE = "audio/webm";

function isPermissionDeniedError(error: unknown): boolean {
  const name = (error as { name?: string }).name ?? "";
  return name === "NotAllowedError" || name === "PermissionDeniedError";
}

function resolveMimeType(): string | undefined {
  if (
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported(PREFERRED_MIME_TYPE)
  ) {
    return PREFERRED_MIME_TYPE;
  }
  return undefined;
}

let recorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;
let chunks: Blob[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let transcriptionRunId = 0;

function clearTimer() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

function releaseStream() {
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
  recorder = null;
  chunks = [];
}

interface VoiceStore {
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

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  transcription: "idle",
  isRecording: false,
  recorderError: null,
  micPermission: "prompt",
  recordingSeconds: 0,

  startRecording: async () => {
    if (
      get().micPermission === "denied" ||
      useConnectivityStore.getState().isOffline
    ) {
      return;
    }

    set({ transcription: "idle", recorderError: null, recordingSeconds: 0 });

    let mediaStream: MediaStream;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (caughtError) {
      if (isPermissionDeniedError(caughtError)) {
        set({ micPermission: "denied" });
      } else {
        set({ recorderError: "Could not access the microphone." });
      }
      return;
    }

    set({ micPermission: "granted" });
    stream = mediaStream;
    chunks = [];

    const mimeType = resolveMimeType();
    const mediaRecorder = mimeType
      ? new MediaRecorder(mediaStream, { mimeType })
      : new MediaRecorder(mediaStream);
    recorder = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
      clearTimer();
      releaseStream();
      set({ isRecording: false });

      const runId = ++transcriptionRunId;
      requestTranscribeAudio(blob)
        .then(({ text }) => {
          if (transcriptionRunId !== runId) {
            return;
          }
          void useMessagesStore.getState().sendText(text);
          set({ transcription: "idle" });
        })
        .catch(() => {
          if (transcriptionRunId !== runId) {
            return;
          }
          set({ transcription: "error" });
        });
    };

    mediaRecorder.start();
    set({ isRecording: true, recordingSeconds: 0 });
    timer = setInterval(() => {
      set((state) => ({ recordingSeconds: state.recordingSeconds + 1 }));
    }, 1000);
  },

  stopRecording: () => {
    set({ transcription: "pending" });
    if (recorder?.state === "recording") {
      recorder.stop();
    }
  },

  cancelRecording: () => {
    transcriptionRunId += 1;
    if (recorder) {
      recorder.onstop = null;
      if (recorder.state === "recording") {
        recorder.stop();
      }
    }
    clearTimer();
    releaseStream();
    set({ isRecording: false, recordingSeconds: 0, transcription: "idle" });
  },

  cancelTranscribing: () => {
    transcriptionRunId += 1;
    set({ recorderError: null, recordingSeconds: 0, transcription: "idle" });
  },

  retryVoice: () => {
    set({ transcription: "idle" });
    void get().startRecording();
  },

  dismissError: () => {
    set({ recorderError: null, recordingSeconds: 0, transcription: "idle" });
  },

  subscribeMicPermission: () => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      return () => {
        clearTimer();
        releaseStream();
      };
    }

    let permissionStatus: PermissionStatus | null = null;

    function handleChange() {
      if (permissionStatus) {
        set({ micPermission: permissionStatus.state as MicPermission });
      }
    }

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((status) => {
        permissionStatus = status;
        set({ micPermission: status.state as MicPermission });
        status.addEventListener("change", handleChange);
      })
      .catch(() => undefined);

    return () => {
      permissionStatus?.removeEventListener("change", handleChange);
      clearTimer();
      releaseStream();
    };
  },
}));

export function selectVoiceStatus(state: VoiceStore): VoiceStatus {
  if (state.isRecording) {
    return "recording";
  }
  if (state.transcription === "pending") {
    return "transcribing";
  }
  if (state.transcription === "error" || state.recorderError) {
    return "error";
  }
  return "idle";
}
