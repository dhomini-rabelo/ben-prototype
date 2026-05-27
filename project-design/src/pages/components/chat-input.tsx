import { ChatInput } from "../../layout/components/chat-input";
import { ComponentPreview } from "./_preview";

export function ChatInputPreview() {
  return (
    <ComponentPreview
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
