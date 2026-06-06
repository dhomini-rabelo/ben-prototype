import type { ReactNode } from "react";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import { useCaptureCard } from "./contexts/capture-card-context";

type CaptureCardTitleProps = {
  children: ReactNode;
};

export function CaptureCardTitle({ children }: CaptureCardTitleProps) {
  const { state } = useCaptureCard();
  const isError = state === "error";
  const isFinished = state === "finished";
  const isFired = state === "fired";

  return (
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
      {children}
    </Typography>
  );
}
