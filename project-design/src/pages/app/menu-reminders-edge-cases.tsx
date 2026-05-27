import { MenuListRow } from "../../layout/components/menu-list-row";
import { Typography } from "../../layout/components/ui/typography";
import { MenuListShell } from "./_menu-list-shell";

export function MenuRemindersEdgeCases() {
  return (
    <MenuListShell title="Reminders">
      <section className="flex flex-col gap-2">
        <Typography
          variant="label-caps"
          className="px-3 pt-2 text-on-surface-variant"
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
          <MenuListRow
            kind="reminder"
            title="Renew library books"
            trailing="last Fri"
            supporting="fired"
            muted
          />
          <MenuListRow
            kind="reminder"
            title="Check on the sourdough starter"
            trailing="last Wed"
            supporting="fired"
            muted
          />
          <MenuListRow
            kind="reminder"
            title="Pay the electric bill"
            trailing="2w ago"
            supporting="fired"
            muted
          />
          <MenuListRow
            kind="reminder"
            title="Confirm dentist appointment"
            trailing="3w ago"
            supporting="fired"
            muted
          />
        </div>
      </section>
    </MenuListShell>
  );
}
