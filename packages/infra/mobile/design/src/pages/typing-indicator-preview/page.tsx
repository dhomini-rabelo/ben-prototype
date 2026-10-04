import { TypingIndicator } from "@/layout/components/ui/typing-indicator";
import { PreviewShell } from "@/layout/components/common/preview-shell";

export function TypingIndicatorPreviewPage() {
  return (
    <PreviewShell
      name="TypingIndicator"
      description="Ben is composing a reply. Three quiet bouncing dots inside a Ben-styled bubble."
      variants={[{ label: "Default", node: <TypingIndicator /> }]}
    />
  );
}
