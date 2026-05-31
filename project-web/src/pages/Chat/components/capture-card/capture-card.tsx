import { Typography } from "../../../../layout/components/ui/typography";
import { cn } from "../../../../layout/utils/styles";
import { CaptureCardActionButton } from "./capture-card-action-button";
import { CaptureCardErrorButton } from "./capture-card-error-button";
import { CaptureCardHeader } from "./capture-card-header";
import { CaptureCardIcon } from "./capture-card-icon";
import type { CaptureCardProps } from "./capture-card.types";

export function CaptureCard({
  kind,
  title,
  meta,
  state = "default",
  taskShape = "text",
  actionLabel,
  supportingText,
  onAction,
  errorMessage,
  className,
}: CaptureCardProps) {
  const isError = state === "error";
  const isPending = state === "pending";
  const isFired = state === "fired";
  const isActive = state === "active";
  const isFinished = state === "finished";
  const isTask = kind === "task";

  return (
    <div
      className={cn(
        "mt-2 flex items-start gap-3 rounded-xl border bg-surface-container-lowest px-3.5 py-3",
        isError && "border-text-error/30 bg-surface-error",
        isPending && "border-outline-variant/30 opacity-80",
        isFinished && "border-outline-variant/40 bg-surface-container-low",
        isFired && "border-outline-variant/40 bg-surface-container-low",
        !isError &&
          !isPending &&
          !isFinished &&
          !isFired &&
          "border-outline-variant/50",
        className,
      )}
    >
      <CaptureCardIcon
        kind={kind}
        taskShape={taskShape}
        isError={isError}
        isMuted={isFired || isFinished}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <CaptureCardHeader
          kind={kind}
          isError={isError}
          isFired={isFired}
          isActive={isActive}
        />
        <Typography
          variant="body-md"
          className={cn(
            "leading-snug",
            isError && "text-text-error",
            isFinished && "text-on-surface-variant line-through",
            isFired && "text-on-surface-variant",
            !isError && !isFinished && !isFired && "text-on-surface",
          )}
        >
          {title}
        </Typography>
        {meta && !isError && (
          <Typography
            variant="label-caps"
            className="mt-1 normal-case text-on-surface-variant"
          >
            {meta}
          </Typography>
        )}
        {supportingText && !isError && (
          <Typography
            variant="label-caps"
            className="mt-1 normal-case text-on-surface-variant/80"
          >
            {supportingText}
          </Typography>
        )}
        {isError && (
          <CaptureCardErrorButton
            kind={kind}
            errorMessage={errorMessage}
            onAction={onAction}
          />
        )}

        {isTask && !isError && (
          <CaptureCardActionButton
            state={state}
            actionLabel={actionLabel}
            onAction={onAction}
          />
        )}
      </div>
    </div>
  );
}
