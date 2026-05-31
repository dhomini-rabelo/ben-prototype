import { ArrowRight } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "../../../layout/utils/styles";

type SuggestedActionProps = {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function SuggestedAction({
  icon: Icon,
  children,
  className,
  onClick,
}: SuggestedActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-4 rounded-lg bg-surface-container-low p-4 text-left transition-colors hover:bg-surface-container-high",
        className,
      )}
    >
      <Icon
        className="size-5 text-on-surface-variant transition-colors group-hover:text-primary"
        strokeWidth={1.75}
      />
      <span className="flex-1 text-button font-semibold text-on-surface">
        {children}
      </span>
      <ArrowRight
        className="size-4 text-on-surface-variant"
        strokeWidth={1.75}
      />
    </button>
  );
}
