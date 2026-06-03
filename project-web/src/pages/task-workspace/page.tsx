import Cookies from "js-cookie";
import { AlertCircle, TriangleAlert, WifiOff } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { JWT_COOKIE } from "../../api/client";
import { ROUTES } from "../../core/routes";
import { ChatBanner } from "../../layout/components/chat-banner";
import { Typography } from "../../layout/components/ui/typography";
import { ChatInput } from "../chat/components/chat-input/chat-input";
import { RecordingBar } from "../chat/components/recording-bar/recording-bar";
import { DiffBar } from "./components/diff-bar/diff-bar";
import { SubThreadBanner } from "./components/sub-thread-banner/sub-thread-banner";
import { TextContent } from "./components/text-content/text-content";
import { TodoContent } from "./components/todo-content/todo-content";
import { WorkspaceShell } from "./components/workspace-shell/workspace-shell";
import { WorkspaceTopBar } from "./components/workspace-top-bar/workspace-top-bar";
import { useTaskWorkspace } from "./hooks/use-task-workspace";

export function TaskWorkspace() {
  const navigate = useNavigate();
  const workspace = useTaskWorkspace();

  useEffect(() => {
    if (!Cookies.get(JWT_COOKIE)) {
      navigate(ROUTES.login);
    }
  }, [navigate]);

  if (workspace.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface px-6 text-on-surface">
        <Typography variant="body-md" className="text-on-surface-variant">
          loading your workspace…
        </Typography>
      </div>
    );
  }

  const task = workspace.task;

  if (workspace.isError || !task) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface px-6 text-center text-on-surface">
        <Typography variant="body-md" className="text-on-surface-variant">
          couldn't load this one
        </Typography>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => workspace.retry()}
            className="rounded-full bg-primary px-4 py-2 text-button font-semibold text-on-primary"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={workspace.handleBack}
            className="rounded-full bg-surface-container-high px-4 py-2 text-button font-semibold text-on-surface"
          >
            Back to chat
          </button>
        </div>
      </div>
    );
  }

  const isFinished = task.status === "finished";
  const isRecording = workspace.voiceStatus === "recording";
  const isTranscribing = workspace.voiceStatus === "transcribing";
  const hasPendingDiff = task.pendingDiff !== null;

  function renderTopBanner() {
    if (workspace.isOffline) {
      return (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={WifiOff} />
          <ChatBanner.Text>
            You're offline. Sending is paused until you're back online.
          </ChatBanner.Text>
        </ChatBanner.Root>
      );
    }
    if (workspace.voiceStatus === "error") {
      return (
        <ChatBanner.Root tone="error">
          <ChatBanner.Icon icon={AlertCircle} />
          <ChatBanner.Text>mic glitched — try again or type it</ChatBanner.Text>
          <ChatBanner.Action label="Retry" onClick={workspace.retryVoice} />
          <ChatBanner.Dismiss onClick={workspace.dismissError} />
        </ChatBanner.Root>
      );
    }
    if (workspace.micPermission === "denied") {
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

  function renderBanner() {
    if (hasPendingDiff) {
      return undefined;
    }
    if (workspace.isAwaitingReply) {
      return <SubThreadBanner variant="ben-typing" />;
    }
    if (workspace.sendError) {
      return (
        <SubThreadBanner
          variant="error"
          text="Ben didn't reply — tap to retry"
          onRetry={workspace.handleSend}
        />
      );
    }
    if (workspace.lastBenReply) {
      return <SubThreadBanner text={workspace.lastBenReply} />;
    }
    return undefined;
  }

  function renderDiffBar() {
    if (!hasPendingDiff) {
      return undefined;
    }
    return (
      <DiffBar
        disabled={workspace.isMutating}
        onApprove={workspace.handleApproveDiff}
        onReject={workspace.handleRejectDiff}
      />
    );
  }

  function renderFooter() {
    if (isRecording) {
      return (
        <RecordingBar
          elapsedSeconds={workspace.recordingSeconds}
          onStop={workspace.stopRecording}
          onCancel={workspace.cancelRecording}
        />
      );
    }

    return (
      <ChatInput
        value={workspace.draft}
        placeholder="Ask Ben to edit…"
        mode={
          isFinished
            ? "disabled"
            : workspace.isOffline || isTranscribing
              ? "sending-disabled"
              : "idle"
        }
        canRecord={workspace.canRecord}
        onChange={(event) => workspace.handleDraftChange(event.target.value)}
        onSend={workspace.handleSend}
        onStartRecording={workspace.startRecording}
      />
    );
  }

  return (
    <WorkspaceShell
      topBar={
        <WorkspaceTopBar
          onBack={workspace.handleBack}
          onFinish={workspace.handleFinish}
          onReopen={workspace.handleReopen}
        />
      }
      topBanner={renderTopBanner()}
      banner={renderBanner()}
      diffBar={renderDiffBar()}
      footer={renderFooter()}
    >
      {task.contentType === "todo" ? (
        <TodoContent
          readOnly={isFinished}
          onToggle={workspace.handleToggleTodo}
          onAdd={workspace.handleAddTodo}
        />
      ) : (
        <TextContent
          readOnly={isFinished || hasPendingDiff}
          onEdit={workspace.handleTextEdit}
        />
      )}
    </WorkspaceShell>
  );
}
