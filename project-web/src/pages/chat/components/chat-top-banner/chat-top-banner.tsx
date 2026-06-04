import { AlertCircle, TriangleAlert, WifiOff } from "lucide-react";
import { memo } from "react";
import { ChatBanner } from "../../../../layout/components/chat-banner";
import { useConnectivityStore } from "../../../../layout/stores/connectivity-store";
import { selectVoiceStatus, useVoiceStore } from "../../stores/voice-store";

function ChatTopBannerComponent() {
  const retryVoice = useVoiceStore((store) => store.retryVoice);
  const dismissError = useVoiceStore((store) => store.dismissError);
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const micPermission = useVoiceStore((store) => store.micPermission);
  const isOffline = useConnectivityStore((store) => store.isOffline);

  const isVoiceError = voiceStatus === "error";
  const isMicDenied = micPermission === "denied";

  if (!isOffline && !isVoiceError && !isMicDenied) {
    return null;
  }

  return (
    <div className="px-4 pb-2">
      {isOffline ? (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={WifiOff} />
          <ChatBanner.Text>
            You're offline. Sending is paused until you're back online.
          </ChatBanner.Text>
        </ChatBanner.Root>
      ) : isVoiceError ? (
        <ChatBanner.Root tone="error">
          <ChatBanner.Icon icon={AlertCircle} />
          <ChatBanner.Text>mic glitched — try again or type it</ChatBanner.Text>
          <ChatBanner.Action label="Retry" onClick={retryVoice} />
          <ChatBanner.Dismiss onClick={dismissError} />
        </ChatBanner.Root>
      ) : isMicDenied ? (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={TriangleAlert} />
          <ChatBanner.Text>
            Ben can't hear you yet — turn on mic in browser settings.
          </ChatBanner.Text>
          <ChatBanner.Dismiss />
        </ChatBanner.Root>
      ) : null}
    </div>
  );
}

export const ChatTopBanner = memo(ChatTopBannerComponent);
