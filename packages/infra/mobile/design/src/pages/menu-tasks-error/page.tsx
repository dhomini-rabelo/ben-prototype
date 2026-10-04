import { AlertCircle } from "lucide-react";
import { ChatBanner } from "@/layout/components/chat/chat-banner";
import { MenuListShell } from "@/layout/components/common/menu-list-shell";

export function MenuTasksErrorPage() {
  return (
    <MenuListShell title="Tasks">
      <div className="pt-4">
        <ChatBanner
          tone="error"
          icon={AlertCircle}
          action={{ label: "retry" }}
        >
          couldn't load your tasks
        </ChatBanner>
      </div>
    </MenuListShell>
  );
}
