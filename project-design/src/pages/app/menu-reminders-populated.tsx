import { MenuListRow } from "../../layout/components/ui/menu-list-row";
import { Typography } from "../../layout/components/ui/typography";
import { MenuListShell } from "./_menu-list-shell";

export function MenuRemindersPopulated() {
  return (
    <MenuListShell title="Reminders">
      <section className="flex flex-col gap-2">
        <Typography
          variant="label-caps"
          className="px-3 pt-2 text-on-surface-variant"
        >
          Upcoming
        </Typography>
        <div className="flex flex-col">
          <MenuListRow
            kind="reminder"
            title="Call dad"
            trailing="in 2h"
            emphasizeTrailing
            supporting="captured 10m ago"
          />
          <MenuListRow
            kind="reminder"
            title="Move the laundry"
            trailing="tomorrow 9am"
            emphasizeTrailing
            supporting="captured yesterday"
          />
          <MenuListRow
            kind="reminder"
            title="Pick up dry cleaning"
            trailing="Fri 6pm"
            emphasizeTrailing
            supporting="captured 2d ago"
          />
        </div>

        <Typography
          variant="label-caps"
          className="mt-4 px-3 text-on-surface-variant"
        >
          Fired
        </Typography>
        <div className="flex flex-col">
          <MenuListRow
            kind="reminder"
            title="Stretch break"
            trailing="3h ago"
            supporting="fired"
            muted
          />
          <MenuListRow
            kind="reminder"
            title="Take the trash out"
            trailing="yesterday 9am"
            supporting="fired"
            muted
          />
          <MenuListRow
            kind="reminder"
            title="Submit the expense report"
            trailing="Mon 5pm"
            supporting="fired"
            muted
          />
        </div>
      </section>
    </MenuListShell>
  );
}
