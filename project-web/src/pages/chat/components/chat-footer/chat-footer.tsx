import { memo } from "react";
import { ChatInput } from "@/layout/components/chat-input";
import { RecordingBar } from "@/layout/components/recording-bar";
import { useMessageListData } from "@/layout/hooks/api/use-message-list-data";
import {
  selectVoiceStatus,
  useVoiceStore,
} from "@/layout/stores/voice-store";
import { useChatInput } from "@/pages/chat/hooks/use-chat-input";

function ChatFooterComponent() {
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const { state: historyState } = useMessageListData();
  const { draft, handleDraftChange, handleSend } = useChatInput();

  if (voiceStatus === "recording") {
    return <RecordingBar />;
  }

  return (
    <ChatInput.Root
      draft={draft}
      onDraftChange={handleDraftChange}
      onSend={handleSend}
      disabled={historyState.isLoading}
    >
      <ChatInput.AttachButton />
      <ChatInput.Input />
      <ChatInput.ActionButton />
    </ChatInput.Root>
  );
}

export const ChatFooter = memo(ChatFooterComponent);
