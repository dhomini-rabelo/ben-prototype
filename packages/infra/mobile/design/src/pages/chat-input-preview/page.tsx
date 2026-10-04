import { ChatInput } from "@/layout/components/chat/chat-input";
import { PreviewShell } from "@/layout/components/common/preview-shell";

export function ChatInputPreviewPage() {
  return (
    <PreviewShell
      name="ChatInput"
      description="The bottom input bar. Mic dominates by default; morphs to send as soon as text is present."
      variants={[
        { label: "Idle (mic dominant)", node: <ChatInput /> },
        {
          label: "Composing (send dominant)",
          node: <ChatInput mode="composing" value="remind me to call mom" />,
        },
        {
          label: "Sending disabled (post-release)",
          node: <ChatInput mode="sending-disabled" />,
        },
        {
          label: "Disabled (offline / no queue)",
          node: <ChatInput mode="disabled" placeholder="offline" />,
        },
      ]}
    />
  );
}
