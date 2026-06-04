import { RecordingBarDesign } from "../../../../layout/components/recording-bar-design/recording-bar-design";
import { useChatActions } from "../../contexts/chat-actions";
import { useChatStore } from "../../states/chat-store";

export function RecordingBar() {
  const { stopRecording, cancelRecording } = useChatActions();
  const recordingSeconds = useChatStore((store) => store.recordingSeconds);

  return (
    <RecordingBarDesign
      elapsedSeconds={recordingSeconds}
      onStop={stopRecording}
      onCancel={cancelRecording}
    />
  );
}
