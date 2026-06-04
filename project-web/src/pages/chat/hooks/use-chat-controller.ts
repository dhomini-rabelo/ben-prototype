import { useEffect, useMemo } from "react";
import { useChatStore } from "../states/chat-store";
import { useChatInput } from "./use-chat-input";
import { useConnectivity } from "./use-connectivity";
import { useVoiceInput } from "./use-voice-input";

export interface ChatActions {
  handleDraftChange: (value: string) => void;
  handleSend: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  cancelRecording: () => void;
  cancelTranscribing: () => void;
  retryVoice: () => void;
  dismissError: () => void;
}

export function useChatController(): ChatActions {
  const { isOffline } = useConnectivity();
  const setOffline = useChatStore((store) => store.setOffline);
  const sendText = useChatStore((store) => store.sendText);
  const stopTyping = useChatStore((store) => store.stopTyping);

  useEffect(() => {
    setOffline(isOffline);
  }, [isOffline, setOffline]);

  useEffect(() => stopTyping, [stopTyping]);

  const { handleDraftChange, handleSend } = useChatInput();
  const voice = useVoiceInput({ onTranscribed: sendText });

  return useMemo(
    () => ({
      handleDraftChange,
      handleSend,
      startRecording: voice.startRecording,
      stopRecording: voice.stopRecording,
      cancelRecording: voice.cancelRecording,
      cancelTranscribing: voice.cancelTranscribing,
      retryVoice: voice.retryVoice,
      dismissError: voice.dismissError,
    }),
    [handleDraftChange, handleSend, voice],
  );
}
