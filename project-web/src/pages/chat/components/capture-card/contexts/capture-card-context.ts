import { createContext, useContext } from "react";
import type {
    CaptureCardState,
    CaptureKind,
    TaskShape,
} from "@/pages/chat/components/capture-card/types";

export type CaptureCardContextValue = {
  kind: CaptureKind;
  state: CaptureCardState;
  taskShape: TaskShape;
};

export const CaptureCardContext = createContext<CaptureCardContextValue | null>(
  null,
);

export function useCaptureCard() {
  const context = useContext(CaptureCardContext);

  if (!context) {
    throw new Error("CaptureCard parts must be used within <CaptureCard.Root>");
  }

  return context;
}
