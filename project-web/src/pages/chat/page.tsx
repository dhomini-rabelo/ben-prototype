import { Menu } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BrandMark } from "../../layout/components/brand-mark";
import { IconButton } from "../../layout/components/ui/icon-button";
import { ChatEmptyState } from "./components/chat-empty-state/chat-empty-state";
import { ChatFooter } from "./components/chat-footer/chat-footer";
import { ChatHistory } from "./components/chat-history/chat-history";
import { ChatHistorySkeleton } from "./components/chat-history/chat-history-skeleton";
import { ChatTopBanner } from "./components/chat-top-banner/chat-top-banner";
import { ActiveTaskPicker } from "./components/task-picker/active-task-picker";
import { useChatMessages } from "./hooks/use-chat-messages";
import { useConnectivity } from "./hooks/use-connectivity";
import { useConnectivityStore } from "./stores/connectivity-store";
import { useMessagesStore } from "./stores/messages-store";
import { selectVoiceStatus, useVoiceStore } from "./stores/voice-store";

const FOOTER_GAP = 16;

export function Chat() {
  const { messages, historyState } = useChatMessages();
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const { isOffline } = useConnectivity();
  const setOffline = useConnectivityStore((store) => store.setOffline);
  const stopTyping = useMessagesStore((store) => store.stopTyping);

  const footerRef = useRef<HTMLElement | null>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    setOffline(isOffline);
  }, [isOffline, setOffline]);

  useEffect(() => stopTyping, [stopTyping]);

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

  const isLoadingHistory = historyState.isLoading;
  const isEmpty = !isLoadingHistory && messages.length === 0;
  const isRecording = voiceStatus === "recording";
  const hasVoiceBubble =
    voiceStatus === "transcribing" || voiceStatus === "error";

  function renderBody() {
    if (isLoadingHistory) {
      return <ChatHistorySkeleton />;
    }
    if (isEmpty && !hasVoiceBubble) {
      return <ChatEmptyState />;
    }
    return <ChatHistory />;
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">
      <header className="fixed top-0 left-1/2 z-50 flex h-16 w-full max-w-120 -translate-x-1/2 flex-col bg-surface">
        <div className="flex h-16 items-center justify-between px-6">
          <BrandMark logoWidth={28} logoHeight={22} />
          <IconButton label="Menu">
            <Menu className="size-6" />
          </IconButton>
        </div>
        <ChatTopBanner />
      </header>

      <main
        className={
          "flex w-full max-w-120 flex-1 flex-col px-4 pt-20 " +
          (isEmpty ? "px-6" : "")
        }
        style={{ paddingBottom: footerHeight + FOOTER_GAP }}
      >
        {renderBody()}
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
