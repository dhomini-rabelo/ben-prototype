import { CloudOff } from "lucide-react";
import { ChatBanner } from "../../layout/components/ui/chat-banner";
import { ChatInput } from "../../layout/components/ui/chat-input";
import { TodoListItem } from "../../layout/components/ui/todo-list-item";
import { WorkspaceShell } from "./_workspace-shell";

export function WorkspaceOffline() {
  return (
    <WorkspaceShell
      title="Packing for the offsite"
      contentType="list"
      topBanner={
        <ChatBanner tone="warn" icon={CloudOff} dismissible>
          offline — Ben's listening but can't reply yet
        </ChatBanner>
      }
      footer={<ChatInput placeholder="Message Ben (queued)" />}
    >
      <section className="flex flex-1 flex-col gap-1 pt-2">
        <TodoListItem title="Charger + adapter" done />
        <TodoListItem title="Notebook + two pens" done />
        <TodoListItem title="Running shoes" />
        <TodoListItem title="Light rain layer" />
        <TodoListItem title="Glasses case" />
      </section>
    </WorkspaceShell>
  );
}
