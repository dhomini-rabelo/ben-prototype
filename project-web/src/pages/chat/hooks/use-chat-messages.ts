import { useMemo } from "react";
import { useMessageListData } from "../../../layout/hooks/api/use-message-list-data";
import { useMessagesStore } from "../states/messages-store";
import { mapHistoryToUiMessages } from "../utils/chat-messages";

export function useChatMessages() {
  const { state: historyState, actions: historyActions } = useMessageListData();
  const sessionMessages = useMessagesStore((store) => store.sessionMessages);

  const messages = useMemo(() => {
    const historyOldestFirst = [...historyState.items].reverse();
    return [...mapHistoryToUiMessages(historyOldestFirst), ...sessionMessages];
  }, [historyState.items, sessionMessages]);

  return { messages, historyState, historyActions };
}
