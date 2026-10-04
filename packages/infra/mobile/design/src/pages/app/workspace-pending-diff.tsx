import { ChatInput } from "@/layout/components/chat-input";
import { DiffBar } from "@/layout/components/diff-bar";
import { TodoListItem } from "@/layout/components/todo-list-item";
import { WorkspaceShell } from "./_workspace-shell";

export function WorkspacePendingDiff() {
  return (
    <WorkspaceShell
      title="Packing for the offsite"
      contentType="list"
      diffBar={<DiffBar summary="Ben suggested 3 changes" />}
      footer={<ChatInput placeholder="Reply to keep iterating…" />}
    >
      <section className="flex flex-1 flex-col gap-1 pt-2">
        <TodoListItem title="Charger + adapter" done />
        <TodoListItem title="Notebook + two pens" done />
        <TodoListItem title="Running shoes" />
        <TodoListItem title="Heavy jacket" diff="removed" />
        <TodoListItem title="Light rain layer" diff="added" />
        <TodoListItem title="Umbrella (compact)" diff="added" />
        <TodoListItem title="Glasses case" />
        <TodoListItem title="Snacks for the flight" />
      </section>
    </WorkspaceShell>
  );
}
