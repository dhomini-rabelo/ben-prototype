import { TodoListItem } from "@/layout/components/workspace/todo-list-item";
import { PreviewShell } from "@/layout/components/common/preview-shell";

export function TodoListItemPreviewPage() {
  return (
    <PreviewShell
      name="TodoListItem"
      description="A single row in a workspace list. Supports done state, diff additive/subtractive styling, and an inline 'add item' affordance."
      variants={[
        { label: "Default", node: <TodoListItem title="Running shoes" /> },
        { label: "Done", node: <TodoListItem title="Charger + adapter" done /> },
        {
          label: "Diff — added",
          node: <TodoListItem title="Light rain layer" diff="added" />,
        },
        {
          label: "Diff — removed",
          node: <TodoListItem title="Heavy jacket" diff="removed" />,
        },
        { label: "Add row", node: <TodoListItem title="" addRow /> },
      ]}
    />
  );
}
