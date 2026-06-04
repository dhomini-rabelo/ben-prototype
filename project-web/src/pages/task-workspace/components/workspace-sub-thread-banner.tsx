import { useAtomValue } from "jotai";
import { memo } from "react";
import { useWorkspaceTask } from "../hooks/use-workspace-task";
import { taskDraftAtom } from "../states/task-workspace-state";
import { useTaskStore } from "../stores/task-store";
import { SubThreadBanner } from "./sub-thread-banner/sub-thread-banner";

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

export const WorkspaceSubThreadBanner = memo(WorkspaceSubThreadBannerComponent);
