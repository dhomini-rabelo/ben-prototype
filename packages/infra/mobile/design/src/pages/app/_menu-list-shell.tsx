import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Typography } from "@/layout/components/ui/typography";

type MenuListShellProps = {
  title: string;
  children: ReactNode;
};

export function MenuListShell({ title, children }: MenuListShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">
      <header className="fixed top-0 left-1/2 z-10 flex h-16 w-full max-w-120 -translate-x-1/2 items-center gap-2 bg-surface px-3">
        <button
          type="button"
          aria-label="Back to menu"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
        >
          <ChevronLeft className="size-5" strokeWidth={2} />
        </button>
        <Typography
          variant="body-md"
          className="font-semibold text-on-surface"
        >
          {title}
        </Typography>
      </header>

      <main className="flex w-full max-w-120 flex-1 flex-col px-3 pt-20 pb-10">
        {children}
      </main>
    </div>
  );
}
