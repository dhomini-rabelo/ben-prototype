import type { ReactNode } from "react";
import { Typography } from "../../../../layout/components/ui/typography";

type TaskPickerSheetProps = {
  count?: number;
  children: ReactNode;
};

export function TaskPickerSheet({ count, children }: TaskPickerSheetProps) {
  return (
    <div className="flex w-full flex-col rounded-t-3xl bg-surface-container-lowest pb-6 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-center px-5 pt-3 pb-2">
        <span className="h-1 w-10 rounded-full bg-outline-variant/60" />
      </div>
      <div className="flex items-center justify-between px-5 pt-1 pb-3">
        <Typography variant="label-caps" className="text-on-surface-variant">
          Active tasks
        </Typography>
        {count != null && count > 0 && (
          <Typography
            variant="label-caps"
            className="normal-case text-on-surface-variant/70"
          >
            {count} · most recent first
          </Typography>
        )}
      </div>

      {children}
    </div>
  );
}
