import { MenuListRow } from "../../layout/components/ui/menu-list-row";
import { Typography } from "../../layout/components/ui/typography";
import { MenuListShell } from "./_menu-list-shell";

export function MenuTasksEdgeCases() {
  return (
    <MenuListShell title="Tasks">
      <section className="flex flex-col gap-2">
        <Typography
          variant="label-caps"
          className="px-3 pt-2 text-on-surface-variant"
        >
          Finished
        </Typography>
        <div className="flex flex-col">
          <MenuListRow
            kind="task-list"
            title="Grocery list — weekend"
            supporting="finished yesterday"
            muted
          />
          <MenuListRow
            kind="task-text"
            title="Annual review notes"
            supporting="finished 4d ago"
            muted
          />
          <MenuListRow
            kind="task-text"
            title="Conference talk outline"
            supporting="finished last week"
            muted
          />
          <MenuListRow
            kind="task-list"
            title="Packing list — Tahoe trip"
            supporting="finished 2w ago"
            muted
          />
          <MenuListRow
            kind="task-text"
            title="Q1 retro doc"
            supporting="finished 3w ago"
            muted
          />
          <MenuListRow
            kind="task-text"
            title="Birthday party planning"
            supporting="finished last month"
            muted
          />
        </div>
      </section>
    </MenuListShell>
  );
}
