import { Mic, Send } from "lucide-react";
import { useCanRecord } from "@/layout/hooks/use-can-record";
import { useConnectivityStore } from "@/layout/stores/connectivity-store";
import { selectVoiceStatus, useVoiceStore } from "@/layout/stores/voice-store";
import { useChatInputContext } from "./contexts/chat-input";

export function ChatInputActionButton() {
  const startRecording = useVoiceStore((store) => store.startRecording);
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const isOffline = useConnectivityStore((store) => store.isOffline);

  const canRecord = useCanRecord();

  const { draft, onSend, disabled } = useChatInputContext();

  const isTranscribing = voiceStatus === "transcribing";
  const isSendingDisabled = !disabled && (isOffline || isTranscribing);
  const hasText = draft.length > 0;

  if (hasText) {
    return (
      <button
        type="button"
        aria-label="Send"
        onClick={onSend}
        disabled={disabled || isSendingDisabled}
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
      disabled={disabled || !canRecord}
      className="ml-2 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-inverse-surface disabled:opacity-60"
    >
      <Mic className="size-5" />
    </button>
  );
}
