import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChatEmptyState } from "./components/chat-empty-state/chat-empty-state";
import { ChatFooter } from "./components/chat-footer/chat-footer";
import { ChatHistory } from "./components/chat-history/chat-history";
import { ChatHistorySkeleton } from "./components/chat-history/chat-history-skeleton";
import { ChatTopBanner } from "./components/chat-top-banner/chat-top-banner";
import { ChatTopBar } from "./components/chat-top-bar/chat-top-bar";
import { ActiveTaskPicker } from "./components/task-picker/active-task-picker";
import { useChatMessages } from "./hooks/use-chat-messages";
import { useConnectivity } from "../../layout/hooks/use-connectivity";
import { useMessagesStore } from "./stores/messages-store";
import { selectVoiceStatus, useVoiceStore } from "../../layout/stores/voice-store";

const FOOTER_GAP = 16;

export function Chat() {
  const { historyState } = useChatMessages();
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  useConnectivity();
  const stopTyping = useMessagesStore((store) => store.stopTyping);

  const footerRef = useRef<HTMLElement | null>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => stopTyping, [stopTyping]);

  useEffect(() => {
    useVoiceStore.getState().setTranscriptHandler((text) => {
      void useMessagesStore.getState().sendText(text);
    });
  }, []);

  useEffect(() => useVoiceStore.getState().subscribeMicPermission(), []);

  useLayoutEffect(() => {
    const node = footerRef.current;
    if (!node) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setFooterHeight(entry.contentRect.height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const isRecording = voiceStatus === "recording";
  const hasVoiceBubble =
    voiceStatus === "transcribing" || voiceStatus === "error";

  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">
      <header className="fixed top-0 left-1/2 z-50 flex h-16 w-full max-w-120 -translate-x-1/2 flex-col bg-surface">
        <ChatTopBar />
        <ChatTopBanner />
      </header>

      <main
        className={
          "flex w-full max-w-120 flex-1 flex-col px-4 pt-20 " +
          (historyState.isEmpty ? "px-6" : "")
        }
        style={{ paddingBottom: footerHeight + FOOTER_GAP }}
      >
        {historyState.isLoading ? (
          <ChatHistorySkeleton />
        ) : historyState.isEmpty && !hasVoiceBubble ? (
          <ChatEmptyState />
        ) : (
          <ChatHistory />
        )}
      </main>

      <footer
        ref={footerRef}
        className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-120 -translate-x-1/2 flex-col gap-2 bg-surface px-4 pt-2 pb-6"
      >
        {!isRecording && <ActiveTaskPicker />}
        <ChatFooter />
      </footer>
    </div>
  );
}
