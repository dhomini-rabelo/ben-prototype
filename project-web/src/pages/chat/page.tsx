import Cookies from "js-cookie";
import { AlertCircle, TriangleAlert, WifiOff } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { JWT_COOKIE } from "../../api/client";
import { ChatBanner } from "../../layout/components/chat-banner";
import { ROUTES } from "../../core/routes";
import { ChatEmptyState } from "./components/chat-empty-state/chat-empty-state";
import { ChatHistory } from "./components/chat-history/chat-history";
import { ChatHistorySkeleton } from "./components/chat-history/chat-history-skeleton";
import { ChatInput } from "./components/chat-input/chat-input";
import { ChatShell } from "./components/chat-shell/chat-shell";
import { RecordingBar } from "./components/recording-bar/recording-bar";
import { ActiveTaskPicker } from "./components/task-picker/active-task-picker";
import { useChat } from "./hooks/use-chat";

export function Chat() {
  const navigate = useNavigate();
  const chat = useChat();

  useEffect(() => {
    if (!Cookies.get(JWT_COOKIE)) {
      navigate(ROUTES.login);
    }
  }, [navigate]);

  const isRecording = chat.voiceStatus === "recording";
  const isTranscribing = chat.voiceStatus === "transcribing";
  const hasVoiceBubble = isTranscribing || chat.voiceStatus === "error";

  function renderTopBanner() {
    if (chat.isOffline) {
      return (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={WifiOff} />
          <ChatBanner.Text>
            You're offline. Sending is paused until you're back online.
          </ChatBanner.Text>
        </ChatBanner.Root>
      );
    }
    if (chat.voiceStatus === "error") {
      return (
        <ChatBanner.Root tone="error">
          <ChatBanner.Icon icon={AlertCircle} />
          <ChatBanner.Text>mic glitched — try again or type it</ChatBanner.Text>
          <ChatBanner.Action label="Retry" onClick={chat.retryVoice} />
          <ChatBanner.Dismiss onClick={chat.dismissError} />
        </ChatBanner.Root>
      );
    }
    if (chat.micPermission === "denied") {
      return (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={TriangleAlert} />
          <ChatBanner.Text>
            Ben can't hear you yet — turn on mic in browser settings.
          </ChatBanner.Text>
          <ChatBanner.Dismiss />
        </ChatBanner.Root>
      );
    }
    return undefined;
  }

  function renderFooter() {
    if (isRecording) {
      return (
        <RecordingBar
          elapsedSeconds={chat.recordingSeconds}
          onStop={chat.stopRecording}
          onCancel={chat.cancelRecording}
        />
      );
    }

    return (
      <ChatInput
        value={chat.draft}
        mode={
          chat.isLoadingHistory
            ? "disabled"
            : chat.isOffline || isTranscribing
              ? "sending-disabled"
              : "idle"
        }
        canRecord={chat.canRecord}
        onChange={(event) => chat.handleDraftChange(event.target.value)}
        onSend={chat.handleSend}
        onStartRecording={chat.startRecording}
      />
    );
  }

  return (
    <ChatShell
      topBanner={renderTopBanner()}
      peek={!isRecording ? <ActiveTaskPicker /> : undefined}
      footer={renderFooter()}
      bodyClassName={chat.isEmpty ? "px-6" : undefined}
    >
      {chat.isLoadingHistory ? (
        <ChatHistorySkeleton />
      ) : chat.isEmpty && !hasVoiceBubble ? (
        <ChatEmptyState />
      ) : (
        <ChatHistory
          messages={chat.messages}
          isAwaitingReply={chat.isAwaitingReply}
          isFetchingOlder={chat.isFetchingOlder}
          voiceBubble={
            isTranscribing
              ? { status: "transcribing", onCancel: chat.cancelTranscribing }
              : chat.voiceStatus === "error"
                ? { status: "error", onRetry: chat.retryVoice }
                : undefined
          }
          bottomRef={chat.bottomRef}
          topRef={chat.topRef}
          onOpenTask={(taskId) => navigate(ROUTES.taskWorkspace(taskId))}
        />
      )}
    </ChatShell>
  );
}
