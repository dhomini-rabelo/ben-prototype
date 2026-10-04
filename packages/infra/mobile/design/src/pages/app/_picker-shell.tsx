import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "@/layout/components/brand-mark";
import { ActiveTaskPeek } from "@/layout/components/active-task-peek";
import { ChatInput } from "@/layout/components/chat-input";
import { IconButton } from "@/layout/components/ui/icon-button";

type PickerShellProps = {
  sheet: ReactNode;
  peekCount?: number;
  peekTitle?: string;
};

export function PickerShell({
  sheet,
  peekCount = 3,
  peekTitle = "Draft the Q3 brief",
}: PickerShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">
      <header className="fixed top-0 left-1/2 z-10 flex h-16 w-full max-w-120 -translate-x-1/2 items-center justify-between bg-surface px-6">
        <BrandMark logoWidth={28} logoHeight={22} />
        <IconButton label="Menu">
          <Menu className="size-6" />
        </IconButton>
      </header>

      <main className="flex w-full max-w-120 flex-1 flex-col px-4 pt-20 pb-60">
        <section className="flex flex-1 flex-col justify-end gap-4 pt-2 opacity-40">
          <div className="rounded-2xl rounded-tl-sm bg-surface-container-low px-4 py-3 text-body-md">
            morning. what's on the list today?
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-120 -translate-x-1/2 flex-col gap-2 bg-surface px-4 pt-2 pb-6">
        <ActiveTaskPeek variant="summary" count={peekCount} title={peekTitle} />
        <ChatInput />
      </div>

      <div className="fixed inset-0 z-40 bg-inverse-surface/30 backdrop-blur-[1px]" />

      <div className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-120 -translate-x-1/2 flex-col">
        {sheet}
      </div>
    </div>
  );
}
