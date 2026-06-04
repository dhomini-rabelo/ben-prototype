import { useAtomValue } from "jotai";
import { memo } from "react";
import { useWorkspaceTask } from "../hooks/use-workspace-task";
import { taskDraftAtom } from "../states/task-workspace-state";
import { useTaskChatStore } from "../stores/task-chat-store";
import { SubThreadBanner } from "./sub-thread-banner/sub-thread-banner";

function WorkspaceSubThreadBannerComponent() {
  const task = useWorkspaceTask();
  const isAwaitingReply = useTaskChatStore((store) => store.isAwaitingReply);
  const sendError = useTaskChatStore((store) => store.sendError);
  const lastBenReply = useTaskChatStore((store) => store.lastBenReply);
  const sendText = useTaskChatStore((store) => store.sendText);
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

export const WorkspaceSubThreadBanner = memo(WorkspaceSubThreadBannerComponent);
