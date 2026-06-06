import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";

type ItemDetailReminderMetaProps = {
  firesAtRelative?: string;
  firesAtAbsolute?: string;
  status?: "upcoming" | "fired";
};

export function ItemDetailReminderMeta({
  firesAtRelative,
  firesAtAbsolute,
  status,
}: ItemDetailReminderMetaProps) {
  const isFired = status === "fired";

  return (
    <div className="flex flex-col gap-1 rounded-xl bg-surface-container-low px-3.5 py-3">
      <div className="flex items-center gap-2">
        {firesAtRelative && (
          <Typography
            variant="body-md"
            className={cn(
              "font-semibold",
              isFired ? "text-on-surface-variant" : "text-on-surface",
            )}
          >
            {firesAtRelative}
          </Typography>
        )}
        {status && (
          <span
            className={cn(
              "rounded-full px-1.5 py-px font-mono text-[10px] uppercase tracking-wider",
              isFired
                ? "bg-surface-container-high text-on-surface-variant/70"
                : "bg-primary/10 text-primary",
            )}
          >
            {status}
          </span>
        )}
      </div>
      {firesAtAbsolute && (
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant"
        >
          {firesAtAbsolute}
        </Typography>
      )}
    </div>
  );
}
