import type { ReactNode } from "react";

type CaptureCardBodyProps = {
  children: ReactNode;
};

export function CaptureCardBody({ children }: CaptureCardBodyProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">{children}</div>
  );
}
