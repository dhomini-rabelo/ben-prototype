import { ChatInput } from "../../layout/components/chat-input";
import { SubThreadBanner } from "../../layout/components/sub-thread-banner";
import { TodoListItem } from "../../layout/components/todo-list-item";
import { WorkspaceShell } from "./_workspace-shell";

export function WorkspaceListPopulated() {
  return (
    <WorkspaceShell
      title="Packing for the offsite"
      contentType="list"
      banner={
        <SubThreadBanner
          variant="ben-reply"
          text="added rain layer — the forecast looks wet Thursday"
        />
      }
      footer={<ChatInput placeholder="Ask Ben to add or remove…" />}
    >
      <section className="flex flex-1 flex-col gap-1 pt-2">
        <TodoListItem title="Charger + adapter" done />
        <TodoListItem title="Notebook + two pens" done />
        <TodoListItem title="Running shoes" />
        <TodoListItem title="Light rain layer" />
        <TodoListItem title="Glasses case" />
        <TodoListItem title="Snacks for the flight" />
        <TodoListItem addRow title="" />
      </section>
    </WorkspaceShell>
  );
}
