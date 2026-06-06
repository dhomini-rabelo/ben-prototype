import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/layout/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "group inline-flex items-center justify-center gap-3",
        "bg-primary text-on-primary text-button font-semibold",
        "rounded-lg px-6 py-3.5",
        "transition-all duration-200 ease-in-out",
        "hover:bg-surface-tint active:scale-[0.98] active:bg-inverse-surface",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
