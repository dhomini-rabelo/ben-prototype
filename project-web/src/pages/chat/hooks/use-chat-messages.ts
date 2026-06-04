import { useMemo } from "react";
import type { Message } from "../../../api/models/message";
import { useMessageListData } from "../../../layout/hooks/api/use-message-list-data";
import { useMessagesStore } from "../stores/messages-store";
import type { BenUiMessage } from "../utils/chat-messages";

export function mapHistoryToUiMessages(history: Message[]): BenUiMessage[] {
  return history.map((message) => ({
    id: message.id,
    role: message.role === "ben" ? "assistant" : "user",
    parts: [{ type: "text", text: message.content }],
    metadata: message.capture ? { capture: message.capture } : undefined,
  }));
}

export function useChatMessages() {
  const { state: historyState, actions: historyActions } = useMessageListData();
  const sessionMessages = useMessagesStore((store) => store.sessionMessages);

  const messages = useMemo(() => {
    const historyOldestFirst = [...historyState.items].reverse();
    return [...mapHistoryToUiMessages(historyOldestFirst), ...sessionMessages];
  }, [historyState.items, sessionMessages]);

  return {
    messages,
    historyState: {
      ...historyState,
      isEmpty: historyState.isLoading ? null : messages.length === 0,
    },
    historyActions,
  };
}
