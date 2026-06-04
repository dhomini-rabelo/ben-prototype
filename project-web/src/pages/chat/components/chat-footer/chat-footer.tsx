import { memo } from "react";
import { ChatInput } from "../../../../layout/components/chat-input";
import { RecordingBar } from "../../../../layout/components/recording-bar";
import { useMessageListData } from "../../../../layout/hooks/api/use-message-list-data";
import {
  selectVoiceStatus,
  useVoiceStore,
} from "../../../../layout/stores/voice-store";
import { useChatInput } from "../../hooks/use-chat-input";

function ChatFooterComponent() {
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const { state: historyState } = useMessageListData();
  const { draft, handleDraftChange, handleSend } = useChatInput();

  if (voiceStatus === "recording") {
    return <RecordingBar />;
  }

  return (
    <ChatInput.Root disabled={historyState.isLoading}>
      <ChatInput.AttachButton />
      <ChatInput.Input
        value={draft}
        onChange={handleDraftChange}
        onSend={handleSend}
      />
      <ChatInput.ActionButton value={draft} onSend={handleSend} />
    </ChatInput.Root>
  );
}

export const ChatFooter = memo(ChatFooterComponent);
