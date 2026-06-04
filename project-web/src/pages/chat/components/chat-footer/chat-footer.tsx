import { memo } from "react";
import { useMessageListData } from "../../../../layout/hooks/api/use-message-list-data";
import { selectVoiceStatus, useVoiceStore } from "../../../../layout/stores/voice-store";
import { ChatInput } from "../chat-input";
import { RecordingBar } from "../recording-bar/recording-bar";

function ChatFooterComponent() {
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const { state: historyState } = useMessageListData();

  if (voiceStatus === "recording") {
    return <RecordingBar />;
  }

  return (
    <ChatInput.Root disabled={historyState.isLoading}>
      <ChatInput.AttachButton />
      <ChatInput.Input />
      <ChatInput.ActionButton />
    </ChatInput.Root>
  );
}

export const ChatFooter = memo(ChatFooterComponent);
