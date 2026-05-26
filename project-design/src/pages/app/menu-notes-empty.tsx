import { Typography } from "../../layout/components/ui/typography";
import { MenuListShell } from "./_menu-list-shell";

export function MenuNotesEmpty() {
  return (
    <MenuListShell title="Notes">
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <Typography variant="body-md" className="text-on-surface">
          no notes yet
        </Typography>
        <Typography
          variant="body-md"
          className="mt-1 text-on-surface-variant"
        >
          talk to Ben — he'll save the keepers.
        </Typography>
      </div>
    </MenuListShell>
  );
}
