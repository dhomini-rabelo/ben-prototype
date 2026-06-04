import { create, type StateCreator } from "zustand";
import { requestSendChatMessage } from "../../../api/requests/chat";
import type { CaptureView } from "../../../api/responses/agent-reply";
import type { MicPermission } from "../hooks/use-media-recorder";
import type { BenUiMessage } from "../utils/chat-messages";

export type TranscriptionStatus = "idle" | "pending" | "error";
export type VoiceStatus = "idle" | "recording" | "transcribing" | "error";

const TYPING_STEP_MS = 24;
const TYPING_CHARS_PER_STEP = 3;

function buildUserMessage(text: string): BenUiMessage {
  return {
    id: crypto.randomUUID(),
    role: "user",
    parts: [{ type: "text", text }],
  };
}

function buildBenMessage(
  text: string,
  capture?: CaptureView | null,
): BenUiMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    parts: [{ type: "text", text }],
    metadata: capture ? { capture } : undefined,
  };
}

interface RecorderSnapshot {
  isRecording: boolean;
  error: string | null;
  permission: MicPermission;
  elapsedSeconds: number;
}

interface ChatStore {
  sessionMessages: BenUiMessage[];
  isAwaitingReply: boolean;
  sendError: boolean;
  transcription: TranscriptionStatus;
  isRecording: boolean;
  recorderError: string | null;
  micPermission: MicPermission;
  recordingSeconds: number;
  isOffline: boolean;
  typingIntervalId: ReturnType<typeof setInterval> | null;

  setOffline: (value: boolean) => void;
  setTranscription: (status: TranscriptionStatus) => void;
  syncRecorder: (snapshot: RecorderSnapshot) => void;
  stopTyping: () => void;
  sendText: (content: string) => Promise<boolean>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessionMessages: [],
  isAwaitingReply: false,
  sendError: false,
  transcription: "idle",
  isRecording: false,
  recorderError: null,
  micPermission: "prompt",
  recordingSeconds: 0,
  isOffline: false,
  typingIntervalId: null,

  setOffline: (value) => set({ isOffline: value }),

  setTranscription: (status) => set({ transcription: status }),

  syncRecorder: (snapshot) =>
    set({
      isRecording: snapshot.isRecording,
      recorderError: snapshot.error,
      micPermission: snapshot.permission,
      recordingSeconds: snapshot.elapsedSeconds,
    }),

  stopTyping: () => {
    const intervalId = get().typingIntervalId;
    if (intervalId !== null) {
      clearInterval(intervalId);
      set({ typingIntervalId: null });
    }
  },

  sendText: async (content) => {
    const trimmed = content.trim();
    if (!trimmed || get().isAwaitingReply || get().isOffline) {
      return false;
    }

    get().stopTyping();
    set((state) => ({
      sessionMessages: [...state.sessionMessages, buildUserMessage(trimmed)],
      isAwaitingReply: true,
      sendError: false,
    }));

    try {
      const reply = await requestSendChatMessage(trimmed);
      const benMessage = buildBenMessage("", reply.capture);
      set((state) => ({
        sessionMessages: [...state.sessionMessages, benMessage],
      }));
      animateReply(set, get, benMessage.id, reply.message);
      return true;
    } catch {
      set({ sendError: true });
      return false;
    } finally {
      set({ isAwaitingReply: false });
    }
  },
}));

type StoreSet = Parameters<StateCreator<ChatStore>>[0];
type StoreGet = Parameters<StateCreator<ChatStore>>[1];

function animateReply(
  set: StoreSet,
  get: StoreGet,
  messageId: string,
  fullText: string,
) {
  get().stopTyping();
  let revealed = 0;
  const intervalId = setInterval(() => {
    revealed = Math.min(revealed + TYPING_CHARS_PER_STEP, fullText.length);
    const nextText = fullText.slice(0, revealed);
    set((state) => ({
      sessionMessages: state.sessionMessages.map((message) =>
        message.id === messageId
          ? { ...message, parts: [{ type: "text", text: nextText }] }
          : message,
      ),
    }));
    if (revealed >= fullText.length) {
      get().stopTyping();
    }
  }, TYPING_STEP_MS);
  set({ typingIntervalId: intervalId });
}

export function selectVoiceStatus(state: ChatStore): VoiceStatus {
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

export function selectCanRecord(state: ChatStore): boolean {
  return state.micPermission !== "denied" && !state.isOffline;
}
