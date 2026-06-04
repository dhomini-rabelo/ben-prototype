import { useEffect } from "react";
import { useChatMessages } from "../hooks/use-chat-messages";
import { useConnectivity } from "../hooks/use-connectivity";
import { useConnectivityStore } from "../states/connectivity-store";
import { useMessagesStore } from "../states/messages-store";
import { selectVoiceStatus, useVoiceStore } from "../states/voice-store";
import { ChatEmptyState } from "./chat-empty-state/chat-empty-state";
import { ChatFooter } from "./chat-footer/chat-footer";
import { ChatHistory } from "./chat-history/chat-history";
import { ChatHistorySkeleton } from "./chat-history/chat-history-skeleton";
import { ChatShell } from "./chat-shell/chat-shell";
import { ChatTopBanner } from "./chat-top-banner/chat-top-banner";
import { ActiveTaskPicker } from "./task-picker/active-task-picker";

export function ChatScreen() {
  const { messages, historyState } = useChatMessages();
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const { isOffline } = useConnectivity();
  const setOffline = useConnectivityStore((store) => store.setOffline);
  const stopTyping = useMessagesStore((store) => store.stopTyping);

  useEffect(() => {
    setOffline(isOffline);
  }, [isOffline, setOffline]);

  useEffect(() => stopTyping, [stopTyping]);

  useEffect(() => useVoiceStore.getState().subscribeMicPermission(), []);

  const isLoadingHistory = historyState.isLoading;
  const isEmpty = !isLoadingHistory && messages.length === 0;
  const isRecording = voiceStatus === "recording";
  const hasVoiceBubble =
    voiceStatus === "transcribing" || voiceStatus === "error";

  function renderBody() {
    if (isLoadingHistory) {
      return <ChatHistorySkeleton />;
    }
    if (isEmpty && !hasVoiceBubble) {
      return <ChatEmptyState />;
    }
    return <ChatHistory />;
  }

  return (
    <ChatShell
      topBanner={<ChatTopBanner />}
      peek={!isRecording ? <ActiveTaskPicker /> : undefined}
      footer={<ChatFooter />}
      bodyClassName={isEmpty ? "px-6" : undefined}
    >
      {renderBody()}
    </ChatShell>
  );
}
