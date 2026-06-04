import { useAtomValue } from "jotai";
import { ChatInputDesign } from "../../../../layout/components/chat-input-design/chat-input-design";
import { useMessageListData } from "../../../../layout/hooks/api/use-message-list-data";
import { useCanRecord } from "../../hooks/use-can-record";
import { useChatInput } from "../../hooks/use-chat-input";
import { draftAtom } from "../../states/chat-state";
import { useConnectivityStore } from "../../states/connectivity-store";
import { selectVoiceStatus, useVoiceStore } from "../../states/voice-store";

export function ChatInput() {
  const { handleDraftChange, handleSend } = useChatInput();
  const startRecording = useVoiceStore((store) => store.startRecording);
  const draft = useAtomValue(draftAtom);
  const canRecord = useCanRecord();
  const isOffline = useConnectivityStore((store) => store.isOffline);
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const { state: historyState } = useMessageListData();

  const isTranscribing = voiceStatus === "transcribing";
  const mode = historyState.isLoading
    ? "disabled"
    : isOffline || isTranscribing
      ? "sending-disabled"
      : "idle";

  return (
    <ChatInputDesign
      value={draft}
      mode={mode}
      canRecord={canRecord}
      onChange={(event) => handleDraftChange(event.target.value)}
      onSend={handleSend}
      onStartRecording={startRecording}
    />
  );
}
