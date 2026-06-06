import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Typography } from "@/layout/components/ui/typography";

type MenuListShellProps = {
  title: string;
  onBack: () => void;
  children: ReactNode;
};

export function MenuListShell({ title, onBack, children }: MenuListShellProps) {
  return (
    <div className="flex h-full w-full flex-col bg-surface text-on-surface">
      <header className="flex h-16 shrink-0 items-center gap-2 px-3">
        <button
          type="button"
          aria-label="Back to menu"
          onClick={onBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
        >
          <ChevronLeft className="size-5" strokeWidth={2} />
        </button>
        <Typography variant="body-md" className="font-semibold text-on-surface">
          {title}
        </Typography>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto px-3 pb-10">
        {children}
      </main>
    </div>
  );
}
