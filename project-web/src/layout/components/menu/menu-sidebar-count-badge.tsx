import { Typography } from "@/layout/components/ui/typography";
import type { MenuEntryId } from "@/layout/stores/menu-store";

export type CountValue = number | "skeleton" | "dash" | undefined;

export function CountBadge({
  entryId,
  value,
  formatCount,
}: {
  entryId: MenuEntryId;
  value: CountValue;
  formatCount?: (n: number) => string;
}) {
  if (value === undefined) return null;
  if (value === "skeleton") {
    return (
      <span className="h-4 w-12 animate-pulse rounded-full bg-outline-variant/40" />
    );
  }
  if (value === "dash") {
    return (
      <Typography
        variant="label-caps"
        className="normal-case text-on-surface-variant/60"
      >
        —
      </Typography>
    );
  }
  const text =
    entryId === "tasks" && formatCount ? formatCount(value) : `${value}`;
  return (
    <Typography
      variant="label-caps"
      className="normal-case text-on-surface-variant"
    >
      {text}
    </Typography>
  );
}
