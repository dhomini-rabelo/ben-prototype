import { MessageBubble } from "../message-bubble/message-bubble";

export function ChatHistorySkeleton() {
  return (
    <section className="flex flex-1 flex-col justify-end gap-3 pt-2">
      <MessageBubble from="ben" state="skeleton" />
      <div className="flex w-full justify-end">
        <div className="h-9 w-48 animate-pulse rounded-2xl rounded-tr-sm bg-outline-variant" />
      </div>
      <MessageBubble from="ben" state="skeleton" />
      <div className="flex w-full justify-end">
        <div className="h-9 w-56 animate-pulse rounded-2xl rounded-tr-sm bg-outline-variant" />
      </div>
      <MessageBubble from="ben" state="skeleton" />
      <div className="flex w-full justify-end">
        <div className="h-9 w-40 animate-pulse rounded-2xl rounded-tr-sm bg-outline-variant" />
      </div>
      <MessageBubble from="ben" state="skeleton" />
      <div className="flex w-full justify-end">
        <div className="h-9 w-56 animate-pulse rounded-2xl rounded-tr-sm bg-outline-variant" />
      </div>
      <MessageBubble from="ben" state="skeleton" />
      <div className="flex w-full justify-end">
        <div className="h-9 w-32 animate-pulse rounded-2xl rounded-tr-sm bg-outline-variant" />
      </div>
      <MessageBubble from="ben" state="skeleton" />
    </section>
  );
}
