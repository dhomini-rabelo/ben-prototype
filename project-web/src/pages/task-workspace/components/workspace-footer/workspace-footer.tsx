import { memo } from "react";
import { ChatInput } from "@/layout/components/chat-input";
import { RecordingBar } from "@/layout/components/recording-bar";
import {
  selectVoiceStatus,
  useVoiceStore,
} from "@/layout/stores/voice-store";
import { useWorkspaceInput } from "@/pages/task-workspace/hooks/use-workspace-input";
import { useWorkspaceTask } from "@/pages/task-workspace/hooks/use-workspace-task";

function WorkspaceFooterComponent() {
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const { draft, handleDraftChange, handleSend } = useWorkspaceInput();
  const task = useWorkspaceTask();

  if (voiceStatus === "recording") {
    return <RecordingBar />;
  }

  const isFinished = task?.status === "finished";

  return (
    <ChatInput.Root
      draft={draft}
      onDraftChange={handleDraftChange}
      onSend={handleSend}
      disabled={isFinished}
    >
      <ChatInput.AttachButton />
      <ChatInput.Input
        placeholder={isFinished ? "reopen to keep editing" : "Ask Ben to edit…"}
      />
      <ChatInput.ActionButton />
    </ChatInput.Root>
  );
}

export const WorkspaceFooter = memo(WorkspaceFooterComponent);
