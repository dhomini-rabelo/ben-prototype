import { AlertCircle } from "lucide-react";
import { ChatBanner } from "../../layout/components/ui/chat-banner";
import { MenuListShell } from "./_menu-list-shell";

export function MenuTasksError() {
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
