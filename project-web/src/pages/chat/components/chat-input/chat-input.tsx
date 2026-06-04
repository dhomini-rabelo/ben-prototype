import { useAtomValue } from "jotai";
import { ChatInputDesign } from "../../../../layout/components/chat-input-design/chat-input-design";
import { useMessageListData } from "../../../../layout/hooks/api/use-message-list-data";
import { useChatActions } from "../../contexts/chat-actions";
import { draftAtom } from "../../states/chat-state";
import {
  selectCanRecord,
  selectVoiceStatus,
  useChatStore,
} from "../../states/chat-store";

export function ChatInput() {
  const { handleDraftChange, handleSend, startRecording } = useChatActions();
  const draft = useAtomValue(draftAtom);
  const canRecord = useChatStore(selectCanRecord);
  const isOffline = useChatStore((store) => store.isOffline);
  const voiceStatus = useChatStore(selectVoiceStatus);
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
