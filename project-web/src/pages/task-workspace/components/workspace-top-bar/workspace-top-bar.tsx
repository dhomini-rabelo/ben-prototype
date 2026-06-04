import { CheckCircle2, ChevronLeft, List, MoreHorizontal, RotateCcw, Type } from "lucide-react";
import { memo, useState } from "react";
import { useNavigate } from "react-router";
import { ROUTES } from "../../../../core/routes";
import { Typography } from "../../../../layout/components/ui/typography";
import { cn } from "../../../../layout/utils/styles";
import { useWorkspaceTask } from "../../hooks/use-workspace-task";
import { useTaskStore } from "../../stores/task-store";

function WorkspaceTopBarComponent() {
  const navigate = useNavigate();
  const task = useWorkspaceTask();
  const finish = useTaskStore((store) => store.finish);
  const reopen = useTaskStore((store) => store.reopen);
  const isMutating = useTaskStore((store) => store.isMutating);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!task) {
    return null;
  }

  const TypeIcon = task.contentType === "todo" ? List : Type;
  const isFinished = task.status === "finished";

  async function handleFinish() {
    setIsMenuOpen(false);
    if (await finish()) {
      navigate(ROUTES.chat);
    }
  }

  function handleReopen() {
    setIsMenuOpen(false);
    void reopen();
  }

  return (
    <div className="relative flex h-14 items-center justify-between gap-2 px-2">
      <button
        type="button"
        aria-label="Back to chat"
        onClick={() => navigate(ROUTES.chat)}
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
      >
        <ChevronLeft className="size-5" strokeWidth={2} />
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant">
          <TypeIcon className="size-3.5" strokeWidth={1.75} />
        </span>
        <Typography
          variant="body-md"
          className="truncate font-semibold text-on-surface"
        >
          {task.title}
        </Typography>
        {isFinished && (
          <span className="rounded-full bg-surface-container-high px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
            finished
          </span>
        )}
      </div>

      <button
        type="button"
        aria-label="More"
        onClick={() => setIsMenuOpen((open) => !open)}
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
      >
        <MoreHorizontal className="size-5" strokeWidth={2} />
      </button>

      {isMenuOpen && (
        <div
          className={cn(
            "absolute top-12 right-2 z-10 flex w-44 flex-col rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-1 shadow-[0_8px_24px_rgba(0,0,0,0.1)]",
          )}
        >
          {isFinished ? (
            <button
              type="button"
              onClick={handleReopen}
              disabled={isMutating}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-body-md text-on-surface hover:bg-surface-container-low disabled:opacity-60"
            >
              <RotateCcw className="size-4" strokeWidth={2} />
              Reopen task
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isMutating}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-body-md text-on-surface hover:bg-surface-container-low disabled:opacity-60"
            >
              <CheckCircle2 className="size-4" strokeWidth={2} />
              Finish task
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export const WorkspaceTopBar = memo(WorkspaceTopBarComponent);
