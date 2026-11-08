import { MenuEntryList } from "@/layout/components/menu/menu-entry-list";

export function MenuEntrySheet() {
  return (
    <div className="flex w-full flex-col rounded-t-3xl bg-surface-container-lowest pb-6 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-center px-5 pt-3 pb-2">
        <span className="h-1 w-10 rounded-full bg-outline-variant/60" />
      </div>
      <MenuEntryList counts={{ tasks: 3, notes: 12, reminders: 5 }} />
    </div>
  );
}
