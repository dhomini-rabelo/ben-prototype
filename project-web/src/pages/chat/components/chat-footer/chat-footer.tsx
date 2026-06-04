import { memo } from "react";
import { selectVoiceStatus, useVoiceStore } from "../../states/voice-store";
import { ChatInput } from "../chat-input/chat-input";
import { RecordingBar } from "../recording-bar/recording-bar";

function ChatFooterComponent() {
  const voiceStatus = useVoiceStore(selectVoiceStatus);

  if (voiceStatus === "recording") {
    return <RecordingBar />;
  }

  return <ChatInput />;
}

export const ChatFooter = memo(ChatFooterComponent);
