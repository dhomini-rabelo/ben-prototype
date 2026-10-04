import { MenuListShell } from "./_menu-list-shell";

export function MenuRemindersLoading() {
  return (
    <MenuListShell title="Reminders">
      <div className="flex flex-col gap-1 pt-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl px-3 py-3"
          >
            <div className="size-9 animate-pulse rounded-lg bg-outline-variant/40" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-1/2 animate-pulse rounded bg-outline-variant/40" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-outline-variant/30" />
            </div>
            <div className="h-3 w-14 animate-pulse rounded bg-outline-variant/30" />
          </div>
        ))}
      </div>
    </MenuListShell>
  );
}
