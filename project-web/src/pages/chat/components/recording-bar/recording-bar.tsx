import { RecordingBarDesign } from "../../../../layout/components/recording-bar-design/recording-bar-design";
import { useVoiceStore } from "../../stores/voice-store";

export function RecordingBar() {
  const stopRecording = useVoiceStore((store) => store.stopRecording);
  const cancelRecording = useVoiceStore((store) => store.cancelRecording);
  const recordingSeconds = useVoiceStore((store) => store.recordingSeconds);

  return (
    <RecordingBarDesign
      elapsedSeconds={recordingSeconds}
      onStop={stopRecording}
      onCancel={cancelRecording}
    />
  );
}
