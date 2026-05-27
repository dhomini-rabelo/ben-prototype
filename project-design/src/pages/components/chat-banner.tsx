import { AlertCircle, CloudOff, MicOff } from "lucide-react";
import { ChatBanner } from "../../layout/components/chat-banner";
import { ComponentPreview } from "./_preview";

export function ChatBannerPreview() {
  return (
    <ComponentPreview
      name="ChatBanner"
      description="Soft inline alert. Lives above the composer (errors) or at the top of the chat (offline). Friend-tone copy, never red-screen."
      variants={[
        {
          label: "Info (offline)",
          node: (
            <ChatBanner tone="warn" icon={CloudOff} dismissible>
              offline — Ben's listening but can't reply yet
            </ChatBanner>
          ),
        },
        {
          label: "Warn with action (permission)",
          node: (
            <ChatBanner
              tone="warn"
              icon={MicOff}
              action={{ label: "Show me how" }}
              dismissible
            >
              Ben can't hear you yet — turn on mic in browser settings.
            </ChatBanner>
          ),
        },
        {
          label: "Error (mic-record failed)",
          node: (
            <ChatBanner tone="error" icon={AlertCircle} dismissible>
              mic glitched — try again or type it
            </ChatBanner>
          ),
        },
      ]}
    />
  );
}
