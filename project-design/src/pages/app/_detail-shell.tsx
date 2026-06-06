import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "@/layout/components/brand-mark";
import { CaptureCard } from "@/layout/components/capture-card/capture-card";
import { IconButton } from "@/layout/components/ui/icon-button";
import { MessageBubble } from "@/layout/components/message-bubble";

type DetailShellProps = {
  sheet: ReactNode;
};

export function DetailShell({ sheet }: DetailShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">
      <header className="fixed top-0 left-1/2 z-10 flex h-16 w-full max-w-120 -translate-x-1/2 items-center justify-between bg-surface px-6">
        <BrandMark logoWidth={28} logoHeight={22} />
        <IconButton label="Menu">
          <Menu className="size-6" />
        </IconButton>
      </header>

      <main className="flex w-full max-w-120 flex-1 flex-col px-4 pt-20 pb-44">
        <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
          <MessageBubble from="user">
            add a note — try a 1:16 pour-over ratio this week
          </MessageBubble>
          <MessageBubble from="ben">
            noted.
            <CaptureCard
              kind="note"
              state="default"
              title="Try 1:16 pour-over ratio this week"
            />
          </MessageBubble>
        </section>
      </main>

      <div className="fixed inset-0 z-40 bg-inverse-surface/30 backdrop-blur-[1px]" />

      <div className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-120 -translate-x-1/2 flex-col">
        {sheet}
      </div>
    </div>
  );
}
