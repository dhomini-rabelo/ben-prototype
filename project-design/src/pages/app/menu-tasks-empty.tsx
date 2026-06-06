import { Typography } from "@/layout/components/ui/typography";
import { MenuListShell } from "./_menu-list-shell";

export function MenuTasksEmpty() {
  return (
    <MenuListShell title="Tasks">
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <Typography variant="body-md" className="text-on-surface">
          no tasks yet
        </Typography>
        <Typography
          variant="body-md"
          className="mt-1 text-on-surface-variant"
        >
          talk to Ben — he'll set one up when something needs working on.
        </Typography>
      </div>
    </MenuListShell>
  );
}
