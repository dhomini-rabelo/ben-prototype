import { create } from "zustand";
import { requestSendChatMessage } from "../../../../api/requests/chat";
import { useConnectivityStore } from "../connectivity-store";
import { animateReply } from "./animate-reply";
import { buildBenMessage, buildUserMessage } from "./message-builders";
import type { MessagesStore } from "./types";

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
