import {
  Bell,
  Menu,
  MessageCircle,
  Mic,
  NotebookPen,
  Plus,
} from "lucide-react";
import { BrandMark } from "../../layout/components/ui/brand-mark";
// import { Composer } from "../../layout/components/ui/composer";
import { IconButton } from "../../layout/components/ui/icon-button";
import { SuggestedAction } from "../../layout/components/ui/suggested-action";
import { Typography } from "../../layout/components/ui/typography";

export function ChatEmpty() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">
      <TopBar />

      <main className="flex w-full max-w-120 flex-1 flex-col px-6 pt-20 pb-30">
        <section className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
            <MessageCircle className="size-7" strokeWidth={1.5} />
          </div>
          <div className="flex max-w-[280px] flex-col items-center gap-2 text-center">
            <Typography variant="tagline" className="text-on-surface">
              No recent messages.
            </Typography>
            <Typography variant="body-md" className="text-on-surface-variant">
              Let's get started — tap the mic or type to tell Ben anything.
            </Typography>
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-2 border-t border-surface-variant pt-4">
          <Typography
            variant="label-caps"
            className="ml-1 mb-1 text-on-surface-variant"
          >
            Suggested Actions
          </Typography>
          <SuggestedAction icon={Bell}>Remind me to...</SuggestedAction>
          <SuggestedAction icon={NotebookPen}>
            Create a note about...
          </SuggestedAction>
        </section>
      </main>

      <footer className="fixed bottom-0 left-1/2 z-50 w-full max-w-120 -translate-x-1/2 bg-surface/90 px-6 pt-2 pb-6 backdrop-blur-md">
        {/*
          Context peek — drop in above the input when you want to show the active
          ledger context (Reminders / Tasks / Notes). Renders the pulsing dot,
          label, and a chevron to collapse.

          <Composer className="mx-2 mb-2" />
        */}
        <div className="flex w-full items-center rounded-full border border-transparent bg-surface-container-high px-2 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-colors focus-within:border-outline-variant focus-within:bg-surface-container-highest">
          <button
            aria-label="Attach"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-primary"
          >
            <Plus className="size-5" />
          </button>
          <input
            type="text"
            placeholder="Message Ben..."
            className="min-w-0 flex-1 border-none bg-transparent px-2 text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-0"
          />
          <button
            aria-label="Voice input"
            className="ml-2 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-inverse-surface"
          >
            <Mic className="size-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}

function TopBar() {
  return (
    <header className="fixed top-0 left-1/2 z-50 flex h-16 w-full max-w-120 -translate-x-1/2 items-center justify-between bg-surface px-6">
      <BrandMark logoWidth={28} logoHeight={22} />
      <IconButton label="Menu">
        <Menu className="size-6" />
      </IconButton>
    </header>
  );
}
