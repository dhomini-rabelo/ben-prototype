import { useAtomValue } from "jotai";
import { memo } from "react";
import { useMessageListData } from "../../../../layout/hooks/api/use-message-list-data";
import { useChatActions } from "../../contexts/chat-actions";
import { draftAtom } from "../../states/chat-state";
import {
  selectCanRecord,
  selectVoiceStatus,
  useChatStore,
} from "../../states/chat-store";
import { ChatInput } from "../chat-input/chat-input";
import { RecordingBar } from "../recording-bar/recording-bar";

function ChatFooterComponent() {
  const {
    handleDraftChange,
    handleSend,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useChatActions();
  const voiceStatus = useChatStore(selectVoiceStatus);
  const draft = useAtomValue(draftAtom);
  const canRecord = useChatStore(selectCanRecord);
  const isOffline = useChatStore((store) => store.isOffline);
  const recordingSeconds = useChatStore((store) => store.recordingSeconds);
  const { state: historyState } = useMessageListData();

  if (voiceStatus === "recording") {
    return (
      <RecordingBar
        elapsedSeconds={recordingSeconds}
        onStop={stopRecording}
        onCancel={cancelRecording}
      />
    );
  }

  const isTranscribing = voiceStatus === "transcribing";
  const mode = historyState.isLoading
    ? "disabled"
    : isOffline || isTranscribing
      ? "sending-disabled"
      : "idle";

  return (
    <ChatInput
      value={draft}
      mode={mode}
      canRecord={canRecord}
      onChange={(event) => handleDraftChange(event.target.value)}
      onSend={handleSend}
      onStartRecording={startRecording}
    />
  );
}

export const ChatFooter = memo(ChatFooterComponent);
