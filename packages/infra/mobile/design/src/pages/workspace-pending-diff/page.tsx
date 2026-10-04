import { ChatInput } from "@/layout/components/chat/chat-input";
import { DiffBar } from "@/layout/components/workspace/diff-bar";
import { TodoListItem } from "@/layout/components/workspace/todo-list-item";
import { WorkspaceShell } from "@/layout/components/common/workspace-shell";

export function WorkspacePendingDiffPage() {
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
