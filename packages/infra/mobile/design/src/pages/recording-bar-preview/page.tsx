import { RecordingBar } from "@/layout/components/chat/recording-bar";
import { PreviewShell } from "@/layout/components/common/preview-shell";

export function RecordingBarPreviewPage() {
  return (
    <PreviewShell
      name="RecordingBar"
      description="Replaces the whole footer while recording: cancel, live dot, elapsed time, waveform and send."
      variants={[
        { label: "Default", node: <RecordingBar /> },
        { label: "Longer take", node: <RecordingBar elapsed="0:42" /> },
      ]}
    />
  );
}
