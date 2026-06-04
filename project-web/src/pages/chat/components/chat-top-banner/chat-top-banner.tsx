import { AlertCircle, TriangleAlert, WifiOff } from "lucide-react";
import { memo } from "react";
import { ChatBanner } from "../../../../layout/components/chat-banner";
import { useChatActions } from "../../contexts/chat-actions";
import { selectVoiceStatus, useChatStore } from "../../states/chat-store";

export const ChatTopBanner = memo(function ChatTopBanner() {
  const { retryVoice, dismissError } = useChatActions();
  const isOffline = useChatStore((store) => store.isOffline);
  const voiceStatus = useChatStore(selectVoiceStatus);
  const micPermission = useChatStore((store) => store.micPermission);

  function renderBanner() {
    if (isOffline) {
      return (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={WifiOff} />
          <ChatBanner.Text>
            You're offline. Sending is paused until you're back online.
          </ChatBanner.Text>
        </ChatBanner.Root>
      );
    }
    if (voiceStatus === "error") {
      return (
        <ChatBanner.Root tone="error">
          <ChatBanner.Icon icon={AlertCircle} />
          <ChatBanner.Text>mic glitched — try again or type it</ChatBanner.Text>
          <ChatBanner.Action label="Retry" onClick={retryVoice} />
          <ChatBanner.Dismiss onClick={dismissError} />
        </ChatBanner.Root>
      );
    }
    if (micPermission === "denied") {
      return (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={TriangleAlert} />
          <ChatBanner.Text>
            Ben can't hear you yet — turn on mic in browser settings.
          </ChatBanner.Text>
          <ChatBanner.Dismiss />
        </ChatBanner.Root>
      );
    }
    return null;
  }

  const banner = renderBanner();
  if (!banner) {
    return null;
  }

  return <div className="px-4 pb-2">{banner}</div>;
});
