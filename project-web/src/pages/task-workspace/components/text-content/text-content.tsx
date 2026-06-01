import type { FocusEvent } from "react";
import { Typography } from "../../../../layout/components/ui/typography";
import type { Task } from "../../../../api/models/task";

type TextContentProps = {
  task: Task;
  readOnly?: boolean;
  onEdit?: (value: string) => void;
};

export function TextContent({ task, readOnly, onEdit }: TextContentProps) {
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

  const content = task.textContent ?? "";

  function handleBlur(event: FocusEvent<HTMLTextAreaElement>) {
    if (event.target.value !== content) {
      onEdit?.(event.target.value);
    }
  }

  return (
    <section className="flex flex-1 flex-col pt-2">
      <textarea
        key={`${task.id}:${content}`}
        defaultValue={content}
        readOnly={readOnly}
        placeholder="tell Ben what to put here…"
        onBlur={handleBlur}
        className="min-h-60 flex-1 resize-none border-none bg-transparent text-body-md leading-relaxed text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-0"
      />
    </section>
  );
}
