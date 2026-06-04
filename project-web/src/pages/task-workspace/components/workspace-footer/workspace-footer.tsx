import { useAtom } from "jotai";
import { memo } from "react";
import { ChatInputDesign } from "../../../../layout/components/chat-input-design/chat-input-design";
import { RecordingBarDesign } from "../../../../layout/components/recording-bar-design/recording-bar-design";
import { useConnectivityStore } from "../../../../layout/stores/connectivity-store";
import { useWorkspaceTask } from "../../hooks/use-workspace-task";
import { taskDraftAtom } from "../../states/task-workspace-state";
import { useTaskStore } from "../../stores/task-store";
import { selectVoiceStatus, useVoiceStore } from "../../../../layout/stores/voice-store";

function WorkspaceFooterComponent() {
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const recordingSeconds = useVoiceStore((store) => store.recordingSeconds);
  const startRecording = useVoiceStore((store) => store.startRecording);
  const stopRecording = useVoiceStore((store) => store.stopRecording);
  const cancelRecording = useVoiceStore((store) => store.cancelRecording);
  const micPermission = useVoiceStore((store) => store.micPermission);
  const isOffline = useConnectivityStore((store) => store.isOffline);
  const sendText = useTaskStore((store) => store.sendText);
  const task = useWorkspaceTask();
  const [draft, setDraft] = useAtom(taskDraftAtom);

  const isRecording = voiceStatus === "recording";
  const isTranscribing = voiceStatus === "transcribing";
  const isFinished = task?.status === "finished";
  const canRecord = micPermission !== "denied" && !isOffline;

  function handleSend() {
    setDraft("");
    void sendText(draft).then((sent) => {
      if (!sent) {
        setDraft(draft);
      }
    });
  }

  if (isRecording) {
    return (
      <RecordingBarDesign
        elapsedSeconds={recordingSeconds}
        onStop={stopRecording}
        onCancel={cancelRecording}
      />
    );
  }

  return (
    <ChatInputDesign
      value={draft}
      placeholder="Ask Ben to edit…"
      mode={
        isFinished
          ? "disabled"
          : isOffline || isTranscribing
            ? "sending-disabled"
            : "idle"
      }
      canRecord={canRecord}
      onChange={(event) => setDraft(event.target.value)}
      onSend={handleSend}
      onStartRecording={startRecording}
    />
  );
}

export const WorkspaceFooter = memo(WorkspaceFooterComponent);
