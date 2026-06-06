import { AlertCircle } from "lucide-react";
import { ChatBanner } from "@/layout/components/chat-banner";
import { MenuListShell } from "./_menu-list-shell";

export function MenuRemindersError() {
  return (
    <MenuListShell title="Reminders">
      <div className="pt-4">
        <ChatBanner
          tone="error"
          icon={AlertCircle}
          action={{ label: "retry" }}
        >
          couldn't load your reminders
        </ChatBanner>
      </div>
    </MenuListShell>
  );
}
