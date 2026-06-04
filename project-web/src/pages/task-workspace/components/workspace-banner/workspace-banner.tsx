import { AlertCircle, TriangleAlert, WifiOff } from "lucide-react";
import { useAtomValue } from "jotai";
import { memo } from "react";
import { ChatBanner } from "../../../../layout/components/chat-banner";
import { useConnectivityStore } from "../../../chat/stores/connectivity-store";
import { useWorkspaceTask } from "../../hooks/use-workspace-task";
import { taskDraftAtom } from "../../states/task-workspace-state";
import { useTaskStore } from "../../stores/task-store";
import { selectVoiceStatus, useVoiceStore } from "../../stores/voice-store";
import { SubThreadBanner } from "../sub-thread-banner/sub-thread-banner";

function WorkspaceTopBannerComponent() {
  const isOffline = useConnectivityStore((store) => store.isOffline);
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const micPermission = useVoiceStore((store) => store.micPermission);
  const retryVoice = useVoiceStore((store) => store.retryVoice);
  const dismissError = useVoiceStore((store) => store.dismissError);

  const isVoiceError = voiceStatus === "error";
  const isMicDenied = micPermission === "denied";

  if (!isOffline && !isVoiceError && !isMicDenied) {
    return null;
  }

  return (
    <div className="px-4 pb-2">
      {isOffline ? (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={WifiOff} />
          <ChatBanner.Text>
            You're offline. Sending is paused until you're back online.
          </ChatBanner.Text>
        </ChatBanner.Root>
      ) : isVoiceError ? (
        <ChatBanner.Root tone="error">
          <ChatBanner.Icon icon={AlertCircle} />
          <ChatBanner.Text>mic glitched — try again or type it</ChatBanner.Text>
          <ChatBanner.Action label="Retry" onClick={retryVoice} />
          <ChatBanner.Dismiss onClick={dismissError} />
        </ChatBanner.Root>
      ) : isMicDenied ? (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={TriangleAlert} />
          <ChatBanner.Text>
            Ben can't hear you yet — turn on mic in browser settings.
          </ChatBanner.Text>
          <ChatBanner.Dismiss />
        </ChatBanner.Root>
      ) : null}
    </div>
  );
}

function WorkspaceSubThreadBannerComponent() {
  const task = useWorkspaceTask();
  const isAwaitingReply = useTaskStore((store) => store.isAwaitingReply);
  const sendError = useTaskStore((store) => store.sendError);
  const lastBenReply = useTaskStore((store) => store.lastBenReply);
  const sendText = useTaskStore((store) => store.sendText);
  const draft = useAtomValue(taskDraftAtom);

  if (task?.pendingDiff) {
    return null;
  }
  if (isAwaitingReply) {
    return <SubThreadBanner variant="ben-typing" />;
  }
  if (sendError) {
    return (
      <SubThreadBanner
        variant="error"
        text="Ben didn't reply — tap to retry"
        onRetry={() => void sendText(draft)}
      />
    );
  }
  if (lastBenReply) {
    return <SubThreadBanner text={lastBenReply} />;
  }
  return null;
}

export const WorkspaceTopBanner = memo(WorkspaceTopBannerComponent);
export const WorkspaceSubThreadBanner = memo(WorkspaceSubThreadBannerComponent);
