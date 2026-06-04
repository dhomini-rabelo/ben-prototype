import { memo } from "react";
import { selectVoiceStatus, useChatStore } from "../../states/chat-store";
import { ChatInput } from "../chat-input/chat-input";
import { RecordingBar } from "../recording-bar/recording-bar";

function ChatFooterComponent() {
  const voiceStatus = useChatStore(selectVoiceStatus);

  if (voiceStatus === "recording") {
    return <RecordingBar />;
  }

  return <ChatInput />;
}

export const ChatFooter = memo(ChatFooterComponent);
