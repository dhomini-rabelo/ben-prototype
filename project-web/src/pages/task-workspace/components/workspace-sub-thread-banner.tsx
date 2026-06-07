import { selectVoiceStatus, useVoiceStore } from "@/layout/stores/voice-store";
import { useWorkspaceTask } from "@/pages/task-workspace/hooks/use-workspace-task";
import { taskDraftAtom } from "@/pages/task-workspace/states/task-workspace-state";
import { useTaskChatStore } from "@/pages/task-workspace/stores/task-chat-store";
import { useAtomValue } from "jotai";
import { memo } from "react";
import { SubThreadBanner } from "./sub-thread-banner/sub-thread-banner";

function WorkspaceSubThreadBannerComponent() {
  const task = useWorkspaceTask();
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const retryVoice = useVoiceStore((store) => store.retryVoice);
  const isAwaitingReply = useTaskChatStore((store) => store.isAwaitingReply);
  const sendError = useTaskChatStore((store) => store.sendError);
  const lastBenReply = useTaskChatStore((store) => store.lastBenReply);
  const sendText = useTaskChatStore((store) => store.sendText);
  const draft = useAtomValue(taskDraftAtom);

  if (task?.pendingDiff) {
    return null;
  }

  if (voiceStatus === "transcribing") {
    return <SubThreadBanner variant="user-pending" />;
  }
  if (voiceStatus === "error") {
    return (
      <SubThreadBanner
        variant="error"
        text="couldn't catch that — tap to retry or type it instead"
        onRetry={retryVoice}
      />
    );
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

export const WorkspaceSubThreadBanner = memo(WorkspaceSubThreadBannerComponent);
