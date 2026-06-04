import { memo } from "react";
import { ChatInput } from "../../../../layout/components/chat-input";
import { RecordingBar } from "../../../../layout/components/recording-bar";
import {
  selectVoiceStatus,
  useVoiceStore,
} from "../../../../layout/stores/voice-store";
import { useWorkspaceInput } from "../../hooks/use-workspace-input";
import { useWorkspaceTask } from "../../hooks/use-workspace-task";

function WorkspaceFooterComponent() {
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const { draft, handleDraftChange, handleSend } = useWorkspaceInput();
  const task = useWorkspaceTask();

  if (voiceStatus === "recording") {
    return <RecordingBar />;
  }

  return (
    <ChatInput.Root
      draft={draft}
      onDraftChange={handleDraftChange}
      onSend={handleSend}
      disabled={task?.status === "finished"}
    >
      <ChatInput.AttachButton />
      <ChatInput.Input placeholder="Ask Ben to edit…" />
      <ChatInput.ActionButton />
    </ChatInput.Root>
  );
}

export const WorkspaceFooter = memo(WorkspaceFooterComponent);
