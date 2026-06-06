import { useState, type FocusEvent } from "react";
import { Typography } from "@/layout/components/ui/typography";
import { useWorkspaceTask } from "@/pages/task-workspace/hooks/use-workspace-task";
import { useTaskContentStore } from "@/pages/task-workspace/stores/task-content-store";

type TextContentProps = {
  readOnly?: boolean;
};

export function TextContent({ readOnly }: TextContentProps) {
  const task = useWorkspaceTask();
  const editText = useTaskContentStore((s) => s.editText);

  const content = task?.textContent ?? "";

  // Controlled textarea seeded from the server content. We re-sync during render
  // (React's "adjust state when a prop changes" pattern) whenever the task or its
  // persisted content changes, instead of remounting via `key` or a state-in-effect.
  const syncKey = `${task?.id ?? ""}:${content}`;
  const [value, setValue] = useState(content);
  const [syncedKey, setSyncedKey] = useState(syncKey);
  if (syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    setValue(content);
  }

  if (!task) {
    return null;
  }

  const diff =
    task.pendingDiff?.changes.contentType === "text"
      ? task.pendingDiff.changes
      : null;

  if (diff) {
    return (
      <section className="flex flex-1 flex-col gap-3 pt-2">
        {diff.before.length > 0 && (
          <Typography
            variant="body-md"
            className="rounded-lg bg-diff-removed/60 px-3 py-2 leading-relaxed text-diff-removed-fg line-through"
          >
            {diff.before}
          </Typography>
        )}
        <Typography
          variant="body-md"
          className="rounded-lg bg-diff-added px-3 py-2 leading-relaxed text-diff-added-fg ring-1 ring-diff-added-outline/60"
        >
          {diff.after}
        </Typography>
      </section>
    );
  }

  function handleBlur(event: FocusEvent<HTMLTextAreaElement>) {
    if (event.target.value !== content) {
      void editText(event.target.value);
    }
  }

  return (
    <section className="flex flex-1 flex-col pt-2">
      <textarea
        value={value}
        readOnly={readOnly}
        placeholder="tell Ben what to put here…"
        onChange={(event) => setValue(event.target.value)}
        onBlur={handleBlur}
        className="min-h-60 flex-1 resize-none border-none bg-transparent text-body-md leading-relaxed text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-0"
      />
    </section>
  );
}
