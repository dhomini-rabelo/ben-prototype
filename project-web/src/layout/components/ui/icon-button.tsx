import type { ReactNode } from "react";
import { cn } from "../../utils/styles";

type IconButtonProps = {
  label: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function IconButton({
  label,
  children,
  className,
  onClick,
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-high",
        className,
      )}
    >
      {children}
    </button>
  );
}
