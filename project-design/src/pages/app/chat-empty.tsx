import { Bell, MessageCircle, NotebookPen } from "lucide-react";
import { ChatComposer } from "../../layout/components/ui/chat-composer";
import { SuggestedAction } from "../../layout/components/ui/suggested-action";
import { Typography } from "../../layout/components/ui/typography";
import { ChatShell } from "./_chat-shell";

export function ChatEmpty() {
  return (
    <ChatShell
      bodyClassName="px-6"
      footer={<ChatComposer />}
    >
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
    </ChatShell>
  );
}
