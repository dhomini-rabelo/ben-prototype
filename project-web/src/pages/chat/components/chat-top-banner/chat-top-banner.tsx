import { AlertCircle, TriangleAlert, WifiOff } from "lucide-react";
import { memo } from "react";
import { ChatBanner } from "../../../../layout/components/chat-banner";
import { useConnectivityStore } from "../../states/connectivity-store";
import { selectVoiceStatus, useVoiceStore } from "../../states/voice-store";

export const ChatTopBanner = memo(function ChatTopBanner() {
  const retryVoice = useVoiceStore((store) => store.retryVoice);
  const dismissError = useVoiceStore((store) => store.dismissError);
  const isOffline = useConnectivityStore((store) => store.isOffline);
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const micPermission = useVoiceStore((store) => store.micPermission);

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
