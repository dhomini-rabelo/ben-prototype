import type { ReactNode } from "react";
import { Typography } from "@/layout/components/ui/typography";
import { useCaptureCard } from "./contexts/capture-card-context";

type CaptureCardSupportingTextProps = {
  children: ReactNode;
};

export function CaptureCardSupportingText({
  children,
}: CaptureCardSupportingTextProps) {
  const { state } = useCaptureCard();

  if (state === "error") {
    return null;
  }

  return (
    <Typography
      variant="label-caps"
      className="mt-1 normal-case text-on-surface-variant/80"
    >
      {children}
    </Typography>
  );
}
