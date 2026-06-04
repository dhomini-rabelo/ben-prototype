import { Mic, Send } from "lucide-react";
import { useCanRecord } from "../../hooks/use-can-record";
import { useChatInput } from "../../hooks/use-chat-input";
import { useConnectivityStore } from "../../../../layout/stores/connectivity-store";
import { selectVoiceStatus, useVoiceStore } from "../../../../layout/stores/voice-store";
import { useChatInputDisabled } from "./contexts/disabled";

export function ChatInputActionButton() {
  const startRecording = useVoiceStore((store) => store.startRecording);
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const isOffline = useConnectivityStore((store) => store.isOffline);

  const canRecord = useCanRecord();

  const { draft, handleSend } = useChatInput();
  const isChatDisabled = useChatInputDisabled();

  const isTranscribing = voiceStatus === "transcribing";
  const isSendingDisabled = !isChatDisabled && (isOffline || isTranscribing);
  const hasText = draft.length > 0;

  if (hasText) {
    return (
      <button
        type="button"
        aria-label="Send"
        onClick={handleSend}
        disabled={isChatDisabled || isSendingDisabled}
        className="ml-2 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-inverse-surface disabled:opacity-60"
      >
        <Send className="size-5" strokeWidth={2} />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Voice input"
      onClick={startRecording}
      disabled={isChatDisabled || !canRecord}
      className="ml-2 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-inverse-surface disabled:opacity-60"
    >
      <Mic className="size-5" />
    </button>
  );
}
