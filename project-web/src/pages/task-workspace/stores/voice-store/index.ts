import { create } from "zustand";
import { requestTranscribeAudio } from "../../../../api/requests/transcription";
import { useConnectivityStore } from "../../../chat/stores/connectivity-store";
import { subscribeMicPermission } from "../../../chat/stores/voice-store/mic-permission";
import {
  cancelRecorder,
  releaseRecorder,
  startRecorder,
  stopRecorder,
} from "../../../chat/stores/voice-store/recorder";
import { useTaskStore } from "../task-store";
import type { VoiceStore } from "./types";

export { selectVoiceStatus } from "./select-voice-status";
export type {
  MicPermission,
  TranscriptionStatus,
  VoiceStatus,
  VoiceStore,
} from "./types";

let timer: ReturnType<typeof setInterval> | null = null;
let transcriptionRunId = 0;

function clearTimer() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
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

    const started = await startRecorder({
      onPermission: (permission) => set({ micPermission: permission }),
      onError: (message) => set({ recorderError: message }),
      onStop: (blob) => {
        clearTimer();
        set({ isRecording: false });

        const runId = ++transcriptionRunId;
        requestTranscribeAudio(blob)
          .then(({ text }) => {
            if (transcriptionRunId !== runId) {
              return;
            }
            void useTaskStore.getState().sendText(text);
            set({ transcription: "idle" });
          })
          .catch(() => {
            if (transcriptionRunId !== runId) {
              return;
            }
            set({ transcription: "error" });
          });
      },
    });

    if (!started) {
      return;
    }

    set({ isRecording: true, recordingSeconds: 0 });
    timer = setInterval(() => {
      set((state) => ({ recordingSeconds: state.recordingSeconds + 1 }));
    }, 1000);
  },

  stopRecording: () => {
    set({ transcription: "pending" });
    stopRecorder();
  },

  cancelRecording: () => {
    transcriptionRunId += 1;
    cancelRecorder();
    clearTimer();
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
    const unsubscribe = subscribeMicPermission((permission) =>
      set({ micPermission: permission }),
    );

    return () => {
      unsubscribe();
      clearTimer();
      releaseRecorder();
    };
  },
}));
