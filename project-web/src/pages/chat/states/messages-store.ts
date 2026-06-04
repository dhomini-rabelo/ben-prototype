import { create, type StateCreator } from "zustand";
import { requestSendChatMessage } from "../../../api/requests/chat";
import type { CaptureView } from "../../../api/responses/agent-reply";
import type { BenUiMessage } from "../utils/chat-messages";
import { useConnectivityStore } from "./connectivity-store";

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

interface MessagesStore {
  sessionMessages: BenUiMessage[];
  isAwaitingReply: boolean;
  sendError: boolean;
  typingIntervalId: ReturnType<typeof setInterval> | null;

  stopTyping: () => void;
  sendText: (content: string) => Promise<boolean>;
}

export const useMessagesStore = create<MessagesStore>((set, get) => ({
  sessionMessages: [],
  isAwaitingReply: false,
  sendError: false,
  typingIntervalId: null,

  stopTyping: () => {
    const intervalId = get().typingIntervalId;
    if (intervalId !== null) {
      clearInterval(intervalId);
      set({ typingIntervalId: null });
    }
  },

  sendText: async (content) => {
    const trimmed = content.trim();
    if (
      !trimmed ||
      get().isAwaitingReply ||
      useConnectivityStore.getState().isOffline
    ) {
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

type StoreSet = Parameters<StateCreator<MessagesStore>>[0];
type StoreGet = Parameters<StateCreator<MessagesStore>>[1];

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
