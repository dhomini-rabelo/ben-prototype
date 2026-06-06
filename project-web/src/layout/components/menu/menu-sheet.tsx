import type { ReactNode } from "react";
import { cn } from "@/layout/utils/styles";

type MenuSheetProps = {
  children: ReactNode;
  className?: string;
};

export function MenuSheet({ children, className }: MenuSheetProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-t-3xl bg-surface-container-lowest pb-6 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      <div className="flex items-center justify-center px-5 pt-3 pb-2">
        <span className="h-1 w-10 rounded-full bg-outline-variant/60" />
      </div>
      {children}
    </div>
  );
}
