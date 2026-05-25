import { ChatComposer } from "../../layout/components/ui/chat-composer";
import { ComponentPreview } from "./_preview";

export function ChatComposerPreview() {
  return (
    <ComponentPreview
      name="ChatComposer"
      description="The bottom input bar. Mic dominates by default; morphs to send as soon as text is present."
      variants={[
        { label: "Idle (mic dominant)", node: <ChatComposer /> },
        {
          label: "Composing (send dominant)",
          node: <ChatComposer mode="composing" value="remind me to call mom" />,
        },
        {
          label: "Sending disabled (post-release)",
          node: <ChatComposer mode="sending-disabled" />,
        },
        {
          label: "Disabled (offline / no queue)",
          node: <ChatComposer mode="disabled" placeholder="offline" />,
        },
      ]}
    />
  );
}
