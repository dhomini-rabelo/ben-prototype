import type { ReactNode } from "react";
import { Typography } from "../../../../layout/components/ui/typography";
import { useCaptureCard } from "./contexts/capture-card-context";

type CaptureCardMetaProps = {
  children: ReactNode;
};

export function CaptureCardMeta({ children }: CaptureCardMetaProps) {
  const { state } = useCaptureCard();

  if (state === "error") {
    return null;
  }

  return (
    <Typography
      variant="label-caps"
      className="mt-1 normal-case text-on-surface-variant"
    >
      {children}
    </Typography>
  );
}
