import { MessageBubble } from "../../layout/components/ui/message-bubble";
import { ComponentPreview } from "./_preview";

export function MessageBubblePreview() {
  return (
    <ComponentPreview
      name="MessageBubble"
      description="User and Ben chat bubbles. Pending = optimistic. Error = soft, never red-screen. Skeleton = loading."
      variants={[
        {
          label: "Ben",
          node: (
            <MessageBubble from="ben">
              morning. what's on the list today?
            </MessageBubble>
          ),
        },
        {
          label: "User",
          node: (
            <MessageBubble from="user">
              remind me to pick up milk on the way home
            </MessageBubble>
          ),
        },
        {
          label: "Pending (transcribing)",
          node: (
            <MessageBubble from="user" state="pending">
              hearing you…
            </MessageBubble>
          ),
        },
        {
          label: "Error",
          node: (
            <MessageBubble from="user" state="error">
              couldn't catch that — tap to retry
            </MessageBubble>
          ),
        },
        {
          label: "Skeleton (loading)",
          node: <MessageBubble from="ben" state="skeleton" />,
        },
      ]}
    />
  );
}
