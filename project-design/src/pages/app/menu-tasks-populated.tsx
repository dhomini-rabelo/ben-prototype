import { MenuListRow } from "../../layout/components/menu-list-row";
import { Typography } from "../../layout/components/ui/typography";
import { MenuListShell } from "./_menu-list-shell";

export function MenuTasksPopulated() {
  return (
    <MenuListShell title="Tasks">
      <section className="flex flex-col gap-2">
        <Typography
          variant="label-caps"
          className="px-3 pt-2 text-on-surface-variant"
        >
          Active
        </Typography>
        <div className="flex flex-col">
          <MenuListRow
            kind="task-text"
            title="Draft the Q3 brief"
            supporting="active · just now"
          />
          <MenuListRow
            kind="task-list"
            title="Packing for the offsite"
            supporting="active · 2h ago"
          />
          <MenuListRow
            kind="task-text"
            title="Rewrite onboarding email sequence"
            supporting="active · yesterday"
          />
        </div>

        <Typography
          variant="label-caps"
          className="mt-4 px-3 text-on-surface-variant"
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
        </div>
      </section>
    </MenuListShell>
  );
}
