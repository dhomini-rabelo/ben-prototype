import { Typography } from "../../layout/components/ui/typography";
import { MenuListShell } from "./_menu-list-shell";

export function MenuRemindersEmpty() {
  return (
    <MenuListShell title="Reminders">
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <Typography variant="body-md" className="text-on-surface">
          no reminders yet
        </Typography>
        <Typography
          variant="body-md"
          className="mt-1 text-on-surface-variant"
        >
          say{" "}
          <span className="font-mono text-[14px] text-on-surface">
            "remind me to…"
          </span>{" "}
          and Ben'll catch it.
        </Typography>
      </div>
    </MenuListShell>
  );
}
